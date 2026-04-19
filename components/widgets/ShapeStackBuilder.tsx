"use client";

// A stack of layers, checked at every seam before a single row is read.
//
// The reader chooses what the network is handed, adds layers from a palette,
// reorders them and removes them, and every seam between two cards is drawn
// green where the layer above reads exactly what the layer beneath answers and
// red where it does not, carrying the library's own refusal at the seam it
// names. Each card prints what its layer reads and what it answers with, both
// as an arrangement of extents and as a bare count, because the page's whole
// point is that those are two different facts. Remove the flatten from the
// worked stack and the seam beneath the dense layer turns red while the counts
// on both sides still agree. Every extent, every count, every verdict and
// every message is the library's through the API. The browser lays the cards
// out, prints a tuple the way the library prints one, and nothing more.

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  JoinReport,
  LayerReport,
  LayerSpec,
  MAX_EXTENT,
  MAX_FILTERS,
  MAX_LAYERS,
  MAX_NEURONS,
  MAX_PADDING,
  MAX_WIDTH,
  PoolSummary,
  StackCheck,
  checkStack,
  formatExtents,
} from "@/lib/concepts/shapes-and-flattening";

// What the first layer is handed. A picture is (channels, height, width) and
// a row is one extent.
interface InputChoice {
  label: string;
  reads: number[];
}

const INPUT_CHOICES: InputChoice[] = [
  { label: "a picture, 1 × 8 × 8", reads: [1, 8, 8] },
  { label: "a picture, 1 × 28 × 28", reads: [1, 28, 28] },
  { label: "a picture, 3 × 32 × 32", reads: [3, 32, 32] },
  { label: "a row of 36", reads: [36] },
  { label: "a row of 784", reads: [784] },
];

// One card in the builder. A dense card may state its own width, and leaving
// it blank lets the API tell it how many numbers arrive.
type CardSettings =
  | {
      kind: "conv";
      n_filters: number;
      kernel_size: number;
      stride: number;
      padding: number;
    }
  | { kind: "pool"; summary: PoolSummary; window: number; stride: number }
  | { kind: "flatten" }
  | { kind: "dense"; n_neurons: number; readsWidth: number | null };

type Card = CardSettings & { id: number };

const KIND_NAMES = {
  conv: "Convolution",
  pool: "Pooling",
  flatten: "Flatten",
  dense: "Dense",
} as const;

// The worked example, (1, 8, 8) to (10,) in four layers.
const WORKED_INPUT = 0;
const WORKED_CARDS: CardSettings[] = [
  { kind: "conv", n_filters: 4, kernel_size: 3, stride: 1, padding: 0 },
  { kind: "pool", summary: "max", window: 2, stride: 2 },
  { kind: "flatten" },
  { kind: "dense", n_neurons: 10, readsWidth: null },
];

// The case the whole check exists to catch, a convolution answering
// (8, 26, 26) and a dense layer reading its 5408 numbers as a row.
const MISSING_FLATTEN_INPUT = 1;
const MISSING_FLATTEN_CARDS: CardSettings[] = [
  { kind: "conv", n_filters: 8, kernel_size: 3, stride: 1, padding: 0 },
  { kind: "dense", n_neurons: 10, readsWidth: null },
];

const PALETTE: CardSettings[] = [
  { kind: "conv", n_filters: 4, kernel_size: 3, stride: 1, padding: 0 },
  { kind: "pool", summary: "max", window: 2, stride: 2 },
  { kind: "flatten" },
  { kind: "dense", n_neurons: 10, readsWidth: null },
];

const BUTTON_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

const SMALL_BUTTON_CLASS =
  "rounded border border-slate-300 bg-white px-2 text-sm font-medium leading-6 text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

const NUMBER_INPUT_CLASS =
  "w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

const SELECT_CLASS =
  "rounded border border-slate-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

// Ids are handed out from the largest one in play, so a card keeps its
// identity through reorders and a removed card's id is never reused while
// it could still be on screen.
function withIds(settings: CardSettings[], firstId: number): Card[] {
  return settings.map((card, index) => ({ ...card, id: firstId + index }));
}

