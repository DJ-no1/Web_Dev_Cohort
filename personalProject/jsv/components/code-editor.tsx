"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useStore } from "@/lib/store";

const MONACO_DARK_THEME: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "fafafa", background: "09090b" },
    { token: "comment", foreground: "71717a", fontStyle: "italic" },
    { token: "keyword", foreground: "d4d4d8" },
    { token: "string", foreground: "a1a1aa" },
    { token: "number", foreground: "e4e4e7" },
    { token: "type", foreground: "d4d4d8" },
  ],
  colors: {
    "editor.background": "#09090b",
    "editor.foreground": "#fafafa",
    "editor.lineHighlightBackground": "#18181b",
    "editor.selectionBackground": "#27272a",
    "editor.inactiveSelectionBackground": "#1c1c1e",
    "editorCursor.foreground": "#fafafa",
    "editorLineNumber.foreground": "#52525b",
    "editorLineNumber.activeForeground": "#a1a1aa",
    "editorGutter.background": "#09090b",
    "editorWidget.background": "#18181b",
    "editorWidget.border": "#27272a",
    "editor.selectionHighlightBackground": "#27272a80",
  },
};

/* ── Map event-loop step to a CSS class for code highlighting ── */
function highlightClassForStep(step: string): {
  className: string;
  inlineClassName: string;
} {
  switch (step) {
    case "evaluateScript":
      return {
        className: "jsv-highlight-script",
        inlineClassName: "jsv-highlight-script-inline",
      };
    case "runTask":
      return {
        className: "jsv-highlight-task",
        inlineClassName: "jsv-highlight-task-inline",
      };
    case "runMicrotasks":
      return {
        className: "jsv-highlight-microtask",
        inlineClassName: "jsv-highlight-microtask-inline",
      };
    default:
      return {
        className: "jsv-highlight",
        inlineClassName: "jsv-highlight-inline",
      };
  }
}

export default function CodeEditor() {
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);
  const mode = useStore((s) => s.mode);
  const markers = useStore((s) => s.markers);
  const currentStep = useStore((s) => s.currentStep);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme("jsv-dark", MONACO_DARK_THEME);
    monaco.editor.setTheme("jsv-dark");
  };

  // Update decorations when markers or step changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const { className, inlineClassName } = highlightClassForStep(currentStep);

    const newDecorations: editor.IModelDeltaDecoration[] = markers.map(
      (marker) => {
        const startPos = model.getPositionAt(marker.start);
        const endPos = model.getPositionAt(marker.end);
        return {
          range: {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column,
          },
          options: {
            isWholeLine: false,
            className,
            inlineClassName,
          },
        };
      },
    );

    if (decorationsRef.current) {
      decorationsRef.current.clear();
    }
    decorationsRef.current = editor.createDecorationsCollection(newDecorations);

    // Scroll to the highlighted region if there are markers
    if (markers.length > 0) {
      const lastMarker = markers[markers.length - 1];
      const pos = model.getPositionAt(lastMarker.start);
      editor.revealLineInCenterIfOutsideViewport(pos.lineNumber);
    }
  }, [markers, currentStep]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-zinc-800">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={code}
        onChange={(val) => setCode(val || "")}
        onMount={handleMount}
        options={{
          readOnly: mode !== "editing",
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-geist-mono), monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          contextmenu: false,
          wordWrap: "on",
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
