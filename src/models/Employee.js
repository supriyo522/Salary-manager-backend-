const { Schema, model } = require('mongoose');

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    jobTitle: { type: String, required: true },
    department: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    currency: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },         // local currency
    salaryUsd: { type: Number, required: true, index: true }, // normalised for comparison
    hireDate: { type: Date, required: true },
    history: [{ _id: false, salary: Number, currency: String, changedAt: Date }],
  },
  { timestamps: true }
);

module.exports = model('Employee', employeeSchema);
