const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoAdmin = mongoose.model('Admin', AdminSchema);

module.exports = createModelProxy('admins', MongoAdmin);
