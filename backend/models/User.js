const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: {
    street: { type: String, default: '' },
    landmark: { type: String, default: '' },
    villageTown: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: 'Andhra Pradesh' },
    pincode: { type: String, default: '' }
  },
  notifications: {
    bookingUpdates: { type: Boolean, default: true },
    handymanArrival: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false }
  },
  resetPasswordOtp: {
    code: { type: String },
    expiresAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);

module.exports = createModelProxy('users', MongoUser);
