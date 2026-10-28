import type { Tool } from './engine';
import { list, scalar, vector, map } from './tools';

export const appliedTools: Record<string, Tool> = {
  mlFieldOrder: {
    title: 'Locate named columns', inputs: ['Incoming names', 'Required order'],
    why: "For each column name required by the model, find its position in the incoming column names. Missing or repeated names stop the calculation instead of guessing which measurement a column holds.",
    run: ([incoming, required]) => {
      const names = list(incoming), wanted = list(required);
      if (![...names, ...wanted].every(x => typeof x === 'string') || new Set(names).size !== names.length || new Set(wanted).size !== wanted.length) throw Error('Use distinct text names for both schemas.');
      return wanted.map(name => { const at = names.indexOf(name); if (at < 0) throw Error(`The input is missing ${name}.`); return at; });
    },
  },
  mlTopK: {
    title: 'Rank candidate positions', inputs: ['Scores', 'Number to keep'],
    why: 'Return positions in descending score order. Equal scores keep their incoming order. Gather the corresponding records afterwards.',
    run: ([values, count]) => {
      const scores = vector(values), k = scalar(count);
      if (!Number.isInteger(k) || k < 0) throw Error('The shortlist length must be a nonnegative integer.');
      return scores.map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, k).map(row => row.index);
    },
  },
  mlClip: {
    title: 'Limit a numerical range', inputs: ['Values', 'Lower bound', 'Upper bound'],
    why: 'Replace values below the lower bound or above the upper bound. Values inside the interval keep their original value.',
    run: ([values, lower, upper]) => {
      const low = scalar(lower), high = scalar(upper);
      if (low > high) throw Error('The lower bound must not exceed the upper bound.');
      return map(values, value => Math.min(high, Math.max(low, value)));
    },
  },
};