function nextId(cards: Card[]): number {
  return cards.reduce((largest, card) => Math.max(largest, card.id), 0) + 1;
}

function toSpec(card: Card, reads: number[] | null): LayerSpec {
  switch (card.kind) {
    case "conv":
      return {
        kind: "conv",
        reads,
        n_filters: card.n_filters,
        kernel_size: card.kernel_size,
        stride: card.stride,
        padding: card.padding,
      };
    case "pool":
      return {
        kind: "pool",
        reads,
        summary: card.summary,
        window: card.window,
        stride: card.stride,
      };
    case "flatten":
      return { kind: "flatten", reads };
    case "dense":
      return { kind: "dense", reads, n_neurons: card.n_neurons };
  }
}

function toRequest(cards: Card[], inputReads: number[]): LayerSpec[] {
  return cards.map((card, index) => {
    const stated =
      card.kind === "dense" && card.readsWidth !== null
        ? [card.readsWidth]
        : null;
    return toSpec(card, stated ?? (index === 0 ? inputReads : null));
  });
}

// The answer is kept beside the request it answered, so a stale answer is
// told apart from a fresh one by comparing keys rather than by clearing
// state whenever the cards change.
interface KeyedCheck {
  key: string;
  check: StackCheck;
}

export function ShapeStackBuilder() {
  const [inputChoice, setInputChoice] = useState(WORKED_INPUT);
  const [cards, setCards] = useState<Card[]>(() => withIds(WORKED_CARDS, 1));
  const [answer, setAnswer] = useState<KeyedCheck | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const layers = toRequest(cards, INPUT_CHOICES[inputChoice].reads);
  const key = JSON.stringify(layers);

  useEffect(() => {
    if (cards.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        const check = await checkStack(layers);
        setAnswer({ key, check });
        setMessage(null);
      } catch (error) {
        if (error instanceof ApiError) setMessage(error.message);
        else setMessage("Something went wrong.");
      }
    }, 150);
    return () => clearTimeout(timer);
    // The request is a pure function of the key, so the key is the one
    // dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current =
    answer !== null && answer.key === key && cards.length > 0
      ? answer.check
      : null;
  const reports = current?.layers ?? [];
  const joins = current?.joins ?? [];
  const joinsHolding = joins.filter((join) => join.verdict === "holds").length;

  const loadPreset = (input: number, preset: CardSettings[]) => {
    setInputChoice(input);
    setCards((existing) => withIds(preset, nextId(existing)));
    setMessage(null);
  };

  const addCard = (template: CardSettings) => {
    setCards((existing) =>
      existing.length >= MAX_LAYERS
        ? existing
        : [...existing, ...withIds([template], nextId(existing))],
    );
  };

  const updateCard = (id: number, changes: Partial<CardSettings>) => {
    setCards((existing) =>
      existing.map((card) =>
        card.id === id ? ({ ...card, ...changes } as Card) : card,
      ),
    );
  };

  const moveCard = (index: number, direction: -1 | 1) => {
    setCards((existing) => {
      const target = index + direction;
      if (target < 0 || target >= existing.length) return existing;
      const reordered = [...existing];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      return reordered;
    });
  };

  const removeCard = (index: number) => {
    setCards((existing) => existing.filter((_, each) => each !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <button
          onClick={() => loadPreset(WORKED_INPUT, WORKED_CARDS)}
          className={BUTTON_CLASS}
        >
          The worked stack
        </button>
        <button
          onClick={() =>
            loadPreset(MISSING_FLATTEN_INPUT, MISSING_FLATTEN_CARDS)
          }
          className={BUTTON_CLASS}
        >
          The missing flatten
        </button>
        <button
          onClick={() => {
            setCards([]);
            setMessage(null);
          }}
          className={BUTTON_CLASS}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-600 dark:text-slate-300">
        <span>Add a layer</span>
        {PALETTE.map((template) => (
          <button
            key={template.kind}
            onClick={() => addCard(template)}
            disabled={cards.length >= MAX_LAYERS}
            className={BUTTON_CLASS}
          >
            + {KIND_NAMES[template.kind]}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="text-slate-600 dark:text-slate-300">
            The network is handed
          </span>
          <select
            value={inputChoice}
            onChange={(event) => setInputChoice(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {INPUT_CHOICES.map((choice, index) => (
              <option key={choice.label} value={index}>
                {choice.label}
              </option>
            ))}
          </select>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {formatExtents(INPUT_CHOICES[inputChoice].reads)}
          </span>
        </div>

        {cards.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No layers yet. Add one from the palette, or load a preset.
          </p>
        )}

        {cards.map((card, index) => (
          <div key={card.id}>
            {index > 0 && (
              <Seam
                join={joins[index - 1]}
                beneath={reports[index - 1]}
                above={reports[index]}
              />
            )}
            <LayerCard
              card={card}
              position={index}
              report={reports[index]}
              isFirst={index === 0}
              isLast={index === cards.length - 1}
              onChange={(changes) => updateCard(card.id, changes)}
              onMove={(direction) => moveCard(index, direction)}
              onRemove={() => removeCard(index)}
            />
          </div>
        ))}

        {current && (
          <div
            className={
              "mt-3 rounded-md border px-3 py-2 text-sm " +
              (current.holds
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200")
            }
          >
            {current.holds ? (
              <>
                The stack exists. It reads{" "}
                <span className="font-mono">{formatExtents(current.reads)}</span>{" "}
                and answers{" "}
                <span className="font-mono">
                  {formatExtents(current.answers)}
                </span>
                , and every seam was settled in integer comparisons before any
                row arrived.
              </>
            ) : (
              <>
                The stack is refused. The library&rsquo;s words are{" "}
                <span className="font-mono">{current.refusal}</span>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-500">
        A green seam is a layer reading exactly what the layer beneath answers.
        A red one carries the library&rsquo;s refusal. No row was sent.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Layers" value={String(cards.length)} />
        <Stat
          label="Seams holding"
          value={current ? `${joinsHolding} of ${joins.length}` : "…"}
        />
        <Stat
          label="Answers"
          value={
            current
              ? current.holds
                ? formatExtents(current.answers)
                : "refused"
              : "…"
          }
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}
    </div>
  );
}

function Seam({
  join,
  beneath,
  above,
}: {
  join?: JoinReport;
  beneath?: LayerReport;
  above?: LayerReport;
}) {
  const verdict = join?.verdict ?? "unsettled";
  const lineClass =
    verdict === "holds"
      ? "border-emerald-500"
      : verdict === "fails"
        ? "border-rose-500"
        : "border-dashed border-slate-400";
  const textClass =
    verdict === "holds"
      ? "text-emerald-700 dark:text-emerald-300"
      : verdict === "fails"
        ? "text-rose-700 dark:text-rose-300"
        : "text-slate-500 dark:text-slate-400";

  return (
    <div
      className="flex items-stretch gap-3 py-1 pl-4"
      title={join?.message ?? undefined}
    >
      <div className={"w-0 border-l-4 " + lineClass} style={{ minHeight: 28 }} />
      <div className={"flex flex-col justify-center text-xs " + textClass}>
        <span className="font-mono">
          answers {formatExtents(beneath?.answers ?? null)}
          {" · "}
          reads {formatExtents(above?.reads ?? null)}
        </span>
        {verdict === "fails" && join?.message && (
          <span className="mt-0.5 max-w-prose">{join.message}</span>
        )}
        {verdict === "fails" && !join?.message && (
          <span className="mt-0.5">
            fails too, but the library stops at the first seam that does
          </span>
        )}
        {verdict === "unsettled" && join !== undefined && (
          <span className="mt-0.5">
            unsettled, one side of this seam was never built
          </span>
        )}
      </div>
    </div>
  );
}

function LayerCard({
  card,
  position,
  report,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  card: Card;
  position: number;
  report?: LayerReport;
  isFirst: boolean;
  isLast: boolean;
  onChange: (changes: Partial<CardSettings>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const refused = report !== undefined && report.refusal !== null;
  const borderClass = refused
    ? "border-rose-300 dark:border-rose-800"
    : "border-slate-200 dark:border-slate-700";

  return (
    <div
      className={
        "rounded-md border bg-white px-3 py-2 dark:bg-slate-900 " + borderClass
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-100 px-1.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          layer {position}
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {KIND_NAMES[card.kind]}
        </span>
        <span className="ml-auto flex gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className={SMALL_BUTTON_CLASS}
            aria-label="move down the stack"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className={SMALL_BUTTON_CLASS}
            aria-label="move up the stack"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className={SMALL_BUTTON_CLASS}
            aria-label="remove"
          >
            ×
          </button>
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
        {card.kind === "conv" && (
          <>
            <NumberField
              label="kernels"
              value={card.n_filters}
              min={1}
              max={MAX_FILTERS}
              onChange={(n_filters) => onChange({ n_filters })}
            />
            <NumberField
              label="kernel size"
              value={card.kernel_size}
              min={1}
              max={MAX_EXTENT}
              onChange={(kernel_size) => onChange({ kernel_size })}
            />
            <NumberField
              label="stride"
              value={card.stride}
              min={1}
              max={MAX_EXTENT}
              onChange={(stride) => onChange({ stride })}
            />
            <NumberField
              label="padding"
              value={card.padding}
              min={0}
              max={MAX_PADDING}
              onChange={(padding) => onChange({ padding })}
            />
          </>
        )}
        {card.kind === "pool" && (
          <>
            <label className="flex items-center gap-1.5">
              summary
              <select
                value={card.summary}
                onChange={(event) =>
                  onChange({ summary: event.target.value as PoolSummary })
                }
                className={SELECT_CLASS}
              >
                <option value="max">max</option>
                <option value="average">average</option>
              </select>
            </label>
            <NumberField
              label="window"
              value={card.window}
              min={1}
              max={MAX_EXTENT}
              onChange={(window) => onChange({ window })}
            />
            <NumberField
              label="stride"
              value={card.stride}
              min={1}
              max={MAX_EXTENT}
              onChange={(stride) => onChange({ stride })}
            />
          </>
        )}
        {card.kind === "flatten" && (
          <span className="text-slate-500 dark:text-slate-400">
            no settings, the same numbers as one row
          </span>
        )}
        {card.kind === "dense" && (
          <>
            <NumberField
              label="neurons"
              value={card.n_neurons}
              min={1}
              max={MAX_NEURONS}
              onChange={(n_neurons) => onChange({ n_neurons })}
            />
            <label className="flex items-center gap-1.5">
              reads a row of
              <input
                type="number"
                min={1}
                max={MAX_WIDTH}
                step={1}
                value={card.readsWidth ?? ""}
                placeholder="arrives"
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") {
                    onChange({ readsWidth: null });
                    return;
                  }
                  const parsed = Math.round(Number(raw));
                  if (Number.isFinite(parsed) && parsed >= 1) {
                    onChange({ readsWidth: Math.min(parsed, MAX_WIDTH) });
                  }
                }}
                className={NUMBER_INPUT_CLASS}
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-2 font-mono text-xs">
        {report === undefined && (
          <span className="text-slate-400 dark:text-slate-500">…</span>
        )}
        {report && report.refusal !== null && (
          <span className="text-rose-700 dark:text-rose-300">
            reads {formatExtents(report.reads)} · refused, {report.refusal}
          </span>
        )}
        {report && report.refusal === null && report.reads === null && (
          <span className="text-slate-500 dark:text-slate-400">
            unsettled, nothing arrives from the layer beneath
          </span>
        )}
        {report && report.refusal === null && report.reads !== null && (
          <span className="text-slate-700 dark:text-slate-200">
            reads {formatExtents(report.reads)} → answers{" "}
            {formatExtents(report.answers)}
            <span className="text-slate-500 dark:text-slate-400">
              {"   "}
              {report.n_reads} → {report.n_answers} numbers
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => {
          const parsed = Math.round(Number(event.target.value));
          if (!Number.isFinite(parsed)) return;
          onChange(Math.min(max, Math.max(min, parsed)));
        }}
        className={NUMBER_INPUT_CLASS}
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
