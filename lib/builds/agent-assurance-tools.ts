import type { Data, Tool } from './engine';

type Row = { [key: string]: Data };
const records = (value: Data): Row[] => {
  if (!Array.isArray(value) || value.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw Error('Connect a list of records with named fields.');
  }
  return value as Row[];
};
const flags = (value: Data): (0 | 1 | null)[] => {
  if (!Array.isArray(value) || value.some(flag => flag !== 0 && flag !== 1 && flag !== null)) {
    throw Error('Use 0 for an observed absence, 1 for an observed event, and null for an unresolved check.');
  }
  return value as (0 | 1 | null)[];
};

export const agentAssuranceTools: Record<string, Tool> = {
  agentAssuranceRate: {
    title: 'Count reviewed outcomes',
    why: 'Reports events, reviewed outcomes and total attempts alongside the reviewed-outcome rate and review coverage. Null is unresolved, never a successful prevention. Empty denominators stay null.',
    inputs: ['Outcome flags: 0, 1 or null'],
    run: ([input]) => {
      const values = flags(input);
      const reviewed = values.filter(value => value !== null).length;
      const events = values.filter(value => value === 1).length;
      return { events, reviewed, total: values.length, rate: reviewed ? events / reviewed : null, coverage: values.length ? reviewed / values.length : null };
    },
  },
  agentAssuranceAllClear: {
    title: 'Require completed clear checks',
    why: 'Returns true only for a nonempty list consisting entirely of observed zero flags. A critical event, unresolved check or absent evidence prevents an all-clear result.',
    inputs: ['Current critical-event checks'],
    run: ([input]) => {
      const values = flags(input);
      return values.length > 0 && values.every(value => value === 0);
    },
  },
  agentAssuranceUnsettled: {
    title: 'Keep unsettled actions',
    why: 'Keeps pending, in_flight and unknown actions for reconciliation. Completed and cancelled actions remain in the audit history but leave this work list. Rejects duplicate IDs and unrecognised states.',
    inputs: ['One release’s action records'],
    run: ([input]) => {
      const rows = records(input);
      const known = new Set(['pending', 'in_flight', 'unknown', 'completed', 'cancelled']);
      const seen = new Set<string>();
      for (const row of rows) {
        if (typeof row.id !== 'string' || !row.id || seen.has(row.id)) throw Error('Actions need unique, nonempty IDs.');
        if (typeof row.status !== 'string' || !known.has(row.status)) throw Error('An action has an unrecognised status; investigate its state before continuing.');
        seen.add(row.id);
      }
      return rows.filter(row => row.status === 'pending' || row.status === 'in_flight' || row.status === 'unknown');
    },
  },
};
