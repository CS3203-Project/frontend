import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ServiceRequestAPI, { ServiceRequest, CreateServiceRequestData } from '../api/serviceRequestApi';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';

const ServiceRequestPage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateServiceRequestData>({
    title: '',
    description: '',
    address: ''
  });
  const [formVisible, setFormVisible] = useState(false);

  // Fetch service requests on component mount
  useEffect(() => {
    fetchServiceRequests();
  }, [isLoggedIn, navigate]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await ServiceRequestAPI.getServiceRequests();
      setServiceRequests(response.data.data.serviceRequests);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch service requests');
      setLoading(false);
      console.error('Error fetching service requests:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await ServiceRequestAPI.createServiceRequest(formData);
      setFormData({
        title: '',
        description: '',
        address: ''
      });
      setFormVisible(false);
      await fetchServiceRequests();
      setLoading(false);
    } catch (err) {
      setError('Failed to create service request');
      setLoading(false);
      console.error('Error creating service request:', err);
    }
  };

  const handleFindMatching = async (id: string) => {
    try {
      navigate(`/service-request/${id}/matches`);
    } catch (err) {
      setError('Failed to find matching services');
      console.error('Error finding matching services:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) {
      return;
    }
    
    try {
      setLoading(true);
      await ServiceRequestAPI.deleteServiceRequest(id);
      await fetchServiceRequests();
      setLoading(false);
    } catch (err) {
      setError('Failed to delete service request');
      setLoading(false);
      console.error('Error deleting service request:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black to-purple-50 dark:bg-black  flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
        <p className="text-black dark:text-white mb-4">Please log in to access your profile.</p>
        <Button
          onClick={() => {
        localStorage.setItem('RedirectAfterLogin', window.location.pathname);
        navigate('/signin');
          }}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
        >
          Log In
        </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Service Requests
            </h1>
            <button
              onClick={() => setFormVisible(!formVisible)}
              className="px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white rounded-lg font-medium border border-white/20 hover:border-white/30 shadow-lg transition-all duration-300"
            >
              {formVisible ? 'Cancel' : '+ New Service Request'}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Form for creating new service request */}
          {formVisible && (
            <div className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-4 text-white">Create New Service Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title for your service request"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe what service you need..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                {/* Category field removed as requested */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your address for local services"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg font-medium border border-blue-700 hover:border-blue-600 shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of service requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Your Requests</h2>
            {loading && !formVisible ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-400">Loading your requests...</p>
              </div>
            ) : serviceRequests.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400">You haven't created any service requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/5 rounded-lg p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {request.title || 'Untitled Request'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            request.status === 'MATCHED' ? 'bg-green-500/20 text-green-400' :
                            request.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="mt-4 text-gray-300">{request.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleFindMatching(request.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-500/40 hover:to-blue-700/40 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium border border-blue-800/50 hover:border-blue-700/60 transition-all duration-300"
                      >
                        Find Matching Services
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600/20 to-red-800/20 hover:from-red-500/30 hover:to-red-700/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium border border-red-800/40 hover:border-red-700/50 transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestPage;