/** Linear-interpolated percentile (p in 0..100) of a numeric array. */
function percentile(values, p) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

function summarize(values) {
  if (!values.length) return { count: 0, min: 0, max: 0, avg: 0, median: 0, p25: 0, p75: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    min: values.reduce((a, b) => Math.min(a, b)),
    max: values.reduce((a, b) => Math.max(a, b)),
    avg: Math.round(sum / values.length),
    median: Math.round(percentile(values, 50)),
    p25: Math.round(percentile(values, 25)),
    p75: Math.round(percentile(values, 75)),
  };
}

/** rows: [{ salaryUsd, <key>: string }] -> [{ group, ...summary }] sorted by median desc. */
function groupSummaries(rows, key) {
  const groups = new Map();
  for (const r of rows) {
    if (!groups.has(r[key])) groups.set(r[key], []);
    groups.get(r[key]).push(r.salaryUsd);
  }
  return [...groups.entries()]
    .map(([group, vals]) => ({ group, ...summarize(vals) }))
    .sort((a, b) => b.median - a.median);
}

module.exports = { percentile, summarize, groupSummaries };
