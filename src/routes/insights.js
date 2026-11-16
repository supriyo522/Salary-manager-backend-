const router = require('express').Router();
const Employee = require('../models/Employee');
const { groupSummaries, summarize } = require('../services/stats');
const { COUNTRIES } = require('../services/fx');

// GET /api/insights?groupBy=country|department[&country=IN&department=Engineering]
router.get('/', async (req, res, next) => {
  try {
    const groupBy = req.query.groupBy === 'department' ? 'department' : 'country';
    const filter = {};
    if (req.query.country) filter.country = String(req.query.country);
    if (req.query.department) filter.department = String(req.query.department);
    // ~10k rows x 3 small fields: cheap. Aggregating in JS keeps median logic pure + testable.
    const rows = await Employee.find(filter, { salaryUsd: 1, country: 1, department: 1, _id: 0 }).lean();
    res.json({ currency: 'USD', overall: summarize(rows.map((r) => r.salaryUsd)), groups: groupSummaries(rows, groupBy) });
  } catch (e) { next(e); }
});

router.get('/meta', async (_req, res, next) => {
  try {
    res.json({ countries: COUNTRIES, departments: (await Employee.distinct('department')).sort() });
  } catch (e) { next(e); }
});

module.exports = router;
