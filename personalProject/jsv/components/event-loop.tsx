"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoButton } from "@/components/info-dialogs";
import { AnimatePresence, motion } from "framer-motion";
import type { EventLoopStep } from "@/lib/types";

/* ── Step definitions with color theming ── */
const STEPS: {
  key: EventLoopStep;
  label: string;
  description: string;
  activeColor: string; // tailwind bg
  activeShadow: string;
  checkColor: string;
  glowColor: string; // for pulse ring
}[] = [
  {
    key: "evaluateScript",
    label: "Evaluate Script",
    description:
      "Synchronously execute the script as though it were a function body. Run until the Call Stack is empty.",
    activeColor: "bg-sky-500",
    activeShadow: "shadow-sky-500/25",
    checkColor: "text-sky-400",
    glowColor: "bg-sky-500",
  },
  {
    key: "runTask",
    label: "Run a Task",
    description:
      "Select the oldest Task from the Task Queue. Run it until the Call Stack is empty.",
    activeColor: "bg-amber-500",
    activeShadow: "shadow-amber-500/25",
    checkColor: "text-amber-400",
    glowColor: "bg-amber-500",
  },
  {
    key: "runMicrotasks",
    label: "Run all Microtasks",
    description:
      "Select the oldest Microtask from the Microtask Queue. Run it until the Call Stack is empty. Repeat until the Microtask Queue is empty.",
    activeColor: "bg-violet-500",
    activeShadow: "shadow-violet-500/25",
    checkColor: "text-violet-400",
    glowColor: "bg-violet-500",
  },
  {
    key: "rerender",
    label: "Rerender",
    description:
      "Rerender the UI. Then, return to step 2. (This step only applies to browsers, not NodeJS).",
    activeColor: "bg-emerald-500",
    activeShadow: "shadow-emerald-500/25",
    checkColor: "text-emerald-400",
    glowColor: "bg-emerald-500",
  },
];

const stepIndex = (step: EventLoopStep): number => {
  const idx = STEPS.findIndex((s) => s.key === step);
  return idx === -1 ? -1 : idx;
};

/* ── Animated SVG checkmark ── */
function AnimatedCheck({ className }: { className?: string }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={className || "text-emerald-400"}
    >
      <motion.path
        d="M2.5 7L5.5 10L11.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/* ── Pulsing ring behind active indicator (color-matched) ── */
function PulseRing({ colorClass }: { colorClass: string }) {
  return (
    <>
      <motion.span
        className={`absolute inset-0 rounded-full ${colorClass}/30`}
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className={`absolute inset-0 rounded-full ${colorClass}/20`}
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.4,
        }}
      />
    </>
  );
}

