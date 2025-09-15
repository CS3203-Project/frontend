import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { serviceApi } from '../api/serviceApi';
import { categoryApi } from '../api/categoryApi';
import { userApi } from '../api/userApi';
import apiClient from '../api/axios';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import type { CreateServiceRequest } from '../api/serviceApi';
import type { Category } from '../api/categoryApi';
import type { ProviderProfile } from '../api/userApi';
import { FiUpload, FiX, FiClock, FiEye, FiChevronDown, FiPlus } from 'react-icons/fi';
import Orb from '../components/Orb';

interface FormData {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  tags: string[];
  images: File[];
  uploadedImageUrls: string[];
  video: File | null;
  uploadedVideoUrl: string;
  workingTime: WorkingHours;
  isActive: boolean;
}

interface FormErrors {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: string;
  images?: string;
}

interface WorkingHours {
  monday: { enabled: boolean; startTime: string; endTime: string };
  tuesday: { enabled: boolean; startTime: string; endTime: string };
  wednesday: { enabled: boolean; startTime: string; endTime: string };
  thursday: { enabled: boolean; startTime: string; endTime: string };
  friday: { enabled: boolean; startTime: string; endTime: string };
  saturday: { enabled: boolean; startTime: string; endTime: string };
  sunday: { enabled: boolean; startTime: string; endTime: string };
}

