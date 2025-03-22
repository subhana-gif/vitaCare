import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface DoctorReviewsProps {
  doctorId: string;
  token: string;
}

const DoctorReviews: React.FC<DoctorReviewsProps> = ({ doctorId, token }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async (page: number) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/reviews/${doctorId}?page=${page}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/reviews/${doctorId}/rating`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
    fetchAverageRating();
  }, [currentPage, doctorId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      toast.warn('Please select a rating');
      return;
    }
    if (!newReview.comment.trim()) {
      toast.warn('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId,
          ...newReview
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Review submitted successfully');
      setNewReview({ rating: 0, comment: '' });
      fetchReviews(1);
      fetchAverageRating();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange?: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${onRatingChange ? 'cursor-pointer' : ''} text-xl`}
          onClick={() => onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Patient Reviews</h3>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h4 className="text-xl font-semibold mb-4">Write a Review</h4>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <StarRating
            rating={newReview.rating}
            onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Review</label>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Share your experience with this doctor..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-semibold text-lg">{review.userName}</h5>
                <StarRating rating={review.rating} />
              </div>
              <span className="text-gray-500 text-sm">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 mt-2">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorReviews;