const { parentPort, workerData } = require('worker_threads');
const asyncHooks = require('async_hooks');
const fs = require('fs');
const { VM } = require('vm2');
const _ = require('lodash');
const falafel = require('falafel');
const prettyFormat = require('pretty-format');

let babel;
try {
  babel = require('@babel/core');
} catch {
  babel = null;
}

const { traceLoops } = require('./loopTracer');

// ── Event constructors ──────────────────────────────────────────────

const event = (type, payload) => ({ type, payload });

const Events = {
  ConsoleLog:    (message) => event('ConsoleLog', { message }),
  ConsoleWarn:   (message) => event('ConsoleWarn', { message }),
  ConsoleError:  (message) => event('ConsoleError', { message }),

  EnterFunction: (id, name, start, end) => event('EnterFunction', { id, name, start, end }),
  ExitFunction:  (id, name, start, end) => event('ExitFunction', { id, name, start, end }),
  ErrorFunction: (message, id, name, start, end) => event('ErrorFunction', { message, id, name, start, end }),

  InitPromise:    (id, parentId) => event('InitPromise', { id, parentId }),
  ResolvePromise: (id) => event('ResolvePromise', { id }),
  BeforePromise:  (id) => event('BeforePromise', { id }),
  AfterPromise:   (id) => event('AfterPromise', { id }),

  InitMicrotask:   (id, parentId) => event('InitMicrotask', { id, parentId }),
  BeforeMicrotask: (id) => event('BeforeMicrotask', { id }),
  AfterMicrotask:  (id) => event('AfterMicrotask', { id }),

  InitTimeout:   (id, callbackName) => event('InitTimeout', { id, callbackName }),
  BeforeTimeout: (id) => event('BeforeTimeout', { id }),

  UncaughtError: (error) => event('UncaughtError', {
    name: (error || {}).name,
    stack: (error || {}).stack,
    message: (error || {}).message,
  }),
  EarlyTermination: (message) => event('EarlyTermination', { message }),
};

// ── Event posting ───────────────────────────────────────────────────

const allEvents = [];
const postEvent = (evt) => {
  allEvents.push(evt);
  parentPort.postMessage(JSON.stringify(evt));
};

// ── Async hooks ─────────────────────────────────────────────────────

const ignoredAsyncHookTypes = [
  'FSEVENTWRAP', 'FSREQCALLBACK', 'GETADDRINFOREQWRAP', 'GETNAMEINFOREQWRAP',
  'HTTPPARSER', 'JSSTREAM', 'PIPECONNECTWRAP', 'PIPEWRAP', 'PROCESSWRAP',
  'QUERYWRAP', 'SHUTDOWNWRAP', 'SIGNALWRAP', 'STATWATCHER', 'TCPCONNECTWRAP',
  'TCPSERVERWRAP', 'TCPWRAP', 'TTYWRAP', 'UDPSENDWRAP', 'UDPWRAP', 'WRITEWRAP',
  'ZLIB', 'SSLCONNECTION', 'PBKDF2REQUEST', 'RANDOMBYTESREQUEST', 'TLSWRAP',
  'DNSCHANNEL',
];

const asyncIdToResource = {};

const init = (asyncId, type, triggerAsyncId, resource) => {
  asyncIdToResource[asyncId] = resource;

  if (type === 'PROMISE') {
    postEvent(Events.InitPromise(asyncId, triggerAsyncId));
  }
  if (type === 'Timeout') {
    const callbackName = resource._onTimeout.name || 'anonymous';
    postEvent(Events.InitTimeout(asyncId, callbackName));
  }
  if (type === 'Microtask') {
    postEvent(Events.InitMicrotask(asyncId, triggerAsyncId));
  }
};

const before = (asyncId) => {
  const resource = asyncIdToResource[asyncId] || {};
  const resourceName = (resource.constructor || {}).name;

  if (resourceName === 'PromiseWrap') {
    postEvent(Events.BeforePromise(asyncId));
  }
  if (resourceName === 'Timeout') {
    postEvent(Events.BeforeTimeout(asyncId));
  }
  if (resourceName === 'AsyncResource') {
    postEvent(Events.BeforeMicrotask(asyncId));
  }
};

const after = (asyncId) => {
  const resource = asyncIdToResource[asyncId] || {};
  const resourceName = (resource.constructor || {}).name;

  if (resourceName === 'PromiseWrap') {
    postEvent(Events.AfterPromise(asyncId));
  }
  if (resourceName === 'AsyncResource') {
    postEvent(Events.AfterMicrotask(asyncId));
  }
};

const destroy = (asyncId) => {
  delete asyncIdToResource[asyncId];
};

const promiseResolve = (asyncId) => {
  postEvent(Events.ResolvePromise(asyncId));
};

asyncHooks
  .createHook({ init, before, after, destroy, promiseResolve })
  .enable();

// ── Code instrumentation via falafel ────────────────────────────────

const functionDefinitionTypes = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
];
const arrowFnImplicitReturnTypesRegex = /Literal|Identifier|(\w)*Expression/;

