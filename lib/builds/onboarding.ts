import { constant, op, source, type Build, type Construction } from "./engine";

const doubling: Build = {
  id: "workshop-guide",
  title: "Connect the sensor",
  problem: "For this example, a sensor gives us half of the reading we need. The machine beside it doubles whatever arrives.",
  challenge: "Connect Sensor reading's round output arrow to Multiply's square Value input. You can click each end or drag between them. Then test the examples.",
  sources: { reading: "Sensor reading" },
  recipe: op("multiply", [source("reading"), constant(2)]),
  cases: [
    { name: "A reading of 3", data: { reading: 3 }, expected: 6 },
    { name: "A reading of 5", data: { reading: 5 }, expected: 10 },
    { name: "A negative reading", data: { reading: -2 }, expected: -4 },
  ],
  why: "The source supplies each reading. The constant supplies the same multiplier every time. Multiply combines them, and its wire carries the answer into Result. Changing the reading changes the answer without changing the rule.",
  extras: [],
  limitation: "The sensor and its scale are invented to teach the controls. A real calibration would need measurements establishing how the sensor differs from a reference.",
};

export const connectionIntroduction = doubling;

export const independentIntroduction: Build = {
  ...doubling,
  title: "Make the rule yourself",
  problem: "We have another sensor with the same half-scale readings. Its floor is empty, so it needs a construction of its own.",
  challenge: "Build a rule that doubles each sensor reading. Choose the pieces from the shelf, set the constant, and connect their inputs. Test every example when you think the rule is ready.",
};

export const calibrationRepair: Build = {
  ...doubling,
  id: "workshop-calibration-repair",
  title: "The replacement sensor has a different zero",
  problem: "The replacement still changes by half as much as the reference. But when it reads zero, the reference reads 4. The old doubling rule now misses every reference by the same amount.",
  challenge: "Keep the useful part of your earlier machine. Add what it needs so readings of 0 and 3 agree with reference measurements of 4 and 10. Then test the repair.",
  recipe: op("add", [op("multiply", [source("reading"), constant(2)]), constant(4)]),
  cases: [{name: "Replacement at zero", data: {reading: 0}, expected: 4}, {name: "Replacement at three", data: {reading: 3}, expected: 10}],
  extras: ["subtract"],
  hints: ["At a reading of zero, changing the multiplier still leaves zero. What operation can supply a fixed adjustment?", "The reference is higher than the doubled sensor reading. Keep the doubling rule, then add the fixed amount needed to reach that reference. Check both calibration pairs before trying new readings."],
  why: "The multiplier repairs the scale. The added constant repairs the zero point. They address different parts of the calibration.",
};

export const calibrationShift: Build = {
  ...calibrationRepair, id: "workshop-calibration-shift", title: "The next sensor readings",
  challenge: "Use the repaired machine on readings you have not used to build it. These checks also include the two calibration readings.",
  cases: [{name: "Next reading: seven", data: {reading: 7}, expected: 18}, {name: "Next reading: minus one", data: {reading: -1}, expected: 2}, ...calibrationRepair.cases],
};

/** One missing connection teaches wiring before the learner has to place tools. */
export function firstConnectionGraph(): Construction {
  return {
    pieces: [
      { id: "reading", tool: "source:reading", x: 32, y: 70, settings: {} },
      { id: "factor", tool: "constant", x: 32, y: 320, settings: { value: 2 } },
      { id: "multiplier", tool: "multiply", x: 410, y: 120, settings: {} },
      { id: "output", tool: "output", x: 790, y: 160, settings: {} },
    ],
    connections: [
      { from: "factor", to: "multiplier", port: 1 },
      { from: "multiplier", to: "output", port: 0 },
    ],
  };
}
