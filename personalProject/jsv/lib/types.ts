// Event types produced by the backend execution server

export type EventType =
  | "EnterFunction"
  | "ExitFunction"
  | "ErrorFunction"
  | "ConsoleLog"
  | "ConsoleWarn"
  | "ConsoleError"
  | "InitTimeout"
  | "BeforeTimeout"
  | "EnqueueMicrotask"
  | "DequeueMicrotask"
  | "InitPromise"
  | "ResolvePromise"
  | "BeforePromise"
  | "AfterPromise"
  | "InitMicrotask"
  | "BeforeMicrotask"
  | "AfterMicrotask"
  | "Rerender"
  | "EarlyTermination"
  | "UncaughtError"
  | "Done";

export interface JSVEvent {
  type: EventType;
  payload: {
    id?: number;
    name?: string;
    callbackName?: string;
    start?: number;
    end?: number;
    message?: string;
    parentId?: number;
    error?: { name: string; message: string; stack: string };
    exitCode?: number;
  };
}

export const PLAYABLE_EVENTS: EventType[] = [
  "EnterFunction",
  "ExitFunction",
  "EnqueueMicrotask",
  "DequeueMicrotask",
  "InitTimeout",
  "BeforeTimeout",
  "Rerender",
  "ConsoleLog",
  "ConsoleWarn",
  "ConsoleError",
  "ErrorFunction",
];

export type AppMode = "editing" | "running" | "visualizing";

export type EventLoopStep =
  | "none"
  | "evaluateScript"
  | "runTask"
  | "runMicrotasks"
  | "rerender";

export interface StackFrame {
  id: string;
  name: string;
}

export interface QueueItem {
  id: string;
  name: string;
  numericId?: number; // original numeric id from events (for task dequeue by id)
}

export interface CodeMarker {
  start: number;
  end: number;
}

export interface ConsoleEntry {
  id: string;
  type: "log" | "warn" | "error";
  message: string;
}
