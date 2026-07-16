const Review = require('../models/Review');

// @desc    Submit a new review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({
      customerName,
      rating: Number(rating),
      comment,
      isApproved: false, // Moderated by default
    });

    res.status(201).json({
      message: 'Review submitted successfully. It will appear on the site once approved by the admin.',
      review,
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true });
    res.json(reviews);
  } catch (error) {
    console.error('Get approved reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all pending reviews (Admin only)
// @route   GET /api/reviews/pending
// @access  Private (Admin)
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false });
    res.json(reviews);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve a review
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin)
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await Review.findByIdAndUpdate(id, { isApproved: true });
    res.json({ message: 'Review approved successfully', review: updatedReview });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete/Reject a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.deleteOne({ _id: id });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getApprovedReviews,
  getPendingReviews,
  approveReview,
  deleteReview,
};
