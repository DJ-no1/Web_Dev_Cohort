"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { EXAMPLES } from "@/lib/examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Check,
  X,
  RotateCcw,
  Trophy,
  Lightbulb,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";

export default function QuizPanel() {
  const code = useStore((s) => s.code);
  const example = useStore((s) => s.example);
  const quizMode = useStore((s) => s.quizMode);
  const quizPredictions = useStore((s) => s.quizPredictions);
  const quizActualOutput = useStore((s) => s.quizActualOutput);
  const quizRevealed = useStore((s) => s.quizRevealed);
  const quizScore = useStore((s) => s.quizScore);
  const mode = useStore((s) => s.mode);

  const setCode = useStore((s) => s.setCode);
  const setExample = useStore((s) => s.setExample);
  const reset = useStore((s) => s.reset);
  const startQuiz = useStore((s) => s.startQuiz);
  const setQuizPredictions = useStore((s) => s.setQuizPredictions);
  const revealQuizResults = useStore((s) => s.revealQuizResults);
  const exitQuiz = useStore((s) => s.exitQuiz);

  const [lineCount, setLineCount] = useState(3);

  const handleExampleChange = (name: string) => {
    const ex = EXAMPLES.find((e) => e.name === name);
    if (ex) {
      setCode(ex.code);
      setExample(ex.name);
      reset();
      exitQuiz();
      setLineCount(3);
    }
  };

  const handlePredictionChange = (index: number, value: string) => {
    const newPredictions = [...quizPredictions];
    newPredictions[index] = value;
    setQuizPredictions(newPredictions);
  };

  const handleStartQuiz = () => {
    startQuiz();
  };

  const handleTryAgain = () => {
    exitQuiz();
    setLineCount(3);
  };

  const scorePercent =
    quizScore && quizScore.total > 0
      ? Math.round((quizScore.correct / quizScore.total) * 100)
      : 0;

  // Not yet started — pick example and start
  if (!quizMode) {
    return (
      <div className="flex flex-col h-full">
        {/* Example picker */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">
              Predict the Output
            </h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pick an example, read the code, then predict what{" "}
            <code className="text-zinc-300 bg-zinc-800 px-1 rounded">
              console.log
            </code>{" "}
            will print and in what order.
          </p>

          <Select value={example} onValueChange={handleExampleChange}>
            <SelectTrigger className="w-full h-9 text-xs bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Select example" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 max-h-72">
              <SelectGroup>
                <SelectLabel className="text-[10px] uppercase tracking-wider text-emerald-500/80 px-2">
                  Beginner
                </SelectLabel>
                {EXAMPLES.filter((e) => e.difficulty === "beginner").map(
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
                {EXAMPLES.filter((e) => e.difficulty === "advanced").map(
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
        </div>

        {/* Code preview */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-1 shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              Code
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto px-4 pb-4">
            <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
              {code}
            </pre>
          </div>
        </div>

        {/* Start button */}
        <div className="p-4 border-t border-zinc-800">
          <Button
            onClick={handleStartQuiz}
            disabled={code.trim() === ""}
            className="w-full h-9 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
          >
            <Play className="w-3.5 h-3.5 mr-2" />
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (mode === "running") {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm text-zinc-500 animate-pulse">
          Executing code...
        </span>
      </div>
    );
  }

  // Quiz active — prediction input or results
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Code preview (smaller, hard-capped) */}
      <div
        className="shrink-0 border-b border-zinc-800 overflow-hidden"
        style={{ maxHeight: "40%" }}
      >
        <div className="px-4 pt-3 pb-1 flex items-center justify-between shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            Code
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">{example}</span>
        </div>
        <div
          className="overflow-auto px-4 pb-3"
          style={{ maxHeight: "calc(100% - 32px)" }}
        >
          <pre className="text-[11px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {code}
          </pre>
        </div>
      </div>

      {/* Prediction / results area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-zinc-200">
              {quizRevealed ? "Results" : "Your Predictions"}
            </span>
          </div>
          {!quizRevealed && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500 mr-1">Lines:</span>
              <button
                onClick={() => setLineCount(Math.max(1, lineCount - 1))}
                className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs text-zinc-400 w-4 text-center tabular-nums">
                {lineCount}
              </span>
              <button
                onClick={() => setLineCount(Math.min(15, lineCount + 1))}
                className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-4">
          <div className="space-y-2 pb-4">
            <AnimatePresence mode="popLayout">
              {!quizRevealed
                ? // ── Prediction inputs ──
                  Array.from({ length: lineCount }).map((_, i) => (
                    <motion.div
                      key={`input-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[10px] text-zinc-600 font-mono w-5 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={quizPredictions[i] || ""}
                        onChange={(e) =>
                          handlePredictionChange(i, e.target.value)
                        }
                        placeholder={`Line ${i + 1} output...`}
                        className="flex-1 h-8 px-2.5 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
                      />
                    </motion.div>
                  ))
                : // ── Results comparison ──
                  quizActualOutput.map((actual, i) => {
                    const predicted = (quizPredictions[i] || "").trim();
                    const isCorrect = predicted === actual;
                    return (
                      <motion.div
                        key={`result-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card
                          className={`p-2.5 border ${
                            isCorrect
                              ? "border-emerald-800/60 bg-emerald-950/20"
                              : "border-red-800/60 bg-red-950/20"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {isCorrect ? (
                                <Check className="w-2.5 h-2.5" />
                              ) : (
                                <X className="w-2.5 h-2.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-500">
                                  Line {i + 1}
                                </span>
                              </div>
                              {!isCorrect && predicted && (
                                <p className="text-xs font-mono text-red-400/80 line-through">
                                  {predicted}
                                </p>
                              )}
                              <p
                                className={`text-xs font-mono ${
                                  isCorrect
                                    ? "text-emerald-300"
                                    : "text-zinc-300"
                                }`}
                              >
                                {actual}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Score banner + actions */}
      <div className="shrink-0 p-4 border-t border-zinc-800 space-y-3">
        {quizRevealed && quizScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-3 text-center ${
              scorePercent === 100
                ? "bg-emerald-950/30 border border-emerald-800/40"
                : scorePercent >= 50
                  ? "bg-amber-950/30 border border-amber-800/40"
                  : "bg-red-950/30 border border-red-800/40"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy
                className={`w-4 h-4 ${
                  scorePercent === 100
                    ? "text-emerald-400"
                    : scorePercent >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              />
              <span className="text-lg font-bold text-white tabular-nums">
                {quizScore.correct}/{quizScore.total}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {scorePercent === 100
                ? "Perfect! You nailed it!"
                : scorePercent >= 50
                  ? "Good effort! Review the event loop steps."
                  : "Keep practicing — switch to the Visualizer to see how it works."}
            </p>
          </motion.div>
        )}

        <div className="flex gap-2">
          {!quizRevealed ? (
            <Button
              onClick={revealQuizResults}
              className="flex-1 h-9 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
            >
              <Check className="w-3.5 h-3.5 mr-2" />
              Check Answers
            </Button>
          ) : (
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="flex-1 h-9 border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
