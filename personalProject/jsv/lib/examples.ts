export interface CodeExample {
  name: string;
  code: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "real-world";
}

export const DEFAULT_CODE = `// Click "Run" to visualize!
console.log('Hello, world!');`;

export const EXAMPLES: CodeExample[] = [
  // ─────────────── BEGINNER ───────────────
  {
    name: "1. Hello World",
    difficulty: "beginner",
    code: `// The simplest program — just one statement.
console.log('Hello, world!');`,
  },
  {
    name: "2. Two Logs",
    difficulty: "beginner",
    code: `// JS runs top to bottom, one line at a time.
console.log('first');
console.log('second');`,
  },
  {
    name: "3. Simple Function",
    difficulty: "beginner",
    code: `// Calling a function pushes it onto the call stack.
// When it returns, it pops off.
function greet() {
  console.log('hi!');
}

greet();`,
  },
  {
    name: "4. Two Functions",
    difficulty: "beginner",
    code: `// Each function call goes on and off the stack.
function sayA() { console.log('A'); }
function sayB() { console.log('B'); }

sayA();
sayB();`,
  },
  {
    name: "5. Nested Calls",
    difficulty: "beginner",
    code: `// When a function calls another, the stack grows.
// The inner function must finish before the outer one.
function inner() {
  console.log('inside inner');
}

function outer() {
  console.log('before inner');
  inner();
  console.log('after inner');
}

outer();`,
  },
  {
    name: "6. Deep Call Stack",
    difficulty: "beginner",
    code: `// Watch the stack grow 5 levels deep, then unwind.
function fifth()  { console.log('done!'); }
function fourth() { fifth(); }
function third()  { fourth(); }
function second() { third(); }
function first()  { second(); }

first();`,
  },

  // ─────────────── INTERMEDIATE ───────────────
  {
    name: "7. First setTimeout",
    difficulty: "intermediate",
    code: `// setTimeout schedules a callback in the TASK QUEUE.
// It does NOT run immediately — sync code runs first.
console.log('before');

setTimeout(function delayed() {
  console.log('timeout callback');
}, 0);

console.log('after');
// Output: before → after → timeout callback`,
  },
  {
    name: "8. Multiple Timers",
    difficulty: "intermediate",
    code: `// All three timers queue callbacks, but sync code runs first.
setTimeout(function a() { console.log('a'); }, 0);
setTimeout(function b() { console.log('b'); }, 0);
setTimeout(function c() { console.log('c'); }, 0);

console.log('sync');
// Output: sync → a → b → c`,
  },
  {
    name: "9. First Promise",
    difficulty: "intermediate",
    code: `// .then() schedules a callback in the MICROTASK QUEUE.
// Microtasks also wait for sync code to finish.
console.log('before');

Promise.resolve().then(function promiseCb() {
  console.log('promise');
});

console.log('after');
// Output: before → after → promise`,
  },
  {
    name: "10. Task vs Microtask",
    difficulty: "intermediate",
    code: `// KEY CONCEPT: Microtasks run BEFORE tasks!
// Even though setTimeout was registered first,
// the promise callback runs first.
setTimeout(function task() {
  console.log('task (setTimeout)');
}, 0);

Promise.resolve().then(function microtask() {
  console.log('microtask (promise)');
});

console.log('sync');
// Output: sync → microtask → task`,
  },
  {
    name: "11. Promise Chain",
    difficulty: "intermediate",
    code: `// Each .then() creates a NEW microtask only after
// the previous one finishes.
Promise.resolve()
  .then(function first() {
    console.log('first');
  })
  .then(function second() {
    console.log('second');
  })
  .then(function third() {
    console.log('third');
  });

console.log('sync');
// Output: sync → first → second → third`,
  },
  {
    name: "12. Timer Inside a Function",
    difficulty: "intermediate",
    code: `// The setTimeout call runs during script evaluation,
// but its callback only runs in a later event loop cycle.
function setup() {
  console.log('setting up');
  setTimeout(function later() {
    console.log('later!');
  }, 0);
  console.log('setup done');
}

setup();
console.log('all sync done');`,
  },

  // ─────────────── ADVANCED ───────────────
  {
    name: "13. Mixed: Timers + Promises",
    difficulty: "advanced",
    code: `// Classic interview question!
// Order: sync first, then ALL microtasks, then tasks.
console.log('1');

setTimeout(function timeout1() {
  console.log('2');
}, 0);

Promise.resolve().then(function promise1() {
  console.log('3');
});

setTimeout(function timeout2() {
  console.log('4');
}, 0);

Promise.resolve().then(function promise2() {
  console.log('5');
});

console.log('6');
// Output: 1 → 6 → 3 → 5 → 2 → 4`,
  },
  {
    name: "14. Microtask in a Microtask",
    difficulty: "advanced",
    code: `// A microtask can schedule MORE microtasks.
// They all run before the next task!
Promise.resolve().then(function first() {
  console.log('micro 1');
  Promise.resolve().then(function nested() {
    console.log('micro 2 (nested)');
  });
});

setTimeout(function task() {
  console.log('task');
}, 0);

console.log('sync');
// Output: sync → micro 1 → micro 2 (nested) → task`,
  },
  {
    name: "15. Task Schedules Microtask",
    difficulty: "advanced",
    code: `// When a task runs, it can create microtasks.
// Those microtasks run BEFORE the next task.
setTimeout(function task1() {
  console.log('task 1');
  Promise.resolve().then(function microInTask() {
    console.log('microtask inside task 1');
  });
}, 0);

setTimeout(function task2() {
  console.log('task 2');
}, 0);

console.log('sync');
// Output: sync → task 1 → microtask inside task 1 → task 2`,
  },
  {
    name: "16. Promise.reject + catch",
    difficulty: "advanced",
    code: `// .catch() is also a microtask, just like .then()
Promise.resolve().then(function onResolve() {
  console.log('resolved');
});

Promise.reject().catch(function onReject() {
  console.log('caught');
});

setTimeout(function task() {
  console.log('task');
}, 0);

console.log('sync');
// Output: sync → resolved → caught → task`,
  },
  {
    name: "17. The Full Picture",
    difficulty: "advanced",
    code: `// Watch ALL the pieces together:
// sync → microtasks → rerender → tasks → repeat
function logA() { console.log('A — sync'); }
function logB() { console.log('B — sync'); }

logA();

setTimeout(function timeout() {
  console.log('C — task');
  Promise.resolve().then(function microInTask() {
    console.log('D — microtask inside task');
  });
}, 0);

Promise.resolve().then(function promise1() {
  console.log('E — microtask');
});

Promise.resolve().then(function promise2() {
  console.log('F — microtask');
  Promise.resolve().then(function nestedMicro() {
    console.log('G — nested microtask');
  });
});

logB();
// Output: A → B → E → F → G → C → D`,
  },
  {
    name: "18. Multiple Timer Delays",
    difficulty: "advanced",
    code: `// Timers with different delays fire in order of delay.
// But all sync code + microtasks run first.
setTimeout(function slow() {
  console.log('3rd — 100ms timer');
}, 100);

setTimeout(function medium() {
  console.log('2nd — 50ms timer');
}, 50);

setTimeout(function fast() {
  console.log('1st — 0ms timer');
}, 0);

Promise.resolve().then(function micro() {
  console.log('microtask — before any timer');
});

console.log('sync — runs first');`,
  },
  {
    name: "19. Async Staircase",
    difficulty: "advanced",
    code: `// Each timer callback schedules the next one.
// This creates a "staircase" of event loop cycles.
console.log('start');

setTimeout(function step1() {
  console.log('step 1');
  setTimeout(function step2() {
    console.log('step 2');
    setTimeout(function step3() {
      console.log('step 3 — done!');
    }, 0);
  }, 0);
}, 0);

console.log('end of sync');`,
  },

  // ─────────────── REAL-WORLD SCENARIOS ───────────────
  {
    name: "20. Fake DB Query",
    difficulty: "real-world",
    code: `// In real apps, DB queries are async.
// We simulate one with setTimeout.
function fetchUser(id) {
  console.log('Querying DB for user ' + id + '...');
  setTimeout(function onDbResult() {
    var user = { id: id, name: 'Alice' };
    console.log('Got user: ' + user.name);
  }, 0);
}

console.log('App started');
fetchUser(42);
console.log('Request sent, moving on...');`,
  },
  {
    name: "21. Try / Catch",
    difficulty: "real-world",
    code: `// Sync errors are caught immediately on the call stack.
function parseJSON(str) {
  console.log('Parsing: ' + str);
  var result = JSON.parse(str);
  console.log('Parsed OK');
  return result;
}

try {
  parseJSON('{"valid": true}');
  parseJSON('NOT JSON !!!');
} catch (e) {
  console.error('Parse failed: ' + e.message);
}

console.log('App continues after error');`,
  },
  {
    name: "22. Promise API Call",
    difficulty: "real-world",
    code: `// Simulating a fetch() → .then() → .catch() pattern.
// The .then() callback is a MICROTASK.
function fakeApiCall(url) {
  console.log('Fetching ' + url);
  return Promise.resolve({ status: 200, data: 'OK' });
}

console.log('App: loading data');

fakeApiCall('/api/users')
  .then(function onSuccess(res) {
    console.log('Response: ' + res.status);
    console.log('Data: ' + res.data);
  });

console.log('App: fetch initiated');`,
  },
  {
    name: "23. Failed API + Catch",
    difficulty: "real-world",
    code: `// When a promise rejects, .catch() handles it.
// The .catch() callback is also a microtask.
function fetchData() {
  console.log('Calling API...');
  return Promise.reject({ error: 'Network Error' });
}

fetchData()
  .then(function onSuccess(data) {
    console.log('Got: ' + data);
  })
  .catch(function onError(err) {
    console.error('Failed: ' + err.error);
    console.log('Showing error toast to user');
  });

console.log('UI is still responsive');`,
  },
  {
    name: "24. Object Processing",
    difficulty: "real-world",
    code: `// Processing objects synchronously — all on the call stack.
function validateUser(user) {
  console.log('Validating ' + user.name);
  if (!user.email) {
    console.warn(user.name + ' has no email!');
  }
  return true;
}

function processUsers(users) {
  console.log('Processing ' + users.length + ' users');
  for (var i = 0; i < users.length; i++) {
    validateUser(users[i]);
  }
  console.log('All users processed');
}

var users = [
  { name: 'Alice', email: 'a@b.com' },
  { name: 'Bob', email: null },
  { name: 'Charlie', email: 'c@d.com' },
];
processUsers(users);`,
  },
  {
    name: "25. Cache Check Pattern",
    difficulty: "real-world",
    code: `// Common pattern: check cache first, else fetch.
// Cache hit = sync, cache miss = async.
var cache = {};

function getData(key) {
  if (cache[key]) {
    console.log('Cache HIT for ' + key);
    return Promise.resolve(cache[key]);
  }
  console.log('Cache MISS for ' + key);
  return new Promise(function fetcher(resolve) {
    setTimeout(function simulateFetch() {
      cache[key] = 'value_for_' + key;
      console.log('Fetched ' + key + ' from server');
      resolve(cache[key]);
    }, 0);
  });
}

getData('user:1').then(function onResult(v) {
  console.log('Got: ' + v);
});

console.log('Doing other work...');`,
  },
  {
    name: "26. Event Handler Sim",
    difficulty: "real-world",
    code: `// Simulating click handlers — browser queues them as tasks.
function handleClick(btn) {
  console.log(btn + ' clicked');
  // update DOM would happen here
  Promise.resolve().then(function updateUI() {
    console.log('UI updated for ' + btn);
  });
}

console.log('Page loaded');

// Simulate two click events arriving
setTimeout(function clickEvent1() {
  handleClick('Submit');
}, 0);

setTimeout(function clickEvent2() {
  handleClick('Cancel');
}, 0);

console.log('Listeners registered');`,
  },
  {
    name: "27. Auth Flow",
    difficulty: "real-world",
    code: `// Login flow: validate → authenticate → load profile.
// Each step could be async in real code.
function validateInput(user, pass) {
  console.log('Validating input...');
  if (!user || !pass) { throw new Error('Missing fields'); }
  console.log('Input OK');
}

function authenticate(user) {
  console.log('Authenticating ' + user + '...');
  return Promise.resolve({ token: 'abc123' });
}

function loadProfile(token) {
  console.log('Loading profile with token...');
  return Promise.resolve({ name: 'Alice', role: 'admin' });
}

try {
  validateInput('alice', 'pass123');
} catch(e) {
  console.error(e.message);
}

authenticate('alice')
  .then(function onAuth(session) {
    console.log('Logged in! Token: ' + session.token);
    return loadProfile(session.token);
  })
  .then(function onProfile(profile) {
    console.log('Welcome, ' + profile.name + ' (' + profile.role + ')');
  });

console.log('Login page rendered');`,
  },
  {
    name: "28. Retry on Failure",
    difficulty: "real-world",
    code: `// Retry pattern: if first call fails, try again.
var attempt = 0;

function apiCall() {
  attempt++;
  console.log('Attempt ' + attempt);
  if (attempt < 3) {
    return Promise.reject('Server busy');
  }
  return Promise.resolve('Success!');
}

function retry() {
  apiCall()
    .then(function onSuccess(data) {
      console.log('Result: ' + data);
    })
    .catch(function onFail(err) {
      console.warn('Failed: ' + err + ', retrying...');
      setTimeout(function retryLater() {
        retry();
      }, 0);
    });
}

console.log('Starting with retries');
retry();`,
  },
  {
    name: "29. Task Scheduler",
    difficulty: "real-world",
    code: `// A mini job queue: process jobs one at a time,
// yielding to the event loop between each.
var jobs = ['send email', 'resize image', 'update DB'];

function processJob(name) {
  console.log('Processing: ' + name);
  // Simulate some work
  Promise.resolve().then(function onDone() {
    console.log('  Done: ' + name);
  });
}

function runNext() {
  if (jobs.length === 0) {
    console.log('All jobs complete!');
    return;
  }
  var job = jobs.shift();
  processJob(job);
  // Schedule next job as a task so the loop can breathe
  setTimeout(function nextTick() {
    runNext();
  }, 0);
}

console.log('Job queue started');
runNext();`,
  },
];
