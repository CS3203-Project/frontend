import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Save,
  Plus,
  Trash2,
  Award,
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

export default function BecomeProvider() {
  const navigate = useNavigate();
  // Section refs for scrolling to first invalid field on submit
  const bioSectionRef = useRef<HTMLDivElement | null>(null);
  const skillsSectionRef = useRef<HTMLDivElement | null>(null);
  const qualificationsSectionRef = useRef<HTMLDivElement | null>(null);
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
  const validateField = (
    field: 'bio' | 'skills' | 'qualifications',
    value: string | string[]
  ): boolean => {
    const errors: {[key: string]: string} = {};
    
    switch (field) {
      case 'bio':
        if (typeof value !== 'string' || !value?.trim()) {
          errors.bio = 'Bio is required';
        } else if (value.trim().length < 50) {
          errors.bio = 'Bio should be at least 50 characters long';
        } else if (value.trim().length > 1000) {
          errors.bio = 'Bio should not exceed 1000 characters';
        }
        break;
      case 'skills':
        if (!Array.isArray(value) || value.length === 0) {
          errors.skills = 'At least one skill is required';
        } else if (value.length < 2) {
          errors.skills = 'Please add at least 2 skills';
        }
        break;
      case 'qualifications':
        if (!Array.isArray(value) || value.length === 0) {
          errors.qualifications = 'At least one qualification is required';
        }
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
    return !errors[field];
  };

  const handleFieldBlur = (field: 'bio' | 'skills' | 'qualifications') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof CreateProviderData] as string | string[]);
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
      // Mark all as touched so inline errors are visible
      setTouched({ bio: true, skills: true, qualifications: true });

      // Scroll to the first invalid section to guide the user
      if (!isValidBio) {
        bioSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!isValidSkills) {
        skillsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!isValidQualifications) {
        qualificationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create provider profile';
      toast.error(message);
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
      toast.success('Skill added successfully! ');
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Simple background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:50px_50px]"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header Section */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-white-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Profile
          </button>

          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-black-800 border border-black-600 text-black-300 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black-400"></span>
              </span>
              Join Our Provider Network
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">Become a</span>
              <span className="block text-black-300">
                Service Provider
              </span>
            </h1>

            <p className="text-xl text-black-400 max-w-3xl mx-auto mb-8">
              Transform your skills into success. Join thousands of professionals already earning on our platform.
            </p>

            {/* Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="group p-6 bg-black-900 border border-black-700 rounded-2xl transition-all duration-300 hover:border-black-500">
                <div className="p-3 bg-black-800 rounded-xl w-fit mx-auto mb-4">
                  <Star className="h-6 w-6 text-black-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Build Your Reputation</h3>
                <p className="text-black-400 text-sm">Showcase your skills and build trust with customer reviews</p>
              </div>

              <div className="group p-6 bg-black-900 border border-black-700 rounded-2xl transition-all duration-300 hover:border-black-500">
                <div className="p-3 bg-black-800 rounded-xl w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-black-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Platform</h3>
                <p className="text-black-400 text-sm">Safe payments and verified customers for peace of mind</p>
              </div>

              <div className="group p-6 bg-black-900 border border-black-700 rounded-2xl transition-all duration-300 hover:border-black-500">
                <div className="p-3 bg-black-800 rounded-xl w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-black-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flexible Schedule</h3>
                <p className="text-black-400 text-sm">Work on your terms with complete schedule control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          <div className="relative bg-black-900 border border-black rounded-3xl overflow-hidden">

            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="p-8 lg:p-12 space-y-10">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-8">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="flex items-center justify-center w-10 h-10 bg-black-700 rounded-full text-white text-sm font-bold">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="text-white font-semibold text-lg">Profile Setup</span>
                      <p className="text-black-400 text-sm">Create your professional profile</p>
                    </div>
                  </div>
                </div>

              {/* Bio Section */}
              <div ref={bioSectionRef} className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-xl font-semibold text-white">
                    <div className="relative p-3 bg-black-800 rounded-xl mr-3">
                      <User className="h-6 w-6 text-black-400" />
                    </div>
                    Tell Us About Yourself
                  </label>
                  <span className="text-xs text-black-400 bg-black-800 px-2 py-1 rounded-full">Required</span>
                </div>

                <div className="relative group">
                  {/* Container */}
                  <div className="relative bg-black-800 border border-black-600 rounded-2xl overflow-hidden">
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, bio: e.target.value }));
                        if (touched.bio) validateField('bio', e.target.value);
                      }}
                      onBlur={() => handleFieldBlur('bio')}
                      placeholder="Share your story, experience, and what makes you unique. This helps customers understand your background and expertise..."
                      rows={6}
                      className={`w-full px-6 py-4 bg-transparent border-0 rounded-2xl focus:ring-2 resize-none text-white placeholder-black-400 transition-all duration-200 focus:outline-none ${
                        formErrors.bio && touched.bio
                          ? 'focus:ring-red-500'
                          : 'focus:ring-black-400'
                      }`}
                      required
                    />
                    {/* Character counter */}
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        (formData.bio?.length || 0) > 900
                          ? 'bg-red-900 text-red-300'
                          : (formData.bio?.length || 0) > 700
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-black-700 text-black-400'
                      }`}>
                        {formData.bio?.length || 0}/1000
                      </div>
                    </div>
                  </div>

                  {/* Error message */}
                  {formErrors.bio && touched.bio && (
                    <div className="mt-2 p-3 bg-red-900 border border-red-700 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center space-x-2">
                        <span className="text-red-500">Warning</span>
                        <span>{formErrors.bio}</span>
                      </p>
                    </div>
                  )}

                  {/* Success indicator */}
                  {formData.bio && formData.bio.length >= 50 && !formErrors.bio && (
                    <div className="mt-2 p-3 bg-white-900 border border-white-700 rounded-lg">
                      <p className="text-white-400 text-sm flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Great! Your bio looks professional.</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start space-x-2 p-4 bg-black-800 border border-black-600 rounded-xl">
                  <div className="p-1 bg-black-700 rounded-full">
                    <svg className="h-4 w-4 text-black-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-black-300 text-sm font-medium mb-1">Pro Tip</p>
                    <p className="text-black-300 text-sm">A compelling bio increases your booking chances by up to 40%. Include your experience, specialties, and what makes you unique!</p>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div ref={skillsSectionRef} className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-xl font-semibold text-white">
                    <div className="relative p-3 bg-black-800 rounded-xl mr-3">
                      <Award className="h-6 w-6 text-black-400" />
                    </div>
                    Your Skills & Expertise
                  </label>
                  <span className="text-xs text-black-400 bg-black-800 px-2 py-1 rounded-full">
                    {formData.skills?.length || 0} skills added
                  </span>
                </div>

                {/* Skill input */}
                <div className="relative group">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill (e.g., Web Development, Photography, Tutoring)"
                        className="w-full px-6 py-4 bg-black-800 border border-black-600 rounded-xl focus:ring-2 focus:ring-black-400 focus:border-black-400 text-white placeholder-black-400 transition-all duration-200"
                      />
                      {newSkill && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={addSkill}
                      disabled={!newSkill.trim()}
                      className="bg-black-700 hover:bg-black-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-6 py-4 border border-black-600"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Skill</span>
                    </Button>
                  </div>
                </div>

                {/* Skills display */}
                {formData.skills && formData.skills.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-black-300 flex items-center space-x-2">
                      <Star className="h-4 w-4 text-black-400" />
                      <span>Your Skills Portfolio</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {formData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="group relative bg-black-800 border border-black-600 rounded-xl px-4 py-3 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-black-400 rounded-full"></div>
                            <span className="text-sm font-medium text-white">{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-black-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                              title={`Remove ${skill}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error and validation messages */}
                {formErrors.skills && touched.skills && (
                  <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center space-x-2">
                      <span className="text-red-500">Warning</span>
                      <span>{formErrors.skills}</span>
                    </p>
                  </div>
                )}
                
                {/* Success indicator */}
                {formData.skills && formData.skills.length >= 2 && !formErrors.skills && (
                  <div className="p-3 bg-white-500/10 backdrop-blur-sm border border-white-500/30 rounded-lg animate-slide-up">
                    <p className="text-white-400 text-sm flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Excellent! You've added {formData.skills.length} skills to your profile.</span>
                    </p>
                  </div>
                )}
                
                <div className="flex items-start space-x-2 p-4 bg-gradient-to-r from-white-500/5 to-purple-500/5 backdrop-blur-sm rounded-xl border border-white-500/20">
                  <div className="p-1 bg-white-500/20 rounded-full">
                    <Award className="h-4 w-4 text-white-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white-300 text-sm font-medium mb-1">Skill Tips</p>
                    <p className="text-black-300 text-sm">Add 3-5 relevant skills that showcase your expertise. Be specific (e.g., "React Development" instead of just "Programming").</p>
                  </div>
                </div>
              </div>

              {/* Qualifications Section */}
              <div ref={qualificationsSectionRef} className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-white-600/20 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-white-400" />
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
                    className="flex-1 px-4 py-3 bg-black-800 border border-black-600 rounded-xl focus:ring-2 focus:ring-black-400 focus:border-black-400 text-white placeholder-black-400 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    onClick={addQualification}
                    size="default"
                    className="bg-black-700 hover:bg-black-600 flex items-center space-x-2 px-6 border border-black-600"
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
                        className="flex items-center justify-between bg-black-800 border border-black-600 px-6 py-4 rounded-xl"
                      >
                        <span className="text-black-200 font-medium">{qualification}</span>
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
                {/* Qualifications error and success indicators */}
                {formErrors.qualifications && touched.qualifications && (
                  <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center space-x-2">
                      <span className="text-red-500">Warning</span>
                      <span>{formErrors.qualifications}</span>
                    </p>
                  </div>
                )}
                {formData.qualifications && formData.qualifications.length >= 1 && !formErrors.qualifications && (
                  <div className="p-3 bg-white-900 border border-white-700 rounded-lg">
                    <p className="text-white-400 text-sm flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Great! You've added {formData.qualifications.length} qualification{formData.qualifications.length > 1 ? 's' : ''}.</span>
                    </p>
                  </div>
                )}

                <p className="text-black-400 text-sm">
                  Include your education, certifications, and professional achievements
                </p>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-black-800 rounded-lg mr-3">
                    <Camera className="h-5 w-5 text-black-400" />
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
                    className="cursor-pointer flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-black-600 rounded-2xl hover:border-black-400 transition-all duration-200 bg-black-800"
                  >
                    <div className="p-4 bg-black-700 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-black-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">Click to upload your logo</p>
                      <p className="text-black-400 text-sm">SVG, PNG, JPG up to 5MB</p>
                    </div>
                  </label>

                  {uploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                      <div className="flex items-center space-x-3 text-black-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-black-400 border-t-transparent"></div>
                        <span className="font-medium">Uploading logo...</span>
                      </div>
                    </div>
                  )}
                  
                  {formData.logoUrl && !uploadingLogo && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white-900 border border-white-700 text-white-400 px-3 py-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  )}
                </div>

                <p className="text-black-400 text-sm">
                  A professional image increases profile views by 60%
                </p>
              </div>

              {/* ID Card Upload Section */}
              <div className="space-y-4">
                <label className="flex items-center text-xl font-semibold text-white mb-4">
                  <div className="p-2 bg-black-800 rounded-lg mr-3">
                    <IdCard className="h-5 w-5 text-black-400" />
                  </div>
                  ID Verification
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
                    className="cursor-pointer flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-black-600 rounded-2xl hover:border-black-400 transition-all duration-200 bg-black-800"
                  >
                    <div className="p-4 bg-black-700 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-black-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">Upload ID Document</p>
                      <p className="text-black-400 text-sm">Driver's License, ID Card, or Professional License</p>
                    </div>
                  </label>

                  {uploadingId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                      <div className="flex items-center space-x-3 text-black-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-black-400 border-t-transparent"></div>
                        <span className="font-medium">Uploading document...</span>
                      </div>
                    </div>
                  )}

                  {formData.IDCardUrl && !uploadingId && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white-900 border border-white-700 text-white-400 px-3 py-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  )}
                </div>

                <p className="text-black-400 text-sm">
                  ID verification can speed up approval by 2-3 days
                </p>
              </div>

              {/* Information Note */}
              <div className="bg-black-800 border border-black-600 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-black-700 rounded-lg mt-1">
                    <Shield className="h-5 w-5 text-black-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Application review (1-3 business days)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Email notification on approval status</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Start adding services immediately</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Begin accepting customer bookings</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Access to provider dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-black-300">
                          <CheckCircle className="h-4 w-4 text-white-400" />
                          <span>Join our community of professionals</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="relative">
              <div className="relative px-8 lg:px-12 py-8 border-t border-black-600">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0 sm:space-x-6">
                  {/* Cancel Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                    className="text-black-300 hover:text-white hover:bg-black-800 border border-black-600 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>

                  {/* Submit Button */}
                  <div className="relative group">
                    <Button
                      type="submit"
                      disabled={loading || uploadingLogo || uploadingId}
                      className="relative bg-black-700 hover:bg-black-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 px-8 py-4 text-lg font-bold border border-black-600 rounded-xl"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          <span>Creating Your Profile...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1 bg-black-600 rounded-full">
                            <Save className="h-5 w-5" />
                          </div>
                          <span>Create Provider Profile</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <div className="text-xs text-black-400 flex items-center space-x-2">
                    <Shield className="h-3 w-3" />
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="w-1 h-1 bg-black-500 rounded-full"></div>
                  <div className="text-xs text-black-400 flex items-center space-x-2">
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
