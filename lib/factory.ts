import { FIRST_BATCH, STRICT_BATCH, type Part } from "./neuron-lab";

export type MachineKind = "height" | "mass" | "weight" | "sum" | "bias" | "gate";
export type Machine = { id: string; kind: MachineKind; x: number; y: number; value: number; fixed?: boolean };
export type Wire = { from: string; to: string; port: number };
export type Circuit = { machines: Machine[]; wires: Wire[] };
export type Signal = { id: string; inputs: number[]; output: number; calculation: string };
export type Trace = { part: Part; steps: Signal[]; output: number | null; problem?: { node: string; port?: number; message: string } };
export const MACHINE_WIDTH = 160;
export const MACHINE_HEIGHT = 142;
export const FLOOR_WIDTH = 1152;
export const FLOOR_HEIGHT = 660;
export const GRID = 24;
export const inletY = (kind: MachineKind, port: number) => kind === "sum" ? 50 + port * 48 : 72;
export const outletY = 72;
export const inputsFor = (kind: MachineKind) => kind === "height" || kind === "mass" ? 0 : kind === "sum" ? 2 : 1;
export const machineNames: Record<MachineKind, string> = { height: "Height sensor", mass: "Mass sensor", weight: "Weight", sum: "Combiner", bias: "Bias", gate: "Sorting gate" };
export const machineHelp: Record<MachineKind, string> = {
  height: "Reads this part's height. Its wire carries that number to another machine.",
  mass: "Reads this part's mass. Its wire carries that number to another machine.",
  weight: "Multiplies the incoming number. A negative weight reverses its contribution, so a larger input can reduce the final score.",
  sum: "Adds its two incoming numbers. Both sockets need a wire before it can produce an answer.",
  bias: "Adds the same adjustment to every part's score. It moves the cutoff without changing the sensor measurements.",
  gate: "Compares the arriving score with its cutoff. A score at or above the cutoff sends the part to the workshop; a lower score sends it to storage.",
};
const number = (n: number) => Number(n.toFixed(3)).toString();

/** Follow the learner's actual wiring backwards from the gate, then calculate forwards. */
export function traceCircuit(circuit: Circuit, part: Part): Trace {
  const steps: Signal[] = [];
  const known = new Map<string, number>();
  const visiting = new Set<string>();
  let problem: Trace["problem"];
  function visit(id: string): number | null {
    if (known.has(id)) return known.get(id)!;
    const machine = circuit.machines.find(m => m.id === id);
    if (!machine) { problem = { node: id, message: "That wire ends at a machine that is no longer on the floor." }; return null; }
    if (visiting.has(id)) { problem = { node: id, message: "This wiring forms a loop. A machine is waiting for its own answer. Remove a wire so information can travel from a sensor to the gate." }; return null; }
    visiting.add(id);
    const inputs: number[] = [];
    for (let port = 0; port < inputsFor(machine.kind); port++) {
      const wires = circuit.wires.filter(w => w.to === id && w.port === port);
      if (wires.length !== 1) { problem = { node: id, port, message: `${machineNames[machine.kind]} needs a number at ${machine.kind === "sum" ? `input ${port + 1}` : "its input"}. Connect a machine's round output to this empty square socket.` }; return null; }
      const input = visit(wires[0].from);
      if (input === null) return null;
      inputs.push(input);
    }
    let output: number;
    let calculation: string;
    switch (machine.kind) {
      case "height": output = part.height; calculation = `Height → ${number(output)}`; break;
      case "mass": output = part.mass; calculation = `Mass → ${number(output)}`; break;
      case "weight": output = inputs[0] * machine.value; calculation = `${number(inputs[0])} × (${number(machine.value)}) = ${number(output)}`; break;
      case "sum": output = inputs[0] + inputs[1]; calculation = `${number(inputs[0])} + (${number(inputs[1])}) = ${number(output)}`; break;
      case "bias": output = inputs[0] + machine.value; calculation = `${number(inputs[0])} + (${number(machine.value)}) = ${number(output)}`; break;
      case "gate": output = Number(inputs[0] >= machine.value); calculation = `${number(inputs[0])} ${output ? "≥" : "<"} ${number(machine.value)}\n→ ${output ? "Workshop" : "Storage"}`; break;
    }
    if (!Number.isFinite(output)) { problem = { node: id, message: "This machine produced a number too large to use. Reduce its setting and try again." }; return null; }
    visiting.delete(id);
    known.set(id, output);
    steps.push({ id, inputs, output, calculation });
    return output;
  }
  const output = visit("gate");
  return { part, steps, output, ...(problem ? { problem } : {}) };
}

export function connect(circuit: Circuit, wire: Wire): Circuit {
  const source = circuit.machines.find(m => m.id === wire.from);
  const target = circuit.machines.find(m => m.id === wire.to);
  if (!source || !target || source.kind === "gate" || wire.from === wire.to || !Number.isInteger(wire.port) || wire.port < 0 || wire.port >= inputsFor(target.kind)) return circuit;
  return { ...circuit, wires: [...circuit.wires.filter(w => w.to !== wire.to || w.port !== wire.port), wire] };
}

export function placement(circuit: Circuit, x: number, y: number, moving?: string) {
  const candidate = { x: Math.max(24, Math.min(936, Math.round(x / GRID) * GRID)), y: Math.max(96, Math.min(384, Math.round(y / GRID) * GRID)) };
  const occupied = circuit.machines.some(m => m.id !== moving && Math.abs(m.x - candidate.x) < MACHINE_WIDTH + 20 && Math.abs(m.y - candidate.y) < MACHINE_HEIGHT + 16);
  return occupied ? null : candidate;
}

