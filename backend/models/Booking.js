const mongoose = require('mongoose');
const createModelProxy = require('../config/modelHelper');

const BookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceType: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'Pending' }, // Pending, Accepted, In Progress, Completed, Cancelled
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongoBooking = mongoose.model('Booking', BookingSchema);

module.exports = createModelProxy('bookings', MongoBooking);
