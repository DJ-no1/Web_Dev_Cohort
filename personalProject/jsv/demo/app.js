/**
 * app.js — Frontend JavaScript for JS Event Loop Visualizer Demo
 * ----------------------------------------------------------------
 * This file runs in the browser. It does the following:
 *
 *   1. CONNECT    — Opens a WebSocket connection to our Node.js backend
 *   2. LOAD       — Asks the backend for the list of examples (to fill the dropdown)
 *   3. RUN        — When the user clicks "Run ▶", asks the backend for the steps
 *   4. DISPLAY    — Shows each step in the UI (call stack, queues, console)
 *   5. CONTROL    — Handles Prev / Next / Auto Play buttons
 *
 * KEY CONCEPTS YOU WILL SEE HERE:
 *   - WebSocket: Real-time two-way communication between browser and server
 *   - DOM manipulation: Changing what's on the page using JavaScript
 *   - Event listeners: Responding to button clicks, select changes, etc.
 *   - State management: Tracking "where are we" in the playback
 */

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1: GRABBING HTML ELEMENTS
// We store references to DOM elements so we don't have to look them up every time.
// ══════════════════════════════════════════════════════════════════════════════

const connectionStatus = document.getElementById("connectionStatus");
const exampleSelect = document.getElementById("exampleSelect");
const runBtn = document.getElementById("runBtn");
const codeDisplay = document.getElementById("codeDisplay");
const callStackEl = document.getElementById("callStack");
const taskQueueEl = document.getElementById("taskQueue");
const microtaskQueueEl = document.getElementById("microtaskQueue");
const consoleOutputEl = document.getElementById("consoleOutput");
const stepDescription = document.getElementById("stepDescription");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");
const stepCounter = document.getElementById("stepCounter");
const speedSelect = document.getElementById("speedSelect");

// Panel elements (used for the glow highlight effect)
const callStackPanel = document.getElementById("callStackPanel");
const taskQueuePanel = document.getElementById("taskQueuePanel");
const microtaskQueuePanel = document.getElementById("microtaskQueuePanel");
const consolePanel = document.getElementById("consolePanel");

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2: APP STATE
// These variables track what is currently happening in the visualizer.
// ══════════════════════════════════════════════════════════════════════════════

let steps = []; // The array of step objects received from the backend
let currentStep = -1; // Which step we're currently showing (-1 = not started)
let isAutoPlaying = false; // Is the auto-play timer running?
let autoPlayTimer = null; // The interval ID for auto-play (so we can cancel it)

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3: WEBSOCKET CONNECTION
// WebSocket allows real-time communication between browser and server.
// Unlike regular HTTP requests, the connection stays open for back-and-forth messages.
// ══════════════════════════════════════════════════════════════════════════════

let ws = null; // Our WebSocket connection object

/**
 * connectToServer()
 * -----------------
 * Opens a WebSocket connection to our Node.js backend server.
 * Called once when the page loads.
 */
function connectToServer() {
  // The URL of our WebSocket server (backend runs on port 3001)
  const serverUrl = "ws://localhost:3001";

  // Create a new WebSocket connection
  // This instantly tries to connect; the actual connection happens asynchronously
  ws = new WebSocket(serverUrl);

  // ── ws.onopen ─────────────────────────────────────────────────────────────
  // Called when the connection is successfully established
  ws.onopen = function () {
    console.log("✅ Connected to the backend server!");

    // Update the status bar in the UI
    connectionStatus.textContent = "🟢 Connected to backend server";
    connectionStatus.classList.add("connected");

    // Enable the Run button now that we're connected
    runBtn.disabled = false;

    // Ask the server for the list of examples (to fill the dropdown)
    sendToServer({ type: "GetExamples" });
  };

  // ── ws.onmessage ─────────────────────────────────────────────────────────
  // Called every time the server sends us a message
  ws.onmessage = function (event) {
    // Messages are JSON strings — parse them into JavaScript objects
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (err) {
      console.error("Failed to parse server message:", err);
      return;
    }

    // Handle different message types
    handleServerMessage(message);
  };

  // ── ws.onclose ────────────────────────────────────────────────────────────
  // Called when the connection is lost (server stopped, network issue, etc.)
  ws.onclose = function () {
    console.log("❌ WebSocket connection closed.");
    connectionStatus.textContent =
      "🔴 Disconnected — trying to reconnect in 3 seconds...";
    connectionStatus.classList.remove("connected");
    runBtn.disabled = true;

    // Try to reconnect after 3 seconds
    setTimeout(connectToServer, 3000);
  };

  // ── ws.onerror ────────────────────────────────────────────────────────────
  // Called if there's a connection error
  ws.onerror = function (err) {
    console.error("WebSocket error:", err);
    connectionStatus.textContent =
      "🔴 Cannot connect — is the backend running? (npm start in demo/backend/)";
    connectionStatus.classList.remove("connected");
  };
}

