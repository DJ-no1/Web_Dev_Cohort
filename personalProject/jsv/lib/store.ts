import { create } from "zustand";
import { nanoid } from "nanoid";
import { fetchEventsForCode } from "./ws-client";
import { DEFAULT_CODE } from "./examples";
import type {
  AppMode,
  CodeMarker,
  ConsoleEntry,
  EventLoopStep,
  JSVEvent,
  QueueItem,
  StackFrame,
} from "./types";
import { PLAYABLE_EVENTS } from "./types";

/* ── Derived description for last-processed event ── */
function describeEvent(evt: JSVEvent): string {
  const { type, payload } = evt;
  switch (type) {
    case "EnterFunction":
      return `Called ${payload.name || "anonymous"}()`;
    case "ExitFunction":
      return `${payload.name || "anonymous"}() returned`;
    case "ErrorFunction":
      return `Error in ${payload.name || "anonymous"}()`;
    case "ConsoleLog":
      return `console.log(${(payload.message || "").trim().slice(0, 40)})`;
    case "ConsoleWarn":
      return `console.warn(${(payload.message || "").trim().slice(0, 40)})`;
    case "ConsoleError":
      return `console.error(${(payload.message || "").trim().slice(0, 40)})`;
    case "InitTimeout":
      return `setTimeout → queued ${payload.callbackName || "callback"}`;
    case "BeforeTimeout":
      return `Dequeued task (timeout callback)`;
    case "EnqueueMicrotask":
      return `Enqueued microtask: ${payload.name || "anonymous"}`;
    case "DequeueMicrotask":
      return `Dequeued microtask`;
    case "Rerender":
      return `Browser rerender — loop back to step 2`;
    default:
      return type;
  }
}

/* ── Count only the events the user will actually step through ── */
function countPlayableEvents(events: JSVEvent[]): number {
  return events.filter((e) => PLAYABLE_EVENTS.includes(e.type)).length;
}

/* ── Helper to process non-playable events ── */
type SetStateFn = (
  updater:
    | Partial<JSVState>
    | ((state: JSVState) => Partial<JSVState>),
) => void;

function processNonPlayableEvent(evt: JSVEvent, setFn: SetStateFn) {
  if (evt.type === "UncaughtError") {
    setFn((s) => ({
      consoleOutput: [
        ...s.consoleOutput,
        {
          id: nanoid(),
          type: "error" as const,
          message: `Uncaught ${evt.payload.name || "Error"}: ${evt.payload.message || ""}`,
        },
      ],
    }));
  }
  if (evt.type === "EarlyTermination") {
    setFn((s) => ({
      consoleOutput: [
        ...s.consoleOutput,
        {
          id: nanoid(),
          type: "warn" as const,
          message: evt.payload.message || "Terminated early",
        },
      ],
    }));
  }
}

interface JSVState {
  // Code
  code: string;
  mode: AppMode;
  example: string;

  // View: which page/tab is shown
  view: "visualizer" | "quiz";

  // Visualization data
  frames: StackFrame[];
  tasks: QueueItem[];
  microtasks: QueueItem[];
  markers: CodeMarker[];
  consoleOutput: ConsoleEntry[];

  // Playback
  events: JSVEvent[];
  currentEventIndex: number;
  currentStep: EventLoopStep;
  previousStep: EventLoopStep;
  isAutoPlaying: boolean;
  playbackSpeed: number;
  loopCount: number;

  // Progress & context
  totalPlayableEvents: number;
  playableEventsSeen: number;
  lastEventDescription: string;
  lastEventType: string | null;

  // Which panel just changed — used for highlight flash animations
  activePanel: "stack" | "taskQueue" | "microtaskQueue" | "console" | null;

  // Error
  error: string | null;

  // Quiz mode
  quizMode: boolean;
  quizPredictions: string[];
  quizActualOutput: string[];
  quizRevealed: boolean;
  quizScore: { correct: number; total: number } | null;

  // Actions
  setCode: (code: string) => void;
  setExample: (example: string) => void;
  setPlaybackSpeed: (speed: number) => void;
  runCode: () => Promise<void>;
  reset: () => void;
  playNextEvent: () => boolean;
  autoPlay: () => void;
  pause: () => void;

