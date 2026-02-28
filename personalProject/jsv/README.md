# JS Visualizer — JavaScript Event Loop Visualizer

An interactive web application that lets users write JavaScript code and visualize its execution through the **Call Stack**, **Task Queue**, **Microtask Queue**, and **Event Loop** in real time. Inspired by [js-visualizer-9000](https://github.com/nicknisi/js-visualizer-9000-client).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Backend (Execution Server)](#backend-execution-server)
- [Frontend (Next.js App)](#frontend-nextjs-app)
- [State Management](#state-management)
- [Event Types & Protocol](#event-types--protocol)
- [Component Reference](#component-reference)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Key Design Decisions](#key-design-decisions)
- [Known Limitations](#known-limitations)

---

## Architecture Overview

```
┌─────────────────────────────────┐       WebSocket       ┌─────────────────────────────────┐
│         FRONTEND (Next.js)      │ ◄──────────────────► │     BACKEND (Node.js Server)    │
│                                 │                       │                                 │
│  Monaco Editor (code input)     │   { type: "RunCode",  │  WebSocket Server (ws)          │
│  Zustand Store (state)          │     payload: "..." }  │  ↓                              │
│  Visualization Panels           │                       │  launchWorker.js                │
│  - Call Stack                   │   [...reduced events] │  ↓                              │
│  - Task Queue                   │ ◄──────────────────── │  worker.js (worker_thread)      │
│  - Microtask Queue              │                       │  - falafel (AST instrumentation) │
│  - Event Loop Stepper           │                       │  - async_hooks (event tracing)  │
│  - Console Output               │                       │  - vm2 (sandboxed execution)    │
│  Playback Controls              │                       │  ↓                              │
│                                 │                       │  eventsReducer.js               │
│  Deploy: Vercel                 │                       │  Deploy: Heroku                 │
└─────────────────────────────────┘                       └─────────────────────────────────┘
```

The frontend and backend are **completely separate** deployable units. The frontend connects to the backend via WebSocket at the URL configured in `NEXT_PUBLIC_WS_URL`.

---

## Tech Stack

### Frontend

| Technology                                                 | Purpose                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| Next.js 16.1.6 (App Router, Turbopack)                     | React framework                                           |
| React 19.2.3                                               | UI library                                                |
| TypeScript                                                 | Type safety                                               |
| Tailwind CSS v4 + shadcn/ui (new-york style, zinc palette) | Styling & UI components                                   |
| Monaco Editor (`@monaco-editor/react`)                     | Code editor with syntax highlighting & inline decorations |
| Zustand                                                    | Global state management (store with playback logic)       |
| Framer Motion                                              | 150ms ease-out animations for stack/queue items           |
| nanoid                                                     | Unique ID generation for frames and queue items           |
| lucide-react                                               | Icons                                                     |

### Backend

| Technology             | Purpose                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| ws                     | WebSocket server                                                                      |
| worker_threads         | Isolated code execution in a separate thread                                          |
| async_hooks            | Traces Promise, Timeout, and Microtask lifecycle events                               |
| falafel                | AST-based code instrumentation (wraps function bodies with enter/exit tracers)        |
| @babel/core            | Babel plugin to inject `Tracer.iterateLoop()` into loops for infinite loop protection |
| vm2                    | Sandboxed code execution with controlled globals                                      |
| lodash + pretty-format | Utilities for deduplication and console output formatting                             |

---

## Project Structure

```
jsv/
├── app/
│   ├── globals.css           # Tailwind v4 imports, shadcn theme vars, Monaco highlight CSS
│   ├── layout.tsx            # Root layout: dark mode, Geist fonts, TooltipProvider
│   └── page.tsx              # Main page: 2-column layout wiring all components
├── backend/
│   ├── index.js              # Entry point: require('./src/main/app')
│   ├── package.json          # Backend deps (ws, falafel, vm2, @babel/core, etc.)
│   ├── Procfile              # Heroku: "web: node index.js"
│   ├── .gitignore
│   └── src/
│       ├── main/
│       │   ├── app.js            # WebSocket server: receives RunCode, launches worker, sends reduced events
│       │   ├── launchWorker.js   # Spawns worker_thread, forwards messages, handles errors
│       │   └── eventsReducer.js  # Post-processes raw async_hooks events into playable sequence
│       └── worker/
│           ├── worker.js         # Code instrumentation (falafel) + execution (vm2) + event tracing (async_hooks)
│           └── loopTracer.js     # Babel plugin: injects Tracer.iterateLoop() into loop bodies
├── components/
│   ├── call-stack.tsx        # Call Stack panel (vertical LIFO, AnimatePresence)
│   ├── code-editor.tsx       # Monaco editor with custom dark theme + marker decorations
│   ├── console-output.tsx    # Console output panel (log/warn/error with auto-scroll)
│   ├── controls.tsx          # Example selector, Run/Edit, Step/Auto/Pause, Reset, Speed
│   ├── event-loop.tsx        # 4-step Event Loop stepper (vertical, active/completed states)
│   ├── info-dialogs.tsx      # Info (i) buttons with educational Dialog for each panel
│   ├── queue-panel.tsx       # Shared horizontal queue panel (used for Task & Microtask Queue)
│   └── ui/                   # shadcn/ui primitives (badge, button, card, dialog, scroll-area, select, separator, tooltip)
├── lib/
│   ├── examples.ts           # 7 preset code examples (DEFAULT_CODE exported)
│   ├── store.ts              # Zustand store: state + playback engine (playNextEvent, autoPlay, etc.)
│   ├── types.ts              # TypeScript types: EventType, JSVEvent, AppMode, StackFrame, QueueItem, etc.
│   ├── utils.ts              # cn() helper (clsx + tailwind-merge)
│   └── ws-client.ts          # fetchEventsForCode(): WebSocket client, sends code → receives reduced events
├── .env.local                # NEXT_PUBLIC_WS_URL=ws://localhost:8080
├── components.json           # shadcn/ui config (new-york style, zinc base, aliases)
├── package.json              # Frontend deps
└── tsconfig.json
```

---

## Data Flow

### 1. User writes code → clicks "Run"

```
User types JS code in Monaco Editor
   ↓
store.runCode() is called
   ↓
Mode transitions: "editing" → "running"
   ↓
ws-client.ts: fetchEventsForCode(code)
   - Opens WebSocket to NEXT_PUBLIC_WS_URL
   - Sends: { type: "RunCode", payload: "<user code>" }
```

### 2. Backend instruments and executes code

```
app.js receives RunCode message
   ↓
launchWorker(code, onEvent) spawns a worker_thread
   ↓
worker.js in the worker thread:
   1. falafel parses code AST
   2. Wraps every function body with Tracer.enterFunc/exitFunc in try/finally
   3. Babel plugin injects Tracer.iterateLoop() into all loop bodies
   4. async_hooks enabled: init/before/after/destroy/promiseResolve
   5. vm2 executes the instrumented code in a sandbox
   6. Events are posted to parent via parentPort.postMessage()
   ↓
Worker exits → "Done" event sent
   ↓
app.js collects all events, runs eventsReducer.reduceEvents()
   ↓
Reduced events array sent back over WebSocket as JSON
```

### 3. Frontend receives events → visualization begins

```
ws-client.ts receives the array, resolves the Promise
   ↓
store.runCode() stores events, mode → "visualizing"
   ↓
User clicks "Step" or "Auto" to play through events
   ↓
store.playNextEvent():
   - Skips non-playable events (UncaughtError, EarlyTermination logged to console)
   - Processes the next playable event:
     - EnterFunction → push to frames[], update markers[]
     - ExitFunction → pop from frames[], pop markers[]
     - EnqueueMicrotask → push to microtasks[]
     - DequeueMicrotask → shift from microtasks[]
     - InitTimeout → push to tasks[]
     - BeforeTimeout → remove from tasks[]
     - ConsoleLog/Warn/Error → append to consoleOutput[]
   - Determines currentStep (evaluateScript/runTask/runMicrotasks/rerender)
   - Auto-advances when DequeueMicrotask/BeforeTimeout is followed by EnterFunction
```

---

## Backend (Execution Server)

### `backend/src/main/app.js`

WebSocket server on `process.env.PORT || 8080`. Handles one message type: `RunCode`. For each execution:

- Spawns a worker via `launchWorker()`
- Collects all events until `Done`
- Runs `reduceEvents()` to post-process events
- Sends reduced events array as JSON back to client
- Safety timeout: 10 seconds, then `EarlyTermination` sent

### `backend/src/main/launchWorker.js`

Spawns `worker.js` as a `Worker` thread with `workerData = sourceCode`. Forwards all `message` events to the callback. On worker error → `UncaughtError`. On worker exit → `Done`.

### `backend/src/main/eventsReducer.js`

Critical post-processing step. The raw events from `async_hooks` need significant reduction:

1. **Deduplicates** multiple `ResolvePromise` events for the same promise ID
2. **Determines which promises had callbacks invoked**: Scans for `BeforePromise → EnterFunction` patterns, maps child promise IDs to parent IDs via `InitPromise` events
3. **Injects `EnqueueMicrotask`** events when a `ResolvePromise` matches a promise that had its callback invoked
4. **Injects `DequeueMicrotask`** before `EnterFunction` when preceded by `BeforePromise` or `BeforeMicrotask`
5. **Injects `Rerender`** before each `BeforeTimeout` (simulating the browser render step)
6. **Handles `queueMicrotask()`** via `InitMicrotask`/`BeforeMicrotask`/`AfterMicrotask` pattern

### `backend/src/worker/worker.js`

The core execution engine. Steps:

1. **AST instrumentation (falafel)**: Wraps every function body in `Tracer.enterFunc()` / `Tracer.exitFunc()` with a `try/finally` block. Handles regular functions, function expressions, and arrow functions (both block body and implicit return).

2. **Loop protection (Babel)**: Injects `Tracer.iterateLoop()` into while, do-while, for, for-in, for-of loop bodies. The tracer checks a 5-second timeout and 500-event limit.

3. **async_hooks**: Hooks `init`, `before`, `after`, `destroy`, `promiseResolve` to trace:
   - `PROMISE` type → `InitPromise`, `BeforePromise`, `AfterPromise`, `ResolvePromise`
   - `Timeout` type → `InitTimeout`, `BeforeTimeout`
   - `Microtask` type → `InitMicrotask`, `BeforeMicrotask`, `AfterMicrotask`

4. **Sandbox (vm2)**: Runs instrumented code with controlled globals: `setTimeout`, `queueMicrotask`, `console` (log/warn/error), `Tracer`, `nextId`, `lodash`.

### `backend/src/worker/loopTracer.js`

A Babel visitor plugin. For each loop statement type (`WhileStatement`, `DoWhileStatement`, `ForStatement`, `ForInStatement`, `ForOfStatement`), pushes a `Tracer.iterateLoop()` call expression to the loop body.

---

## Frontend (Next.js App)

### Pages

**`app/layout.tsx`**: Root layout. Sets `<html className="dark">` for permanent dark mode. Wraps children in `<TooltipProvider>`. Uses Geist and Geist Mono fonts.

**`app/page.tsx`**: Client component. Two-column responsive layout:

- **Left column (45%)**: `<CodeEditor>` + `<ConsoleOutput>`
- **Right column (55%)**: `<QueuePanel title="Task Queue">` + `<QueuePanel title="Microtask Queue">` + bottom row of `<CallStack>` (240px fixed) + `<EventLoopStepper>` (flex fill)
- Header with title "JS Visualizer"
- Controls bar below header
- Error display (conditional)
- Monaco Editor is loaded via `next/dynamic` with `ssr: false`

### Styling

- **Theme**: Dark mode only. Zinc color palette throughout (zinc-950 background, zinc-800 borders, zinc-300 text).
- **globals.css**: Tailwind v4 imports (`tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`), dark variant, shadcn theme variables, Monaco `.jsv-highlight` / `.jsv-highlight-inline` classes.
- **Animations**: Framer Motion with 150ms ease-out transitions. `AnimatePresence` with `mode="popLayout"` for graceful entry/exit of stack frames and queue items.

---

## State Management

### Zustand Store (`lib/store.ts`)

Single global store with the following shape:

```typescript
interface JSVState {
  // Code
  code: string; // Current editor content
  mode: AppMode; // "editing" | "running" | "visualizing"
  example: string; // Name of selected example

  // Visualization data (what's currently displayed in panels)
  frames: StackFrame[]; // Call stack frames (id + name)
  tasks: QueueItem[]; // Task queue items (id + name + numericId)
  microtasks: QueueItem[]; // Microtask queue items (id + name)
  markers: CodeMarker[]; // Monaco editor highlights (start + end offsets)
  consoleOutput: ConsoleEntry[]; // Console entries (id + type + message)

  // Playback
  events: JSVEvent[]; // Full array of reduced events from backend
  currentEventIndex: number; // Pointer into events array
  currentStep: EventLoopStep; // "none" | "evaluateScript" | "runTask" | "runMicrotasks" | "rerender"
  isAutoPlaying: boolean; // Whether auto-play loop is running
  playbackSpeed: number; // 0.5, 1, 2, or 4

  // Error
  error: string | null;

  // Actions
  setCode(code: string): void;
  setExample(example: string): void;
  setPlaybackSpeed(speed: number): void;
  runCode(): Promise<void>; // Sends code to backend, receives events
  reset(): void; // Returns to editing mode
  playNextEvent(): boolean; // Advances one step, returns true if reached end
  autoPlay(): void; // Starts auto-play loop
  pause(): void; // Stops auto-play
}
```

### Playback Engine (`playNextEvent`)

The core visualization logic. On each call:

1. Skips non-playable events (but logs `UncaughtError`/`EarlyTermination` to console)
2. Processes one playable event by mutating the visualization state
3. Skips non-playable events again after processing
4. Determines the `currentStep` based on the next upcoming event
5. Auto-chains: if a `DequeueMicrotask`/`BeforeTimeout` is immediately followed by `EnterFunction`, recursively calls itself to show the function entering the call stack

### Auto-play

Calls `playNextEvent()` in a loop with a delay of `max(100, 500 / speed)` ms between steps. Stops when events are exhausted or user pauses.

---

## Event Types & Protocol

### WebSocket Protocol

**Client → Server:**

```json
{ "type": "RunCode", "payload": "console.log('hello')" }
```

**Server → Client:**

```json
[
  {
    "type": "EnterFunction",
    "payload": { "id": 0, "name": "anonymous", "start": 0, "end": 22 }
  },
  { "type": "ConsoleLog", "payload": { "message": "hello\n" } },
  {
    "type": "ExitFunction",
    "payload": { "id": 0, "name": "anonymous", "start": 0, "end": 22 }
  }
]
```

### Event Type Reference

| Event              | Produced By                          | Payload                             | Playable | Effect on UI                                |
| ------------------ | ------------------------------------ | ----------------------------------- | -------- | ------------------------------------------- |
| `EnterFunction`    | falafel instrumentation              | `{ id, name, start, end }`          | Yes      | Push frame to Call Stack, highlight code    |
| `ExitFunction`     | falafel instrumentation              | `{ id, name, start, end }`          | Yes      | Pop frame from Call Stack, remove highlight |
| `ErrorFunction`    | falafel instrumentation              | `{ message, id, name, start, end }` | Yes      | Log error to Console                        |
| `ConsoleLog`       | vm2 sandbox `console.log`            | `{ message }`                       | Yes      | Append log to Console                       |
| `ConsoleWarn`      | vm2 sandbox `console.warn`           | `{ message }`                       | Yes      | Append warn to Console                      |
| `ConsoleError`     | vm2 sandbox `console.error`          | `{ message }`                       | Yes      | Append error to Console                     |
| `InitTimeout`      | async_hooks `init` (Timeout)         | `{ id, callbackName }`              | Yes      | Push item to Task Queue                     |
| `BeforeTimeout`    | async_hooks `before` (Timeout)       | `{ id }`                            | Yes      | Remove item from Task Queue                 |
| `EnqueueMicrotask` | eventsReducer (synthetic)            | `{ name }`                          | Yes      | Push item to Microtask Queue                |
| `DequeueMicrotask` | eventsReducer (synthetic)            | `{}`                                | Yes      | Shift item from Microtask Queue             |
| `Rerender`         | eventsReducer (synthetic)            | `{}`                                | Yes      | Visual step indicator                       |
| `InitPromise`      | async_hooks `init` (PROMISE)         | `{ id, parentId }`                  | No       | Used by reducer for mapping                 |
| `ResolvePromise`   | async_hooks `promiseResolve`         | `{ id }`                            | No       | Triggers EnqueueMicrotask in reducer        |
| `BeforePromise`    | async_hooks `before` (PromiseWrap)   | `{ id }`                            | No       | Triggers DequeueMicrotask injection         |
| `AfterPromise`     | async_hooks `after` (PromiseWrap)    | `{ id }`                            | No       | Internal tracking                           |
| `InitMicrotask`    | async_hooks `init` (Microtask)       | `{ id, parentId }`                  | No       | Used by reducer for queueMicrotask tracking |
| `BeforeMicrotask`  | async_hooks `before` (AsyncResource) | `{ id }`                            | No       | Triggers DequeueMicrotask injection         |
| `AfterMicrotask`   | async_hooks `after` (AsyncResource)  | `{ id }`                            | No       | Internal tracking                           |
| `UncaughtError`    | worker error handler                 | `{ name, message, stack }`          | No       | Logged to Console as error                  |
| `EarlyTermination` | timeout/event limit                  | `{ message }`                       | No       | Logged to Console as warning                |
| `Done`             | worker exit                          | `{ exitCode }`                      | No       | Signals end of execution                    |

---

## Component Reference

### `components/code-editor.tsx`

Monaco editor wrapper. Defines a custom `jsv-dark` theme matching the zinc palette. Manages `decorationsCollection` for code highlighting during visualization. Read-only when `mode !== "editing"`.

### `components/call-stack.tsx`

Vertical LIFO display with `flex-col-reverse`. Uses `AnimatePresence` with `mode="popLayout"`. Newest frame (top of stack) gets brighter styling (`bg-zinc-700 text-white`). Empty state shown when no frames.

### `components/queue-panel.tsx`

Shared component used for both Task Queue and Microtask Queue. Horizontal layout with `ScrollArea` + `ScrollBar`. First item (oldest, next to be dequeued) gets brighter styling. Props: `title`, `items: QueueItem[]`, `panelType`.

### `components/event-loop.tsx`

4-step vertical stepper showing the Event Loop phases. Steps: Evaluate Script → Run a Task → Run all Microtasks → Rerender. Active step: white filled circle + description text. Completed steps: checkmark. Reads `currentStep` from store.

### `components/console-output.tsx`

Card with auto-scrolling `ScrollArea`. Displays `log` (zinc-300), `warn` (yellow-400 with ⚠), `error` (red-400 with ✕) entries. Monospace font. Max height 200px.

### `components/controls.tsx`

Toolbar with:

- **Example selector**: `Select` dropdown with 7 preset examples
- **Run / Edit button**: Toggles between modes
- **Step**: Advances one event (`playNextEvent()`)
- **Auto / Pause**: Toggles auto-play
- **Reset**: Returns to editing mode (ghost button with RotateCcw icon)
- **Speed selector**: 0.5x / 1x / 2x / 4x

### `components/info-dialogs.tsx`

Provides an `InfoButton` component that renders a small ℹ icon. Clicking it opens a `Dialog` with educational content about the panel (Call Stack, Task Queue, Microtask Queue, or Event Loop). Content explains the concept, TL;DR, and detailed description.

---

## Running Locally

### Prerequisites

- Node.js 18+ (backend requires `worker_threads`, `async_hooks`, `vm2`)
- npm or pnpm

### Backend

```bash
cd backend
npm install
node index.js
# → "JSV Server running on port: 8080"
```

Or with file watching:

```bash
npm run dev
```

### Frontend

```bash
# From project root (jsv/)
npm install
npm run dev
# → http://localhost:3000
```

The frontend reads `NEXT_PUBLIC_WS_URL` from `.env.local` (defaults to `ws://localhost:8080`).

---

## Deployment

### Frontend → Vercel

1. Push to Git repo
2. Import in Vercel
3. Set environment variable: `NEXT_PUBLIC_WS_URL=wss://your-heroku-app.herokuapp.com`
4. Deploy (Next.js auto-detected)

### Backend → Heroku

```bash
cd backend
heroku create your-app-name
git init && git add . && git commit -m "init"
heroku git:remote -a your-app-name
git push heroku main
```

The `Procfile` tells Heroku to run `web: node index.js`. The WebSocket server uses `process.env.PORT` assigned by Heroku.

**Important**: Set the frontend's `NEXT_PUBLIC_WS_URL` to `wss://your-app-name.herokuapp.com` (note `wss://` for Heroku's TLS termination).

---

## Key Design Decisions

1. **Split architecture**: The backend needs `worker_threads`, `async_hooks`, and `vm2` which are Node.js-only APIs unavailable in serverless/edge runtimes. Heroku provides a persistent Node.js process.

2. **Event reduction pipeline**: Raw `async_hooks` events are too granular for visualization. The `eventsReducer` synthesizes user-friendly events like `EnqueueMicrotask` and `DequeueMicrotask` from low-level promise/microtask lifecycle events.

3. **falafel over Babel for instrumentation**: falafel provides simpler string-based source transforms that preserve original character offsets (`start`/`end`), which are used for Monaco editor code highlighting.

4. **Zustand over Context/Redux**: Lightweight, no boilerplate, supports reading state outside React components (used in `autoPlay` loop).

5. **Dark-only theme**: The application is permanently in dark mode (`<html className="dark">`). All colors use the zinc scale for a minimal black-and-white aesthetic.

6. **150ms animations**: All Framer Motion transitions use `duration: 0.15, ease: "easeOut"` for snappy, non-distracting visual feedback.

---

## Known Limitations

- **vm2 is deprecated**: The `vm2` package is no longer maintained. Consider migrating to `isolated-vm` or `vm2`'s successor for production use.
- **Node.js 18 engine**: The `backend/package.json` specifies `"engines": { "node": "18.x" }`. Newer Node versions work but may produce warnings.
- **No persistent sessions**: Each "Run" creates a new WebSocket connection. There's no session persistence or code saving.
- **Browser-only APIs not supported**: The sandbox only provides `setTimeout`, `queueMicrotask`, and `console`. APIs like `setInterval`, `requestAnimationFrame`, `fetch`, DOM APIs, etc. are not available in the execution sandbox.
- **Single execution at a time**: The backend processes one execution per WebSocket connection. There's no queuing or concurrency limiting beyond the 10s timeout.

---

## Preset Examples

| Name                    | Demonstrates                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| Default (Mixed)         | `setTimeout`, `Promise.then`, synchronous calls — shows execution order |
| Call Stack              | 10 nested function calls — visualizes LIFO stack behavior               |
| Task Queue              | Multiple `setTimeout` with different delays                             |
| Microtask Queue         | `Promise.resolve().then()` and `Promise.reject().catch()`               |
| Tasks vs Microtasks     | Side-by-side comparison of Task and Microtask execution order           |
| Nested Promises         | Promise chain with `.then().then().then()`                              |
| Mixed Timers & Promises | Interleaved `setTimeout` and `Promise.resolve` with `console.log`       |
