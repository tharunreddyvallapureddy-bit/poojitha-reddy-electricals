const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  loginAdmin,
  getAdminProfile,
} = require('../controllers/authController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

// Customer Auth Routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/profile', protectUser, getUserProfile);

// Admin Auth Routes
router.post('/admin/login', loginAdmin);
router.get('/admin/profile', protectAdmin, getAdminProfile);

module.exports = router;
