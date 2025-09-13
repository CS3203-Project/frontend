import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RateCustomerPage: React.FC = () => {
  const location = useLocation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get customerId from location.state (passed from messaging page)
  const customerId = location.state?.customerId;
  console.log('Submitting review for customerId:', customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customerId) return;
    const token = localStorage.getItem('token');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reviewerId: user.id, revieweeId: customerId, rating, comment })
    });
    if (res.ok) {
      alert('Review submitted!');
      navigate('/messaging');
    } else {
      setError('Failed to submit review');
    }
  };

  if (!customerId) return <div className="p-8 text-center text-red-500">Customer info not found.</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rate and Review Customer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Rating (1-5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Comment:</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default RateCustomerPage;
