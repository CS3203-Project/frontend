import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServiceRequestAPI, { ServiceRequest } from '../api/serviceRequestApi';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  providerId: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  similarity?: number;
}

interface MatchingResult {
  matchingServices: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const ServiceRequestMatchesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    
    if (id) {
      fetchServiceRequest();
      fetchMatchingServices(1);
    }
  }, [id, isLoggedIn]);

  const fetchServiceRequest = async () => {
    try {
      if (!id) return;
      
      const response = await ServiceRequestAPI.getServiceRequestById(id);
      setServiceRequest(response.data.data);
    } catch (err) {
      setError('Failed to fetch service request details');
      console.error('Error fetching service request:', err);
    }
  };

  const fetchMatchingServices = async (page: number) => {
    try {
      if (!id) return;
      
      setLoading(true);
      const response = await ServiceRequestAPI.findMatchingServices(id, page, 10);
      setMatchingResult(response.data.data);
      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch matching services');
      setLoading(false);
      console.error('Error fetching matching services:', err);
    }
  };

  const handlePageChange = (page: number) => {
    fetchMatchingServices(page);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex mb-4">
          <Link
            to="/service-request"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
          >
            ← Back to Service Requests
          </Link>
        </div>

        <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/10">
          {/* Service Request Details */}
          {serviceRequest && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                {serviceRequest.title || 'Untitled Request'}
              </h1>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300 mb-4">{serviceRequest.description}</p>
                {serviceRequest.address && (
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">Location:</span> {serviceRequest.address}
                    {serviceRequest.city && `, ${serviceRequest.city}`}
                    {serviceRequest.state && `, ${serviceRequest.state}`}
                    {serviceRequest.country && `, ${serviceRequest.country}`}
                  </p>
                )}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    serviceRequest.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                    serviceRequest.status === 'MATCHED' ? 'bg-green-500/20 text-green-400' :
                    serviceRequest.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {serviceRequest.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Matching Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Matching Services</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-400">Finding matching services...</p>
              </div>
            ) : matchingResult?.matchingServices.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400">No matching services found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchingResult?.matchingServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white/5 rounded-lg p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {service.title || 'Untitled Service'}
                        </h3>
                        {service.similarity !== undefined && (
                          <p className="text-sm text-gray-400 mt-1">
                            Match Score: <span className="font-medium text-green-400">{Math.round(service.similarity * 100)}%</span>
                          </p>
                        )}
                        <p className="text-gray-300 mt-3">{service.description}</p>
                        
                        {/* Location information - more prominently displayed */}
                        {(service.address || service.city || service.state || service.country) && (
                          <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/10">
                            <p className="flex items-center text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">Location:</span>
                              <span className="ml-1">
                                {service.address && `${service.address}`}
                                {service.city && `${service.address ? ', ' : ''}${service.city}`}
                                {service.state && `${(service.address || service.city) ? ', ' : ''}${service.state}`}
                                {service.country && `${(service.address || service.city || service.state) ? ', ' : ''}${service.country}`}
                              </span>
                            </p>
                          </div>
                        )}
                        
                        <p className="mt-4 text-white font-medium">
                          Price: <span className="text-green-400">{service.price} {service.currency}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Link
                        to={`/service/${service.id}`}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-blue-800/30 hover:from-blue-500/40 hover:to-blue-700/40 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium border border-blue-800/50 hover:border-blue-700/60 transition-all duration-300"
                      >
                        View Service
                      </Link>
                      <Link
                        to={`/provider/${service.providerId}`}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-purple-800/30 hover:from-purple-500/40 hover:to-purple-700/40 text-purple-400 hover:text-purple-300 rounded-lg text-sm font-medium border border-purple-800/50 hover:border-purple-700/60 transition-all duration-300"
                      >
                        View Provider
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {matchingResult && matchingResult.pagination.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white/90 transition-all duration-300"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: matchingResult.pagination.pages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            currentPage === i + 1
                              ? 'bg-white/20 border border-white/40 text-white'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 hover:text-white'
                          } transition-all duration-300`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(matchingResult.pagination.pages, currentPage + 1))}
                        disabled={currentPage === matchingResult.pagination.pages}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/90 hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white/90 transition-all duration-300"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestMatchesPage;