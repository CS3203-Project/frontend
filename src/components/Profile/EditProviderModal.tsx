import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import Button from '../Button';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import type { UpdateProviderData, ProviderProfile } from '../../api/userApi';

interface EditProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProvider: ProviderProfile) => void;
  provider: ProviderProfile;
}

export default function EditProviderModal({ isOpen, onClose, onSuccess, provider }: EditProviderModalProps) {
  const [formData, setFormData] = useState<UpdateProviderData>({});
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newQualification, setNewQualification] = useState('');

  useEffect(() => {
    if (isOpen && provider) {
      setFormData({
        bio: provider.bio || '',
        skills: [...(provider.skills || [])],
        qualifications: [...(provider.qualifications || [])],
        logoUrl: provider.logoUrl || '',
        IDCardUrl: provider.IDCardUrl || ''
      });
    }
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const updatedProvider = await userApi.updateProvider(formData);
      toast.success('Provider profile updated successfully!');
      onSuccess(updatedProvider);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update provider profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications?.includes(newQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (qualificationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter(qual => qual !== qualificationToRemove) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Provider Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio?.length || 0}/1000 characters
              </p>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo/Profile Image URL
              </label>
              <input
                type="url"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/your-logo.jpg"
              />
            </div>

            {/* ID Card URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Card/Document Image (Optional)
              </label>
              <input
                type="text"
                value={formData.IDCardUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, IDCardUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URL or text identifier for your ID document"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Image URL or text identifier of your ID card or professional license
              </p>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a skill (e.g., React.js, Photography, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualifications
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a qualification (e.g., Bachelor's in Computer Science)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                />
                <Button
                  type="button"
                  onClick={addQualification}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="space-y-2">
                {formData.qualifications?.map((qualification, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{qualification}</span>
                    <button
                      type="button"
                      onClick={() => removeQualification(qualification)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
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
                <span>Update Profile</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
