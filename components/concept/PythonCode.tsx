"use client";

// A block of Python, coloured and copyable.
//
// The colouring is a small tokenizer rather than a highlighting library,
// because the site shows short, plain scripts and nothing else: comments,
// strings, numbers, keywords and a few builtins are the whole of what needs
// telling apart, and a dependency for that would outweigh the blocks it
// coloured. Anything the tokenizer does not recognise is printed as it is.

import { useEffect, useState } from "react";

const KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const BUILTINS = new Set([
  "abs", "dict", "enumerate", "float", "int", "len", "list", "max", "min",
  "print", "range", "round", "sorted", "sum", "tuple", "zip", "str", "bool",
  "isinstance", "any", "all", "map", "set", "reversed", "next", "iter",
]);

type Token = { kind: "k" | "s" | "n" | "c" | "b" | "plain"; text: string };

const TOKEN = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|\b\d+(?:\.\d*)?(?:e[+-]?\d+)?\b|\b[A-Za-z_]\w*\b)/g;

export function tokenise(source: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of source.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) tokens.push({ kind: "plain", text: source.slice(last, at) });
    const text = match[0];
    const first = text[0];
    let kind: Token["kind"] = "plain";
    if (first === "#") kind = "c";
    else if (first === '"' || first === "'") kind = "s";
    else if (/\d/.test(first)) kind = "n";
    else if (KEYWORDS.has(text)) kind = "k";
    else if (BUILTINS.has(text)) kind = "b";
    tokens.push({ kind, text });
    last = at + text.length;
  }
  if (last < source.length) tokens.push({ kind: "plain", text: source.slice(last) });
  return tokens;
}

export function PythonCode({
  source,
  label,
  copyable = true,
}: {
  source: string;
  label?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
    } catch {
      // Without clipboard access the reader selects the text; the block is
      // ordinary text and selecting it works as it always has.
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-line bg-surface">
      {(label || copyable) && (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-raised px-3 py-1.5">
          <span className="font-mono text-xs text-muted">{label ?? "Python"}</span>
          {copyable && (
            <button
              type="button"
              onClick={copy}
              className="font-mono text-xs text-muted transition hover:text-foreground"
              aria-live="polite"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-foreground">
        <code>
          {tokenise(source).map((token, index) =>
            token.kind === "plain" ? (
              token.text
            ) : (
              <span key={index} className={`tok-${token.kind}`}>
                {token.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </div>
  );
}

// What a script printed, set under the code that printed it.
export function ProgramOutput({ output }: { output: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-line bg-raised px-3 py-1.5 font-mono text-xs text-muted">
        Output
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-foreground">
        <code>{output}</code>
      </pre>
    </div>
  );
}
