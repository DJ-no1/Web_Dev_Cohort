"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { InfoButton } from "@/components/info-dialogs";
import { useStore } from "@/lib/store";
import type { QueueItem } from "@/lib/types";

interface QueuePanelProps {
  title: string;
  items: QueueItem[];
  panelType: "taskQueue" | "microtaskQueue";
}

// Color schemes per queue type
const COLORS = {
  taskQueue: {
    border: "border-amber-500/50",
    shadow: "shadow-[0_0_12px_rgba(245,158,11,0.1)]",
    firstBg: "bg-amber-950/50",
    firstText: "text-amber-300",
    firstBorder: "border-amber-500/40",
    firstShadow: "shadow-amber-500/5",
    restBg: "bg-zinc-800",
    restText: "text-zinc-400",
    restBorder: "border-zinc-700/50",
    badge: "bg-amber-500/15 text-amber-400",
    emptyIcon: "text-amber-900/50",
  },
  microtaskQueue: {
    border: "border-violet-500/50",
    shadow: "shadow-[0_0_12px_rgba(139,92,246,0.1)]",
    firstBg: "bg-violet-950/50",
    firstText: "text-violet-300",
    firstBorder: "border-violet-500/40",
    firstShadow: "shadow-violet-500/5",
    restBg: "bg-zinc-800",
    restText: "text-zinc-400",
    restBorder: "border-zinc-700/50",
    badge: "bg-violet-500/15 text-violet-400",
    emptyIcon: "text-violet-900/50",
  },
};

export default function QueuePanel({
  title,
  items,
  panelType,
}: QueuePanelProps) {
  const activePanel = useStore((s) => s.activePanel);
  const mode = useStore((s) => s.mode);

  const colors = COLORS[panelType];
  const isHighlighted = activePanel === panelType && mode === "visualizing";

  return (
    <Card
      className={`bg-zinc-900 transition-colors duration-500 ${
        isHighlighted ? `${colors.border} ${colors.shadow}` : "border-zinc-800"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            {title}
          </h3>
          {items.length > 0 && (
            <motion.span
              key={items.length}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${colors.badge}`}
            >
              {items.length}
            </motion.span>
          )}
        </div>
        <InfoButton panel={panelType} />
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-0">
        <ScrollArea className="w-full">
          <div className="flex flex-row gap-2 min-h-11 items-center p-1">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ x: 50, opacity: 0, scale: 0.85 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{
                      x: -50,
                      opacity: 0,
                      scale: 0.7,
                      transition: { duration: 0.35, ease: "easeIn" },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className={`shrink-0 px-4 py-2 rounded-md text-sm font-mono relative ${
                      isFirst
                        ? `${colors.firstBg} ${colors.firstText} border ${colors.firstBorder} shadow-md ${colors.firstShadow}`
                        : `${colors.restBg} ${colors.restText} border ${colors.restBorder}`
                    }`}
                  >
                    {item.name}
                    {isFirst && items.length > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            panelType === "taskQueue"
                              ? "rgb(245,158,11)"
                              : "rgb(139,92,246)",
                        }}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [1, 0.6, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {items.length === 0 && (
              <div className="flex items-center gap-2 px-2">
                <span className={`text-xs font-mono ${colors.emptyIcon}`}>
                  {"[ ]"}
                </span>
                <span className="text-zinc-600 text-xs">Empty</span>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
