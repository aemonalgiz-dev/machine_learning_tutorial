import type { Tool } from './engine';
import { scalar, text, vector } from './tools';

export const numericalLearningTools: Record<string, Tool> = {
  numericalNonzeroScale: {
    title: 'Choose a nonzero divisor',
    why: 'Use the supplied nonnegative magnitude as a divisor, except that zero becomes one. Dividing a zero vector by one leaves it at zero without inventing a direction.',
    inputs: ['Nonnegative magnitude'],
    run: ([value]) => {
      const magnitude = scalar(value);
      if (!Number.isFinite(magnitude) || magnitude < 0) throw Error('Supply a finite, nonnegative magnitude.');
      return magnitude === 0 ? 1 : magnitude;
    },
  },
  numericalPassingPositions: {
    title: 'Keep the passing experiment positions',
    why: 'Read a list of zero-or-one decisions and return the original positions marked one. An empty list of positions means none of the proposed experiments passed the stated comparison.',
    inputs: ['Zero-or-one decision for each experiment'],
    run: ([value]) => {
      const mask = vector(value);
      if (!mask.every(flag => flag === 0 || flag === 1)) throw Error('Supply one zero-or-one decision per proposed experiment.');
      return mask.flatMap((flag, index) => flag === 1 ? [index] : []);
    },
  },
  numericalTestLoss: {
    title: 'Evaluate the declared test loss',
    why: 'Evaluate the small loss named by this example at the supplied weight. Squared loss squares weight-minus-target; absolute loss keeps its magnitude. The loss stays the same while the weight is perturbed.',
    inputs: ['Weight to evaluate', 'Target weight', 'Loss: squared or absolute'],
    run: ([weight, target, kind]) => {
      const difference = scalar(weight) - scalar(target), name = text(kind);
      if (name === 'squared') return difference * difference;
      if (name === 'absolute') return Math.abs(difference);
      throw Error('This teaching loss must be named squared or absolute.');
    },
  },
  numericalSlopeReport: {
    title: 'Label the slope comparisons',
    why: 'Keep the separately calculated left, right and central slopes visible. This tool labels your results; it does not decide that a derivative exists.',
    inputs: ['Slope from the left', 'Slope from the right', 'Central difference'],
    run: ([left, right, central]) => ({ left: scalar(left), right: scalar(right), central: scalar(central) }),
  },
  numericalStepReport: {
    title: 'Show the step comparison',
    why: "Keep the proposed state, its estimated step error and the allowed error beside the acceptance decision. This compares numerical steps; it does not establish that the simulated motion matches reality.",
    inputs: ['Candidate state', 'Estimated local error', 'Allowed local error', 'Accept: zero or one'],
    run: ([candidate, error, tolerance, accepted]) => {
      const flag = scalar(accepted);
      if (flag !== 0 && flag !== 1) throw Error('Use a threshold comparison to supply a zero-or-one acceptance decision.');
      return { candidate: scalar(candidate), estimated_error: scalar(error), tolerance: scalar(tolerance), accepted: flag };
    },
  },
};
