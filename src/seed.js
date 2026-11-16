const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const { COUNTRIES, toUsd } = require('./services/fx');

// Deterministic PRNG (mulberry32): every seed run produces identical data.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Aarav','Priya','Liam','Emma','Noah','Olivia','Arjun','Sophia','Lukas','Mia','Ethan','Ananya','Oliver','Hannah','Rohan','Isla','Jack','Meera','Felix','Chloe'];
const LAST = ['Sharma','Smith','Patel','Muller','Brown','Singh','Wilson','Schmidt','Taylor','Gupta','Clark','Khan','Evans','Roy','Fischer','Walker','Das','Nguyen','Scott','Bose'];
// department -> [title, typical US-level salary in USD]
const DEPTS = {
  Engineering: [['Software Engineer', 95000], ['Senior Engineer', 130000], ['Engineering Manager', 165000]],
  Sales: [['Sales Executive', 60000], ['Account Manager', 80000], ['Sales Director', 140000]],
  Marketing: [['Marketing Associate', 55000], ['Marketing Manager', 90000]],
  Finance: [['Analyst', 65000], ['Finance Manager', 110000]],
  HR: [['HR Associate', 50000], ['HR Manager', 85000]],
  Support: [['Support Agent', 40000], ['Support Lead', 65000]],
};
// Country pay level relative to US so insights show a realistic spread
const COUNTRY_FACTOR = { US: 1, IN: 0.3, GB: 0.8, DE: 0.85, CA: 0.85, AU: 0.9 };

async function seed(total = 10000) {
  const rand = rng(42);
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const countries = Object.keys(COUNTRIES);
  const deptNames = Object.keys(DEPTS);
  const docs = [];
  for (let i = 0; i < total; i++) {
    const country = pick(countries);
    const { currency } = COUNTRIES[country];
    const department = pick(deptNames);
    const [jobTitle, baseUsd] = pick(DEPTS[department]);
    const usd = baseUsd * COUNTRY_FACTOR[country] * (0.85 + rand() * 0.3);
    const salary = Math.round(usd / toUsd(1, currency) / 100) * 100;
    const first = pick(FIRST), last = pick(LAST);
    docs.push({
      name: `${first} ${last}`,
      email: `${first}.${last}.${i}@acme.com`.toLowerCase(),
      jobTitle, department, country, currency, salary,
      salaryUsd: toUsd(salary, currency),
      hireDate: new Date(Date.UTC(2015 + Math.floor(rand() * 11), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28))),
      history: [],
    });
  }
  await Employee.deleteMany({});
  for (let i = 0; i < docs.length; i += 1000) await Employee.insertMany(docs.slice(i, i + 1000), { ordered: false });
  return docs.length;
}

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salary_manager';
  mongoose.connect(mongoUri)
    .then(() => seed())
    .then((n) => { console.log(`Seeded ${n} employees`); return mongoose.disconnect(); })
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}
module.exports = { seed };
