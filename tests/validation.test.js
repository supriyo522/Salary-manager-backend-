const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEmployee } = require('../src/services/validation');
const { toUsd } = require('../src/services/fx');

const valid = { name: ' Asha Rao ', email: 'ASHA@acme.com', jobTitle: 'Engineer', department: 'Engineering', country: 'in', salary: '1500000', hireDate: '2022-01-15' };

test('accepts valid input, normalises it, derives currency + USD salary', () => {
  const { errors, value } = validateEmployee(valid);
  assert.equal(errors, null);
  assert.equal(value.name, 'Asha Rao');
  assert.equal(value.email, 'asha@acme.com');
  assert.equal(value.country, 'IN');
  assert.equal(value.currency, 'INR');
  assert.equal(value.salaryUsd, toUsd(1500000, 'INR'));
});

test('rejects bad salary, email and country', () => {
  const { errors } = validateEmployee({ ...valid, salary: -5, email: 'nope', country: 'ZZ' });
  assert.deepEqual(Object.keys(errors).sort(), ['country', 'email', 'salary']);
});

test('rejects empty body', () => {
  assert.ok(validateEmployee().errors.name);
});

test('toUsd throws on unknown currency', () => {
  assert.throws(() => toUsd(1, 'XXX'));
});
