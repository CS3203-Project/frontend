import { FiCamera, FiShare2, FiFlag, FiMapPin, FiStar, FiClock, FiCheck, FiAward, FiMessageCircle, FiHeart, FiUser } from 'react-icons/fi';
import Button from '../../Button.tsx';
import { cn } from '../../../utils/utils.ts';
import type { ServiceProviderProfile } from './types.ts';
import { showSuccessToast } from '../../../utils/toastUtils.ts';

interface ProfileHeaderProps {
  provider: ServiceProviderProfile;
  setShowContactModal: (value: boolean) => void;
  setShowLocationModal: (value: boolean) => void;
  isFollowing: boolean;
  setIsFollowing: (value: boolean) => void;
  setShowBannerUpload: (value: boolean) => void;
}

export default function ProfileHeader({
  provider,
  setShowContactModal,
  setShowLocationModal,
  isFollowing,
  setIsFollowing,
  setShowBannerUpload
}: ProfileHeaderProps) {
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    showSuccessToast(isFollowing ? 'Unfollowed provider' : 'Following provider');
  };

  const handleBannerUpload = () => {
    setShowBannerUpload(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccessToast('Profile link copied to clipboard!');
  };

  return (
    <>
      {/* Service Banner */}
      <div className="relative h-64 md:h-80 bg-gray-200 overflow-hidden group animate-fade-in rounded-3xl md:rounded-[2.5rem] shadow-xl">
        {/* Glassmorphism overlay for the whole banner */}
        <div className="absolute inset-0 z-0 bg-white/10 dark:bg-black/20 backdrop-blur-[6px] rounded-3xl md:rounded-[2.5rem] pointer-events-none" />
        {provider.coverImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 rounded-3xl md:rounded-[2.5rem] overflow-hidden"
            style={{ backgroundImage: `url(${provider.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black/20 rounded-3xl md:rounded-[2.5rem]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center rounded-3xl md:rounded-[2.5rem]">
            <div className="text-center text-white">
              <FiCamera className="w-16 h-16 mx-auto mb-4 opacity-60 animate-bounce" />
              <h3 className="text-xl font-semibold mb-2">Showcase Your Services</h3>
              <p className="text-white/80 mb-4">Upload a banner to highlight your expertise</p>
              <button
                onClick={handleBannerUpload}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors shadow-lg"
                aria-label="Upload Banner"
              >
                Upload Banner
              </button>
            </div>
          </div>
        )}

        {/* Banner Overlay - Shows on hover when banner exists */}
        {provider.coverImage && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl md:rounded-[2.5rem]">
            <button
              onClick={handleBannerUpload}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center space-x-2 shadow-lg"
              aria-label="Change Banner"
            >
              <FiCamera className="w-5 h-5" />
              <span>Change Banner</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            aria-label="Share Profile"
            title="Copy profile link"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors" aria-label="Report Profile" title="Report profile">
            <FiFlag className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Info Overlay */}
      </div>

      {/* Profile Header */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-[30px] shadow-lg p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                {provider.avatar ? (
                  <img 
                    src={provider.avatar} 
                    alt={provider.name || 'Provider Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-20 h-20 text-gray-400" />
                )}
              </div>
              <div className={cn(
                "absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                getAvailabilityColor(provider.availability?.status)
              )}>
                <span className="sr-only">{provider.availability?.status || 'Unknown'}</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {provider.name || <span className="italic text-gray-400">No Name</span>}
                    </h1>
                    {provider.verified && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium animate-fade-in">
                        <FiCheck className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                    {provider.premiumProvider && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium animate-fade-in">
                        <FiAward className="w-3 h-3 mr-1" />
                        Premium
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-3">
                    {provider.title || <span className="italic text-gray-400">No Title</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <button 
                        onClick={() => setShowLocationModal(true)}
                        className="hover:text-blue-600 transition-colors"
                        aria-label="Show Location"
                      >
                        {provider.location?.city && provider.location?.country
                          ? `${provider.location.city}, ${provider.location.country}`
                          : <span className="italic text-gray-400">No Location</span>}
                      </button>
                    </div>
                    <div className="flex items-center" title="Rating">
                      <FiStar className="w-4 h-4 mr-1 text-yellow-400" />
                      {typeof provider.rating === 'number' ? provider.rating : '--'}
                      <span className="ml-1">({provider.totalReviews ?? 0} reviews)</span>
                    </div>
                    <div className="flex items-center" title="Response Time">
                      <FiClock className="w-4 h-4 mr-1" />
                      {provider.responseTime || <span className="italic text-gray-400">N/A</span>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 md:mt-0">
                  <Button
                    onClick={handleContact}
                    className="px-6 shadow-md bg-blue-600 text-white border border-transparent hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 transition-colors"
                    aria-label="Contact Provider"
                  >
                    <FiMessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleFollow}
                    className={cn(
                      "px-6 shadow-md border border-gray-300 text-black bg-white hover:bg-gray-100 dark:bg-black dark:text-white dark:border-gray-600 dark:hover:bg-gray-900 transition-colors",
                      isFollowing && "!bg-red-50 !text-red-600 !border-red-200 dark:!bg-red-900 dark:!text-red-200 dark:!border-red-700"
                    )}
                    aria-label={isFollowing ? 'Unfollow' : 'Follow'}
                  >
                    <FiHeart className={cn("w-4 h-4 mr-2 transition-all duration-200", isFollowing && "fill-current text-red-500 scale-110 animate-pulse")}/>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.completedProjects ?? <span className="italic text-gray-400">--</span>}
              </div>
              <div className="text-sm text-gray-500">Projects Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.stats?.onTimeDelivery != null ? `${provider.stats.onTimeDelivery}%` : <span className="italic text-gray-400">--</span>}
              </div>
              <div className="text-sm text-gray-500">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.stats?.repeatClients != null ? `${provider.stats.repeatClients}%` : <span className="italic text-gray-400">--</span>}
              </div>
              <div className="text-sm text-gray-500">Repeat Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.hourlyRate?.min != null && provider.hourlyRate?.max != null
                  ? `$${provider.hourlyRate.min}-${provider.hourlyRate.max}`
                  : <span className="italic text-gray-400">--</span>}
              </div>
              <div className="text-sm text-gray-500">Hourly Rate</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// Use the real toast utility
