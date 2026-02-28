"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

export default function ConsoleOutput() {
  const consoleOutput = useStore((s) => s.consoleOutput);
  const activePanel = useStore((s) => s.activePanel);
  const mode = useStore((s) => s.mode);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isHighlighted = activePanel === "console" && mode === "visualizing";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutput]);

  return (
    <Card
      className={`bg-zinc-900 max-h-50 transition-colors duration-500 ${
        isHighlighted
          ? "border-zinc-500/50 shadow-[0_0_12px_rgba(161,161,170,0.08)]"
          : "border-zinc-800"
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-2 py-2 px-4 space-y-0">
        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
        <h3 className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
          Console
        </h3>
        {consoleOutput.length > 0 && (
          <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded ml-auto">
            {consoleOutput.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0">
        <ScrollArea className="h-32.5">
          <div className="font-mono text-xs space-y-0 p-2">
            {consoleOutput.length === 0 && (
              <div className="text-zinc-700 italic flex items-center gap-1.5">
                <span className="text-zinc-800">{">"}</span> No output yet
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {consoleOutput.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex items-start gap-2 py-0.5 border-b border-zinc-800/50 last:border-b-0 ${
                    entry.type === "error"
                      ? "text-red-400"
                      : entry.type === "warn"
                        ? "text-yellow-400"
                        : "text-zinc-300"
                  }`}
                >
                  {/* Line number */}
                  <span className="text-zinc-700 select-none shrink-0 w-4 text-right tabular-nums">
                    {idx + 1}
                  </span>
                  {/* Icon */}
                  <span className="shrink-0 select-none">
                    {entry.type === "error" ? (
                      <span className="text-red-500">✕</span>
                    ) : entry.type === "warn" ? (
                      <span className="text-yellow-500">⚠</span>
                    ) : (
                      <span className="text-zinc-600">›</span>
                    )}
                  </span>
                  {/* Message */}
                  <span className="whitespace-pre-wrap break-all min-w-0">
                    {entry.message.replace(/\n$/, "")}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
