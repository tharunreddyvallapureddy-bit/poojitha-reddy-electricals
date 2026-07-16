const express = require('express');
const router = express.Router();
const {
  createReview,
  getApprovedReviews,
  getPendingReviews,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public reviews routes
router.post('/', createReview);
router.get('/', getApprovedReviews);

// Admin moderation reviews routes
router.get('/pending', protectAdmin, getPendingReviews);
router.put('/:id/approve', protectAdmin, approveReview);
router.delete('/:id', protectAdmin, deleteReview);

module.exports = router;
