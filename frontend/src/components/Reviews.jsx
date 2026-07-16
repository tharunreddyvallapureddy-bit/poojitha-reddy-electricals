import React, { useState, useEffect } from 'react';
import { StarIcon } from './Icons';

const Reviews = ({ API_URL }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: '',
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (ratingVal) => {
    setFormData((prev) => ({ ...prev, rating: ratingVal }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setSubmitLoading(true);

    if (!formData.customerName || !formData.comment) {
      setMessage({ text: 'Please fill in all fields.', type: 'danger' });
      setSubmitLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error submitting review.');
      }

      setMessage({
        text: 'Thank you! Your review has been submitted and is pending admin moderation.',
        type: 'success',
      });

      setFormData({
        customerName: '',
        rating: 5,
        comment: '',
      });
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section id="reviews" className="section container">
      <h2 className="section-title">Customer Feedback</h2>
      <p className="section-subtitle">
        We take pride in our service quality. See what our valued customers have to say, or submit your own feedback!
      </p>

      <div className="grid-2">
        {/* Reviews List Column */}
        <div className="reviews-list-container">
          <h3 className="sub-title" style={{ marginBottom: '24px' }}>Approved Reviews</h3>
          
          {loading ? (
            <div className="text-center text-secondary">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted">No reviews approved yet. Be the first to submit!</div>
          ) : (
            <div className="reviews-scroller">
              {reviews.map((review) => (
                <div key={review._id} className="review-card glass-card">
                  <div className="review-meta">
                    <span className="reviewer-name">{review.customerName}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        size={16}
                        fill={star <= review.rating ? 'currentColor' : 'none'}
                        className={star <= review.rating ? 'text-warning fill-warning' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Column */}
        <div className="submit-review-container">
          <div className="glass-card submit-review-card">
            <h3 className="sub-title" style={{ marginBottom: '16px' }}>Leave a Review</h3>
            
            {message.text && (
              <div className={`alert-box alert-${message.type}`} style={{ marginBottom: '20px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleTextChange}
                  className="form-input"
                  placeholder="e.g. S. Srinivas Rao"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="star-btn"
                    >
                      <StarIcon
                        size={28}
                        fill={star <= (hoverRating || formData.rating) ? 'currentColor' : 'none'}
                        className={
                          star <= (hoverRating || formData.rating)
                            ? 'text-warning fill-warning'
                            : 'text-muted'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleTextChange}
                  className="form-textarea"
                  placeholder="Tell us about your experience..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