/**
 * sendToServer(data)
 * ------------------
 * Sends a JavaScript object to the server as a JSON string.
 * Only sends if the connection is open.
 */
function sendToServer(data) {
  // Check that the connection is open (ReadyState 1 = OPEN)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.warn("Cannot send message — WebSocket not connected.");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4: HANDLING MESSAGES FROM THE SERVER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * handleServerMessage(message)
 * ----------------------------
 * Processes messages received from the backend.
 * Different message types trigger different actions.
 */
function handleServerMessage(message) {
  // ── ExamplesList ───────────────────────────────────────────────────────────
  // Server sent us the list of available examples.
  // We use this to populate the dropdown menu.
  if (message.type === "ExamplesList") {
    populateExamplesDropdown(message.examples);
  }

  // ── ExampleData ────────────────────────────────────────────────────────────
  // Server sent us the full step data for an example.
  // We store the steps and show the first one.
  else if (message.type === "ExampleData") {
    console.log(`Received ${message.steps.length} steps for "${message.name}"`);
    loadSteps(message.code, message.steps);
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  else if (message.type === "Error") {
    stepDescription.textContent = "❌ Server error: " + message.message;
  }
}

/**
 * populateExamplesDropdown(examples)
 * -----------------------------------
 * Fills the <select> dropdown with the example names received from the server.
 * Each option gets a value equal to the example's numeric ID.
 */
function populateExamplesDropdown(examples) {
  // Clear the placeholder "Loading..." option
  exampleSelect.innerHTML = "";

  // Add one <option> for each example
  examples.forEach(function (example) {
    const option = document.createElement("option");
    option.value = example.id; // The ID we'll send back when running
    option.textContent = example.name; // The human-readable name shown in dropdown
    exampleSelect.appendChild(option);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5: LOADING AND DISPLAYING STEPS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * loadSteps(code, newSteps)
 * -------------------------
 * Called when we receive step data from the server.
 * Stores the steps, shows the code, and displays step 0.
 */
function loadSteps(code, newSteps) {
  // Store the steps in our app state
  steps = newSteps;
  currentStep = 0;

  // Show the code in the code panel
  codeDisplay.textContent = code;

  // Enable the navigation buttons
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  autoPlayBtn.disabled = false;

  // Display the first step (index 0)
  displayStep(0);
}

/**
 * displayStep(index)
 * ------------------
 * The main rendering function.
 * Given a step index, updates ALL panels in the UI to match that step's state.
 */
function displayStep(index) {
  // Guard: make sure the index is valid
  if (index < 0 || index >= steps.length) return;

  const step = steps[index];

  // Update the current step in our state
  currentStep = index;

  // ── Update Step Counter ─────────────────────────────────────────────────
  stepCounter.textContent = "Step " + (index + 1) + " / " + steps.length;

  // ── Update Description Bar ──────────────────────────────────────────────
  stepDescription.textContent = step.description;

  // ── Update Call Stack Panel ─────────────────────────────────────────────
  renderStack(callStackEl, step.callStack);

  // ── Update Task Queue Panel ─────────────────────────────────────────────
  renderQueue(taskQueueEl, step.taskQueue, "task-item");

  // ── Update Microtask Queue Panel ────────────────────────────────────────
  renderQueue(microtaskQueueEl, step.microtaskQueue, "micro-item");

  // ── Update Console Output ───────────────────────────────────────────────
  renderConsole(consoleOutputEl, step.consoleOutput);

  // ── Highlight the Active Panel ──────────────────────────────────────────
  highlightPanel(step.highlight);

  // ── Update Prev/Next Button States ─────────────────────────────────────
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === steps.length - 1;
}

/**
 * renderStack(container, frames)
 * ------------------------------
 * Renders the call stack panel.
 * 'frames' is an array of function names like ["square", "multiply"].
 * We display them as stacked boxes. The LAST item in the array = TOP of stack.
 *
 * NOTE: The CSS uses `flex-direction: column-reverse` so we can keep the
 * array order natural (index 0 = bottom) and CSS handles the visual flip.
 */
function renderStack(container, frames) {
  // If the stack is empty, show the "empty" placeholder
  if (!frames || frames.length === 0) {
    container.innerHTML = '<div class="empty-label">empty</div>';
    return;
  }

  // Build the HTML for each frame
  // We REVERSE the array so the last-called function appears at the TOP visually
  container.innerHTML = "";
  var reversed = frames.slice().reverse(); // copy + reverse (don't mutate original)
  reversed.forEach(function (frameName) {
    var div = document.createElement("div");
    div.className = "stack-item";
    div.textContent = frameName + "()";
    container.appendChild(div);
  });
}

/**
 * renderQueue(container, items, itemClass)
 * -----------------------------------------
 * Renders a queue (Task Queue or Microtask Queue).
 * 'items' is an array of callback names like ["greet", "handleResolve"].
 * 'itemClass' is the CSS class for styling (orange vs purple).
 */
function renderQueue(container, items, itemClass) {
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty-label">empty</div>';
    return;
  }

  container.innerHTML = "";
  items.forEach(function (itemName) {
    var div = document.createElement("div");
    div.className = itemClass;
    div.textContent = itemName;
    container.appendChild(div);
  });
}

/**
 * renderConsole(container, lines)
 * --------------------------------
 * Renders the console output panel.
 * 'lines' is an array of strings like ["Hello!", "Result: 16"].
 */
function renderConsole(container, lines) {
  if (!lines || lines.length === 0) {
    container.innerHTML = '<div class="empty-label">nothing logged yet</div>';
    return;
  }

  container.innerHTML = "";
  lines.forEach(function (line) {
    var div = document.createElement("div");
    div.className = "console-line";
    div.textContent = line;
    container.appendChild(div);
  });
}

/**
 * highlightPanel(panelName)
 * --------------------------
 * Adds a glowing border to the specified panel to draw the student's attention.
 * After a short delay, the glow fades away.
 *
 * panelName can be:
 *   "callStack"      → highlights the Call Stack panel
 *   "taskQueue"      → highlights the Task Queue panel
 *   "microtaskQueue" → highlights the Microtask Queue panel
 *   "console"        → highlights the Console panel
 *   "eventLoop"      → highlights both queue panels (event loop checking)
 *   null             → no highlight
 */
function highlightPanel(panelName) {
  // First, remove any existing highlights from all panels
  callStackPanel.classList.remove("highlight");
  taskQueuePanel.classList.remove("highlight");
  microtaskQueuePanel.classList.remove("highlight");
  consolePanel.classList.remove("highlight");

  // Apply the new highlight if one was specified
  if (panelName === "callStack") {
    callStackPanel.classList.add("highlight");
  } else if (panelName === "taskQueue") {
    taskQueuePanel.classList.add("highlight");
  } else if (panelName === "microtaskQueue") {
    microtaskQueuePanel.classList.add("highlight");
  } else if (panelName === "console") {
    consolePanel.classList.add("highlight");
  } else if (panelName === "eventLoop") {
    // When the Event Loop is checking, highlight both queues
    taskQueuePanel.classList.add("highlight");
    microtaskQueuePanel.classList.add("highlight");
  }
  // If null, nothing gets highlighted — the previous removes are enough
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6: PLAYBACK CONTROLS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * goToNextStep()
 * --------------
 * Advances to the next step in the visualizer.
 */
function goToNextStep() {
  if (currentStep < steps.length - 1) {
    displayStep(currentStep + 1);
  }
}

/**
 * goToPrevStep()
 * --------------
 * Goes back to the previous step.
 */
function goToPrevStep() {
  if (currentStep > 0) {
    displayStep(currentStep - 1);
  }
}

/**
 * startAutoPlay()
 * ---------------
 * Automatically advances through steps at the selected speed.
 * Changes the Auto Play button to a "Pause" button while playing.
 */
function startAutoPlay() {
  isAutoPlaying = true;

  // Change button label to "Pause"
  autoPlayBtn.textContent = "⏸ Pause";
  autoPlayBtn.classList.add("is-playing");

  // Disable prev/next while auto-playing (avoid confusion)
  prevBtn.disabled = true;

  // Get the delay (in ms) from the speed dropdown
  var delay = parseInt(speedSelect.value, 10);

  // Set an interval that calls goToNextStep() repeatedly
  autoPlayTimer = setInterval(function () {
    // If we've reached the last step, stop automatically
    if (currentStep >= steps.length - 1) {
      stopAutoPlay();
      return;
    }
    goToNextStep();
  }, delay);
}

/**
 * stopAutoPlay()
 * --------------
 * Stops the auto-play and resets the button.
 */
function stopAutoPlay() {
  isAutoPlaying = false;
  clearInterval(autoPlayTimer);
  autoPlayTimer = null;

  // Reset button label
  autoPlayBtn.textContent = "▶ Auto Play";
  autoPlayBtn.classList.remove("is-playing");

  // Re-enable prev/next
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = currentStep === steps.length - 1;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7: EVENT LISTENERS
// These connect the HTML buttons/selects to our JavaScript functions.
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Run Button
 * When the user clicks "Run ▶", find the selected example and ask the server for its steps.
 */
runBtn.addEventListener("click", function () {
  // Stop any ongoing auto-play
  if (isAutoPlaying) stopAutoPlay();

  // Get the ID of the selected example
  var selectedId = parseInt(exampleSelect.value, 10);

  // Reset the UI while we wait for the server response
  steps = [];
  currentStep = -1;
  stepDescription.textContent = "⏳ Loading...";
  stepCounter.textContent = "Step 0 / 0";
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  autoPlayBtn.disabled = true;
  renderStack(callStackEl, []);
  renderQueue(taskQueueEl, [], "task-item");
  renderQueue(microtaskQueueEl, [], "micro-item");
  renderConsole(consoleOutputEl, []);
  highlightPanel(null);

  // Send the request to the server
  sendToServer({ type: "RunExample", exampleId: selectedId });
});

/**
 * Previous Button
 * Go back one step.
 */
prevBtn.addEventListener("click", function () {
  if (!isAutoPlaying) goToPrevStep();
});

/**
 * Next Button
 * Advance one step.
 */
nextBtn.addEventListener("click", function () {
  if (!isAutoPlaying) goToNextStep();
});

/**
 * Auto Play Button
 * Toggle between playing and pausing.
 */
autoPlayBtn.addEventListener("click", function () {
  if (isAutoPlaying) {
    stopAutoPlay(); // If already playing, pause
  } else {
    startAutoPlay(); // If paused, start playing
  }
});

/**
 * Speed Select
 * If the user changes the speed while auto-playing, restart with new speed.
 */
speedSelect.addEventListener("change", function () {
  if (isAutoPlaying) {
    stopAutoPlay();
    startAutoPlay(); // Restart with the new speed
  }
});

/**
 * Keyboard Shortcuts (arrow keys for navigation)
 * ← left arrow  = previous step
 * → right arrow = next step
 * Space         = toggle auto-play
 */
document.addEventListener("keydown", function (event) {
  // Don't trigger shortcuts if the user is typing in the select/dropdown
  if (document.activeElement === exampleSelect) return;

  if (event.key === "ArrowRight" && !nextBtn.disabled && !isAutoPlaying) {
    goToNextStep();
  }
  if (event.key === "ArrowLeft" && !prevBtn.disabled && !isAutoPlaying) {
    goToPrevStep();
  }
  if (event.key === " ") {
    event.preventDefault(); // Prevent page scroll on spacebar
    if (!autoPlayBtn.disabled) {
      autoPlayBtn.click();
    }
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 8: INITIALIZATION
// This runs once when the page loads.
// ══════════════════════════════════════════════════════════════════════════════

// Connect to the WebSocket server
connectToServer();

// Quick sanity check in the console
console.log("JS Event Loop Visualizer — Demo app.js loaded!");
console.log(
  "Open the server (npm start in demo/backend/) and refresh if not connected.",
);
