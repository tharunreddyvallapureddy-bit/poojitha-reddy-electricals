const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPasswordWithCode,
  loginAdmin,
  getAdminProfile,
} = require('../controllers/authController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

// Customer Auth Routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/profile', protectUser, getUserProfile);
router.put('/user/profile', protectUser, updateUserProfile);
router.put('/user/change-password', protectUser, changePassword);
router.post('/user/forgot-password', forgotPassword);
router.post('/user/reset-password', resetPasswordWithCode);

// Admin Auth Routes
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', protectAdmin, getAdminProfile);

module.exports = router;
