const { Worker } = require("worker_threads");
const path = require("path");

const WORKER_FILE = path.join(__dirname, "..", "worker", "worker.js");

const action = (type, payload) => JSON.stringify({ type, payload });

const Messages = {
  UncaughtError: (error) => action("UncaughtError", error),
  Done: (exitCode) => action("Done", { exitCode }),
};

const launchWorker = (jsSourceCode, onEvent) => {
  const worker = new Worker(WORKER_FILE, { workerData: jsSourceCode });

  worker.on("message", (message) => {
    onEvent(message);
  });

  worker.on("error", (error) => {
    console.error("Worker ERROR:", error);
    onEvent(
      Messages.UncaughtError({
        name: error.name || "Error",
        stack: error.stack || "",
        message: error.message || "Unknown error",
      }),
    );
  });

  worker.on("exit", (code) => {
    onEvent(Messages.Done(code));
  });

  return worker;
};

module.exports = { launchWorker };
