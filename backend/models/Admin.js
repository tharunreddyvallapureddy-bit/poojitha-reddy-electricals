const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Vinay (Poojitha Reddy)' },
  email: { type: String, default: 'poojithareddyelectricals@gmail.com' },
  phone: { type: String, default: '8498870697' },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'Master Administrator' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoAdmin = mongoose.model('Admin', AdminSchema);

module.exports = createModelProxy('admins', MongoAdmin);
