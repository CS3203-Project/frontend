import { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Globe } from 'lucide-react';
import Button from '../Button';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import type { UpdateProfileData, UserProfile } from '../../api/userApi';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: Partial<UserProfile>) => void;
  user: UserProfile;
}

export default function EditProfileModal({ isOpen, onClose, onSuccess, user }: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Initialize social media array with 5 slots (Twitter, LinkedIn, Instagram, GitHub, Website)
      const socialMediaArray = new Array(5).fill('');
      if (user.socialmedia && user.socialmedia.length > 0) {
        user.socialmedia.forEach((link, index) => {
          if (index < 5) {
            socialMediaArray[index] = link;
          }
        });
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        imageUrl: user.imageUrl || '',
        location: user.location || '',
        phone: user.phone || '',
        address: user.address || '',
        socialmedia: socialMediaArray
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Clean up the form data before submitting
      const cleanedData = {
        ...formData,
        // Remove empty image URL
        imageUrl: formData.imageUrl?.trim() || undefined,
        // Filter out empty social media links but maintain order
        socialmedia: formData.socialmedia?.filter(link => link && link.trim()) || []
      };
      
      const updatedUser = await userApi.updateProfile(cleanedData);
      toast.success('Profile updated successfully!');
      onSuccess(updatedUser);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/City
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city or location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Image
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value.trim() || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/your-image.jpg (leave empty for default avatar)"
                />
                {formData.imageUrl && formData.imageUrl.trim() && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Social Media
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    value={formData.socialmedia?.[0] || ''}
                    onChange={(e) => {
                      const newSocial = [...(formData.socialmedia || new Array(5).fill(''))];
                      newSocial[0] = e.target.value.trim();
                      setFormData(prev => ({ ...prev, socialmedia: newSocial }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="twitter.com/username or x.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.socialmedia?.[1] || ''}
                    onChange={(e) => {
                      const newSocial = [...(formData.socialmedia || new Array(5).fill(''))];
                      newSocial[1] = e.target.value.trim();
                      setFormData(prev => ({ ...prev, socialmedia: newSocial }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.socialmedia?.[2] || ''}
                    onChange={(e) => {
                      const newSocial = [...(formData.socialmedia || new Array(5).fill(''))];
                      newSocial[2] = e.target.value.trim();
                      setFormData(prev => ({ ...prev, socialmedia: newSocial }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="instagram.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={formData.socialmedia?.[3] || ''}
                    onChange={(e) => {
                      const newSocial = [...(formData.socialmedia || new Array(5).fill(''))];
                      newSocial[3] = e.target.value.trim();
                      setFormData(prev => ({ ...prev, socialmedia: newSocial }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="github.com/username"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website/Portfolio
                  </label>
                  <input
                    type="url"
                    value={formData.socialmedia?.[4] || ''}
                    onChange={(e) => {
                      const newSocial = [...(formData.socialmedia || new Array(5).fill(''))];
                      newSocial[4] = e.target.value.trim();
                      setFormData(prev => ({ ...prev, socialmedia: newSocial }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <p className="text-xs text-gray-500 sm:col-span-2">
                  Leave fields empty if you don't have accounts on these platforms.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Always visible */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