  // Quiz actions
  startQuiz: () => Promise<void>;
  setQuizPredictions: (predictions: string[]) => void;
  revealQuizResults: () => void;
  exitQuiz: () => void;
  setView: (view: "visualizer" | "quiz") => void;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const INITIAL_VIZ_STATE = {
  frames: [] as StackFrame[],
  tasks: [] as QueueItem[],
  microtasks: [] as QueueItem[],
  markers: [] as CodeMarker[],
  consoleOutput: [] as ConsoleEntry[],
  events: [] as JSVEvent[],
  currentEventIndex: 0,
  currentStep: "none" as EventLoopStep,
  previousStep: "none" as EventLoopStep,
  isAutoPlaying: false,
  loopCount: 0,
  totalPlayableEvents: 0,
  playableEventsSeen: 0,
  lastEventDescription: "",
  lastEventType: null as string | null,
  activePanel: null as JSVState["activePanel"],
  error: null as string | null,
  quizMode: false,
  quizPredictions: [] as string[],
  quizActualOutput: [] as string[],
  quizRevealed: false,
  quizScore: null as { correct: number; total: number } | null,
};

export const useStore = create<JSVState>((set, get) => ({
  code: DEFAULT_CODE,
  mode: "editing",
  example: "1. Hello World",
  playbackSpeed: 1,
  view: "visualizer",

  ...INITIAL_VIZ_STATE,

  setCode: (code) => set({ code }),
  setExample: (example) => set({ example }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  runCode: async () => {
    const { code } = get();
    set({ mode: "running", ...INITIAL_VIZ_STATE });

    try {
      const events = await fetchEventsForCode(code);
      set({
        mode: "visualizing",
        events,
        currentEventIndex: 0,
        currentStep: "evaluateScript",
        previousStep: "none",
        totalPlayableEvents: countPlayableEvents(events),
        playableEventsSeen: 0,
        lastEventDescription: "Script evaluation started",
        lastEventType: null,
      });
    } catch (e) {
      set({
        mode: "editing",
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },

  reset: () =>
    set({
      mode: "editing",
      ...INITIAL_VIZ_STATE,
    }),

  playNextEvent: () => {
    const state = get();
    const { events } = state;
    let idx = state.currentEventIndex;

    // Skip non-playable events
    while (idx < events.length && !PLAYABLE_EVENTS.includes(events[idx].type)) {
      processNonPlayableEvent(events[idx], set);
      idx++;
    }

    if (idx >= events.length) {
      set({
        currentEventIndex: idx,
        isAutoPlaying: false,
        lastEventDescription: "Execution complete",
        activePanel: null,
      });
      return true;
    }

    const event = events[idx];
    const { type, payload } = event;

    // ── Determine which panel is affected ──
    let activePanel: JSVState["activePanel"] = null;

    // ── Process console events ──
    if (type === "ConsoleLog" || type === "ConsoleWarn" || type === "ConsoleError") {
      const entryType = type === "ConsoleLog" ? "log" : type === "ConsoleWarn" ? "warn" : "error";
      set((s) => ({
        consoleOutput: [
          ...s.consoleOutput,
          { id: nanoid(), type: entryType, message: payload.message || "" },
        ],
      }));
      activePanel = "console";
    }

    if (type === "ErrorFunction") {
      set((s) => ({
        consoleOutput: [
          ...s.consoleOutput,
          {
            id: nanoid(),
            type: "error",
            message: `Uncaught Exception in "${payload.name}": ${payload.message}`,
          },
        ],
      }));
      activePanel = "console";
    }

    // ── Process call stack ──
    if (type === "EnterFunction") {
      set((s) => ({
        frames: [
          ...s.frames,
          { id: nanoid(), name: payload.name || "anonymous" },
        ],
        markers:
          payload.start !== undefined && payload.end !== undefined
            ? [...s.markers, { start: payload.start, end: payload.end }]
            : s.markers,
      }));
      activePanel = "stack";
    }

    if (type === "ExitFunction") {
      set((s) => ({
        frames: s.frames.slice(0, -1),
        markers: s.markers.slice(0, -1),
      }));
      activePanel = "stack";
    }

    // ── Process queues ──
    if (type === "EnqueueMicrotask") {
      set((s) => ({
        microtasks: [
          ...s.microtasks,
          { id: nanoid(), name: payload.name || "anonymous" },
        ],
      }));
      activePanel = "microtaskQueue";
    }

    if (type === "DequeueMicrotask") {
      set((s) => ({
        microtasks: s.microtasks.slice(1),
      }));
      activePanel = "microtaskQueue";
    }

    if (type === "InitTimeout") {
      set((s) => ({
        tasks: [
          ...s.tasks,
          {
            id: nanoid(),
            name: payload.callbackName || "anonymous",
            numericId: payload.id,
          },
        ],
      }));
      activePanel = "taskQueue";
    }

    if (type === "BeforeTimeout") {
      set((s) => ({
        tasks: s.tasks.filter((t) => t.numericId !== payload.id),
      }));
      activePanel = "taskQueue";
    }

    // Increment loop count when Rerender event is processed
    if (type === "Rerender") {
      set((s) => ({ loopCount: s.loopCount + 1 }));
    }

    // Advance index
    idx++;

    // Skip next non-playable events
    while (idx < events.length && !PLAYABLE_EVENTS.includes(events[idx].type)) {
      processNonPlayableEvent(events[idx], set);
      idx++;
    }

    // ── Determine current event loop step ──
    const nextEvent = idx < events.length ? events[idx] : undefined;
    const prevStep = state.currentStep;
    let currentStep: EventLoopStep = state.currentStep;

    if (!nextEvent) {
      currentStep = prevStep;
    } else if (nextEvent.type === "Rerender") {
      currentStep = "rerender";
    } else if (
      nextEvent.type === "BeforeTimeout" ||
      (nextEvent.type === "EnterFunction" && prevStep === "runTask")
    ) {
      currentStep = "runTask";
    } else if (
      nextEvent.type === "DequeueMicrotask" ||
      (nextEvent.type === "EnterFunction" && prevStep === "runMicrotasks")
    ) {
      currentStep = "runMicrotasks";
    }

    set({
      currentEventIndex: idx,
      currentStep,
      previousStep: prevStep,
      playableEventsSeen: state.playableEventsSeen + 1,
      lastEventDescription: describeEvent(event),
      lastEventType: type,
      activePanel,
    });

    // Auto-advance: timeout dequeue immediately shows the function entering the stack
    // DequeueMicrotask is NOT auto-advanced so users can see items leaving the queue
    if (
      type === "BeforeTimeout" &&
      nextEvent &&
      nextEvent.type === "EnterFunction"
    ) {
      get().playNextEvent();
    }

    return idx >= events.length;
  },

  autoPlay: () => {
    set({ isAutoPlaying: true });

    const loop = async () => {
      const state = get();
      if (state.mode !== "visualizing" || !state.isAutoPlaying) return;

      const endReached = state.playNextEvent();
      if (endReached) {
        set({ isAutoPlaying: false });
        return;
      }

      const speed = get().playbackSpeed;
      const delay = Math.max(80, 600 / speed);
      await pause(delay);

      if (get().isAutoPlaying && get().mode === "visualizing") {
        loop();
      }
    };

    loop();
  },

  pause: () => set({ isAutoPlaying: false }),

  // ── Quiz mode ──
  startQuiz: async () => {
    const { code } = get();
    set({
      ...INITIAL_VIZ_STATE,
      quizMode: true,
      quizPredictions: [],
      quizActualOutput: [],
      quizRevealed: false,
      quizScore: null,
      mode: "running",
    });

    try {
      const events = await fetchEventsForCode(code);
      // Extract actual console output from events
      const actual = events
        .filter((e) =>
          e.type === "ConsoleLog" ||
          e.type === "ConsoleWarn" ||
          e.type === "ConsoleError"
        )
        .map((e) => (e.payload.message || "").trim());

      set({
        mode: "editing", // stay in editing so viz doesn't start
        events,
        quizActualOutput: actual,
        quizRevealed: false,
        quizScore: null,
        error: null,
      });
    } catch (e) {
      set({
        mode: "editing",
        quizMode: false,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },

  setQuizPredictions: (predictions) => set({ quizPredictions: predictions }),

  revealQuizResults: () => {
    const { quizPredictions, quizActualOutput } = get();
    const total = quizActualOutput.length;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      const predicted = (quizPredictions[i] || "").trim();
      const actual = (quizActualOutput[i] || "").trim();
      if (predicted === actual) correct++;
    }
    set({ quizRevealed: true, quizScore: { correct, total } });
  },

  exitQuiz: () => {
    set({
      quizMode: false,
      quizPredictions: [],
      quizActualOutput: [],
      quizRevealed: false,
      quizScore: null,
    });
  },

  setView: (view) => {
    const state = get();
    // Reset viz state when switching views
    if (view === "quiz" && state.mode !== "editing") {
      set({ ...INITIAL_VIZ_STATE, mode: "editing", view });
    } else {
      if (view === "visualizer" && state.quizMode) {
        set({ view, quizMode: false, quizPredictions: [], quizActualOutput: [], quizRevealed: false, quizScore: null });
      } else {
        set({ view });
      }
    }
  },
}));
