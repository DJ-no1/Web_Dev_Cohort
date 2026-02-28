"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type PanelType = "callStack" | "taskQueue" | "microtaskQueue" | "eventLoop";

const PANEL_INFO: Record<
  PanelType,
  { title: string; tldr: string; details: string[] }
> = {
  callStack: {
    title: "About the Call Stack",
    tldr: "The Call Stack tracks function calls. It is a LIFO stack of frames. Each frame represents a function call.",
    details: [
      "The Call Stack is a fundamental part of the JavaScript language. It is a record-keeping structure that allows us to perform function calls. Each function call is represented as a frame on the Call Stack.",
      "The JS engine uses this information to ensure execution picks back up in the right spot after a function returns.",
      "When a JavaScript program first starts executing, the Call Stack is empty. When the first function call is made, a new frame is pushed onto the top of the Call Stack. When that function returns, its frame is popped off of the Call Stack.",
    ],
  },
  taskQueue: {
    title: "About the Task Queue",
    tldr: "The Task Queue is a FIFO queue of Tasks that are going to be executed by the Event Loop. Tasks are synchronous blocks of code that can enqueue other Tasks while they're running.",
    details: [
      "If the Call Stack keeps track of the functions that are executing right now, then the Task Queue keeps track of functions that are going to be executed in the future.",
      "The Task Queue is a FIFO queue of Tasks that are processed by the Event Loop. Tasks are synchronous blocks of code. You can think of them as Function objects.",
      "The Event Loop works by continuously looping through the Task Queue and processing the Tasks it contains one by one. A single iteration of the Event Loop is called a tick.",
      "While a Task is running, it can enqueue other Tasks to be processed in subsequent ticks of the Event Loop. The simplest way is setTimeout(taskFn, 0). Tasks can also come from external sources such as DOM and network events.",
    ],
  },
  microtaskQueue: {
    title: "About the Microtask Queue",
    tldr: "The Microtask Queue was added in ES6 to handle Promises. It's a lot like the Task Queue. The main difference is how Microtasks are enqueued and when they are processed.",
    details: [
      "The Microtask Queue is a FIFO queue of Microtasks that are processed by the Event Loop. It was added to JavaScript's execution model as part of ES6 in order to handle Promise resolution callbacks.",
      "Microtasks are a lot like Tasks. They are synchronous blocks of code that have exclusive access to the Call Stack while running. And just like Tasks, Microtasks are able to enqueue additional Microtasks or Tasks.",
      "The only difference between Microtasks and Tasks is where they are stored, and when they are processed:",
      "• Tasks are stored in Task Queues. Microtasks are stored in the Microtask Queue (there's only one).",
      "• Tasks are processed in a loop, and rendering occurs between Tasks. But the Microtask Queue is emptied out after a Task completes, and before re-rendering occurs.",
    ],
  },
  eventLoop: {
    title: "About the Event Loop",
    tldr: "The Event Loop processes Tasks and Microtasks. It places them into the Call Stack for execution one at a time. It also controls when rerendering occurs.",
    details: [
      "The Event Loop is a looping algorithm that processes the Tasks/Microtasks in the Task Queue and Microtask Queue. It handles selecting the next Task/Microtask to be run and placing it in the Call Stack for execution.",
      "The Event Loop algorithm consists of four key steps:",
      "1. Evaluate Script: Synchronously execute the script as though it were a function body. Run until the Call Stack is empty.",
      "2. Run a Task: Select the oldest Task from the Task Queue. Run it until the Call Stack is empty.",
      "3. Run all Microtasks: Select the oldest Microtask from the Microtask Queue. Run it until the Call Stack is empty. Repeat until the Microtask Queue is empty.",
      "4. Rerender the UI: Rerender the UI. Then, return to step 2. (This step only applies to browsers, not NodeJS).",
    ],
  },
};

export function InfoButton({ panel }: { panel: PanelType }) {
  const [open, setOpen] = useState(false);
  const info = PANEL_INFO[panel];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded">
          <Info className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{info.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-zinc-300">
            <strong>TL;DR</strong>{" "}
            <em className="text-zinc-400">{info.tldr}</em>
          </p>
          <Separator className="bg-zinc-700" />
          {info.details.map((detail, i) => (
            <p key={i} className="text-zinc-400 leading-relaxed">
              {detail}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
