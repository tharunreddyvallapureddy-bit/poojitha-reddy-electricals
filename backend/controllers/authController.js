const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const { sendResetCodeEmail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new customer user
// @route   POST /api/auth/user/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address: {
        street: '',
        landmark: '',
        villageTown: '',
        district: '',
        state: 'Andhra Pradesh',
        pincode: ''
      },
      notifications: {
        bookingUpdates: true,
        handymanArrival: true,
        promotions: false
      }
    });

    if (user) {
      // Link any previous guest bookings that match this user's phone number
      await Booking.updateMany(
        { userId: null, customerPhone: user.phone },
        { userId: user._id }
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        notifications: user.notifications,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate customer user & get token
// @route   POST /api/auth/user/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Link any previous guest bookings that match this user's phone number
    await Booking.updateMany(
      { userId: null, customerPhone: user.phone },
      { userId: user._id }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || {
        street: '',
        landmark: '',
        villageTown: '',
        district: '',
        state: 'Andhra Pradesh',
        pincode: ''
      },
      notifications: user.notifications || {
        bookingUpdates: true,
        handymanArrival: true,
        promotions: false
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer user profile
// @route   GET /api/auth/user/profile
// @access  Private (User)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address || {
          street: '',
          landmark: '',
          villageTown: '',
          district: '',
          state: 'Andhra Pradesh',
          pincode: ''
        },
        notifications: user.notifications || {
          bookingUpdates: true,
          handymanArrival: true,
          promotions: false
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update customer user profile (Name, Phone, Address, Notifications)
// @route   PUT /api/auth/user/profile
// @access  Private (User)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address, notifications } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street !== undefined ? address.street : (user.address?.street || ''),
        landmark: address.landmark !== undefined ? address.landmark : (user.address?.landmark || ''),
        villageTown: address.villageTown !== undefined ? address.villageTown : (user.address?.villageTown || ''),
        district: address.district !== undefined ? address.district : (user.address?.district || ''),
        state: address.state !== undefined ? address.state : (user.address?.state || 'Andhra Pradesh'),
        pincode: address.pincode !== undefined ? address.pincode : (user.address?.pincode || '')
      };
    }
    if (notifications) {
      user.notifications = {
        bookingUpdates: notifications.bookingUpdates !== undefined ? notifications.bookingUpdates : true,
        handymanArrival: notifications.handymanArrival !== undefined ? notifications.handymanArrival : true,
        promotions: notifications.promotions !== undefined ? notifications.promotions : false
      };
    }

    if (user.save) {
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, {
        name: user.name,
        phone: user.phone,
        address: user.address,
        notifications: user.notifications
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      notifications: user.notifications,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Change password with current password
// @route   PUT /api/auth/user/change-password
// @access  Private (User)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    if (user.save) {
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// @desc    Request forgot password verification code to email
// @route   POST /api/auth/user/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your registered email' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = {
      code: otpCode,
      expiresAt
    };

    if (user.save) {
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, { resetPasswordOtp: user.resetPasswordOtp });
    }

    const emailResult = await sendResetCodeEmail(user.email, otpCode, user.name);

    res.json({
      message: `A 6-digit verification code has been sent to ${user.email}.`,
      email: user.email,
      devCode: emailResult.code
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error generating reset code' });
  }
};

// @desc    Verify code and set new password
// @route   POST /api/auth/user/reset-password
// @access  Public
const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, 6-digit code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtp.code) {
      return res.status(400).json({ message: 'No password reset requested or code expired. Please request a new code.' });
    }

    if (new Date(user.resetPasswordOtp.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.resetPasswordOtp.code.trim() !== code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.resetPasswordOtp = null;

    if (user.save) {
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetPasswordOtp: null });
    }

    res.json({ message: 'Password has been reset successfully! You can now sign in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    res.json({
      _id: admin._id,
      username: admin.username,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error('Login admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin profile
// @route   GET /api/auth/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (admin) {
      res.json({
        _id: admin._id,
        username: admin.username,
      });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPasswordWithCode,
  loginAdmin,
  getAdminProfile,
};
