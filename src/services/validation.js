const { COUNTRIES, toUsd } = require('./fx');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates input and derives currency + salaryUsd. Returns { errors, value }. */
function validateEmployee(body = {}) {
  const errors = {};
  const str = (k) => (typeof body[k] === 'string' ? body[k].trim() : '');

  const name = str('name');
  const email = str('email').toLowerCase();
  const jobTitle = str('jobTitle');
  const department = str('department');
  const country = str('country').toUpperCase();
  const salary = Number(body.salary);
  const hireDate = new Date(body.hireDate);

  if (!name) errors.name = 'Name is required';
  if (!EMAIL_RE.test(email)) errors.email = 'Valid email is required';
  if (!jobTitle) errors.jobTitle = 'Job title is required';
  if (!department) errors.department = 'Department is required';
  if (!COUNTRIES[country]) errors.country = `Country must be one of ${Object.keys(COUNTRIES).join(', ')}`;
  if (!Number.isFinite(salary) || salary <= 0) errors.salary = 'Salary must be a positive number';
  if (Number.isNaN(hireDate.getTime())) errors.hireDate = 'Valid hire date is required';

  if (Object.keys(errors).length) return { errors, value: null };

  const currency = COUNTRIES[country].currency;
  return {
    errors: null,
    value: { name, email, jobTitle, department, country, currency, salary, salaryUsd: toUsd(salary, currency), hireDate },
  };
}

module.exports = { validateEmployee };
