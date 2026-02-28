"use client";

import { useStore } from "@/lib/store";
import { EXAMPLES } from "@/lib/examples";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pencil, SkipForward, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Controls() {
  const mode = useStore((s) => s.mode);
  const code = useStore((s) => s.code);
  const example = useStore((s) => s.example);
  const isAutoPlaying = useStore((s) => s.isAutoPlaying);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const events = useStore((s) => s.events);
  const currentEventIndex = useStore((s) => s.currentEventIndex);
  const totalPlayableEvents = useStore((s) => s.totalPlayableEvents);
  const playableEventsSeen = useStore((s) => s.playableEventsSeen);

  const setCode = useStore((s) => s.setCode);
  const setExample = useStore((s) => s.setExample);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);
  const runCode = useStore((s) => s.runCode);
  const reset = useStore((s) => s.reset);
  const playNextEvent = useStore((s) => s.playNextEvent);
  const autoPlay = useStore((s) => s.autoPlay);
  const pause = useStore((s) => s.pause);

  const hasReachedEnd = currentEventIndex >= events.length && events.length > 0;
  const progress =
    totalPlayableEvents > 0
      ? Math.min(100, (playableEventsSeen / totalPlayableEvents) * 100)
      : 0;

  const handleExampleChange = (name: string) => {
    const ex = EXAMPLES.find((e) => e.name === name);
    if (ex) {
      setCode(ex.code);
      setExample(ex.name);
      reset();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Example selector */}
        <Select
          value={example}
          onValueChange={handleExampleChange}
          disabled={mode === "running"}
        >
          <SelectTrigger className="w-56 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-300">
            <SelectValue placeholder="Select example" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 max-h-72">
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-emerald-500/80 px-2">
                Beginner
              </SelectLabel>
              {EXAMPLES.filter((e) => e.difficulty === "beginner").map((ex) => (
                <SelectItem
                  key={ex.name}
                  value={ex.name}
                  className="text-xs text-zinc-300"
                >
                  {ex.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-amber-500/80 px-2">
                Intermediate
              </SelectLabel>
              {EXAMPLES.filter((e) => e.difficulty === "intermediate").map(
                (ex) => (
                  <SelectItem
                    key={ex.name}
                    value={ex.name}
                    className="text-xs text-zinc-300"
                  >
                    {ex.name}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-rose-500/80 px-2">
                Advanced
              </SelectLabel>
              {EXAMPLES.filter((e) => e.difficulty === "advanced").map((ex) => (
                <SelectItem
                  key={ex.name}
                  value={ex.name}
                  className="text-xs text-zinc-300"
                >
                  {ex.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-cyan-500/80 px-2">
                Real-World
              </SelectLabel>
              {EXAMPLES.filter((e) => e.difficulty === "real-world").map(
                (ex) => (
                  <SelectItem
                    key={ex.name}
                    value={ex.name}
                    className="text-xs text-zinc-300"
                  >
                    {ex.name}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Run / Edit button */}
        {mode === "editing" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => runCode()}
            disabled={code.trim() === ""}
            className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        )}

        {/* Visualization controls */}
        {mode === "visualizing" && (
          <>
            <div className="w-px h-5 bg-zinc-700 mx-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={playNextEvent}
              disabled={hasReachedEnd || isAutoPlaying}
              className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1.5" />
              Step
            </Button>

            {isAutoPlaying ? (
              <Button
                variant="outline"
                size="sm"
                onClick={pause}
                className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Pause
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={autoPlay}
                disabled={hasReachedEnd}
                className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Auto
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-8 text-zinc-500 hover:text-zinc-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-5 bg-zinc-700 mx-1" />

            {/* Speed selector */}
            <Select
              value={String(playbackSpeed)}
              onValueChange={(v) => setPlaybackSpeed(Number(v))}
            >
              <SelectTrigger className="w-18 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="0.5" className="text-xs text-zinc-300">
                  0.5x
                </SelectItem>
                <SelectItem value="1" className="text-xs text-zinc-300">
                  1x
                </SelectItem>
                <SelectItem value="2" className="text-xs text-zinc-300">
                  2x
                </SelectItem>
                <SelectItem value="4" className="text-xs text-zinc-300">
                  4x
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Step counter */}
            <span className="text-[11px] text-zinc-500 font-mono ml-auto tabular-nums">
              {playableEventsSeen} / {totalPlayableEvents}
            </span>
          </>
        )}

        {/* Loading indicator */}
        {mode === "running" && (
          <span className="text-xs text-zinc-500 ml-2 animate-pulse">
            Executing...
          </span>
        )}
      </div>

      {/* Progress bar */}
      {mode === "visualizing" && (
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-sky-500 via-violet-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
