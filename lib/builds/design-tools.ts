import type { Data, Tool } from './engine';

function counts(value: Data): number[] {
  if (!Array.isArray(value) || !value.every(n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0)) {
    throw Error('Use a list of nonnegative whole request counts.');
  }
  return value as number[];
}

export const DESIGN_TOOLS: Record<string, Tool> = {
  designQueue: {
    title: 'Queue over time',
    why: 'Starts empty. In each interval, add arrivals to the previous backlog, subtract service capacity, and keep at least zero. Returns every end-of-interval backlog.',
    inputs: ['Arrivals per interval', 'Service capacity per interval'],
    run: ([incoming, service]) => {
      const arrivals = counts(incoming), capacity = counts(service);
      if (arrivals.length !== capacity.length) throw Error('Arrivals and service capacities need matching intervals.');
      let waiting = 0;
      return arrivals.map((n, i) => {
        waiting = Math.max(0, waiting + n - capacity[i]);
        if (!Number.isSafeInteger(waiting)) throw Error('The backlog is too large to count accurately.');
        return waiting;
      });
    },
  },
  designSelect: {
    title: 'Choose by a mask',
    why: 'For each position, a 1 selects the primary value and a 0 selects the fallback. Keeps the original order.',
    inputs: ['Use-primary mask (0 or 1)', 'Primary values', 'Fallback values'],
    run: ([mask, primary, fallback]) => {
      const flags = counts(mask);
      if (flags.some(n => n !== 0 && n !== 1)) throw Error('The selection mask needs only 0 or 1.');
      if (!Array.isArray(primary) || !Array.isArray(fallback) || primary.length !== flags.length || fallback.length !== flags.length) {
        throw Error('The mask, primary values, and fallback values need matching lengths.');
      }
      return flags.map((flag, i) => flag ? primary[i] : fallback[i]);
    },
  },
};
