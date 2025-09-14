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
  IdCard,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Camera,
  Upload
} from 'lucide-react';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import type { CreateProviderData } from '../api/userApi';
import { uploadImage } from '../utils/imageUpload';
import toast, { Toaster } from 'react-hot-toast';
import Orb from '../components/Orb';

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
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  // Real-time validation
  const validateField = (field: string, value: any) => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'bio':
        if (!value?.trim()) {
          errors.bio = 'Bio is required';
        } else if (value.trim().length < 50) {
          errors.bio = 'Bio should be at least 50 characters long';
        } else if (value.trim().length > 1000) {
          errors.bio = 'Bio should not exceed 1000 characters';
        }
        break;
      case 'skills':
        if (!value || value.length === 0) {
          errors.skills = 'At least one skill is required';
        } else if (value.length < 2) {
          errors.skills = 'Please add at least 2 skills';
        }
        break;
      case 'qualifications':
        if (!value || value.length === 0) {
          errors.qualifications = 'At least one qualification is required';
        }
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
    return !errors[field];
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof CreateProviderData]);
  };

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
    
    // Comprehensive validation
    const isValidBio = validateField('bio', formData.bio);
    const isValidSkills = validateField('skills', formData.skills);
    const isValidQualifications = validateField('qualifications', formData.qualifications);
    
    if (!isValidBio || !isValidSkills || !isValidQualifications) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      await userApi.createProvider(formData);
      toast.success('🎉 Provider profile created successfully! Please wait for verification.');
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
      const updatedSkills = [...(formData.skills || []), newSkill.trim()];
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
      setNewSkill('');
      if (touched.skills) validateField('skills', updatedSkills);
      toast.success('Skill added successfully! 🎯');
    } else if (formData.skills?.includes(newSkill.trim())) {
      toast.error('This skill has already been added');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills?.filter(skill => skill !== skillToRemove) || [];
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    if (touched.skills) validateField('skills', updatedSkills);
    toast.success('Skill removed');
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications?.includes(newQualification.trim())) {
      const updatedQualifications = [...(formData.qualifications || []), newQualification.trim()];
      setFormData(prev => ({
        ...prev,
        qualifications: updatedQualifications
      }));
      setNewQualification('');
      if (touched.qualifications) validateField('qualifications', updatedQualifications);
      toast.success('Qualification added successfully! 📜');
    } else if (formData.qualifications?.includes(newQualification.trim())) {
      toast.error('This qualification has already been added');
    }
  };

  const removeQualification = (qualificationToRemove: string) => {
    const updatedQualifications = formData.qualifications?.filter(qual => qual !== qualificationToRemove) || [];
    setFormData(prev => ({
      ...prev,
      qualifications: updatedQualifications
    }));
    if (touched.qualifications) validateField('qualifications', updatedQualifications);
    toast.success('Qualification removed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Enhanced Animated Orb Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 opacity-30">
          <Orb hue={280} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-20">
          <Orb hue={200} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-15">
          <Orb hue={320} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        
        {/* Additional floating particles */}
        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-10 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-15 blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 right-1/2 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 blur-lg animate-pulse delay-2000"></div>
      </div>

      {/* Animated grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:50px_50px] animate-pulse"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header Section */}
        <div className="mb-12 animate-slide-up">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors group animate-slide-left"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>
          
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-sm font-medium mb-8 animate-bounce-in delay-200">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Join Our Provider Network ✨
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up delay-300">
              <span className="block">Become a</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Service Provider
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-slide-up delay-400">
              Transform your skills into success. Join thousands of professionals already earning on our platform.
            </p>

            {/* Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105 hover-lift animate-slide-up delay-500">
                <div className="p-3 bg-purple-600/20 rounded-xl w-fit mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors animate-pulse-glow">
                  <Star className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Build Your Reputation</h3>
                <p className="text-gray-400 text-sm">Showcase your skills and build trust with customer reviews</p>
              </div>
              
              <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105 hover-lift animate-slide-up delay-600">
                <div className="p-3 bg-blue-600/20 rounded-xl w-fit mx-auto mb-4 group-hover:bg-blue-600/30 transition-colors animate-pulse-glow">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Platform</h3>
                <p className="text-gray-400 text-sm">Safe payments and verified customers for peace of mind</p>
              </div>
              
              <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-105 hover-lift animate-slide-up delay-700">
                <div className="p-3 bg-pink-600/20 rounded-xl w-fit mx-auto mb-4 group-hover:bg-pink-600/30 transition-colors animate-pulse-glow">
                  <Clock className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flexible Schedule</h3>
                <p className="text-gray-400 text-sm">Work on your terms with complete schedule control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <div className="relative">
          {/* Floating glass card effect */}
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up delay-800 hover-lift">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
            
            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="p-8 lg:p-12 space-y-10">
                {/* Enhanced Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-8 animate-bounce-in delay-900">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-bold animate-glow shadow-lg">
                        1
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                    <div className="ml-4">
                      <span className="text-white font-semibold text-lg">Profile Setup</span>
                      <p className="text-gray-400 text-sm">Create your professional profile</p>
                    </div>
                  </div>
                </div>

              {/* Enhanced Bio Section */}
              <div className="space-y-6 animate-slide-up delay-1000">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-xl font-semibold text-white">
                    <div className="relative p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl mr-3 backdrop-blur-sm">
                      <User className="h-6 w-6 text-purple-400" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur opacity-20"></div>
                    </div>
                    Tell Us About Yourself
                  </label>
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Required</span>
                </div>
                
                <div className="relative group">
                  {/* Glass container with enhanced effects */}
                  <div className="relative bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group-hover:border-purple-500/30 transition-all duration-300">
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, bio: e.target.value }));
                        if (touched.bio) validateField('bio', e.target.value);
                      }}
                      onBlur={() => handleFieldBlur('bio')}
                      placeholder="Share your story, experience, and what makes you unique. This helps customers understand your background and expertise..."
                      rows={6}
                      className={`w-full px-6 py-4 bg-transparent border-0 rounded-2xl focus:ring-2 resize-none text-white placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                        formErrors.bio && touched.bio 
                          ? 'focus:ring-red-500' 
                          : 'focus:ring-purple-500'
                      }`}
                      required
                    />
                    {/* Character counter with enhanced styling */}
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <div className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                        (formData.bio?.length || 0) > 900 
                          ? 'bg-red-500/20 text-red-300' 
                          : (formData.bio?.length || 0) > 700 
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {formData.bio?.length || 0}/1000
                      </div>
                    </div>
                  </div>
                  
                  {/* Error message with enhanced styling */}
                  {formErrors.bio && touched.bio && (
                    <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg animate-slide-up">
                      <p className="text-red-400 text-sm flex items-center space-x-2">
                        <span className="text-red-500">⚠️</span>
                        <span>{formErrors.bio}</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Success indicator */}
                  {formData.bio && formData.bio.length >= 50 && !formErrors.bio && (
                    <div className="mt-2 p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg animate-slide-up">
                      <p className="text-green-400 text-sm flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Great! Your bio looks professional.</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start space-x-2 p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 backdrop-blur-sm rounded-xl border border-purple-500/20">
                  <div className="p-1 bg-purple-500/20 rounded-full">
                    <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-purple-300 text-sm font-medium mb-1">💡 Pro Tip</p>
                    <p className="text-gray-300 text-sm">A compelling bio increases your booking chances by up to 40%. Include your experience, specialties, and what makes you unique!</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Skills Section */}
              <div className="space-y-6 animate-slide-up delay-1100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-xl font-semibold text-white">
                    <div className="relative p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl mr-3 backdrop-blur-sm">
                      <Award className="h-6 w-6 text-blue-400" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl blur opacity-20"></div>
                    </div>
                    Your Skills & Expertise
                  </label>
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                    {formData.skills?.length || 0} skills added
                  </span>
                </div>
                
                {/* Skill input with enhanced styling */}
                <div className="relative group">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill (e.g., Web Development, Photography, Tutoring)"
                        className="w-full px-6 py-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-200 group-hover:border-white/20"
                      />
                      {newSkill && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={addSkill}
                      disabled={!newSkill.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-6 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Skill</span>
                    </Button>
                  </div>
                </div>

                {/* Skills display with enhanced cards */}
                {formData.skills && formData.skills.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>Your Skills Portfolio</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {formData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="group relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl px-4 py-3 hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/40 transition-all duration-300 transform hover:scale-105 animate-bounce-in"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                            <span className="text-sm font-medium text-white">{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                              title={`Remove ${skill}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          {/* Subtle glow effect */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error and validation messages */}
                {formErrors.skills && touched.skills && (
                  <div className="p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg animate-slide-up">
                    <p className="text-red-400 text-sm flex items-center space-x-2">
                      <span className="text-red-500">⚠️</span>
                      <span>{formErrors.skills}</span>
                    </p>
                  </div>
                )}
                
                {/* Success indicator */}
                {formData.skills && formData.skills.length >= 2 && !formErrors.skills && (
                  <div className="p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg animate-slide-up">
                    <p className="text-green-400 text-sm flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Excellent! You've added {formData.skills.length} skills to your profile.</span>
                    </p>
                  </div>
                )}
                
                <div className="flex items-start space-x-2 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <div className="p-1 bg-blue-500/20 rounded-full">
                    <Award className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-300 text-sm font-medium mb-1">🎯 Skill Tips</p>
                    <p className="text-gray-300 text-sm">Add 3-5 relevant skills that showcase your expertise. Be specific (e.g., "React Development" instead of just "Programming").</p>
                  </div>
                </div>
              </div>

              {/* Qualifications Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-green-600/20 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-green-400" />
                  </div>
                  Qualifications & Certifications
                </label>
                
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                    placeholder="Add a qualification (e.g., Bachelor's in Computer Science, AWS Certified)"
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    onClick={addQualification}
                    size="default"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center space-x-2 px-6"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>

                {formData.qualifications && formData.qualifications.length > 0 && (
                  <div className="space-y-3">
                    {formData.qualifications.map((qualification, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
                      >
                        <span className="text-gray-200 font-medium">{qualification}</span>
                        <button
                          type="button"
                          onClick={() => removeQualification(qualification)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title={`Remove ${qualification}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-gray-400 text-sm">
                  📜 Include your education, certifications, and professional achievements
                </p>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-pink-600/20 rounded-lg mr-3">
                    <Camera className="h-5 w-5 text-pink-400" />
                  </div>
                  Business Logo / Profile Picture
                </label>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploadingLogo}
                    title="Upload logo"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-white/30 rounded-2xl hover:border-pink-500/50 transition-all duration-200 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                  >
                    <div className="p-4 bg-pink-600/20 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-pink-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">Click to upload your logo</p>
                      <p className="text-gray-400 text-sm">SVG, PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                  
                  {uploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                      <div className="flex items-center space-x-3 text-purple-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                        <span className="font-medium">Uploading logo...</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.logoUrl && !uploadingLogo && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-600/20 backdrop-blur-sm border border-green-500/30 text-green-400 px-3 py-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm">
                  📸 A professional image increases profile views by 60%
                </p>
              </div>

              {/* ID Card Upload Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-yellow-600/20 rounded-lg mr-3">
                    <IdCard className="h-5 w-5 text-yellow-400" />
                  </div>
                  ID Verifcation
                </label>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdUpload}
                    className="hidden"
                    id="id-upload"
                    disabled={uploadingId}
                    title="Upload ID document"
                  />
                  <label
                    htmlFor="id-upload"
                    className="cursor-pointer flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-white/30 rounded-2xl hover:border-yellow-500/50 transition-all duration-200 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                  >
                    <div className="p-4 bg-yellow-600/20 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">Upload ID Document</p>
                      <p className="text-gray-400 text-sm">Driver's License, ID Card, or Professional License</p>
                    </div>
                  </label>
                  
                  {uploadingId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                      <div className="flex items-center space-x-3 text-purple-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                        <span className="font-medium">Uploading document...</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.IDCardUrl && !uploadingId && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-600/20 backdrop-blur-sm border border-green-500/30 text-green-400 px-3 py-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm">
                  🚀 ID verification can speed up approval by 2-3 days
                </p>
              </div>

              {/* Information Note */}
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg mt-1">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Application review (1-3 business days)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Email notification on approval status</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Start adding services immediately</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Begin accepting customer bookings</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Access to provider dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Join our community of professionals</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Submit Section */}
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-blue-600/5"></div>
              
              <div className="relative px-8 lg:px-12 py-8 backdrop-blur-sm border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0 sm:space-x-6">
                  {/* Cancel Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                    className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  
                  {/* Submit Button with enhanced effects */}
                  <div className="relative group">
                    {/* Button glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    
                    <Button
                      type="submit"
                      disabled={loading || uploadingLogo || uploadingId}
                      className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 rounded-xl border border-purple-500/50"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          <span>Creating Your Profile...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1 bg-white/20 rounded-full">
                            <Save className="h-5 w-5" />
                          </div>
                          <span>Create Provider Profile</span>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <div className="text-xs text-gray-400 flex items-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="text-xs text-gray-400 flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Instant Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(20px)',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(20px)',
            },
          },
        }}
      />
    </div>
  );
}
