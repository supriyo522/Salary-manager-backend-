const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/insights', require('./routes/insights'));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ errors: { email: 'Email already exists' } });
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
