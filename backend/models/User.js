const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);

module.exports = createModelProxy('users', MongoUser);
