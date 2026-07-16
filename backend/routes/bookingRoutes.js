const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingByCode,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

// Optional user middleware to extract user if logged in, but proceed as guest if not
const optionalUser = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

// Customer / Guest Routes
router.post('/', optionalUser, createBooking);
router.get('/track/:code', getBookingByCode);
router.get('/mybookings', protectUser, getMyBookings);

// Admin Routes
router.get('/', protectAdmin, getBookings);
router.put('/:id', protectAdmin, updateBookingStatus);
router.delete('/:id', protectAdmin, deleteBooking);

module.exports = router;
