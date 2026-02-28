const _ = require("lodash");

const eventsReducer = (state, evt) => {
  const { type, payload } = evt;

  if (type === "EarlyTermination") state.events.push(evt);
  if (type === "UncaughtError") state.events.push(evt);

  if (type === "ConsoleLog") state.events.push(evt);
  if (type === "ConsoleWarn") state.events.push(evt);
  if (type === "ConsoleError") state.events.push(evt);

  if (type === "EnterFunction") {
    if (state.prevEvt.type === "BeforePromise") {
      state.events.push({ type: "DequeueMicrotask", payload: {} });
    }
    if (state.prevEvt.type === "BeforeMicrotask") {
      state.events.push({ type: "DequeueMicrotask", payload: {} });
    }
    state.events.push(evt);
  }

  if (type === "ExitFunction") state.events.push(evt);
  if (type === "ErrorFunction") state.events.push(evt);

  if (type === "InitPromise") state.events.push(evt);

  if (type === "ResolvePromise") {
    state.events.push(evt);

    const microtaskInfo = state.parentsIdsOfPromisesWithInvokedCallbacks.find(
      ({ id }) => id === payload.id,
    );

    if (microtaskInfo) {
      state.events.push({
        type: "EnqueueMicrotask",
        payload: { name: microtaskInfo.name },
      });
    }
  }

  if (type === "BeforePromise") state.events.push(evt);
  if (type === "AfterPromise") state.events.push(evt);

  if (type === "InitMicrotask") {
    state.events.push(evt);

    const microtaskInfo = state.parentsIdsOfMicrotasks.find(
      ({ id }) => id === payload.id,
    );

    if (microtaskInfo) {
      state.events.push({
        type: "EnqueueMicrotask",
        payload: { name: microtaskInfo.name },
      });
    }
  }

  if (type === "BeforeMicrotask") state.events.push(evt);
  if (type === "AfterMicrotask") state.events.push(evt);

  if (type === "InitTimeout") state.events.push(evt);

  if (type === "BeforeTimeout") {
    state.events.push({ type: "Rerender", payload: {} });
    state.events.push(evt);
  }

  state.prevEvt = evt;
  return state;
};

const reduceEvents = (events) => {
  // Deduplicate multiple ResolvePromise for same id
  events = _(events)
    .reverse()
    .uniqWith(
      (a, b) =>
        a.type === "ResolvePromise" &&
        b.type === "ResolvePromise" &&
        a.payload.id === b.payload.id,
    )
    .reverse()
    .value();

  // Figure out which promises had callbacks invoked
  const promisesWithInvokedCallbacksInfo = events
    .filter(({ type }) =>
      [
        "BeforePromise",
        "EnterFunction",
        "ExitFunction",
        "ResolvePromise",
      ].includes(type),
    )
    .map((evt, idx, arr) =>
      evt.type === "BeforePromise" &&
      (arr[idx + 1] || {}).type === "EnterFunction"
        ? [evt, arr[idx + 1]]
        : undefined,
    )
    .filter(Boolean)
    .map(([beforePromiseEvt, enterFunctionEvt]) => ({
      id: beforePromiseEvt.payload.id,
      name: enterFunctionEvt.payload.name,
    }));

  const promiseChildIdToParentId = {};
  events
    .filter(({ type }) => type === "InitPromise")
    .forEach(({ payload: { id, parentId } }) => {
      promiseChildIdToParentId[id] = parentId;
    });

  const parentsIdsOfPromisesWithInvokedCallbacks =
    promisesWithInvokedCallbacksInfo.map(({ id: childId, name }) => ({
      id: promiseChildIdToParentId[childId],
      name,
    }));

  // Figure out which queueMicrotask callbacks were invoked
  const microtasksWithInvokedCallbacksInfo = events
    .filter(({ type }) =>
      [
        "InitMicrotask",
        "BeforeMicrotask",
        "AfterMicrotask",
        "EnterFunction",
        "ExitFunction",
      ].includes(type),
    )
    .map((evt, idx, arr) =>
      evt.type === "BeforeMicrotask" &&
      (arr[idx + 1] || {}).type === "EnterFunction"
        ? [evt, arr[idx + 1]]
        : undefined,
    )
    .filter(Boolean)
    .map(([beforeMicrotaskEvt, enterFunctionEvt]) => ({
      id: beforeMicrotaskEvt.payload.id,
      name: enterFunctionEvt.payload.name,
    }));

  // For queueMicrotask, the microtask's own asyncId IS the id we match
  // against in InitMicrotask (unlike promises where we need parent→child mapping).
  const parentsIdsOfMicrotasks = microtasksWithInvokedCallbacksInfo.map(
    ({ id, name }) => ({
      id,
      name,
    }),
  );

  return events.reduce(eventsReducer, {
    events: [],
    parentsIdsOfPromisesWithInvokedCallbacks,
    parentsIdsOfMicrotasks,
    prevEvt: {},
  }).events;
};

module.exports = { reduceEvents };
