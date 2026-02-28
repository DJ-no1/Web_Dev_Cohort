"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoButton } from "@/components/info-dialogs";

export default function CallStack() {
  const frames = useStore((s) => s.frames);
  const activePanel = useStore((s) => s.activePanel);
  const mode = useStore((s) => s.mode);

  const isHighlighted = activePanel === "stack" && mode === "visualizing";

  return (
    <Card
      className={`flex flex-col flex-1 bg-zinc-900 transition-colors duration-500 ${
        isHighlighted
          ? "border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.1)]"
          : "border-zinc-800"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            Call Stack
          </h3>
          {frames.length > 0 && (
            <motion.span
              key={frames.length}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded"
            >
              {frames.length}
            </motion.span>
          )}
        </div>
        <InfoButton panel="callStack" />
      </CardHeader>
      <CardContent className="flex-1 p-2 pt-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col-reverse gap-1.5 min-h-full justify-end p-1">
            <AnimatePresence mode="popLayout">
              {frames.map((frame, idx) => {
                const isTop = idx === frames.length - 1;
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0, y: -30 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      scale: 0.85,
                      opacity: 0,
                      y: -20,
                      transition: { duration: 0.15 },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className={`relative px-3 py-2 rounded-md text-center text-sm font-mono truncate ${
                      isTop
                        ? "bg-sky-950/60 text-sky-300 border border-sky-500/40 shadow-md shadow-sky-500/5"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}
                  >
                    {/* Depth indicator */}
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-mono">
                      {idx}
                    </span>
                    {frame.name}
                    {isTop && (
                      <motion.span
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-sky-400/70"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        running
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {frames.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <div className="text-zinc-700 text-xs font-mono">{"[ ]"}</div>
                <div className="text-zinc-600 text-[10px]">Empty</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
