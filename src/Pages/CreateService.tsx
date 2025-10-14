import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';
import { serviceApi } from '../api/serviceApi';
import { categoryApi } from '../api/categoryApi';
import { userApi } from '../api/userApi';
import apiClient from '../api/axios';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import type { CreateServiceRequest } from '../api/serviceApi';
import type { Category } from '../api/categoryApi';
import type { ProviderProfile } from '../api/userApi';
import type { LocationInfo } from '../services/locationService';
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
  // Location fields
  location: LocationInfo & { serviceRadiusKm?: number };
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
    currency: 'LKR',
    tags: [],
    images: [],
    uploadedImageUrls: [],
    video: null,
    uploadedVideoUrl: '',
    workingTime: defaultWorkingHours,
    isActive: true,
    location: {}
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
        // Location fields (only include if provided)
        ...(formData.location.latitude && formData.location.longitude && {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
          country: formData.location.country,
          postalCode: formData.location.postalCode,
          serviceRadiusKm: formData.location.serviceRadiusKm || 10
        })
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

  const handleLocationChange = async (location: LocationInfo & { serviceRadiusKm?: number }) => {
    if (!location) {
      setFormData(prev => ({
        ...prev,
        location: {}
      }));
      return;
    }

    // If we have latitude and longitude but no extended geolocation data,
    // perform reverse geocoding to get address components
    let updatedLocation = { ...location };
    if (location.latitude && location.longitude && !location.city && !location.country) {
      try {
        const { hybridSearchApi } = await import('../api/hybridSearchApi');
        const response = await hybridSearchApi.reverseGeocode(location.latitude, location.longitude);
        if (response.success && response.data && response.data.city && response.data.country) {
          updatedLocation = {
            ...location,
            address: location.address || response.data.address,
            city: response.data.city,
            state: response.data.state,
            country: response.data.country,
            postalCode: response.data.postalCode
          };
        }
      } catch (error) {
        console.warn('Failed to reverse geocode location:', error);
        // Continue with original location data if reverse geocoding fails
      }
    }

    setFormData(prev => ({
      ...prev,
      location: updatedLocation
    }));
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Glass Morphism Background - Homepage Style */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)]"></div>
        
        {/* Square Grid Pattern */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />
        
        {/* Subtle Orbs for depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-10 blur-3xl">
          <Orb hue={280} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-8 blur-3xl">
          <Orb hue={200} hoverIntensity={0.15} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 opacity-10 blur-3xl">
          <Orb hue={320} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        
        {/* Minimal gradient accents */}
        <div className="absolute top-1/5 left-3/4 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/5 left-1/5 w-56 h-56 bg-black/3 dark:bg-white/3 rounded-full blur-3xl opacity-25"></div>
        
        {/* Radial overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
          
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-white/50 to-white/30 dark:from-black/50 dark:to-black/30 backdrop-blur-lg px-8 py-8 border-b border-white/20 dark:border-white/10">
            <div className="relative flex items-center space-x-4">
              <div className="p-3 bg-white dark:bg-black rounded-xl border border-white/40 dark:border-white/20 shadow-lg hover:scale-105 transition-all duration-300">
                <FiPlus className="h-8 w-8 text-black dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Create New Service</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Share your expertise with the world. Create a service that showcases your skills.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative p-8 space-y-8">
            {/* Category Section */}
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-3 h-3 bg-black dark:bg-white rounded-full mr-4"></div>
                Category Selection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-semibold text-black dark:text-white mb-3">
                    Category <span className="text-red-500 dark:text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 appearance-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.categoryId ? 'border-red-400/50 ring-red-400/20' : 'border-white/40 dark:border-white/20'
                      }`}
                    >
                      <option value="" className="bg-white dark:bg-black text-black dark:text-white">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="bg-white dark:bg-black text-black dark:text-white">
                          {category.name || category.slug}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FiChevronDown className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  {errors.categoryId && <p className="mt-2 text-sm text-red-500 dark:text-red-500 dark:text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.categoryId}
                  </p>}
                </div>

                {/* Subcategory */}
                {subcategories.length > 0 && (
                  <div>
                    <label htmlFor="subcategoryId" className="block text-sm font-semibold text-black dark:text-white mb-3">
                      Subcategory
                    </label>
                    <div className="relative">
                      <select
                        id="subcategoryId"
                        name="subcategoryId"
                        value={formData.subcategoryId}
                        onChange={handleInputChange}
                        disabled={!formData.categoryId || subcategories.length === 0}
                        className={`w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 appearance-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          !formData.categoryId || subcategories.length === 0 
                            ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-700' 
                            : 'border-white/40 dark:border-white/20'
                        }`}
                      >
                        <option value="" className="bg-white dark:bg-black text-black dark:text-white">
                          {!formData.categoryId 
                            ? 'Select a category first' 
                            : subcategories.length === 0 
                              ? 'No subcategories available' 
                              : 'Select a subcategory (optional)'
                          }
                        </option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id} className="bg-white dark:bg-black text-black dark:text-white">
                            {subcategory.name || subcategory.slug}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FiChevronDown className={!formData.categoryId || subcategories.length === 0 ? 'text-gray-400 w-5 h-5' : 'text-gray-600 dark:text-gray-400 w-5 h-5'} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details Section */}
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-3 h-3 bg-black dark:bg-white rounded-full mr-4"></div>
                Service Details
              </h2>
              <div className="space-y-8">
                {/* Title */}
                <div className="relative">
                  <label htmlFor="title" className="block text-sm font-semibold text-black dark:text-white mb-3">
                    Service Title <span className="text-red-500 dark:text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive title for your service"
                      className={`w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.title ? 'border-red-400/50 ring-red-400/20' : 'border-white/40 dark:border-white/20'
                      }`}
                    /></div>
                  {errors.title && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>}
                </div>

                {/* Description */}
                <div className="relative">
                  <label htmlFor="description" className="block text-sm font-semibold text-black dark:text-white mb-3">
                    Description <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Describe your service in detail. Include what's included, your experience, and what makes your service unique."
                      className={`w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 resize-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.description ? 'border-red-400/50 ring-red-400/20' : 'border-white/20'
                      }`}
                    />
                  </div>
                  {errors.description && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
                    <FiX className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <label htmlFor="price" className="block text-sm font-semibold text-black dark:text-white mb-3">
                      Price <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.price ? 'border-red-400/50 ring-red-400/20' : 'border-white/20'
                        }`}
                      /></div>
                    {errors.price && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
                      <FiX className="w-4 h-4 mr-1" />
                      {errors.price}
                    </p>}
                  </div>

                  <div className="relative">
                    <label htmlFor="currency" className="block text-sm font-semibold text-black dark:text-white mb-3">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 appearance-none text-white"
                      >
                        <option value="USD" className="bg-gray-900 text-white">USD ($)</option>
                        <option value="EUR" className="bg-gray-900 text-white">EUR (€)</option>
                        <option value="GBP" className="bg-gray-900 text-white">GBP (£)</option>
                        <option value="LKR" className="bg-gray-900 text-white">LKR (₨)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                          <FiChevronDown className="text-white/60 w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Attractive background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-blue-600/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
                <span className="bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Service Images</span>
                <span className="text-red-500 dark:text-red-400 ml-2">*</span>
                <span className="ml-4 text-sm font-normal text-white/50">(Max 5 images, 5MB each)</span>
              </h2>
              
              {/* Upload Area */}
              <div className="mb-6 relative z-10">
                {uploading ? (
                  <div className="border-2 border-dashed border-white/40 rounded-xl p-8 text-center bg-white/10 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-white">
                      Uploading images to Amazon S3...
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      {formData.images.length > 0 ? `Processing ${formData.images.length} image(s)` : 'Please wait...'}
                    </p>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 hover:bg-white/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Glowing effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <FiUpload className="mx-auto h-12 w-12 text-white/80 group-hover:text-white transition-colors duration-200 relative z-10" />
                    <p className="mt-4 text-lg font-medium text-white group-hover:text-white/90 relative z-10">
                      Click to upload images
                    </p>
                    <p className="mt-2 text-sm text-white/60 relative z-10">
                      PNG, JPG, WEBP up to 5MB each
                    </p>
                    {formData.images.length + formData.uploadedImageUrls.length > 0 && (
                      <p className="mt-2 text-sm text-white/70 font-medium relative z-10">
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
                {errors.images && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
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
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Attractive background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-blue-600/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
                <span className="bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Service Video</span>
                <span className="ml-4 text-sm font-normal text-white/50">(Optional, Max 100MB)</span>
              </h2>
              
              {/* Video Upload Area */}
              <div className="mb-6 relative z-10">
                {uploading ? (
                  <div className="border-2 border-dashed border-white/40 rounded-xl p-8 text-center bg-white/10 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-white">
                      Uploading video to Amazon S3...
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Please wait while your video is being uploaded...
                    </p>
                  </div>
                ) : !formData.video && !formData.uploadedVideoUrl ? (
                  <div 
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 hover:bg-white/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Glowing effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="video-upload"
                      aria-label="Upload service video"
                    />
                    
                    <FiUpload className="mx-auto h-12 w-12 text-white/80 group-hover:text-white transition-colors duration-200 relative z-10" />
                    <p className="mt-4 text-lg font-medium text-white group-hover:text-white/90 relative z-10">
                      Click to upload a service video
                    </p>
                    <p className="mt-2 text-sm text-white/60 relative z-10">
                      MP4, WebM, MOV up to 100MB
                    </p>
                    <p className="mt-1 text-xs text-white/50 relative z-10">
                      A short video showcasing your service (optional)
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-white/20 rounded-xl p-6 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                          <FiEye className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {formData.video ? formData.video.name : 'Uploaded Video'}
                          </p>
                          <p className="text-sm text-white/70">
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
                        className="p-2 text-white/60 hover:text-red-500 dark:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200"
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
                          className="w-full max-w-md h-48 bg-black/40 rounded-lg border border-white/20"
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
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Attractive background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-orange-600/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
                <span className="bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Tags</span>
              </h2>
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="e.g., photography, wedding, portrait"
                      maxLength={30}
                      className="w-full px-4 py-4 bg-white dark:bg-black backdrop-blur-sm border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    /></div>
                  <Button 
                    type="button" 
                    onClick={handleAddTag} 
                    size="sm"
                    className="px-6 py-4 bg-gradient-to-r from-white-600 to-gray-600 text-white shadow-lg transition-all duration-300 rounded-xl font-semibold border border-white-500/30"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-black/30 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 group"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-white/70 hover:text-red-500 dark:text-red-400 hover:bg-red-500/20 rounded-full p-1 transition-all duration-200"
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
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Attractive background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
                <span className="bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Working Hours</span>
              </h2>
              <div className="space-y-4 relative z-10">
                {daysOfWeek.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300">
                    <div className="flex items-center min-w-[140px]">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`working-${key}`}
                          checked={formData.workingTime[key as keyof WorkingHours].enabled}
                          onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'enabled', e.target.checked)}
                          className="h-5 w-5 rounded-md bg-black/30 border border-white/20 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 text-white transition-all duration-200"
                        />
                      </div>
                      <label htmlFor={`working-${key}`} className="ml-3 text-sm font-semibold text-black dark:text-white">
                        {label}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-white/60" />
                          <input
                            type="time"
                            value={formData.workingTime[key as keyof WorkingHours].startTime}
                            onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'startTime', e.target.value)}
                            disabled={!formData.workingTime[key as keyof WorkingHours].enabled}
                            className={`px-3 py-2 bg-white dark:bg-black backdrop-blur-sm border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 text-white ${
                              formData.workingTime[key as keyof WorkingHours].enabled 
                                ? 'border-white/20' 
                                : 'border-white/10 bg-black/10 text-white/40 cursor-not-allowed'
                            }`}
                            aria-label={`Start time for ${label}`}
                          />
                        </div>
                        <span className="text-white/60 font-medium">to</span>
                        <input
                          type="time"
                          value={formData.workingTime[key as keyof WorkingHours].endTime}
                          onChange={(e) => handleWorkingHoursChange(key as keyof WorkingHours, 'endTime', e.target.value)}
                          disabled={!formData.workingTime[key as keyof WorkingHours].enabled}
                          className={`px-3 py-2 bg-white dark:bg-black backdrop-blur-sm border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-black/50 dark:focus:border-white/50 transition-all duration-300 text-white ${
                            formData.workingTime[key as keyof WorkingHours].enabled 
                              ? 'border-white/20' 
                              : 'border-white/10 bg-black/10 text-white/40 cursor-not-allowed'
                          }`}
                          aria-label={`End time for ${label}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {formatWorkingHoursForAPI(formData.workingTime).length > 0 && (
                <div className="mt-6 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-sm font-semibold text-black dark:text-white mb-3 flex items-center">
                    Preview (as saved):
                  </div>
                  <div className="text-sm text-white/70 space-y-1">
                    {formatWorkingHoursForAPI(formData.workingTime).map((time, index) => (
                      <div key={index} className="flex items-center">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Status Section */}
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Minimal gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-white/5 dark:from-white/5 dark:to-black/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
              <div className="w-3 h-3 bg-black dark:bg-white rounded-full mr-4"></div>
              Service Status
              </h2>
              <div className="flex items-center justify-between p-6 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 relative z-10">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${formData.isActive ? 'bg-black/30 dark:bg-white/20 border-white/30 dark:border-white/20' : 'bg-black/10 dark:bg-white/5 border-white/10 dark:border-white/10'}`}>
                <FiEye className={`w-5 h-5 ${formData.isActive ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`} />
                </div>
                <div>
                <p className={`font-medium ${formData.isActive ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}>
                  {formData.isActive ? 'Service Active' : 'Service Inactive'}
                </p>
                <p className="text-sm text-black/50 dark:text-white/50">
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
                <div className={`w-12 h-6 rounded-full shadow-inner transition-colors duration-300 border-2 ${
                  formData.isActive ? 'bg-black dark:bg-white border-black dark:border-white' : 'bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20'
                }`}>
                  <div className={`w-5 h-5 bg-white dark:bg-black rounded-full shadow mt-0.5 ml-0.5 transition-transform duration-300 border ${
                  formData.isActive ? 'transform translate-x-6 border-black dark:border-white' : 'border-black/20 dark:border-white/20'
                  }`}></div>
                </div>
                </div>
              </label>
              </div>
            </div>

            {/* Location Section */}
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 rounded-3xl border border-white/30 dark:border-white/20 shadow-xl">
              {/* Attractive background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-green-600/5 rounded-3xl"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-6 flex items-center relative z-10">
                <span className="bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Service Location</span>
                <span className="ml-3 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">
                  Optional
                </span>
              </h2>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <p className="text-sm text-white/70 mb-4">
                    Specify your service location to help customers find services near them. 
                    If no location is provided, your service will be available everywhere.
                  </p>
                </div>
                
                <LocationPickerAdvanced
                  value={formData.location}
                  onChange={handleLocationChange}
                  className="w-full"
                  disabled={loading || uploading}
                  showMap={true}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="relative pt-12">
              {/* Decorative separator */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/30 dark:via-white/30 to-transparent"></div>
              
              <div className="flex justify-end space-x-6 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  disabled={loading || uploading}
                  className="px-10 py-4 bg-white dark:bg-black backdrop-blur-sm border border-white/40 dark:border-white/20 text-black dark:text-white transition-all duration-300 rounded-full shadow-lg hover:scale-105"
                >
                  <span className="font-semibold">Cancel</span>
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  variant="white"
                  className="px-10 py-4 min-w-[200px] rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center font-bold">
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 mr-3 relative">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30"></div>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black absolute top-0 left-0"></div>
                        </div>
                        Uploading...
                      </>
                    ) : loading ? (
                      <>
                        <div className="w-5 h-5 mr-3 relative">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30"></div>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black absolute top-0 left-0"></div>
                        </div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5 mr-2" />
                        Create Service
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



