import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { serviceApi } from '../api/serviceApi';
import { categoryApi } from '../api/categoryApi';
import { userApi } from '../api/userApi';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import type { CreateServiceRequest } from '../api/serviceApi';
import type { Category } from '../api/categoryApi';
import type { ProviderProfile } from '../api/userApi';

interface FormData {
  categoryId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  tags: string[];
  images: string[];
  workingTime: string[];
  isActive: boolean;
}

const workingTimeSlots = [
  'Monday: 9:00 AM - 5:00 PM',
  'Tuesday: 9:00 AM - 5:00 PM',
  'Wednesday: 9:00 AM - 5:00 PM',
  'Thursday: 9:00 AM - 5:00 PM',
  'Friday: 9:00 AM - 5:00 PM',
  'Saturday: 10:00 AM - 4:00 PM',
  'Sunday: 10:00 AM - 4:00 PM',
];

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    tags: [],
    images: [],
    workingTime: [],
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Fetch categories and provider profile on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await categoryApi.getCategories();
        if (categoriesResponse.success) {
          // Filter to show only main categories (no parent)
          const mainCategories = categoriesResponse.data.filter(category => !category.parentId);
          setCategories(mainCategories);
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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    
    // Validation checks
    if (!trimmedTag) return;
    if (trimmedTag.length > 30) {
      showErrorToast('Tag must not exceed 30 characters');
      return;
    }
    if (trimmedTag.startsWith('data:')) {
      showErrorToast('Invalid tag format. Please enter a text tag, not an image.');
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

  const handleAddImage = () => {
    const trimmedImage = currentImage.trim();
    
    // Validation checks
    if (!trimmedImage) return;
    if (!trimmedImage.startsWith('http://') && !trimmedImage.startsWith('https://') && !trimmedImage.startsWith('data:')) {
      showErrorToast('Please enter a valid image URL (starting with http://, https://, or data:)');
      return;
    }
    if (formData.images.includes(trimmedImage)) {
      showErrorToast('Image URL already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, trimmedImage]
    }));
    setCurrentImage('');
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  const handleWorkingTimeChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      workingTime: prev.workingTime.includes(time)
        ? prev.workingTime.filter(t => t !== time)
        : [...prev.workingTime, time]
    }));
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
      const serviceData: CreateServiceRequest = {
        providerId: providerProfile.id, // Use real provider ID
        categoryId: formData.categoryId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        tags: formData.tags,
        images: formData.images,
        workingTime: formData.workingTime,
        isActive: formData.isActive,
      };

      console.log('Sending service data:', serviceData); // Debug log

      const response = await serviceApi.createService(serviceData);
      
      if (response.success) {
        showSuccessToast('Service created successfully!');
        navigate('/profile'); // Navigate back to profile page
      } else {
        showErrorToast(response.message || 'Failed to create service');
      }
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      
      // More detailed error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string; details?: unknown } } };
        console.log('Full error response:', axiosError.response?.data);
        
        if (axiosError.response?.data?.message) {
          showErrorToast(axiosError.response.data.message);
        } else if (axiosError.response?.data?.error) {
          showErrorToast(axiosError.response.data.error);
        } else if (axiosError.response?.data?.details) {
          // Handle validation errors
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-black px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Service</h1>
            <p className="text-gray-200 mt-1">Fill in the details to create your service listing</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || category.slug}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter service title"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your service in detail"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="LKR">LKR</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <p className="text-xs text-gray-500 mb-2">Add short keywords (max 30 characters each) to help users find your service</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="e.g., photography, wedding, portrait"
                  maxLength={30}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs
              </label>
              <p className="text-xs text-gray-500 mb-2">Add image URLs to showcase your service</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <Button type="button" onClick={handleAddImage} size="sm">
                  Add Image
                </Button>
              </div>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600 truncate flex-1">{image}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {workingTimeSlots.map((time) => (
                  <label key={time} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.workingTime.includes(time)}
                      onChange={() => handleWorkingTimeChange(time)}
                      className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Status
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full shadow-inner transition-colors duration-300 ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow mt-1 ml-1 transition-transform duration-300 ${
                        formData.isActive ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    formData.isActive ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.isActive 
                  ? 'Your service will be visible to customers and available for booking'
                  : 'Your service will be hidden from customers and unavailable for booking'
                }
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Creating...' : 'Create Service'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
