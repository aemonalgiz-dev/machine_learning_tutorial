import type { Data, Tool } from './engine';

type Estimate = { mean: number; variance: number };
const finite = (value: Data, name: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw Error(`${name} needs a finite number.`);
  return value;
};
const nonnegative = (value: Data, name: string): number => {
  const result = finite(value, name);
  if (result < 0) throw Error(`${name} cannot be negative.`);
  return result;
};
const estimate = (value: Data): Estimate => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Connect an estimate with mean and variance fields.');
  return { mean: finite(value.mean, 'Mean'), variance: nonnegative(value.variance, 'Variance') };
};
const positive = (value: Data, name: string): number => {
  const result = nonnegative(value, name);
  if (!result) throw Error(`${name} must be positive.`);
  return result;
};
const numbers = (value: Data): number[] => {
  if (!Array.isArray(value)) throw Error('Connect a list of measurements.');
  return value.map(item => finite(item, 'Measurement'));
};

export const stateEstimationTools: Record<string, Tool> = {
  stateEstimate: {
    title: 'Keep an estimate and its spread', inputs: ['Position mean', 'Position variance'],
    why: "Keep the position estimate together with its declared variance. The estimate uses metres, and the variance uses squared metres. The variance comes from our model; compare it with observed errors before treating it as reliable.",
    run: ([mean, variance]) => ({ mean: finite(mean, 'Mean'), variance: nonnegative(variance, 'Variance') }),
  },
  stateAdvance: {
    title: 'Predict through one motion interval', inputs: ['Earlier estimate', 'Expected displacement', 'Added motion variance'],
    why: "Move the earlier position by the expected displacement. Add the independent variance supplied for that movement. This example tracks one position coordinate; a different motion model needs its own uncertainty calculation.",
    run: ([state, displacement, process]) => {
      const prior = estimate(state);
      return { mean: prior.mean + finite(displacement, 'Displacement'), variance: prior.variance + nonnegative(process, 'Motion variance') };
    },
  },
  stateObserveOptional: {
    title: 'Correct when a measurement arrived', inputs: ['Predicted estimate', 'Measurement or null', 'Measurement variance'],
    why: 'A null means no measurement: preserve the prediction. Otherwise apply the scalar independent-noise Kalman correction already built in the first lesson. Zero is a real measurement, not a missing marker.',
    run: ([state, measurement, noise]) => {
      const prior = estimate(state), r = positive(noise, 'Measurement variance');
      if (measurement === null) return prior;
      const scale = Math.max(prior.variance, r);
      const p = prior.variance / scale, observation = r / scale;
      const total = p + observation, gain = p / total, retained = observation / total;
      // Separate weights preserve a small retained share when gain rounds to one.
      const mean = retained * prior.mean + gain * finite(measurement, 'Measurement');
      const variance = retained ** 2 * prior.variance + gain ** 2 * r;
      return { mean: finite(mean, 'Corrected mean'), variance: nonnegative(variance, 'Corrected variance') };
    },
  },
  stateInnovationDistances: {
    title: 'Scale candidate disagreements', inputs: ['Predicted estimate', 'Candidate positions', 'Measurement variance'],
    why: 'For each candidate, divide squared measurement-minus-prediction by the sum of predicted and measurement variance. All candidates must refer to the same capture time, coordinate frame and stated sensor variance.',
    run: ([state, candidates, noise]) => {
      const prior = estimate(state), r = positive(noise, 'Measurement variance');
      const sum = prior.variance + r;
      const scale = Math.max(prior.variance, r);
      const deviation = Math.sqrt(scale) * Math.sqrt(prior.variance / scale + r / scale);
      return numbers(candidates).map(z => {
        const difference = z - prior.mean, square = difference ** 2;
        if (Number.isFinite(sum) && Number.isFinite(square) && (square !== 0 || difference === 0)) {
          return nonnegative(square / sum, 'Squared innovation distance');
        }
        // Divide before squaring when the raw variance sum or difference overflows.
        const scaled = Number.isFinite(difference) ? difference / deviation : z / deviation - prior.mean / deviation;
        return nonnegative(scaled ** 2, 'Squared innovation distance');
      });
    },
  },
  stateUniqueObservation: {
    title: 'Use only an unambiguous candidate', inputs: ['Candidate positions', 'Pass mask'],
    why: 'Returns the measurement only when exactly one mask entry is one. No passing candidate or several plausible candidates returns null. Passing a numerical gate does not establish object identity.',
    run: ([candidates, mask]) => {
      const zs = numbers(candidates), flags = numbers(mask);
      if (zs.length !== flags.length || flags.some(flag => flag !== 0 && flag !== 1)) throw Error('Use one 0-or-1 gate decision for each candidate.');
      const kept = zs.filter((_, i) => flags[i] === 1);
      return kept.length === 1 ? kept[0] : null;
    },
  },
  stateConsistency: {
    title: 'Compare uncertainty with a simulated reference', inputs: ['Estimated state', 'Reference position'],
    why: 'Reports signed error, squared error divided by declared variance, and whether this reference lies within two declared standard deviations. Reference truth is for offline evaluation and must not enter the filter itself. One case cannot establish calibration.',
    run: ([state, truth]) => {
      const result = estimate(state), variance = positive(result.variance, 'Evaluation variance');
      const error = result.mean - finite(truth, 'Reference position');
      return { mean: result.mean, variance, error, normalisedSquaredError: error ** 2 / variance, withinTwoSigma: Math.abs(error) <= 2 * Math.sqrt(variance) };
    },
  },
};
