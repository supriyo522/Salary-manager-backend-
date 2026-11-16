const test = require('node:test');
const assert = require('node:assert/strict');
const { percentile, summarize, groupSummaries } = require('../src/services/stats');

test('percentile interpolates between values', () => {
  assert.equal(percentile([10, 20, 30, 40], 50), 25);
  assert.equal(percentile([5], 90), 5);
  assert.equal(percentile([], 50), 0);
});

test('summarize returns count/min/max/avg/median/quartiles', () => {
  assert.deepEqual(summarize([100, 200, 300]), { count: 3, min: 100, max: 300, avg: 200, median: 200, p25: 150, p75: 250 });
});

test('summarize handles empty input', () => {
  assert.equal(summarize([]).count, 0);
});

test('groupSummaries groups and sorts by median desc', () => {
  const rows = [
    { country: 'IN', salaryUsd: 10 }, { country: 'IN', salaryUsd: 30 },
    { country: 'US', salaryUsd: 100 },
  ];
  const out = groupSummaries(rows, 'country');
  assert.deepEqual(out.map((g) => [g.group, g.median, g.count]), [['US', 100, 1], ['IN', 20, 2]]);
});
