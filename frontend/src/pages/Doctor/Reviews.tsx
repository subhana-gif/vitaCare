import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface Review {
  userId: any;
  userName: any;
  _id: string;
  rating: number;
  comment: string;
  patientName: string;
  createdAt: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={`text-xl mr-0.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [averageRating, setAverageRating] = useState(0);

  const doctorToken = useSelector((state: any) => state.doctors.token);
  const doctorId = useSelector((state: any) => state.doctors.doctorId);


  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/reviews/${doctorId}`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
  
      console.log("API Response:", response.data); // Log response to check its structure
  
      if (Array.isArray(response.data)) {
        setReviews(response.data);
        calculateAverageRating(response.data);
      } else if (response.data && Array.isArray(response.data.reviews)) {
        // If reviews are nested inside an object
        setReviews(response.data.reviews);
        calculateAverageRating(response.data.reviews);
      } else {
        console.error("Unexpected API response:", response.data);
        setReviews([]);
        calculateAverageRating([]);
      }
  
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      calculateAverageRating([]);
      setLoading(false);
    }
  };
    
  const calculateAverageRating = (reviewData: Review[]) => {
    if (!Array.isArray(reviewData) || reviewData.length === 0) {
      setAverageRating(0);
      return;
    }
  
    const total = reviewData.reduce((sum, review) => sum + (review.rating || 0), 0);
    setAverageRating(total / reviewData.length);
  };
  
  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSortBy(value);
    const sortedReviews = [...reviews];
    if (value === 'highest') {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    } else if (value === 'lowest') {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    } else if (value === 'newest') {
      sortedReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    setReviews(sortedReviews);
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-6">My Reviews</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl font-bold">{averageRating.toFixed(1)}</h1>
            <StarRating rating={averageRating} />
            <p className="text-gray-500">
              Based on {reviews.length} reviews
            </p>
          </div>
        </div>

        {/* Reviews List Card */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex justify-end mb-4">
            <select
              value={sortBy}
              onChange={handleSort}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {loading ? (
  <div className="text-center py-8 text-gray-500">Loading reviews...</div>
) : Array.isArray(reviews) && reviews.length > 0 ? (
  <ul className="divide-y divide-gray-200">
    {reviews.map((review) => (
      <li key={review._id} className="py-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{review.patientName}</p>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-500 text-sm">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p className="font-semibold">{review.userName || review.userId?.name || "Anonymous"}</p>
        <p className="mt-2 text-gray-700">{review.comment}</p>
      </li>
    ))}
  </ul>
) : (
  <div className="text-center py-8 text-gray-500">No reviews available</div>
)}
        </div>
      </div>
    </div>
  );
};

export default Reviews;