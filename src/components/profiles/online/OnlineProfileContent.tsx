import { FiStar, FiClock, FiMapPin, FiGlobe, FiCalendar, FiExternalLink, FiChevronRight } from 'react-icons/fi';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { cn } from '../../../utils/utils';
import type { ServiceProviderProfile } from '../shared/types';

interface ProfileContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  provider: ServiceProviderProfile;
  reviewFilter: string;
  setReviewFilter: (value: string) => void;
}

export default function ProfileContent({
  activeTab,
  setActiveTab,
  provider,
  reviewFilter,
  setReviewFilter
}: ProfileContentProps) {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-emerald-500';
      case 'intermediate': return 'bg-amber-500';
      case 'beginner': return 'bg-sky-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed text-base">{provider.about}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-base">{skill.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium text-white capitalize",
                          getSkillLevelColor(skill.level)
                        )}>
                          {skill.level}
                        </span>
                        <span className="text-sm text-gray-500">{skill.endorsed} endorsements</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Reviews</h3>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors"
                >
                  View All
                  <FiChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-6">
                {provider.reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={review.clientAvatar} 
                        alt={review.clientName}
                        className="w-12 h-12 rounded-full border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-gray-900 text-base">{review.clientName}</span>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <FiStar key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                        <div className="text-xs text-gray-400">
                          {review.projectTitle} • {review.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Availability</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      provider.availability.status === 'available' ? 'bg-emerald-500' : 
                      provider.availability.status === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                    )}></div>
                    <span className="text-sm font-semibold capitalize text-gray-900">{provider.availability.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Next Available</span>
                  <span className="text-sm font-semibold text-gray-900">{provider.availability.nextAvailable}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Response Time</span>
                  <span className="text-sm font-semibold text-gray-900">{provider.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location & Service Areas</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 text-sm">
                    {provider.location.city}, {provider.location.state}, {provider.location.country}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiClock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 text-sm">{provider.location.timezone}</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Service Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.location.servicesArea.map((area, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {provider.languages.map((language, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full hover:bg-indigo-200 transition-colors"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Connect</h3>
              <div className="grid grid-cols-3 gap-3">
                {provider.socialMedia.website && (
                  <a 
                    href={provider.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiGlobe className="w-6 h-6 text-gray-600" />
                  </a>
                )}
                {provider.socialMedia.linkedin && (
                  <a 
                    href={provider.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    <FaLinkedin className="w-6 h-6 text-blue-600" />
                  </a>
                )}
                {provider.socialMedia.instagram && (
                  <a 
                    href={provider.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors"
                  >
                    <FaInstagram className="w-6 h-6 text-pink-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provider.services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
              onClick={() => console.log('Service clicked:', service)}
            >
              <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src={service.images[0]} 
                  alt={service.title}
                  className="w-full h-56 object-cover transition-transform hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                  {typeof service.category === 'object' && service.category && 'name' in service.category 
                    ? (service.category as { name: string }).name 
                    : service.category || 'Category'}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{service.title}</h3>
                  <span className="text-xl font-bold text-gray-900">${service.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-1" />
                    {service.duration}
                  </div>
                  <button className="flex items-center text-indigo-600 hover:text-indigo-700 font-semibold">
                    View Details
                    <FiChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provider.portfolio.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
              onClick={() => console.log('Portfolio clicked:', item)}
            >
              <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-56 object-cover transition-transform hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  {typeof item.category === 'object' && item.category && 'name' in item.category 
                    ? (item.category as { name: string }).name 
                    : item.category || 'Category'}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                  <div className="flex items-center">
                    {[...Array(item.clientRating)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                {item.technologies && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.technologies.slice(0, 3).map((tech, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.technologies.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                        +{item.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Completed: {item.completedDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reviews ({provider.totalReviews})
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={cn(
                          "w-5 h-5",
                          i < Math.floor(provider.rating) 
                            ? "text-amber-400 fill-current" 
                            : "text-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{provider.rating} out of 5</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <select 
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Reviews</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {provider.reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <img 
                    src={review.clientAvatar} 
                    alt={review.clientName}
                    className="w-12 h-12 rounded-full border border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">{review.clientName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <FiStar key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Project: {review.projectTitle}</span>
                      <button className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
              <p className="text-gray-600 leading-relaxed text-base">{provider.about}</p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Experience</h3>
              <div className="space-y-6">
                {provider.experience.map((exp, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-indigo-500"></div>
                    <h4 className="font-semibold text-gray-900 text-base">{exp.title}</h4>
                    <p className="text-indigo-600 font-medium text-sm">{exp.company}</p>
                    <p className="text-sm text-gray-400 mb-2">{exp.duration}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Education</h3>
              <div className="space-y-4">
                {provider.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-gray-900 text-base">{edu.degree}</h4>
                    <p className="text-gray-600 text-sm">{edu.institution}</p>
                    <p className="text-sm text-gray-400">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Certifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certifications</h3>
              <div className="space-y-4">
                {provider.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h4 className="font-semibold text-gray-900 text-base">{cert.name}</h4>
                    <p className="text-gray-600 text-sm">{cert.issuer}</p>
                    <p className="text-gray-400 text-sm">{cert.date}</p>
                    {cert.url && (
                      <a 
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm mt-2 font-medium"
                      >
                        <FiExternalLink className="w-4 h-4 mr-1" />
                        Verify
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Member Since</h3>
              <div className="flex items-center space-x-3 mb-3">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 text-sm">{provider.joinedDate}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiClock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 text-sm">Last active: {provider.lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}