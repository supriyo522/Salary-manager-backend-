const mongoose = require('mongoose');
const app = require('./app');

const { MONGO_URI = 'mongodb://127.0.0.1:27017/salary_manager', PORT = 4000 } = process.env;
mongoose.connect(MONGO_URI).then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)));