const traceBlock = (code, fnName, start, end) => `{
  const idWithExtensionToAvoidConflicts = nextId();
  Tracer.enterFunc(idWithExtensionToAvoidConflicts, '${fnName.replace(/'/g, "\\'")}', ${start}, ${end});
  try {
    ${code}
  } catch (e) {
    Tracer.errorFunc(e.message, idWithExtensionToAvoidConflicts, '${fnName.replace(/'/g, "\\'")}', ${start}, ${end});
    throw e;
  } finally {
    Tracer.exitFunc(idWithExtensionToAvoidConflicts, '${fnName.replace(/'/g, "\\'")}', ${start}, ${end});
  }
}`;

const jsSourceCode = workerData;

let output;
try {
  output = falafel(jsSourceCode, (node) => {
    const parentType = node.parent && node.parent.type;
    const isBlockStatement = node.type === 'BlockStatement';
    const isFunctionBody = functionDefinitionTypes.includes(parentType);
    const isArrowFnReturnType = arrowFnImplicitReturnTypesRegex.test(node.type);
    const isArrowFunctionBody = parentType === 'ArrowFunctionExpression';
    const isArrowFn = node.type === 'ArrowFunctionExpression';

    if (isBlockStatement && isFunctionBody) {
      const { start, end } = node.parent;
      const fnName = (node.parent.id && node.parent.id.name) || 'anonymous';
      const block = node.source();
      const blockWithoutCurlies = block.substring(1, block.length - 1);
      node.update(traceBlock(blockWithoutCurlies, fnName, start, end));
    } else if (isArrowFnReturnType && isArrowFunctionBody) {
      const { start, end, params } = node.parent;
      const isParamIdentifier = params.some((param) => param === node);

      if (!isParamIdentifier) {
        const fnName = (node.parent.id && node.parent.id.name) || 'anonymous';
        const block = node.source();
        const returnedBlock = `return (${block});`;
        node.update(traceBlock(returnedBlock, fnName, start, end));
      }
    } else if (isArrowFn) {
      const body = node.source();
      const firstCurly = body.indexOf('{');
      const lastCurly = body.lastIndexOf('}');
      const bodyHasCurlies = firstCurly !== -1 && lastCurly !== -1;

      if (bodyHasCurlies) {
        const parensNeedStripped = body[firstCurly - 1] === '(';
        if (parensNeedStripped) {
          const bodyBlock = body.substring(firstCurly, lastCurly + 1);
          const bodyWithoutParens = `() => ${bodyBlock}`;
          node.update(bodyWithoutParens);
        }
      }
    }
  });
} catch (err) {
  postEvent(Events.UncaughtError({
    name: 'SyntaxError',
    message: err.message || 'Failed to parse code',
    stack: '',
  }));
  process.exit(1);
}

// ── Apply loop tracer via babel ─────────────────────────────────────

let modifiedSource = output.toString();

if (babel) {
  try {
    const result = babel.transformSync
      ? babel.transformSync(modifiedSource, { plugins: [traceLoops], configFile: false })
      : babel.transform(modifiedSource, { plugins: [traceLoops] });
    modifiedSource = result.code;
  } catch {
    // Continue without loop tracing if babel fails
  }
}

// ── Runtime helpers ─────────────────────────────────────────────────

const nextId = (() => {
  let id = 0;
  return () => id++;
})();

const arrToPrettyStr = (arr) =>
  arr.map((a) => (_.isString(a) ? a : prettyFormat(a))).join(' ') + '\n';

const START_TIME = Date.now();
const TIMEOUT_MILLIS = 5000;
const EVENT_LIMIT = 500;

const Tracer = {
  enterFunc: (id, name, start, end) => postEvent(Events.EnterFunction(id, name, start, end)),
  exitFunc:  (id, name, start, end) => postEvent(Events.ExitFunction(id, name, start, end)),
  errorFunc: (message, id, name, start, end) => postEvent(Events.ErrorFunction(message, id, name, start, end)),
  log:   (...args) => postEvent(Events.ConsoleLog(arrToPrettyStr(args))),
  warn:  (...args) => postEvent(Events.ConsoleWarn(arrToPrettyStr(args))),
  error: (...args) => postEvent(Events.ConsoleError(arrToPrettyStr(args))),
  iterateLoop: () => {
    const hasTimedOut = (Date.now() - START_TIME) > TIMEOUT_MILLIS;
    const reachedEventLimit = allEvents.length >= EVENT_LIMIT;
    const shouldTerminate = reachedEventLimit || hasTimedOut;

    if (shouldTerminate) {
      postEvent(Events.EarlyTermination(
        hasTimedOut
          ? `Terminated early: Timeout of ${TIMEOUT_MILLIS}ms exceeded.`
          : `Terminated early: Event limit of ${EVENT_LIMIT} exceeded.`
      ));
      process.exit(1);
    }
  },
};

process.on('uncaughtException', (err) => {
  postEvent(Events.UncaughtError(err));
  process.exit(1);
});

// ── Execute in sandbox ──────────────────────────────────────────────

const vm = new VM({
  timeout: 6000,
  sandbox: {
    nextId,
    Tracer,
    _,
    lodash: _,
    setTimeout,
    queueMicrotask,
    console: {
      log: Tracer.log,
      warn: Tracer.warn,
      error: Tracer.error,
    },
  },
});

try {
  vm.run(modifiedSource);
} catch (err) {
  postEvent(Events.UncaughtError({
    name: err.name || 'Error',
    message: err.message || 'Runtime error',
    stack: err.stack || '',
  }));
  process.exit(1);
}
