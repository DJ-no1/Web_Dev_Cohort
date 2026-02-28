const WebSocket = require("ws");
const { launchWorker } = require("./launchWorker");
const { reduceEvents } = require("./eventsReducer");

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });
console.log("JSV Server running on port:", port);

const Messages = {
  RunCode: "RunCode",
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      ws.send(JSON.stringify({ type: "Error", payload: "Invalid JSON" }));
      return;
    }

    const { type, payload } = parsed;

    if (type === Messages.RunCode) {
      const events = [];
      let isFinished = false;

      let worker;
      const onClose = () => {
        isFinished = true;
        if (worker) {
          try {
            worker.terminate();
          } catch {}
        }
      };
      ws.on("close", onClose);

      worker = launchWorker(payload, (evtString) => {
        if (isFinished) return;

        let evt;
        try {
          evt = JSON.parse(evtString);
        } catch {
          return;
        }

        events.push(evt);

        if (evt.type === "Done") {
          isFinished = true;
          ws.removeListener("close", onClose);

          try {
            const reducedEvents = reduceEvents(events);
            ws.send(JSON.stringify(reducedEvents));
          } catch (err) {
            console.error("Error reducing events:", err);
            ws.send(
              JSON.stringify([
                {
                  type: "UncaughtError",
                  payload: {
                    name: "ServerError",
                    message: "Failed to process events",
                  },
                },
              ]),
            );
          }
        }
      });

      // Safety timeout - kill worker after 10s
      setTimeout(() => {
        if (!isFinished) {
          isFinished = true;
          try {
            worker.terminate();
          } catch {}
          ws.send(
            JSON.stringify([
              {
                type: "EarlyTermination",
                payload: {
                  message: "Server timeout: execution exceeded 10 seconds.",
                },
              },
            ]),
          );
        }
      }, 10000);
    } else {
      console.error("Unknown message type:", type);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
