const Booking = require('../models/Booking');

const generateBookingCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'PRE-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// @desc    Create a new booking request (Customer or Guest)
// @route   POST /api/bookings
// @access  Public (Guest) or Private (User)
const createBooking = async (req, res) => {
  try {
    const { customerName, customerPhone, serviceType, bookingDate, description } = req.body;

    if (!customerName || !customerPhone || !serviceType || !bookingDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const bookingCode = generateBookingCode();
    // If auth token is provided and verified by protectUser, req.user will exist
    const userId = req.user ? req.user._id : null;

    const booking = await Booking.create({
      bookingCode,
      userId,
      customerName,
      customerPhone,
      serviceType,
      bookingDate: new Date(bookingDate),
      description: description || '',
      status: 'Pending',
      adminNotes: '',
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private (Admin)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged-in customer's bookings
// @route   GET /api/bookings/mybookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id });
    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single booking status by reference code
// @route   GET /api/bookings/track/:code
// @access  Public
const getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const booking = await Booking.findOne({ bookingCode: code.toUpperCase() });

    if (!booking) {
      return res.status(404).json({ message: 'Booking reference code not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Track booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update booking status and admin notes
// @route   PUT /api/bookings/:id
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedData = {};
    if (status) updatedData.status = status;
    if (adminNotes !== undefined) updatedData.adminNotes = adminNotes;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData);
    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a booking request
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.deleteOne({ _id: id });
    res.json({ message: 'Booking removed successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingByCode,
  updateBookingStatus,
  deleteBooking,
};
