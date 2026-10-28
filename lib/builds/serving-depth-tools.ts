import type { Data, Tool } from './engine';

type Row = { [key: string]: Data };
const number = (x: Data, label: string): number => {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw Error(`${label} needs a finite number.`);
  return x;
};
const integer = (x: Data, label: string, minimum = 0): number => {
  const result = number(x, label);
  if (!Number.isInteger(result) || result < minimum) throw Error(`${label} needs an integer of at least ${minimum}.`);
  return result;
};
const array = (x: Data): Data[] => { if (!Array.isArray(x)) throw Error('Connect a list.'); return x; };
const rows = (x: Data): Row[] => array(x).map(item => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw Error('Each request needs named fields.');
  return item;
});
const ids = (x: Data): string[] => {
  const result = array(x);
  if (result.some(item => typeof item !== 'string' || !item.length) || new Set(result).size !== result.length) throw Error('Use distinct nonempty request IDs.');
  return result as string[];
};
const field = (row: Row, name: string): Data => { if (!Object.hasOwn(row, name)) throw Error(`A record is missing ${name}.`); return row[name]; };

export const servingDepthTools: Record<string, Tool> = {
  servingField: {
    title: 'Read one request field', inputs: ['Request records'],
    settings: [{ key: 'field', label: 'Field name', initial: 'id' }],
    why: 'Reads the named field from every request, preserving arrival order. Keep the IDs aligned with the token and memory quantities derived from those same records.',
    run: ([data], settings) => rows(data).map(row => field(row, String(settings.field))),
  },
  servingTokenGaps: {
    title: 'Measure gaps between emitted tokens', inputs: ['Token emission times'],
    why: 'Subtracts each token timestamp from the next. A response with one token has no between-token gaps. These timestamps must come from one monotonic millisecond clock.',
    run: ([data]) => {
      const times = array(data).map(x => number(x, 'Token timestamp'));
      if (times.some((x, i) => i > 0 && x < times[i - 1])) throw Error('Emission times must not move backwards.');
      return times.slice(1).map((x, i) => x - times[i]);
    },
  },
  servingPrefixLength: {
    title: 'Count the unchanged leading tokens', inputs: ['Cached token IDs', 'Incoming token IDs'],
    why: 'Counts equal tokens from the start and stops at the first difference. A matching word later in the prompt cannot reuse the earlier attention state across a changed prefix.',
    run: ([cached, incoming]) => {
      const a = array(cached).map(x => integer(x, 'Token ID')), b = array(incoming).map(x => integer(x, 'Token ID'));
      let count = 0;
      while (count < a.length && count < b.length && a[count] === b[count]) count++;
      return count;
    },
  },
  servingCacheCompatible: {
    title: 'Check the cache compatibility contract', inputs: ['Stored contract', 'Incoming contract'],
    why: 'This conservative teaching policy requires equal model, tokenizer, adapter, prompt-template, tenant and KV-format versions. It is an application contract, not a reproduction of every runtime cache-key field or an authorization system.',
    run: ([stored, incoming]) => {
      const pair = [stored, incoming].map(x => {
        if (!x || typeof x !== 'object' || Array.isArray(x)) throw Error('Connect both named compatibility records.');
        return x;
      });
      const keys = ['model', 'tokenizer', 'adapter', 'template', 'tenant', 'kvFormat'];
      for (const row of pair) if (keys.some(key => typeof row[key] !== 'string' || !row[key])) throw Error('Every cache contract needs all six version or namespace fields.');
      return Number(keys.every(key => pair[0][key] === pair[1][key]));
    },
  },
  servingReusableBlocks: {
    title: 'Keep only complete cached blocks', inputs: ['Matching prefix tokens', 'Tokens per block'],
    why: 'Rounds the matching prefix down to complete blocks and returns its reusable token count. A partially matching block is recomputed in this teaching allocator.',
    run: ([tokens, size]) => { const n = integer(tokens, 'Matching tokens'), block = integer(size, 'Block size', 1); return Math.floor(n / block) * block; },
  },
  servingRequiredBlocks: {
    title: 'Reserve whole blocks for each sequence', inputs: ['Token reservations', 'Tokens per block'],
    why: 'Rounds each prompt-plus-output allowance up to whole blocks. Reservations are a conservative admission policy; actual engines can allocate incrementally and preempt or evict work.',
    run: ([tokens, size]) => { const block = integer(size, 'Block size', 1); return array(tokens).map(x => Math.ceil(integer(x, 'Reserved tokens') / block)); },
  },
  servingLiveSequences: {
    title: 'Release sequences that have finished', inputs: ['Sequence records'],
    why: 'Keeps rows with positive remaining output tokens. A zero row has finished in this iteration-boundary simulation and no longer occupies its sequence slot or reserved blocks.',
    run: ([data]) => {
      const records = rows(data);
      ids(records.map(row => field(row, 'id')));
      for (const row of records) integer(field(row, 'blocks'), 'Reserved blocks');
      return records.filter(row => integer(field(row, 'remaining'), 'Remaining output tokens') > 0);
    },
  },
  servingAdmitFIFO: {
    title: 'Admit the waiting prefix that fits', inputs: ['Waiting IDs', 'Required blocks', 'Free sequence slots', 'Free blocks'],
    why: 'Admits requests in the supplied FIFO order while both limits permit. Stops at the first request that cannot fit, even if a later smaller request could. This deliberately simple policy is not a vLLM scheduler emulator.',
    run: ([data, requirements, slotInput, blockInput]) => {
      const names = ids(data), blocks = array(requirements).map(x => integer(x, 'Required blocks'));
      let slots = integer(slotInput, 'Free slots'), free = integer(blockInput, 'Free blocks');
      if (names.length !== blocks.length) throw Error('Every waiting request needs its own block reservation.');
      const accepted: string[] = [];
      for (let i = 0; i < names.length; i++) { if (!slots || blocks[i] > free) break; accepted.push(names[i]); slots--; free -= blocks[i]; }
      return accepted;
    },
  },
  servingCancelAcknowledgements: {
    title: 'Apply confirmed cancellation releases', inputs: ['Running request records', 'Acknowledged cancellation IDs'],
    why: 'Only a cancel_requested row named by the execution engine becomes released. Asking to cancel is not acknowledgement that computation and cache ownership have ended.',
    run: ([data, acknowledgements]) => {
      const records = rows(data), ack = ids(acknowledgements), names = ids(records.map(row => field(row, 'id')));
      if (records.some(row => !['running', 'cancel_requested', 'released'].includes(String(field(row, 'state'))))) throw Error('Use running, cancel_requested or released states.');
      if (ack.some(id => !names.includes(id) || records[names.indexOf(id)].state !== 'cancel_requested')) throw Error('An acknowledgement must identify a pending cancellation.');
      return records.map(row => ({ ...row, state: ack.includes(String(row.id)) ? 'released' : row.state }));
    },
  },
  servingHeldRequests: {
    title: 'Count work still owned by the engine', inputs: ['Request records after acknowledgements'],
    why: 'Keeps running and cancellation-requested work. Only released rows stop owning slots and reserved KV blocks.',
    run: ([data]) => rows(data).filter(row => {
      if (!['running', 'cancel_requested', 'released'].includes(String(field(row, 'state')))) throw Error('A request has an unknown ownership state.');
      integer(field(row, 'blocks'), 'Reserved blocks');
      return row.state !== 'released';
    }),
  },
  servingBoundQueue: {
    title: 'Keep the waiting queue within its limit', inputs: ['Already waiting IDs', 'Incoming IDs', 'Queue limit'],
    why: 'Preserves the existing FIFO queue, admits incoming IDs only into free waiting positions, and reports rejected arrivals separately. It does not generate retries or silently drop existing work.',
    run: ([waiting, arriving, limit]) => {
      const old = ids(waiting), incoming = ids(arriving), capacity = integer(limit, 'Queue limit');
      if (old.length > capacity || incoming.some(id => old.includes(id))) throw Error('The existing queue must fit and incoming IDs must be new.');
      const available = capacity - old.length;
      return { queued: [...old, ...incoming.slice(0, available)], rejected: incoming.slice(available) };
    },
  },
  servingPressureReport: {
    title: 'Keep ownership beside the waiting decisions', inputs: ['Held sequence slots', 'Held KV blocks', 'Queue decision'],
    why: 'Names the independent occupancy and waiting-queue results. A bounded waiting queue does not by itself bound running memory or stop an external tool effect.',
    run: ([slots, blocks, queue]) => {
      if (!queue || typeof queue !== 'object' || Array.isArray(queue)) throw Error('Connect a queue decision record.');
      return { heldSlots: integer(slots, 'Held slots'), heldBlocks: integer(blocks, 'Held blocks'), queued: ids(field(queue, 'queued')), rejected: ids(field(queue, 'rejected')) };
    },
  },
  servingCanaryRoutes: {
    title: 'Route the stable request buckets', inputs: ['Buckets from 0 to 99', 'Canary percentage'],
    why: 'Buckets below the integer percentage use the candidate; the rest use the stable model. The supplied bucket stays attached to a request. Routing chooses a model, not permission to execute its tool calls.',
    run: ([data, amount]) => {
      const percent = integer(amount, 'Canary percentage');
      if (percent > 100) throw Error('Use a percentage between zero and one hundred.');
      return array(data).map(x => { const bucket = integer(x, 'Request bucket'); if (bucket > 99) throw Error('Buckets run from zero to ninety-nine.'); return bucket < percent ? 'candidate' : 'stable'; });
    },
  },
  servingEffectReport: {
    title: 'Attach model routing and write permission', inputs: ['Run IDs', 'Model routes', 'Write-allowed mask'],
    why: 'Keeps each run’s selected model separate from its 0-or-1 permission to perform a write. The workshop mask is only a policy calculation; a real service must enforce capabilities at the tool boundary.',
    run: ([data, routeInput, masks]) => {
      const names = ids(data), routes = array(routeInput), allowed = array(masks);
      if (routes.length !== names.length || allowed.length !== names.length || routes.some(x => x !== 'stable' && x !== 'candidate') || allowed.some(x => x !== 0 && x !== 1)) throw Error('Align one model route and one 0-or-1 write decision with each run ID.');
      return names.map((id, i) => ({ id, model: routes[i], writeAllowed: Boolean(allowed[i]) }));
    },
  },
};