const defaultWorkingHours: WorkingHours = {
  monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '10:00', endTime: '16:00' },
  sunday: { enabled: false, startTime: '10:00', endTime: '16:00' },
};

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    tags: [],
    images: [],
    uploadedImageUrls: [],
    video: null,
    uploadedVideoUrl: '',
    workingTime: defaultWorkingHours,
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});

  // Fetch categories and provider profile on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await categoryApi.getRootCategories({ includeChildren: true });
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Fetch provider profile
        const providerData = await userApi.getProviderProfile();
        setProviderProfile(providerData);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showErrorToast('Failed to load required data');
        // Redirect back to profile if user is not a provider
        navigate('/profile');
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.categoryId) {
        try {
          const categoryResponse = await categoryApi.getCategoryById(formData.categoryId, { includeChildren: true });
          if (categoryResponse.success && categoryResponse.data.children) {
            setSubcategories(categoryResponse.data.children);
          } else {
            setSubcategories([]);
          }
        } catch (error) {
          console.error('Failed to fetch subcategories:', error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
      // Reset subcategory when category changes
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    };

    fetchSubcategories();
  }, [formData.categoryId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormErrors> = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.images.length === 0 && formData.uploadedImageUrls.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload image to S3 using backend endpoint
  const uploadImageToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Use axios with authentication (handled by interceptor)
      const response = await apiClient.post('/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.imageUrl) {
        console.log(`Successfully uploaded ${file.name} to S3:`, response.data.imageUrl);
        return response.data.imageUrl;
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error: any) {
      console.error('Error uploading image to S3:', error);
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          throw new Error(`Authentication required. Please log in again.`);
        } else if (error.response.status === 413) {
          throw new Error(`File ${file.name} is too large. Please select a smaller image.`);
        } else {
          const errorMessage = error.response.data?.message || error.response.data?.error || 'Upload failed';
          throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(`Failed to upload ${file.name}: Network error`);
      } else {
        // Something else happened
        throw new Error(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Upload video to S3 using backend endpoint
  const uploadVideoToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('video', file);

    try {
      // Use axios with authentication (handled by interceptor)
      const response = await apiClient.post('/users/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.videoUrl) {
        console.log(`Successfully uploaded ${file.name} to S3:`, response.data.videoUrl);
        return response.data.videoUrl;
      } else {
        throw new Error('No video URL returned from server');
      }
    } catch (error: any) {
      console.error('Error uploading video to S3:', error);
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          throw new Error(`Authentication required. Please log in again.`);
        } else if (error.response.status === 413) {
          throw new Error(`File ${file.name} is too large. Please select a smaller video (max 100MB).`);
        } else {
          throw new Error(`Failed to upload ${file.name}. Server error: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        throw new Error(`Network error. Please check your connection and try again.`);
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total images limit (5)
    const totalImages = formData.images.length + formData.uploadedImageUrls.length + files.length;
    if (totalImages > 5) {
      showErrorToast('You can upload maximum 5 images');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showErrorToast(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showErrorToast(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));

      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Clean up preview URL
    if (previewImages[index]) {
      URL.revokeObjectURL(previewImages[index]);
    }
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    
    // Validation checks
    if (!trimmedTag) return;
    if (trimmedTag.length > 30) {
      showErrorToast('Tag must not exceed 30 characters');
      return;
    }
    if (formData.tags.includes(trimmedTag)) {
      showErrorToast('Tag already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setCurrentTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleWorkingHoursChange = (day: keyof WorkingHours, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      workingTime: {
        ...prev.workingTime,
        [day]: {
          ...prev.workingTime[day],
          [field]: value
        }
      }
    }));
  };

  const formatWorkingHoursForAPI = (workingHours: WorkingHours): string[] => {
    const result: string[] = [];
    
    // Helper function to convert 24-hour time to 12-hour format with AM/PM
    const convertTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    Object.entries(workingHours).forEach(([day, hours]) => {
      if (hours.enabled) {
        const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
        const startTime12 = convertTo12Hour(hours.startTime);
        const endTime12 = convertTo12Hour(hours.endTime);
        result.push(`${formattedDay}: ${startTime12} - ${endTime12}`);
      }
    });
    
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Please fix the errors in the form');
      return;
    }

    if (!providerProfile?.id) {
      showErrorToast('Provider profile not found. Please ensure you are a verified provider.');
      return;
    }

    setLoading(true);
    
    try {
      // Upload images and video to S3 first
      setUploading(true);
      const uploadedUrls: string[] = [...formData.uploadedImageUrls];
      let videoUrl = formData.uploadedVideoUrl;
      
      // Upload video if present
      if (formData.video) {
        showSuccessToast('Uploading video to S3...');
        try {
          console.log(`Uploading video: ${formData.video.name}`);
          videoUrl = await uploadVideoToS3(formData.video);
          console.log(`Successfully uploaded video to:`, videoUrl);
          showSuccessToast('Video uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload video:', formData.video.name, error);
          showErrorToast(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
          setUploading(false);
          return;
        }
      }
      
      if (formData.images.length > 0) {
        showSuccessToast(`Uploading ${formData.images.length} image(s) to S3...`);
        
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          try {
            console.log(`Uploading image ${i + 1}/${formData.images.length}: ${file.name}`);
            const url = await uploadImageToS3(file);
            uploadedUrls.push(url);
            console.log(`Successfully uploaded ${file.name} to:`, url);
          } catch (error) {
            console.error('Failed to upload image:', file.name, error);
            showErrorToast(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Continue with other uploads
          }
        }
      }
      
      setUploading(false);

      if (uploadedUrls.length === 0) {
        showErrorToast('At least one image must be uploaded successfully');
        return;
      }

      showSuccessToast(`Successfully uploaded ${uploadedUrls.length} image(s). Creating service...`);

      const serviceData: CreateServiceRequest = {
        providerId: providerProfile.id,
        categoryId: formData.subcategoryId || formData.categoryId, // Use subcategory if selected, otherwise main category
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        tags: formData.tags,
        images: uploadedUrls,
        videoUrl: videoUrl || undefined,
        workingTime: formatWorkingHoursForAPI(formData.workingTime),
        isActive: formData.isActive,
      };

      console.log('Formatted working time:', formatWorkingHoursForAPI(formData.workingTime));
      console.log('Sending service data:', serviceData);

      const response = await serviceApi.createService(serviceData);
      
      if (response.success) {
        showSuccessToast('Service created successfully!');
        navigate('/profile');
      } else {
        showErrorToast(response.message || 'Failed to create service');
      }
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string; details?: unknown } } };
        console.log('Full error response:', axiosError.response?.data);
        
        if (axiosError.response?.data?.message) {
          showErrorToast(axiosError.response.data.message);
        } else if (axiosError.response?.data?.error) {
          showErrorToast(axiosError.response.data.error);
        } else if (axiosError.response?.data?.details) {
          const details = axiosError.response.data.details;
          if (Array.isArray(details) && details.length > 0) {
            const firstError = details[0] as { message?: string };
            showErrorToast(`Validation error: ${firstError.message || 'Unknown validation error'}`);
          } else {
            showErrorToast('Validation failed. Check console for details.');
          }
        } else {
          showErrorToast('Failed to create service. Please try again.');
        }
      } else {
        showErrorToast('Failed to create service. Please try again.');
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      showErrorToast(`${file.name} is not a valid video file`);
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      showErrorToast(`${file.name} is too large. Maximum size is 100MB`);
      return;
    }

    // Check video duration (optional - basic check via file size as proxy)
    // For a more robust solution, you'd want to use video element to check duration

    setFormData(prev => ({
      ...prev,
      video: file
    }));

    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: null,
      uploadedVideoUrl: ''
    }));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated Orb Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-30">
          <Orb hue={280} hoverIntensity={0.5} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-20">
          <Orb hue={200} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-15">
          <Orb hue={320} hoverIntensity={0.4} rotateOnHover={true} />
        </div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-300">
          {/* Enhanced Header with Glass Effect */}
          <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg px-8 py-8 border-b border-white/10">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-3xl"></div>
            
            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group hover:bg-white/20 transition-all duration-300">
                <FiSparkles className="h-8 w-8 text-white group-hover:text-purple-300 transition-colors duration-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Create New Service
                </h1>
                <p className="text-gray-300 mt-2">Showcase your expertise and reach new customers</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8 relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-blue-500/5 pointer-events-none"></div>
            {/* Category Section */}
            <div className="relative group">
              {/* Glass background with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Category Selection
                  </span>
                </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-200 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 appearance-none hover:bg-white/15 hover:border-white/30 ${
                        errors.categoryId ? 'border-red-400 ring-red-300/50' : ''
                      }`}
                    >
                      <option value="" className="bg-gray-900 text-gray-200">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="bg-gray-900 text-gray-200">
                          {category.name || category.slug}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex space-x-1">
                      <FiChevronDown className="text-gray-400" />
                      <FiChevronDown className="text-gray-400" />
                    </div>
                  </div>
                  {errors.categoryId && <p className="mt-2 text-sm text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.categoryId}
                  </p>}
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-200 mb-2">
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      id="subcategoryId"
                      name="subcategoryId"
                      value={formData.subcategoryId}
                      onChange={handleInputChange}
                      disabled={!formData.categoryId || subcategories.length === 0}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 appearance-none hover:bg-white/15 hover:border-white/30 ${
                        !formData.categoryId || subcategories.length === 0 
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border-gray-600' 
                          : ''
                      }`}
                    >
                      <option value="" className="bg-gray-900 text-gray-200">
                        {!formData.categoryId 
                          ? 'Select a category first' 
                          : subcategories.length === 0 
                            ? 'No subcategories available' 
                            : 'Select a subcategory (optional)'
                        }
                      </option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id} className="bg-gray-900 text-gray-200">
                          {subcategory.name || subcategory.slug}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex space-x-1">
                      <FiChevronDown className={!formData.categoryId || subcategories.length === 0 ? 'text-gray-500' : 'text-gray-400'} />
                      <FiChevronDown className={!formData.categoryId || subcategories.length === 0 ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            {/* ...rest of the form content remains unchanged... */}
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t-2 border-black">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading || uploading}
                className="px-8 py-3 border-2 border-black hover:border-gray-700 text-black hover:text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 min-w-[160px] bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl border-2 border-black"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </div>
          </form>
 transform -translate-y-1/2 pointer-events-none flex space-x-1">
                      <FiChevronDown className="text-gray-400" />
                      <FiChevronDown className="text-gray-400" />
                    </div>
                  </div>
                  {errors.categoryId && <p className="mt-2 text-sm text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.categoryId}
                  </p>}
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-200 mb-2">
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      id="subcategoryId"
                      name="subcategoryId"
                      value={formData.subcategoryId}
                      onChange={handleInputChange}
                      disabled={!formData.categoryId || subcategories.length === 0}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 appearance-none hover:bg-white/15 hover:border-white/30 ${
                        !formData.categoryId || subcategories.length === 0 
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border-gray-600' 
                          : ''
                      }`}
                    >
                      <option value="" className="bg-gray-900 text-gray-200">
                        {!formData.categoryId 
                          ? 'Select a category first' 
                          : subcategories.length === 0 
                            ? 'No subcategories available' 
                            : 'Select a subcategory (optional)'
                        }
                      </option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id} className="bg-gray-900 text-gray-200">
                          {subcategory.name || subcategory.slug}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex space-x-1">
                      <FiChevronDown className={!formData.categoryId || subcategories.length === 0 ? 'text-gray-500' : 'text-gray-400'} />
                      <FiChevronDown className={!formData.categoryId || subcategories.length === 0 ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div className="relative group">
              {/* Glass background with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Service Details
                  </span>
                </h2>
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title for your service"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 hover:bg-white/15 hover:border-white/30 ${
                      errors.title ? 'border-red-400 ring-red-300/50' : ''
                    }`}
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe your service in detail. Include what's included, your experience, and what makes your service unique."
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 resize-none hover:bg-white/15 hover:border-white/30 ${
                      errors.description ? 'border-red-400 ring-red-300/50' : ''
                    }`}
                  />
                  {errors.description && <p className="mt-2 text-sm text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-200 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-200 hover:bg-white/15 hover:border-white/30 ${
                        errors.price ? 'border-red-400 ring-red-300/50' : ''
                      }`}
                    />
                    {errors.price && <p className="mt-2 text-sm text-red-400 flex items-center">
                      <FiX className="w-4 h-4 mr-1" />
                      {errors.price}
                    </p>}
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-200 mb-2">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white transition-all duration-200 hover:bg-white/15 hover:border-white/30 appearance-none"
                      >
                        <option value="USD" className="bg-gray-900 text-gray-200">USD ($)</option>
                        <option value="EUR" className="bg-gray-900 text-gray-200">EUR (€)</option>
                        <option value="GBP" className="bg-gray-900 text-gray-200">GBP (£)</option>
                        <option value="LKR" className="bg-gray-900 text-gray-200">LKR (₨)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex space-x-1">
                        <FiChevronDown className="text-gray-400" />
                        <FiChevronDown className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="relative group">
              {/* Glass background with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    Service Images *
                  </span>
                  <span className="ml-2 text-sm font-normal text-gray-400">(Max 5 images, 5MB each)</span>
                </h2>
              
              {/* Upload Area */}
              <div className="mb-6">
                {uploading ? (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/10 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-blue-300">
                      Uploading images to Amazon S3...
                    </p>
                    <p className="mt-2 text-sm text-blue-400">
                      {formData.images.length > 0 ? `Processing ${formData.images.length} image(s)` : 'Please wait...'}
                    </p>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-white/10 transition-all duration-200 cursor-pointer group backdrop-blur-sm"
                  >
                    <FiUpload className="mx-auto h-12 w-12 text-gray-300 group-hover:text-purple-300 transition-colors duration-200" />
                    <p className="mt-4 text-lg font-medium text-white group-hover:text-purple-200">
                      Click to upload images
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      PNG, JPG, WEBP up to 5MB each
                    </p>
                    {formData.images.length + formData.uploadedImageUrls.length > 0 && (
                      <p className="mt-2 text-sm text-purple-200 font-medium">
                        {formData.images.length + formData.uploadedImageUrls.length}/5 images selected
                      </p>
                    )}
                  </div>
                )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload service images"
                  />
                {errors.images && <p className="mt-2 text-sm text-red-400 flex items-center">
                  <FiX className="w-4 h-4 mr-1" />
                  At least one image is required
                </p>}
              </div>

              {/* Image Previews */}
              {(formData.images.length > 0 || previewImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-black hover:border-gray-700 transition-all duration-200">
                        <img
                          src={previewImages[index] || URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-700 shadow-lg"
                        aria-label={`Remove image ${index + 1}`}
                        title={`Remove image ${index + 1}`}
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Section */}
            <div className="bg-white p-6 rounded-xl border-2 border-black">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Service Video
                <span className="ml-2 text-sm font-normal text-gray-500">(Optional, Max 100MB)</span>
              </h2>
              
              {/* Video Upload Area */}
              <div className="mb-6">
                {uploading ? (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-blue-600">
                      Uploading video to Amazon S3...
                    </p>
                  </div>
                ) : !formData.video && !formData.uploadedVideoUrl ? (
                  <div className="border-2 border-dashed border-black rounded-xl p-8 text-center hover:border-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="video-upload"
                      aria-label="Upload service video"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer block">
                      <FiUpload className="mx-auto h-12 w-12 text-black group-hover:text-gray-700 transition-colors duration-200" />
                      <p className="mt-4 text-lg font-medium text-black group-hover:text-gray-700">
                        Click to upload a service video
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        MP4, WebM, MOV up to 100MB
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        A short video showcasing your service (optional)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-black rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                          <FiEye className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-black">
                            {formData.video ? formData.video.name : 'Uploaded Video'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formData.video 
                              ? `${(formData.video.size / (1024 * 1024)).toFixed(1)} MB`
                              : 'Video ready'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        aria-label="Remove video"
                        title="Remove video"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    {formData.video && (
                      <div className="mt-4">
                        <video 
                          controls 
                          className="w-full max-w-md h-48 bg-black rounded-lg"
                          src={URL.createObjectURL(formData.video)}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-white p-6 rounded-xl border-2 border-black">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Tags
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="e.g., photography, wedding, portrait"
                    maxLength={30}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-700"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag} 
                    size="sm"
                    className="px-6 whitespace-nowrap bg-black hover:bg-gray-800 text-white border-2 border-black"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-gray-100 text-black border-2 border-black hover:bg-gray-200 transition-colors duration-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-black hover:text-gray-700 hover:bg-gray-300 rounded-full p-1 transition-all duration-200"
                          aria-label={`Remove tag ${tag}`}
                          title={`Remove tag ${tag}`}
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours Section */}
            <div className="relative group">
              {/* Glass background with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    Working Hours
                  </span>
                </h2>
              <div className="space-y-4">
                {daysOfWeek.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/30 transition-colors duration-200">
                    <div className="flex items-center min-w-[120px]">
                      <input
                        type="checkbox"
                        id={`working-${key}`}
                        checked={formData.workingTime[key as keyof WorkingHours].enabled}
                        onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'enabled', e.target.checked)}
                        className="h-4 w-4 text-purple-500 border-2 border-white/30 rounded focus:ring-purple-500 accent-purple-500 bg-white/10"
                      />
                      <label htmlFor={`working-${key}`} className="ml-3 text-sm font-medium text-gray-200">
                        {label}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingTime[key as keyof WorkingHours].startTime}
                          onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'startTime', e.target.value)}
                          disabled={!formData.workingTime[key as keyof WorkingHours].enabled}
                          className={`px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white transition-all duration-200 ${
                            formData.workingTime[key as keyof WorkingHours].enabled 
                              ? 'hover:border-white/30' 
                              : 'bg-white/5 text-gray-500 cursor-not-allowed border-gray-600'
                          }`}
                          aria-label={`Start time for ${label}`}
                        />
                        <span className="text-gray-300">to</span>
                        <input
                          type="time"
                          value={formData.workingTime[key as keyof WorkingHours].endTime}
                          onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'endTime', e.target.value)}
                          disabled={!formData.workingTime[key as keyof WorkingHours].enabled}
                          className={`px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white transition-all duration-200 ${
                            formData.workingTime[key as keyof WorkingHours].enabled 
                              ? 'hover:border-white/30' 
                              : 'bg-white/5 text-gray-500 cursor-not-allowed border-gray-600'
                          }`}
                          aria-label={`End time for ${label}`}
                        />
                      </div>
                      {formData.workingTime[key as keyof WorkingHours].enabled && (
                        <div className="text-xs text-gray-500 ml-4">
                          {(() => {
                            const convertTo12Hour = (time24: string): string => {
                              const [hours, minutes] = time24.split(':');
                              const hour24 = parseInt(hours, 10);
                              const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                              const ampm = hour24 >= 12 ? 'PM' : 'AM';
                              return `${hour12}:${minutes} ${ampm}`;
                            };
                            const startTime12 = convertTo12Hour(formData.workingTime[key as keyof WorkingHours].startTime);
                            const endTime12 = convertTo12Hour(formData.workingTime[key as keyof WorkingHours].endTime);
                            return `${startTime12} - ${endTime12}`;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {formatWorkingHoursForAPI(formData.workingTime).length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview (as saved):</p>
                  <div className="text-sm text-gray-600">
                    {formatWorkingHoursForAPI(formData.workingTime).map((time, index) => (
                      <div key={index}>{time}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Status Section */}
            <div className="relative group">
              {/* Glass background with glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    Service Status
                  </span>
                </h2>
                <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${formData.isActive ? 'bg-green-500/20 border-green-400' : 'bg-gray-500/20 border-gray-400'}`}>
                      <FiEye className={`w-5 h-5 ${formData.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${formData.isActive ? 'text-green-300' : 'text-gray-400'}`}>
                        {formData.isActive ? 'Service Active' : 'Service Inactive'}
                      </p>
                    <p className="text-sm text-gray-400">
                      {formData.isActive 
                        ? 'Your service will be visible to customers and available for booking'
                        : 'Your service will be hidden from customers and unavailable for booking'
                      }
                    </p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only"
                      aria-label="Toggle service active status"
                    />
                    <div className={`w-12 h-6 rounded-full shadow-inner transition-colors duration-300 border ${
                      formData.isActive ? 'bg-green-500/70 border-green-400' : 'bg-gray-600/50 border-gray-500'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 ml-0.5 transition-transform duration-300 border ${
                        formData.isActive ? 'transform translate-x-6 border-green-200' : 'border-gray-200'
                      }`}></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading || uploading}
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 hover:border-white/50 text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 min-w-[160px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl border border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:scale-105"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
