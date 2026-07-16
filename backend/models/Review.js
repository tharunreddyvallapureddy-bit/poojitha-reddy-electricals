const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const ReviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoReview = mongoose.model('Review', ReviewSchema);

module.exports = createModelProxy('reviews', MongoReview);
