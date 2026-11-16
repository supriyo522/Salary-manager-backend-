const router = require('express').Router();
const Employee = require('../models/Employee');
const { validateEmployee } = require('../services/validation');

const SORTABLE = new Set(['name', 'salaryUsd', 'country', 'department', 'hireDate']);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const filter = {};
    if (req.query.country) filter.country = String(req.query.country);
    if (req.query.department) filter.department = String(req.query.department);
    if (req.query.q) filter.name = new RegExp(escapeRe(String(req.query.q)), 'i');

    const sortKey = SORTABLE.has(req.query.sort) ? req.query.sort : 'name';
    const dir = req.query.dir === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Employee.find(filter).sort({ [sortKey]: dir, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Employee.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateEmployee(req.body);
    if (errors) return res.status(400).json({ errors });
    res.status(201).json(await Employee.create({ ...value, history: [] }));
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { errors, value } = validateEmployee(req.body);
    if (errors) return res.status(400).json({ errors });
    const existing = await Employee.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    // Keep an audit trail: record previous salary whenever it changes
    if (existing.salary !== value.salary || existing.currency !== value.currency) {
      existing.history.push({ salary: existing.salary, currency: existing.currency, changedAt: new Date() });
    }
    existing.set(value);
    await existing.save();
    res.json(existing);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Employee.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
