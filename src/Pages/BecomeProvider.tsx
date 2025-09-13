import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Save, 
  Plus, 
  Trash2, 
  FileImage,
  Award,
  Briefcase,
  ArrowLeft,
  IdCard
} from 'lucide-react';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import type { CreateProviderData } from '../api/userApi';
import { uploadImage } from '../utils/imageUpload';
import toast, { Toaster } from 'react-hot-toast';

export default function BecomeProvider() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProviderData>({
    bio: '',
    skills: [],
    qualifications: [],
    logoUrl: '',
    IDCardUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newQualification, setNewQualification] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload logo. Please try again.');
      console.error('Logo upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, IDCardUrl: imageUrl }));
      toast.success('ID document uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload ID document. Please try again.');
      console.error('ID upload error:', error);
    } finally {
      setUploadingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if uploads are in progress
    if (uploadingLogo || uploadingId) {
      toast.error('Please wait for image uploads to complete');
      return;
    }
    
    // Basic validation
    if (!formData.bio?.trim()) {
      toast.error('Please provide a bio');
      return;
    }
    
    if (!formData.skills || formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    
    if (!formData.qualifications || formData.qualifications.length === 0) {
      toast.error('Please add at least one qualification');
      return;
    }
    
    setLoading(true);
    
    try {
      await userApi.createProvider(formData);
      toast.success('Provider profile created successfully! Please wait for verification.');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create provider profile');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Profile
          </button>
          <div className="text-center">
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Become a Service Provider</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our community of service providers and start offering your skills to customers worldwide.
              Fill out the form below to create your provider profile.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Bio Section */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <User className="h-5 w-5 mr-2" />
                  About You
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  This will be displayed on your profile to help customers understand your background.
                </p>
              </div>

              {/* Skills Section */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <Award className="h-5 w-5 mr-2" />
                  Skills
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill (e.g., Web Development, Photography)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                {formData.skills && formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full"
                      >
                        <span className="text-sm font-medium">{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Add skills that represent your expertise and services you can provide.
                </p>
              </div>

              {/* Qualifications Section */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <Award className="h-5 w-5 mr-2" />
                  Qualifications & Certifications
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                    placeholder="Add a qualification (e.g., Bachelor's in Computer Science, AWS Certified)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                {formData.qualifications && formData.qualifications.length > 0 && (
                  <div className="space-y-2">
                    {formData.qualifications.map((qualification, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
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
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Include your education, certifications, and professional achievements.
                </p>
              </div>

              {/* Logo URL Section */}
              {/* Logo Upload Section */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <FileImage className="h-5 w-5 mr-2" />
                  Business Logo
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Uploading logo...</span>
                    </div>
                  )}
                  {formData.logoUrl && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm">Logo uploaded successfully</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Upload your business logo or personal brand image.
                </p>
              </div>

              {/* ID Card Upload Section */}
              <div>
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <IdCard className="h-5 w-5 mr-2" />
                  ID Card/Document Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={uploadingId}
                  />
                  {uploadingId && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Uploading ID document...</span>
                    </div>
                  )}
                  {formData.IDCardUrl && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm">ID document uploaded successfully</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Optional:</strong> Upload an image of your ID card, driver's license, or professional license. This can help speed up the verification process.
                </p>
              </div>

              {/* Information Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your application will be reviewed by our team</li>
                  <li>• Providing ID documentation can help speed up verification</li>
                  <li>• You'll receive an email notification about the verification status</li>
                  <li>• Once approved, you can start adding services and accepting bookings</li>
                  <li>• The verification process typically takes 1-3 business days</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Create Provider Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
