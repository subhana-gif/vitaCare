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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

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
  
      let fetchedReviews: Review[] = [];
      if (Array.isArray(response.data)) {
        fetchedReviews = response.data;
      } else if (response.data && Array.isArray(response.data.reviews)) {
        // If reviews are nested inside an object
        fetchedReviews = response.data.reviews;
      } else {
        console.error("Unexpected API response:", response.data);
      }
  
      // Sort reviews initially by newest
      const sortedReviews = fetchedReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      setReviews(sortedReviews);
      calculateAverageRating(sortedReviews);
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
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

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
            <>
              <ul className="divide-y divide-gray-200">
                {currentReviews.map((review) => (
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

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === index + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No reviews available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;