"use client";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import Controls from "@/components/controls";
import CallStack from "@/components/call-stack";
import QueuePanel from "@/components/queue-panel";
import EventLoopStepper from "@/components/event-loop";
import ConsoleOutput from "@/components/console-output";
import QuizPanel from "@/components/quiz-panel";
import { Code2, Eye, Brain } from "lucide-react";

// Monaco must be loaded client-side only
const CodeEditor = dynamic(() => import("@/components/code-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 min-h-0 flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-500 text-sm">
      Loading editor...
    </div>
  ),
});

export default function Home() {
  const tasks = useStore((s) => s.tasks);
  const microtasks = useStore((s) => s.microtasks);
  const error = useStore((s) => s.error);
  const lastEventDescription = useStore((s) => s.lastEventDescription);
  const mode = useStore((s) => s.mode);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Header with Nav Tabs ── */}
      <header className="flex items-center px-4 py-0 border-b border-zinc-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 py-2">
          <Code2 className="w-5 h-5 text-zinc-400" />
          <h1 className="text-sm font-bold tracking-tight text-white">
            JS Visualizer
          </h1>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-0.5 -mb-px">
          <button
            onClick={() => setView("visualizer")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              view === "visualizer"
                ? "border-sky-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visualizer
          </button>
          <button
            onClick={() => setView("quiz")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              view === "quiz"
                ? "border-amber-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Quiz
          </button>
        </nav>
      </header>

      {/* ── Visualizer View ── */}
      {view === "visualizer" && (
        <>
          {/* Controls bar */}
          <div className="px-4 py-2 border-b border-zinc-800 shrink-0">
            <Controls />
          </div>

          {/* Last action banner */}
          {mode !== "editing" && lastEventDescription && (
            <div className="px-4 py-1.5 border-b border-zinc-800/60 bg-zinc-900/40 shrink-0">
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                <span className="text-zinc-600 mr-1.5">&#9654;</span>
                {lastEventDescription}
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="px-4 py-2 bg-red-950/30 border-b border-red-900/50 shrink-0">
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-0">
            {/* Left panel: Code Editor + Console */}
            <div className="flex flex-col lg:w-[45%] min-h-0 p-2 gap-2">
              <CodeEditor />
              <ConsoleOutput />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-zinc-800/60 my-2" />

            {/* Right panel */}
            <div className="flex flex-col lg:w-[55%] min-h-0 p-2 pl-0 lg:pl-2 gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <QueuePanel
                    title="Task Queue"
                    items={tasks}
                    panelType="taskQueue"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <QueuePanel
                    title="Microtask Queue"
                    items={microtasks}
                    panelType="microtaskQueue"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-0 flex gap-2">
                <div className="w-60 shrink-0 flex">
                  <CallStack />
                </div>
                <div className="flex-1 min-w-0 flex">
                  <EventLoopStepper />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Quiz View ── */}
      {view === "quiz" && (
        <div className="flex-1 min-h-0 flex items-stretch justify-center">
          <div className="w-full max-w-lg border-x border-zinc-800 bg-zinc-950 flex flex-col min-h-0">
            <QuizPanel />
          </div>
        </div>
      )}
    </div>
  );
}
