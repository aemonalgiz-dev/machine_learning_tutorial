import { sum, mean, dot, softmax } from './authoring.mjs';
const fraction = (a, b) => b ? a / b : 0;
const unique = xs => [...new Set(xs)];
const ids = rows => rows.map(r => r.id);
const sorted = xs => unique(xs).sort();
const squaredError = d => mean(d.predicted.map((x, i) => (x - d.actual[i]) ** 2));
const positiveHits = d => dot(d.labels, d.predictions);
// Each alternative follows a plausible misreading of the operation. Some
// coincide with the answer on boundary cases; the authoring layer removes
// duplicate results instead of presenting an ambiguous choice.
export const distractors = {
    'sensor-standardise': d => {
        const m = mean(d.readings), centred = d.readings.map(x => x - m), variance = mean(centred.map(x => x * x));
        return [centred, centred.map(x => variance ? x / variance : 1), d.readings];
    },
    'purchase-bills': d => [d.orders.map(sum), d.orders.map(r => dot(r, [...d.prices].reverse())), [sum(d.orders.map(r => dot(r, d.prices)))]],
    'compose-transforms': d => [
        d.left.map(r => d.right[0].map((_, j) => sum(r.map((x, k) => x + d.right[k][j])))),
        d.left.map(r => d.right[0].map((_, j) => r[0] * d.right[0][j])),
        d.left.map(r => d.right[0].map((_, j) => sum(r.map((x, k) => x * d.right[k][j])) / r.length)),
    ],
    'ridge-objective': d => {
        const mse = squaredError(d), penalty = d.strength * dot(d.coefficients, d.coefficients);
        return [mse, mse + penalty / d.actual.length, mse + d.strength * sum(d.coefficients.map(Math.abs))];
    },
    'gradient-repair': d => {
        const gradient = 2 * mean(d.x.map((x, i) => x * (d.weight * x - d.y[i])));
        return [d.weight + d.rate * gradient, d.weight - d.rate * gradient / 2, d.weight];
    },
    'alert-precision': d => [fraction(positiveHits(d), sum(d.labels)), positiveHits(d) / d.labels.length, 1],
    'fault-recall': d => [fraction(positiveHits(d), sum(d.predictions)), positiveHits(d) / d.labels.length, 1],
    'classification-accuracy': d => [positiveHits(d) / d.labels.length, fraction(positiveHits(d), sum(d.predictions)), fraction(positiveHits(d), sum(d.labels))],
    'probability-brier': d => [
        mean(d.probabilities.map((p, i) => Math.abs(p - d.labels[i]))),
        mean(d.probabilities.map((p, i) => (Number(p >= .5) - d.labels[i]) ** 2)),
        sum(d.probabilities.map((p, i) => (p - d.labels[i]) ** 2)),
    ],
    'binary-log-loss': d => [
        -mean(d.probabilities.map(Math.log)),
        -sum(d.probabilities.map((p, i) => d.labels[i] * Math.log(p) + (1 - d.labels[i]) * Math.log(1 - p))),
        -mean(d.probabilities.map((p, i) => d.labels[i] * Math.log2(p) + (1 - d.labels[i]) * Math.log2(1 - p))),
    ],
    'relu-neuron': d => [dot(d.inputs, d.weights) + d.bias, Math.max(0, dot(d.inputs, d.weights)), Math.max(0, dot(d.inputs.map(x => Math.max(0, x)), d.weights) + d.bias)],
    'relative-token-scores': d => [softmax(d.scores.map(x => -x)), d.scores.map(() => 1 / d.scores.length), d.scores.map(x => Number(x === Math.max(...d.scores)))],
    'attention-summary': d => [mean(d.values), d.values[d.scores.indexOf(Math.max(...d.scores))], dot(d.scores, d.values)],
    'uncertain-symbols': d => [-mean(d.probabilities.map(Math.log2)), -sum(d.probabilities.map(p => p * Math.log(p))), Math.log2(d.probabilities.length)],
    'rare-search-terms': d => [Math.log((d.documents + 1) / (d.frequency + 1)), (d.documents + 1) / (d.frequency + 1), Math.log((d.frequency + 1) / (d.documents + 1)) + 1],
    'mean-text-vector': d => [d.embeddings.map(mean), d.embeddings[0], d.embeddings[0].map((_, j) => sum(d.embeddings.map(r => r[j])))],
    'threshold-pixels': d => [d.pixels.map(r => r.map(x => Number(x > d.cutoff))), d.pixels.map(r => r.map(x => Number(x < d.cutoff))), d.pixels.map(r => r.map(x => Number(x <= d.cutoff)))],
    'scan-a-signal': d => [
        Array.from({ length: d.signal.length - 2 }, (_, i) => dot(d.signal.slice(i, i + 3), [...d.kernel].reverse())),
        Array.from({ length: d.signal.length - 2 }, (_, i) => sum(d.signal.slice(i, i + 3))),
        Array.from({ length: Math.floor(d.signal.length / 3) }, (_, i) => dot(d.signal.slice(i * 3, i * 3 + 3), d.kernel)),
    ],
    'pair-pooling': d => [
        Array.from({ length: d.activations.length / 2 }, (_, i) => mean(d.activations.slice(i * 2, i * 2 + 2))),
        Array.from({ length: d.activations.length - 1 }, (_, i) => Math.max(...d.activations.slice(i, i + 2))),
        [Math.max(...d.activations)],
    ],
    'forecast-baseline': d => [mean(d.history), d.history[0], Math.max(...d.history)],
    'discounted-return': d => [sum(d.rewards), sum(d.rewards.map((r, i) => r * d.gamma ** (i + 1))), mean(d.rewards)],
    'terminal-target': d => [d.reward + d.gamma * d.next_value, d.reward + d.gamma * d.terminal * d.next_value, d.gamma * (d.reward + (1 - d.terminal) * d.next_value)],
    'review-backlog': d => [
        d.arrivals.map((v, i) => Math.max(0, v - d.capacities[i])),
        d.arrivals.map((_, i) => Math.max(0, sum(d.arrivals.slice(0, i + 1)) - sum(d.capacities.slice(0, i + 1)))),
        d.arrivals,
    ],
    'sql-filter-rows': d => [d.rows.filter(r => r.value >= d.cutoff).map(r => [r.id]), d.rows.filter(r => r.value < d.cutoff).map(r => [r.id]), d.rows.filter(r => r.value > d.cutoff).map(r => [r.value])],
    'sql-total-value': d => [[[sum(unique(d.rows.map(r => r.value)))]], [[mean(d.rows.map(r => r.value))]], [[d.rows.length]]],
    'sql-group-totals': d => {
        const groups = sorted(d.rows.map(r => r.group));
        return [groups.map(g => [g, mean(d.rows.filter(r => r.group === g).map(r => r.value))]), groups.map(g => [g, d.rows.filter(r => r.group === g).length]), [["all", sum(d.rows.map(r => r.value))]]];
    },
    'document-projection': d => [d.rows, d.rows.map(r => ({ id: r.id })), d.rows.map(r => ({ id: r.id, value: r.value })).reverse()],
    'latest-record-version': d => {
        const keys = sorted(ids(d.rows));
        return [keys.map(k => d.rows.filter(r => r.id === k).at(-1)), keys.map(k => d.rows.find(r => r.id === k)), keys.map(k => d.rows.filter(r => r.id === k).sort((a, b) => a.version - b.version)[0])];
    },
    'cache-lifetime': d => [ids(d.rows.filter(r => r.expires >= d.now)), ids(d.rows.filter(r => r.expires <= d.now)), ids(d.rows)],
    'directed-neighbours': d => [
        sorted(d.edges.filter(e => d.start.includes(e.to) && !d.start.includes(e.from)).map(e => e.from)),
        sorted(d.edges.filter(e => d.start.includes(e.from)).map(e => e.to)),
        sorted(d.edges.filter(e => d.start.includes(e.to) || d.start.includes(e.from)).flatMap(e => [e.from, e.to]).filter(x => !d.start.includes(x))),
    ],
    'second-graph-frontier': d => {
        const first = sorted(d.edges.filter(e => d.start.includes(e.from)).map(e => e.to));
        const second = sorted(d.edges.filter(e => first.includes(e.from)).map(e => e.to));
        return [second, second.filter(x => !d.start.includes(x)), first.filter(x => !d.start.includes(x))];
    },
    'delegated-tools': d => [unique(d.requested), unique(d.allowed), d.requested.filter(x => d.allowed.includes(x))],
    'remaining-call-budget': d => [d.budget - sum(d.costs), d.budget, d.budget - d.costs.length],
    'observed-side-effects': d => [unique(d.observed.filter(x => !d.allowed.includes(x))), d.observed.filter(x => d.allowed.includes(x)), d.observed],
    'scoped-agent-memory': d => [ids(d.rows.filter(r => r.tenant === d.tenant)), ids(d.rows.filter(r => r.reviewed === true && r.expires > d.now)), ids(d.rows.filter(r => r.tenant === d.tenant && r.reviewed === true && r.expires >= d.now))],
};