const height: Machine = { id: "height", kind: "height", x: 24, y: 120, value: 0, fixed: true };
const mass: Machine = { id: "mass", kind: "mass", x: 24, y: 360, value: 0, fixed: true };
const gate = (value = 0): Machine => ({ id: "gate", kind: "gate", x: 960, y: 216, value, fixed: true });
const weight: Machine = { id: "weight", kind: "weight", x: 312, y: 360, value: -1 };
const combiner: Machine = { id: "sum", kind: "sum", x: 576, y: 216, value: 0 };
const simple: Part[] = [{ id: "A", height: 1, mass: 3, bin: 0 }, { id: "B", height: 4, mass: 1, bin: 1 }, { id: "C", height: 2, mass: 2, bin: 0 }, { id: "D", height: 3, mass: 2, bin: 1 }];
const mixed: Circuit = { machines: [height, mass, weight, combiner, gate()], wires: [{ from: "height", to: "sum", port: 0 }, { from: "mass", to: "weight", port: 0 }, { from: "weight", to: "sum", port: 1 }, { from: "sum", to: "gate", port: 0 }] };
const strict: Circuit = { machines: [...mixed.machines, { id: "bias", kind: "bias", x: 768, y: 360, value: -2 }], wires: [...mixed.wires.filter(w => w.to !== "gate"), { from: "sum", to: "bias", port: 0 }, { from: "bias", to: "gate", port: 0 }] };
export interface FactoryJob {
  title: string; brief: string; goal: string; hint: string; insight: string;
  batch: Part[]; starter: Circuit; example: Circuit; tools: ("weight" | "sum" | "bias")[];
}
export const FACTORY_JOBS: FactoryJob[] = [
  {
    title: "Connect the sensor", brief: "Botie has four parts to sort. The taller ones belong in the workshop. The gate can do that, but it cannot read a height until we connect the sensor.", goal: "Connect the height sensor to the gate. Then send the delivery.", hint: "Click the round output on the right of Height sensor. Then click the square input on the left of Sorting gate. The wire carries a number, not the part itself.", insight: "The sensor supplies a measurement. The gate uses that measurement to choose a destination. You have built a complete path from an input to a decision.", batch: simple, starter: { machines: [height, gate(3)], wires: [] }, example: { machines: [height, gate(3)], wires: [{ from: "height", to: "gate", port: 0 }] }, tools: [],
  },
  {
    title: "Add a weight", brief: "The replacement gate needs a score of 6 to open. Our height sensor still reports the same small numbers. We need a machine between them that makes height contribute more.", goal: "Place a Weight between the sensor and gate. Make the same four deliveries reach their labelled bins.", hint: "Place a Weight, connect Height → Weight → Gate, then raise its multiplier. Try doubling the height. Connecting to the gate replaces its old input wire.", insight: "A weight multiplies an input before it reaches the decision. The height measurements stayed the same; their contribution to the gate's score changed.", batch: simple, starter: { machines: [height, gate(6)], wires: [{ from: "height", to: "gate", port: 0 }] }, example: { machines: [height, { id: "weight", kind: "weight", x: 456, y: 216, value: 2 }, gate(6)], wires: [{ from: "height", to: "weight", port: 0 }, { from: "weight", to: "gate", port: 0 }] }, tools: ["weight"],
  },
  {
    title: "Use both measurements", brief: "This order compares the two sensor readings. A part belongs in the workshop when its height reading is at least as large as its mass reading. We need a way for mass to reduce the score, so the gate can make that comparison.", goal: "Combine height with a negative contribution from mass, then send that score to the gate.", hint: "Connect Mass → Weight and set that Weight to −1. Connect Height and the Weight to the two Combiner inputs. Connect the Combiner to the gate.", insight: "The direct height wire contributes one copy of height. The negative mass weight subtracts one copy of mass. Their combined score tells the gate which measurement is larger.", batch: FIRST_BATCH, starter: { machines: [height, mass, gate()], wires: [{ from: "height", to: "gate", port: 0 }] }, example: mixed, tools: ["weight", "sum"],
  },
  {
    title: "Adjust the cutoff", brief: "The workshop now accepts only parts whose height exceeds their mass by at least two units. The two measurements still have the same roles. We need to lower every score by the same amount before it reaches the gate.", goal: "Insert a Bias after the Combiner. Use it to sort the stricter delivery.", hint: "Connect Combiner → Bias → Gate. Lower the bias to −2. A difference of 1 will then go to storage, while a difference of 2 will reach the workshop.", insight: "The bias shifts every score equally. The gate then turns that score into either 0 or 1. This gate acts as the step activation of the neuron you have assembled.", batch: STRICT_BATCH, starter: mixed, example: strict, tools: ["bias"],
  },
  {
    title: "Build the whole machine", brief: "Botie has a fresh floor and another delivery with the stricter labels. You now have the machines needed to read the measurements, combine their contributions, adjust the score, and choose a destination.", goal: "Build a sorter that sends all eight parts to their labelled bins. You can use any wiring that does the job.", hint: "Start with the two sensors. Give mass a negative weight, add its contribution to height, and use a negative bias before the gate. You can inspect any machine to see its job.", insight: "You have built an artificial neuron from connected operations. The weights control the inputs' contributions, the bias adjusts their total, and the activation produces the decision. The Python bench lets you write those operations yourself.", batch: STRICT_BATCH, starter: { machines: [height, mass, gate()], wires: [] }, example: strict, tools: ["weight", "sum", "bias"],
  },
];
