import React, { useState, useEffect } from 'react';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://vitacare.life/api/reviews/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setReviews(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(
        `https://vitacare.life/api/reviews/${doctorId}/rating`,
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
    fetchReviews();
    fetchAverageRating();
  }, [doctorId]);

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === reviews.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => 
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

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
      const response = await fetch('https://vitacare.life/api/reviews', {
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
      fetchReviews();
      fetchAverageRating();
      setCurrentReviewIndex(0);
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
    <div className="bg-white rounded-xl shadow-xl p-8 mb-10 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Patient Reviews</h3>
        {reviews.length > 0 && (
          <div className="text-gray-600">
            Average Rating: {averageRating.toFixed(1)} ({totalReviews} reviews)
          </div>
        )}
      </div>

      {/* Review Submission Form */}
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

      {/* Reviews Carousel */}
      {reviews.length > 0 ? (
        <div className="relative">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrevReview} 
              className="text-gray-600 hover:text-gray-900"
            >
              <FaChevronLeft size={24} />
            </button>
            
            <div className="w-full max-w-xl mx-4">
              <div className="text-center">
                <h5 className="font-semibold text-lg">{reviews[currentReviewIndex].userName}</h5>
                <div className="flex justify-center my-2">
                  <StarRating rating={reviews[currentReviewIndex].rating} />
                </div>
                <p className="text-gray-700 mt-2 mb-2">{reviews[currentReviewIndex].comment}</p>
                <span className="text-gray-500 text-sm">
                  {new Date(reviews[currentReviewIndex].createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleNextReview} 
              className="text-gray-600 hover:text-gray-900"
            >
              <FaChevronRight size={24} />
            </button>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center mt-4">
            {reviews.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  index === currentReviewIndex 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No reviews yet. Be the first to review!</div>
      )}
    </div>
  );
};

export default DoctorReviews;