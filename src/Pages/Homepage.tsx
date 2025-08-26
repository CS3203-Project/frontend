import HeroSection from '../components/HeroSection';
import ServicesGrid from '../components/ServicesGrid';
import useServices from '../hooks/useServices';

export default function Homepage() {
  const { services, loading, error, refetch } = useServices({
    isActive: true, // Only show active services
    take: 20 // Limit to 20 services for better performance
  });

  return (
    <div>
      <HeroSection />
      
      {/* Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover professional services from our verified providers
            </p>
          </div>
          
          <ServicesGrid 
            services={services} 
            loading={loading} 
            error={error} 
          />
          
          {/* Refresh Button */}
          {error && (
            <div className="text-center mt-6">
              <button
                onClick={refetch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

