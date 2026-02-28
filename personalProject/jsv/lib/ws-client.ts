import type { JSVEvent } from "./types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export function fetchEventsForCode(code: string): Promise<JSVEvent[]> {
  return new Promise((resolve, reject) => {
    let ws: WebSocket;

    try {
      ws = new WebSocket(WS_URL);
    } catch (err) {
      reject(new Error("Failed to connect to execution server."));
      return;
    }

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Connection timed out. Is the server running?"));
    }, 15000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "RunCode", payload: code }));
    };

    ws.onmessage = (event) => {
      clearTimeout(timeout);
      try {
        const data = JSON.parse(event.data);
        ws.close();

        if (Array.isArray(data)) {
          resolve(data as JSVEvent[]);
        } else {
          reject(new Error("Unexpected response from server."));
        }
      } catch {
        ws.close();
        reject(new Error("Failed to parse server response."));
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(
        new Error(
          "WebSocket error. Make sure the execution server is running."
        )
      );
    };

    ws.onclose = (event) => {
      clearTimeout(timeout);
      if (!event.wasClean && event.code !== 1000) {
        reject(new Error("Connection closed unexpectedly."));
      }
    };
  });
}
