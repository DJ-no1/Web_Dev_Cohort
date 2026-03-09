/**
 * server.js — Demo Backend for JS Event Loop Visualizer
 * -------------------------------------------------------
 * This is a simple Node.js WebSocket server.
 * It does two things:
 *   1. Serves the frontend HTML/CSS/JS files over HTTP
 *   2. Handles WebSocket messages from the browser
 *
 * HOW IT WORKS (simple explanation):
 *   - The browser opens a WebSocket connection to this server
 *   - The browser sends a message: "I want to run example #2"
 *   - This server looks up the pre-built steps for that example
 *   - The server sends those steps back to the browser
 *   - The browser then animates the steps one by one
 *
 * TO RUN THIS SERVER:
 *   1. Open a terminal in this folder (demo/backend/)
 *   2. Run: npm install    (installs the 'ws' WebSocket library)
 *   3. Run: npm start      (starts the server)
 *   4. Open your browser to: http://localhost:3001
 */

// ── Imports ───────────────────────────────────────────────────────────────────
// 'http' is built into Node.js — it lets us create a web server
import { createServer } from "http";

// 'fs' is built into Node.js — it lets us read files from disk
import { readFile } from "fs";

// 'path' is built into Node.js — it helps us build file paths correctly
import { join, extname, dirname } from "path";

// 'url' is built into Node.js — needed to get __dirname in ESM modules
import { fileURLToPath } from "url";

// 'ws' is an npm package for WebSockets — run `npm install` to get it
// In ESM, ws exports 'WebSocketServer' (not 'Server')
import { WebSocketServer } from "ws";

// Our pre-built example data
import { EXAMPLES, getExampleSteps } from "./examples.js";

// ── Configuration ─────────────────────────────────────────────────────────────
const PORT = 3001; // The port this server listens on

// In ESM modules, __dirname doesn't exist by default — we recreate it like this:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The frontend files are in the demo/ folder (one level up from demo/backend/)
const FRONTEND_FOLDER = join(__dirname, "..");

// ── HTTP Server ───────────────────────────────────────────────────────────────
// This server responds to regular browser requests (like loading index.html, style.css, etc.)

const server = createServer(function handleRequest(req, res) {
  // Figure out which file the browser is asking for.
  // If they ask for "/", serve "index.html"
  let filePath = req.url === "/" ? "/index.html" : req.url;

  // Build the full path to the file on disk
  const fullPath = join(FRONTEND_FOLDER, filePath);

  // Determine the content type based on the file extension
  // This tells the browser what kind of file we're sending
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".ico": "image/x-icon",
  };
  const ext = extname(fullPath);
  const contentType = contentTypes[ext] || "text/plain";

  // Read the file and send it back to the browser
  readFile(fullPath, function (err, data) {
    if (err) {
      // File not found — send a 404 error
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - File Not Found: " + filePath);
      return;
    }

    // File found — send it with a 200 OK response
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// ── WebSocket Server ──────────────────────────────────────────────────────────
// The WebSocket server sits on top of our HTTP server.
// WebSockets allow real-time, two-way communication between the browser and server.

const wss = new WebSocketServer({ server });

// This runs every time a new browser tab/window connects
wss.on("connection", function handleConnection(ws) {
  console.log("✅ Browser connected via WebSocket");

  // This runs every time the browser sends us a message
  ws.on("message", function handleMessage(rawMessage) {
    // Messages come in as raw text, so we parse the JSON
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch (err) {
      console.error("❌ Could not parse message:", rawMessage);
      return;
    }

    console.log("📨 Received message:", message.type);

    // ── Message: GetExamples ────────────────────────────────────────────────
    // The browser asks: "What examples are available?"
    // We respond with the list of example names for the dropdown menu.
    if (message.type === "GetExamples") {
      const exampleNames = EXAMPLES.map(function (example, index) {
        return { id: index, name: example.name };
      });

      sendMessage(ws, {
        type: "ExamplesList",
        examples: exampleNames,
      });
    }

    // ── Message: RunExample ─────────────────────────────────────────────────
    // The browser asks: "Run example number X"
    // We respond with all the step-by-step data for that example.
    else if (message.type === "RunExample") {
      const exampleId = message.exampleId;
      const data = getExampleSteps(exampleId);

      if (!data) {
        // Invalid example ID
        sendMessage(ws, {
          type: "Error",
          message: "Example #" + exampleId + " does not exist.",
        });
        return;
      }

      console.log(
        `📤 Sending steps for: "${data.name}" (${data.steps.length} steps)`,
      );

      sendMessage(ws, {
        type: "ExampleData",
        name: data.name,
        code: data.code,
        steps: data.steps,
      });
    }

    // ── Unknown message ──────────────────────────────────────────────────────
    else {
      console.log("⚠️  Unknown message type:", message.type);
    }
  });

  // This runs when the browser disconnects (closes the tab, etc.)
  ws.on("close", function () {
    console.log("👋 Browser disconnected");
  });

  // This runs if there's a WebSocket error
  ws.on("error", function (err) {
    console.error("❌ WebSocket error:", err.message);
  });
});

// ── Helper: sendMessage ───────────────────────────────────────────────────────
// A simple helper to turn a JavaScript object into JSON and send it.
function sendMessage(ws, data) {
  try {
    ws.send(JSON.stringify(data));
  } catch (err) {
    console.error("❌ Failed to send message:", err.message);
  }
}

// ── Start the Server ──────────────────────────────────────────────────────────
server.listen(PORT, function () {
  console.log("─────────────────────────────────────────────");
  console.log("🚀 JS Event Loop Visualizer — Demo Server");
  console.log(`🌐 Open your browser: http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────");
});
