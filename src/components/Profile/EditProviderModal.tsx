import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, Camera, Award, Sparkles, Star } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Animated background orbs for extra visual flair */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 opacity-20 blur-2xl">
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 opacity-15 blur-2xl animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-violet-500/30 rounded-full"></div>
        </div>
      </div>

      <div className="edit-provider-modal relative z-10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header with gradient overlay */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 border-b border-white/20 backdrop-blur-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-xl"></div>
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center shadow-lg border border-purple-400/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Edit Provider Profile</h2>
                <p className="text-sm text-gray-300">Update your professional information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-gray-300 hover:text-white group border border-white/10 hover:border-white/30 backdrop-blur-sm"
              disabled={loading}
              title="Close modal"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <style>{`
            .edit-provider-modal .overflow-y-auto::-webkit-scrollbar {
              width: 6px;
            }
            .edit-provider-modal .overflow-y-auto::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
            .edit-provider-modal .overflow-y-auto::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 3px;
            }
            .edit-provider-modal .overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
          `}</style>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Bio Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-lg flex items-center justify-center border border-blue-400/20">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <label className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                  Professional Bio
                </label>
              </div>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 hover:border-white/30"
                rows={4}
                placeholder="Tell potential clients about yourself, your experience, and what makes you unique..."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  Share your story and professional journey
                </p>
                <p className="text-xs text-gray-400">
                  {formData.bio?.length || 0}/1000
                </p>
              </div>
            </div>

            {/* Logo URL Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center border border-green-400/20">
                  <Camera className="h-4 w-4 text-green-400" />
                </div>
                <label className="text-sm font-medium text-white group-hover:text-green-300 transition-colors">
                  Profile Image URL
                </label>
              </div>
              <input
                type="url"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 hover:border-white/30"
                placeholder="https://example.com/your-profile-image.jpg"
              />
              <p className="text-xs text-gray-400 mt-2">
                Add a professional headshot or company logo
              </p>
            </div>

            {/* ID Card URL Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-lg flex items-center justify-center border border-yellow-400/20">
                  <Award className="h-4 w-4 text-yellow-400" />
                </div>
                <label className="text-sm font-medium text-white group-hover:text-yellow-300 transition-colors">
                  ID Card/Document
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
              </div>
              <input
                type="text"
                value={formData.IDCardUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, IDCardUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 hover:border-white/30"
                placeholder="Enter image URL or text identifier for your ID document"
              />
              <p className="text-xs text-gray-400 mt-2">
                Professional license or ID for verification purposes
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center border border-purple-400/20">
                  <Star className="h-4 w-4 text-purple-400" />
                </div>
                <label className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                  Skills & Expertise
                </label>
              </div>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 hover:border-white/30"
                  placeholder="Enter a skill (e.g., React.js, Photography, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 text-purple-300 border-purple-400/30 hover:border-purple-400/50 backdrop-blur-sm shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="group/skill flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-200 cursor-default backdrop-blur-lg"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-purple-400 hover:text-red-400 transition-colors"
                      title={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {formData.skills?.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No skills added yet. Add your first skill above!
                </p>
              )}
            </div>

            {/* Qualifications Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200 group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-lg flex items-center justify-center border border-emerald-400/20">
                  <Award className="h-4 w-4 text-emerald-400" />
                </div>
                <label className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                  Qualifications & Certifications
                </label>
              </div>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 hover:border-white/30"
                  placeholder="Enter a qualification (e.g., Bachelor's in Computer Science)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                />
                <Button
                  type="button"
                  onClick={addQualification}
                  size="sm"
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/40 hover:to-teal-500/40 text-emerald-300 border-emerald-400/30 hover:border-emerald-400/50 backdrop-blur-sm shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
              <div className="space-y-3">
                {formData.qualifications?.map((qualification, index) => (
                  <div
                    key={index}
                    className="group/qual flex items-start justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-400/20 hover:border-emerald-400/40 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-400/30 mt-0.5">
                        <Award className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="text-sm text-gray-300 leading-relaxed flex-1">{qualification}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQualification(qualification)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                      title={`Remove ${qualification}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {formData.qualifications?.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No qualifications added yet. Add your first qualification above!
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer with enhanced styling */}
        <div className="relative bg-gradient-to-r from-gray-900/50 via-black/50 to-gray-900/50 border-t border-white/20 backdrop-blur-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-xl"></div>
          <div className="relative flex items-center justify-between p-6">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>All changes are saved automatically</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border border-purple-400/20 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
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
      </div>
    </div>
  );
}
