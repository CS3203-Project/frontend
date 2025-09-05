import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { serviceApi } from '../api/serviceApi';

const RateServicePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    
    // Try to fetch service directly first
    const fetchServiceData = async () => {
      try {
        // First, try to get service by ID directly
        const response = await serviceApi.getServiceById(serviceId);
        if (response.success) {
          setService(response.data);
          return response.data;
        }
      } catch (error) {
        console.log('Failed to get service by ID, trying conversation ID:', error);
        
        // If direct service fetch fails, try getting service by conversation ID
        try {
          const conversationResponse = await serviceApi.getServiceByConversationId(serviceId);
          if (conversationResponse.success) {
            setService(conversationResponse.data);
            return conversationResponse.data;
          }
        } catch (conversationError) {
          console.error('Failed to get service by conversation ID:', conversationError);
          setError('Failed to load service');
          return null;
        }
      }
      return null;
    };

    // Fetch service and then reviews
    fetchServiceData().then((serviceData) => {
      if (serviceData) {
        // Fetch existing review by this user (if any)
        apiClient.get(`/service-reviews/service/${serviceData.id}`)
          .then(res => {
            // Assume backend returns reviews with reviewerId, get the one for this user
            const userId = localStorage.getItem('userId');
            const review = res.data.reviews.find((r: any) => r.reviewer?.id === userId);
            if (review) {
              setExistingReview(review);
              setRating(review.rating);
              setComment(review.comment || '');
            }
          })
          .catch(() => {/* ignore */});
      }
      setLoading(false);
    });
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!service) {
      setError('Service information not available');
      return;
    }
    
    try {
      if (existingReview) {
        await apiClient.patch(`/service-reviews/${existingReview.id}`, { rating, comment });
        setSuccess('Review updated!');
      } else {
        await apiClient.post('/service-reviews', { serviceId: service.id, rating, comment });
        setSuccess('Review submitted!');
      }
      setTimeout(() => navigate(-1), 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!service) return <div>Service not found.</div>;

  return (
    <div className="rate-service-page" style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2>Rate Service</h2>
      <h3 style={{ marginBottom: 8 }}>{service.title || 'Service'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '1rem 0' }}>
          <label>Rating:</label>
          <div style={{ fontSize: 28 }}>
            {[1,2,3,4,5].map(star => (
              <span key={star} style={{ cursor: 'pointer', color: star <= rating ? '#f5b301' : '#ccc' }} onClick={() => setRating(star)}>&#9733;</span>
            ))}
          </div>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>Comment:</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ width: '100%' }} placeholder="Share your experience..." />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
        <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default RateServicePage;