/* ── Connector line between steps ── */
function ConnectorLine({
  completed,
  color,
}: {
  completed: boolean;
  color: string;
}) {
  return (
    <div className="flex justify-center h-4 w-7 shrink-0">
      <motion.div
        className="w-px h-full"
        initial={false}
        animate={{
          backgroundColor: completed ? color : "rgba(63,63,70,1)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Connector colors per completed step ── */
const CONNECTOR_COLORS = [
  "rgba(14,165,233,0.5)", // sky (evaluateScript)
  "rgba(245,158,11,0.5)", // amber (runTask)
  "rgba(139,92,246,0.5)", // violet (runMicrotasks)
];

export default function EventLoopStepper() {
  const currentStep = useStore((s) => s.currentStep);
  const loopCount = useStore((s) => s.loopCount);
  const mode = useStore((s) => s.mode);
  const events = useStore((s) => s.events);
  const currentEventIndex = useStore((s) => s.currentEventIndex);
  const lastEventDescription = useStore((s) => s.lastEventDescription);

  const activeIdx = stepIndex(currentStep);
  const isDone = mode === "visualizing" && currentEventIndex >= events.length;
  const isVisualizing = mode === "visualizing";

  return (
    <Card className="flex flex-col flex-1 bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            Event Loop
          </h3>

          {/* Loop cycle counter badge */}
          <AnimatePresence>
            {loopCount > 0 && (
              <motion.span
                key={loopCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="opacity-70"
                >
                  <path
                    d="M2 8a6 6 0 0 1 10.2-4.3L11 5h4V1l-1.6 1.6A8 8 0 0 0 0 8h2Zm12 0a6 6 0 0 1-10.2 4.3L5 11H1v4l1.6-1.6A8 8 0 0 0 16 8h-2Z"
                    fill="currentColor"
                  />
                </svg>
                {loopCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <InfoButton panel="eventLoop" />
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        <div className="flex flex-col">
          {STEPS.map((step, idx) => {
            const isActive = !isDone && isVisualizing && idx === activeIdx;
            const isCompleted =
              isDone || (isVisualizing && activeIdx >= 0 && idx < activeIdx);

            return (
              <div key={step.key}>
                <div className="flex gap-3 items-start">
                  {/* Step indicator circle */}
                  <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                    {isActive && <PulseRing colorClass={step.glowColor} />}

                    <motion.div
                      className={`
                        relative z-10 w-7 h-7 rounded-full flex items-center justify-center
                        text-xs font-mono shrink-0
                        ${
                          isActive
                            ? `${step.activeColor} text-zinc-950 font-bold shadow-lg ${step.activeShadow}`
                            : isCompleted
                              ? "bg-zinc-700"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }
                      `}
                      animate={
                        isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }
                      }
                      transition={
                        isActive
                          ? {
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : { duration: 0.2 }
                      }
                    >
                      <AnimatePresence mode="wait">
                        {isCompleted ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                            }}
                            className="flex items-center justify-center"
                          >
                            <AnimatedCheck className={step.checkColor} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="num"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {idx + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Step content */}
                  <div className="min-w-0 pt-1">
                    <motion.p
                      className="text-sm font-medium leading-tight"
                      animate={{
                        color: isActive
                          ? "#ffffff"
                          : isCompleted
                            ? "#a1a1aa"
                            : "#71717a",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.label}
                    </motion.p>

                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          key={step.key}
                          className="text-xs text-zinc-400 mt-1.5 leading-relaxed overflow-hidden"
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <ConnectorLine
                    completed={isCompleted}
                    color={CONNECTOR_COLORS[idx] || "rgba(16,185,129,0.5)"}
                  />
                )}
              </div>
            );
          })}

          {/* Loop back indicator */}
          <AnimatePresence>
            {isVisualizing && (activeIdx >= 3 || loopCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-2 mt-2 ml-0.5"
              >
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-zinc-500"
                  animate={
                    activeIdx === 3 && !isDone ? { rotate: [0, -20, 0] } : {}
                  }
                  transition={
                    activeIdx === 3 && !isDone
                      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  <path
                    d="M3 9a6 6 0 0 1 10.5-4L12 6.5h4.5V2l-1.5 1.5A8 8 0 0 0 1 9h2Z"
                    fill="currentColor"
                  />
                </motion.svg>
                <span className="text-[11px] text-zinc-500">
                  Return to step 2
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current action indicator */}
          <AnimatePresence mode="wait">
            {isVisualizing && lastEventDescription && !isDone && (
              <motion.div
                key={lastEventDescription}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-3 px-3 py-1.5 rounded bg-zinc-800/60 border border-zinc-700/50"
              >
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  Last action
                </span>
                <p className="text-xs text-zinc-400 font-mono truncate">
                  {lastEventDescription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Done state */}
          <AnimatePresence>
            {isDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-3 flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2"
              >
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  className="text-emerald-400 shrink-0"
                >
                  <motion.path
                    d="M2.5 7L5.5 10L11.5 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  />
                </motion.svg>
                <span className="text-xs text-emerald-400 font-medium">
                  Execution complete
                  {loopCount > 0 &&
                    ` · ${loopCount} loop cycle${loopCount > 1 ? "s" : ""}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
