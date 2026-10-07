"use client";

import { useEffect, useId, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { tags } from "@lezer/highlight";

const courseHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: "var(--code-keyword)" },
  { tag: tags.string, color: "var(--code-string)" },
  { tag: [tags.number, tags.bool], color: "var(--code-number)" },
  { tag: tags.comment, color: "var(--code-comment)", fontStyle: "italic" },
  { tag: [tags.standard(tags.variableName), tags.function(tags.variableName)], color: "var(--code-builtin)" },
]));

const courseTheme = EditorView.theme({
  "&": { height: "clamp(20rem, 52vh, 32rem)", color: "var(--foreground)", backgroundColor: "var(--surface)", fontSize: "13px" },
  "&.cm-focused": { outline: "2px solid var(--accent-fill)", outlineOffset: "-2px" },
  ".cm-content": { fontFamily: "var(--font-geist-mono), monospace", padding: "14px 0", caretColor: "var(--foreground)" },
  ".cm-line": { padding: "0 16px 0 10px" },
  ".cm-scroller": { overflow: "auto", minHeight: "0", lineHeight: "1.7" },
  ".cm-gutters": { backgroundColor: "var(--raised)", color: "var(--muted)", borderColor: "var(--line)" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "var(--accent-soft)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "var(--accent-soft)" },
  ".cm-tooltip, .cm-panels": { backgroundColor: "var(--raised)", color: "var(--foreground)", borderColor: "var(--line)" },
  ".cm-searchMatch": { backgroundColor: "var(--accent-soft)", outline: "1px solid var(--accent-fill)" },
});

export default function PythonEditor({
  value, onChange, onRun, onCheck, label,
}: {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onCheck: () => void;
  label: string;
}) {
  const parent = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const actions = useRef({ onChange, onRun, onCheck });
  const startingValue = useRef(value);
  const helpId = useId();

  useEffect(() => { actions.current = { onChange, onRun, onCheck }; }, [onChange, onRun, onCheck]);

  useEffect(() => {
    if (!parent.current) return;
    const editor = new EditorView({
      parent: parent.current,
      state: EditorState.create({
        doc: startingValue.current,
        extensions: [
          basicSetup, python(), indentUnit.of("    "), courseTheme, courseHighlighting,
          EditorView.contentAttributes.of({ "aria-label": label, "aria-describedby": helpId, spellcheck: "false" }),
          keymap.of([
            { key: "Mod-Enter", run: () => { actions.current.onRun(); return true; } },
            { key: "Mod-Shift-Enter", run: () => { actions.current.onCheck(); return true; } },
            indentWithTab,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) actions.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => { view.current = null; editor.destroy(); };
  }, [helpId, label]);

  useEffect(() => {
    const editor = view.current;
    if (editor && value !== editor.state.doc.toString()) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  return (
    <>
      <div ref={parent} className="min-w-0" />
      <p id={helpId} className="border-t border-line px-4 py-2 font-mono text-[11px] leading-5 text-muted">
        Ctrl/⌘ + Enter: run. Add Shift to run tests. Tab: indent. Escape, then Tab: leave the editor.
      </p>
    </>
  );
}
