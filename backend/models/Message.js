const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoMessage = mongoose.model('Message', MessageSchema);

module.exports = createModelProxy('messages', MongoMessage);
