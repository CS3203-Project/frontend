import { FiX, FiMessageCircle, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import type { ServiceProviderProfile } from './types';


interface ContactModalProps {
  showContactModal: boolean;
  setShowContactModal: (value: boolean) => void;
  provider: ServiceProviderProfile;
}

export function ContactModal({ showContactModal, setShowContactModal, provider }: ContactModalProps) {
  return (
    <>
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Contact {provider.name}</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FiPhone className="w-4 h-4 mr-2" />
                  Schedule Call
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiMail className="w-4 h-4 mr-2" />
                  Email
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Response time is typically {provider.responseTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface LocationModalProps {
  showLocationModal: boolean;
  setShowLocationModal: (value: boolean) => void;
  provider: ServiceProviderProfile;
}

export function LocationModal({ showLocationModal, setShowLocationModal, provider }: LocationModalProps) {
  return (
    <>
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Location & Service Areas</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map would be displayed here</p>
                    <p className="text-sm text-gray-400">
                      Coordinates: {provider.location.coordinates.lat}, {provider.location.coordinates.lng}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Primary Location</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{provider.location.city}, {provider.location.state}</p>
                      <p>{provider.location.country}</p>
                      <p>Timezone: {provider.location.timezone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Areas</h4>
                    <div className="space-y-1">
                      {provider.location.servicesArea.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FiMapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}