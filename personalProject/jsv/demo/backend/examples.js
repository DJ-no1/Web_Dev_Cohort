/**
 * examples.js
 * -----------
 * This file contains pre-built examples for teaching the JavaScript Event Loop.
 *
 * Each example has:
 *   - name: Human-friendly title shown in the dropdown
 *   - code: The JavaScript code being demonstrated
 *   - steps: An array of "snapshots" of the JS engine state at each moment
 *
 * Each STEP represents the full state of the JS engine at that point in time:
 *   - description    : What is happening right now (shown in the status bar)
 *   - callStack      : Array of function names on the Call Stack (first = bottom, last = top)
 *   - taskQueue      : Array of callback names waiting in the Task Queue (setTimeout, setInterval)
 *   - microtaskQueue : Array of callback names waiting in the Microtask Queue (Promise.then)
 *   - consoleOutput  : Array of strings printed to the console so far
 *   - highlight      : Which panel to visually highlight — "callStack" | "taskQueue" | "microtaskQueue" | "console" | "eventLoop" | null
 *
 * HOW TO READ THIS FILE AS A STUDENT:
 * Think of each step like a "frame" in a stop-motion animation.
 * Each frame shows you a snapshot of what is happening inside JavaScript's engine.
 * The visualizer will show you these frames one by one.
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 0 — Call Stack Basics
// Goal: Understand how function calls are tracked on the Call Stack
// ─────────────────────────────────────────────────────────────────────────────

const example0 = {
  name: "Example 1: Call Stack Basics",

  // The code the student is watching be executed
  code: `function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

var result = square(4);
console.log("Result: " + result);`,

  // Step-by-step snapshots of the JS engine state
  steps: [
    {
      description:
        "🚀 Script starts. The Call Stack, Task Queue, and Microtask Queue are all empty.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: null,
    },
    {
      description:
        "square(4) is called on line 9 → it gets PUSHED onto the top of the Call Stack.",
      callStack: ["square"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: "callStack",
    },
    {
      description:
        "Inside square(), multiply(4, 4) is called → PUSHED onto the Call Stack. square() pauses and waits.",
      callStack: ["square", "multiply"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: "callStack",
    },
    {
      description:
        "multiply() executes: 4 * 4 = 16, then returns 16 → POPPED off the Call Stack. square() resumes.",
      callStack: ["square"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: "callStack",
    },
    {
      description:
        "square() receives 16, returns it → POPPED off the Call Stack. result = 16.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: "callStack",
    },
    {
      description:
        "console.log('Result: 16') is called → PUSHED onto Call Stack. It prints to the console!",
      callStack: ["console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["Result: 16"],
      highlight: "console",
    },
    {
      description:
        "console.log() finishes → POPPED off the Call Stack. Nothing left to run.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["Result: 16"],
      highlight: "callStack",
    },
    {
      description:
        "✅ All done! The Call Stack is completely empty. The program has finished running.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["Result: 16"],
      highlight: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1 — setTimeout and the Task Queue
// Goal: Understand that setTimeout callbacks don't run immediately.
//       They wait in the Task Queue until the Call Stack is empty.
// ─────────────────────────────────────────────────────────────────────────────

const example1 = {
  name: "Example 2: setTimeout (Task Queue)",

  code: `console.log("1. Start");

// setTimeout schedules 'greet' to run after 1000ms.
// JavaScript does NOT stop and wait here!
setTimeout(function greet() {
  console.log("3. Hello from the Task Queue!");
}, 1000);

console.log("2. End of synchronous code");`,

  steps: [
    {
      description: "🚀 Script starts. Everything is empty.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: null,
    },
    {
      description:
        'console.log("1. Start") → PUSHED onto Call Stack. Prints "1. Start" to the console.',
      callStack: ["console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "console",
    },
    {
      description:
        'console.log() finishes → POPPED off. "1. Start" stays in the console.',
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "callStack",
    },
    {
      description:
        "setTimeout(greet, 1000) is called → PUSHED onto Call Stack.",
      callStack: ["setTimeout"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "callStack",
    },
    {
      description:
        "⏰ setTimeout() registers a 1-second timer with the browser/Node.js. The 'greet' callback is placed into the Task Queue after the delay. JavaScript does NOT pause here — it continues immediately!",
      callStack: [],
      taskQueue: ["greet (after 1s delay)"],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "taskQueue",
    },
    {
      description:
        'console.log("2. End of synchronous code") → PUSHED, prints output.',
      callStack: ["console.log"],
      taskQueue: ["greet (after 1s delay)"],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of synchronous code"],
      highlight: "console",
    },
    {
      description:
        "console.log() done → POPPED off. The main synchronous script has finished.",
      callStack: [],
      taskQueue: ["greet (after 1s delay)"],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of synchronous code"],
      highlight: "callStack",
    },
    {
      description:
        "⚡ Call Stack is EMPTY! The Event Loop checks: any tasks waiting? Yes! 'greet' is in the Task Queue.",
      callStack: [],
      taskQueue: ["greet (after 1s delay)"],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of synchronous code"],
      highlight: "eventLoop",
    },
    {
      description:
        "🔄 Event Loop moves 'greet' FROM the Task Queue → TO the Call Stack. Now it runs!",
      callStack: ["greet"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of synchronous code"],
      highlight: "callStack",
    },
    {
      description:
        'Inside greet: console.log("3. Hello from the Task Queue!") → PUSHED and prints.',
      callStack: ["greet", "console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End of synchronous code",
        "3. Hello from the Task Queue!",
      ],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: ["greet"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End of synchronous code",
        "3. Hello from the Task Queue!",
      ],
      highlight: "callStack",
    },
    {
      description:
        "✅ greet() finishes → POPPED. Task Queue is empty. Program is completely done!",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End of synchronous code",
        "3. Hello from the Task Queue!",
      ],
      highlight: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2 — Promise and the Microtask Queue
// Goal: Understand that Promise.then() callbacks go into the Microtask Queue,
//       which is always processed BEFORE the Task Queue.
// ─────────────────────────────────────────────────────────────────────────────

const example2 = {
  name: "Example 3: Promise (Microtask Queue)",

  code: `console.log("1. Start");

// .then() registers 'onFulfilled' as a microtask
Promise.resolve("Hello!").then(function onFulfilled(value) {
  console.log("3. Promise: " + value);
});

console.log("2. End of script");`,

  steps: [
    {
      description: "🚀 Script starts. Everything is empty.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: null,
    },
    {
      description: 'console.log("1. Start") → PUSHED, prints "1. Start".',
      callStack: ["console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "callStack",
    },
    {
      description:
        "Promise.resolve('Hello!').then(onFulfilled) is called. The Promise is already resolved, so 'onFulfilled' is immediately queued in the Microtask Queue.",
      callStack: ["Promise.resolve", ".then"],
      taskQueue: [],
      microtaskQueue: ["onFulfilled"],
      consoleOutput: ["1. Start"],
      highlight: "microtaskQueue",
    },
    {
      description:
        ".then() returns immediately. 'onFulfilled' is scheduled but NOT yet executed! Note it sits in the Microtask Queue.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: ["onFulfilled"],
      consoleOutput: ["1. Start"],
      highlight: "microtaskQueue",
    },
    {
      description:
        'console.log("2. End of script") → PUSHED, prints "2. End of script".',
      callStack: ["console.log"],
      taskQueue: [],
      microtaskQueue: ["onFulfilled"],
      consoleOutput: ["1. Start", "2. End of script"],
      highlight: "console",
    },
    {
      description:
        "console.log() done → POPPED. Synchronous script has finished.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: ["onFulfilled"],
      consoleOutput: ["1. Start", "2. End of script"],
      highlight: "callStack",
    },
    {
      description:
        "⚡ Call Stack is EMPTY! Before checking the Task Queue, JavaScript ALWAYS drains the Microtask Queue first! 'onFulfilled' is waiting there.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: ["onFulfilled"],
      consoleOutput: ["1. Start", "2. End of script"],
      highlight: "microtaskQueue",
    },
    {
      description:
        "🔄 'onFulfilled' moves FROM Microtask Queue → TO the Call Stack.",
      callStack: ["onFulfilled"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of script"],
      highlight: "callStack",
    },
    {
      description:
        'Inside onFulfilled: console.log("3. Promise: Hello!") → PUSHED, prints.',
      callStack: ["onFulfilled", "console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of script", "3. Promise: Hello!"],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: ["onFulfilled"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of script", "3. Promise: Hello!"],
      highlight: "callStack",
    },
    {
      description:
        "✅ onFulfilled() done → POPPED. Microtask Queue empty. Program finished!",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End of script", "3. Promise: Hello!"],
      highlight: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3 — setTimeout vs Promise: Who runs first?
// Goal: See that even setTimeout(fn, 0) runs AFTER Promise.then().
//       Microtask Queue always empties BEFORE the Task Queue runs.
// ─────────────────────────────────────────────────────────────────────────────

const example3 = {
  name: "Example 4: setTimeout vs Promise (Priority!)",

  code: `console.log("1. Start");

// setTimeout with 0ms — you might think this runs immediately...
setTimeout(function taskCb() {
  console.log("4. setTimeout (Task Queue) — runs LAST");
}, 0);

// Promise.then — this goes to Microtask Queue
Promise.resolve().then(function microtaskCb() {
  console.log("3. Promise (Microtask Queue) — runs BEFORE setTimeout!");
});

console.log("2. End");

// KEY LESSON:
// Even with 0ms delay, setTimeout runs AFTER Promise.then()
// Microtask Queue is always emptied before Task Queue!`,

  steps: [
    {
      description: "🚀 Script starts. Everything is empty.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [],
      highlight: null,
    },
    {
      description: 'console.log("1. Start") → PUSHED, prints "1. Start".',
      callStack: ["console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "callStack",
    },
    {
      description:
        "setTimeout(taskCb, 0) is called. Even with 0ms delay, the callback goes to the Task Queue.",
      callStack: ["setTimeout"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "callStack",
    },
    {
      description:
        "setTimeout() returns. 'taskCb' is now waiting in the Task Queue.",
      callStack: [],
      taskQueue: ["taskCb"],
      microtaskQueue: [],
      consoleOutput: ["1. Start"],
      highlight: "taskQueue",
    },
    {
      description:
        "Promise.resolve().then(microtaskCb) is called. 'microtaskCb' is placed in the Microtask Queue.",
      callStack: ["Promise.resolve", ".then"],
      taskQueue: ["taskCb"],
      microtaskQueue: ["microtaskCb"],
      consoleOutput: ["1. Start"],
      highlight: "microtaskQueue",
    },
    {
      description:
        ".then() returns. Now we have one item in EACH queue. Which runs first?",
      callStack: [],
      taskQueue: ["taskCb"],
      microtaskQueue: ["microtaskCb"],
      consoleOutput: ["1. Start"],
      highlight: null,
    },
    {
      description: 'console.log("2. End") → PUSHED, prints "2. End".',
      callStack: ["console.log"],
      taskQueue: ["taskCb"],
      microtaskQueue: ["microtaskCb"],
      consoleOutput: ["1. Start", "2. End"],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED. Call Stack is now EMPTY!",
      callStack: [],
      taskQueue: ["taskCb"],
      microtaskQueue: ["microtaskCb"],
      consoleOutput: ["1. Start", "2. End"],
      highlight: "callStack",
    },
    {
      description:
        "⚡ Call Stack empty! The Event Loop checks queues. RULE: Microtask Queue is ALWAYS emptied FIRST, then Task Queue. 'microtaskCb' runs first!",
      callStack: [],
      taskQueue: ["taskCb"],
      microtaskQueue: ["microtaskCb"],
      consoleOutput: ["1. Start", "2. End"],
      highlight: "microtaskQueue",
    },
    {
      description:
        "🔄 'microtaskCb' moves FROM Microtask Queue → TO the Call Stack.",
      callStack: ["microtaskCb"],
      taskQueue: ["taskCb"],
      microtaskQueue: [],
      consoleOutput: ["1. Start", "2. End"],
      highlight: "callStack",
    },
    {
      description:
        'Inside microtaskCb: console.log prints "3. Promise (Microtask Queue) — runs BEFORE setTimeout!"',
      callStack: ["microtaskCb", "console.log"],
      taskQueue: ["taskCb"],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
      ],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: ["microtaskCb"],
      taskQueue: ["taskCb"],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
      ],
      highlight: "callStack",
    },
    {
      description:
        "microtaskCb() done → POPPED. Microtask Queue is now EMPTY. Now the Event Loop checks the Task Queue.",
      callStack: [],
      taskQueue: ["taskCb"],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
      ],
      highlight: "taskQueue",
    },
    {
      description: "🔄 Now 'taskCb' moves FROM Task Queue → TO the Call Stack.",
      callStack: ["taskCb"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
      ],
      highlight: "callStack",
    },
    {
      description:
        'Inside taskCb: console.log prints "4. setTimeout (Task Queue) — runs LAST".',
      callStack: ["taskCb", "console.log"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
        "4. setTimeout (Task Queue) — runs LAST",
      ],
      highlight: "console",
    },
    {
      description: "console.log() done → POPPED.",
      callStack: ["taskCb"],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
        "4. setTimeout (Task Queue) — runs LAST",
      ],
      highlight: "callStack",
    },
    {
      description:
        "✅ taskCb() done → POPPED. All queues empty. Program finished! KEY TAKEAWAY: Microtask Queue (Promises) ALWAYS runs before Task Queue (setTimeout), no matter the delay!",
      callStack: [],
      taskQueue: [],
      microtaskQueue: [],
      consoleOutput: [
        "1. Start",
        "2. End",
        "3. Promise (Microtask Queue) — runs BEFORE setTimeout!",
        "4. setTimeout (Task Queue) — runs LAST",
      ],
      highlight: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Export the examples array and a helper function
// ─────────────────────────────────────────────────────────────────────────────

// All examples in one array
const EXAMPLES = [example0, example1, example2, example3];

/**
 * getExampleSteps(id)
 * Returns the steps array for a given example index.
 * The frontend will call this via WebSocket.
 */
function getExampleSteps(id) {
  const example = EXAMPLES[id];
  if (!example) return null;
  return {
    name: example.name,
    code: example.code,
    steps: example.steps,
  };
}

// Make available to other files (server.js will import this)
export { EXAMPLES, getExampleSteps };
