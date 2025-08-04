import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Clock,
  DollarSign,
  FileText,
  Tag,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  List,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { categoryApi, type Category } from '../api/categoryApi';

interface ServiceForm {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  currency: string;
  tags: string[];
  isActive: boolean;
  images: string[];
  workingTime: string[];
}

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newWorkingTime, setNewWorkingTime] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [providerServices, setProviderServices] = useState<ServiceResponse[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [formData, setFormData] = useState<ServiceForm>({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    currency: 'USD',
    tags: [],
    isActive: true,
    images: [],
    workingTime: []
  });

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  // Helper function to get current provider ID
  // TODO: Replace with actual authentication context
  const getCurrentProviderId = () => {
    return 'cmdwnmhjq0002v2xs21s1sp17'; // Real provider ID from database
  };

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getRootCategories({ includeChildren: true });
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    loadCategories();
  }, []);

  // Function to load provider services
  const loadProviderServices = async () => {
    setLoadingServices(true);
    try {
      const currentProviderId = getCurrentProviderId();
      
      const response = await serviceApi.getServices({ 
        providerId: currentProviderId,
        isActive: undefined // Show both active and inactive services
      });
      
      setProviderServices(response.data);
      
      // Show success message with count
      if (response.data.length > 0) {
        toast.success(`Found ${response.data.length} service${response.data.length === 1 ? '' : 's'} for your provider account`);
      }
    } catch (error) {
      console.error('Error loading provider services:', error);
      toast.error('Failed to load your services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Function to toggle services view
  const toggleServicesView = async () => {
    if (!showAllServices) {
      await loadProviderServices();
    }
    setShowAllServices(!showAllServices);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addMediaUrl = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a media URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newMediaUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Check if URL already exists
    if (formData.images.includes(newMediaUrl)) {
      toast.error('This URL has already been added');
      return;
    }
    
    // Add URL to the list (maximum 5 URLs)
    if (formData.images.length >= 5) {
      toast.error('Maximum 5 media URLs allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newMediaUrl]
    }));
    
    // Clear the input
    setNewMediaUrl('');
    toast.success('Media URL added successfully');
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addWorkingTime = () => {
    if (!newWorkingTime.trim()) {
      toast.error('Please enter a working time slot');
      return;
    }
    
    // Validate format: "Day: HH:MM AM/PM - HH:MM AM/PM"
    const workingTimePattern = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):\s*\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)$/i;
    if (!workingTimePattern.test(newWorkingTime.trim())) {
      toast.error('Working time must be in format "Day: HH:MM AM/PM - HH:MM AM/PM" (e.g., "Monday: 9:00 AM - 5:00 PM")');
      return;
    }
    
    // Check if time slot already exists
    if (formData.workingTime.includes(newWorkingTime)) {
      toast.error('This working time slot has already been added');
      return;
    }
    
    // Add time slot to the list (maximum 7 slots)
    if (formData.workingTime.length >= 7) {
      toast.error('Maximum 7 working time slots allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      workingTime: [...prev.workingTime, newWorkingTime]
    }));
    
    // Clear the input
    setNewWorkingTime('');
    toast.success('Working time slot added successfully');
  };

  const removeWorkingTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workingTime: prev.workingTime.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag');
      return;
    }
    
    // Check if tag already exists (case insensitive)
    if (formData.tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
      toast.error('This tag has already been added');
      return;
    }
    
    // Add tag to the list (maximum 10 tags)
    if (formData.tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    
    // Clear the input
    setNewTag('');
    toast.success('Tag added successfully');
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a service title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a service description');
      return;
    }
    
    if (formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (formData.workingTime.length === 0) {
      toast.error('Please add at least one working time slot');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Get providerId from authentication context or user state
      // You'll need to implement proper authentication and get the actual provider ID
      // For testing, using a real provider ID from the database
      const currentProviderId = getCurrentProviderId();
      
      const serviceData = {
        providerId: currentProviderId,
        categoryId: formData.categoryId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        tags: formData.tags,
        images: formData.images,
        isActive: formData.isActive,
        workingTime: formData.workingTime
      };
      
      const response = await serviceApi.createService(serviceData);
      
      if (response.success) {
        toast.success('Service created successfully!');
        
        // Refresh the services list if it's currently shown
        if (showAllServices) {
          await loadProviderServices();
        }
        
        navigate('/profile');
      } else {
        toast.error('Failed to create service. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      
      // Handle specific error messages from backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        } else if (axiosError.message) {
          toast.error(axiosError.message);
        } else {
          toast.error('Failed to create service. Please try again.');
        }
      } else {
        toast.error('Failed to create service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/profile')}
            variant="ghost"
            className="flex items-center space-x-2 mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
              <p className="text-gray-600 mt-2">Fill in the details to create your new service offering</p>
            </div>
            <Button
              onClick={toggleServicesView}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <List className="h-4 w-4" />
              <span>{showAllServices ? 'Hide' : 'View All'} My Services</span>
              {showAllServices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* All Services Section (Collapsible) */}
        {showAllServices && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Services</h2>
                <p className="text-sm text-gray-500">Services created by your provider account</p>
              </div>
              {loadingServices && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>
            
            {loadingServices ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p>Loading your services...</p>
              </div>
            ) : providerServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <List className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-2">No services found</p>
                <p className="text-sm">Create your first service using the form below!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    Showing {providerServices.length} service{providerServices.length === 1 ? '' : 's'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1 text-green-500" />
                      Active
                    </span>
                    <span className="flex items-center">
                      <EyeOff className="h-3 w-3 mr-1 text-gray-400" />
                      Inactive
                    </span>
                  </div>
                </div>
                {providerServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {service.title || 'Untitled Service'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.isActive ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {service.description || 'No description provided'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {service.price} {service.currency}
                          </span>
                          {service.category && (
                            <span className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {service.category.name || service.category.slug}
                            </span>
                          )}
                          {service.tags.length > 0 && (
                            <span>
                              {service.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                  {tag}
                                </span>
                              ))}
                              {service.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{service.tags.length - 3} more</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast.success('Edit functionality coming soon!');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            // TODO: Implement delete functionality
                            toast.success('Delete functionality coming soon!');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your service title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service in detail"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || category.slug}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Tags (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., responsive, modern, SEO-friendly"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3"
                    disabled={!newTag.trim() || formData.tags.length >= 10}
                  >
                    Add Tag
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add up to 10 tags to help customers find your service
                </p>
              </div>
              
              {/* Tags List */}
              {formData.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Working Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Working Time Slots *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWorkingTime}
                    onChange={(e) => setNewWorkingTime(e.target.value)}
                    placeholder="Monday: 9:00 AM - 5:00 PM"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addWorkingTime();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addWorkingTime}
                    className="px-6 py-3"
                    disabled={!newWorkingTime.trim() || formData.workingTime.length >= 7}
                  >
                    Add Time
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Format: "Day: HH:MM AM/PM - HH:MM AM/PM" (e.g., "Monday: 9:00 AM - 5:00 PM"). Add up to 7 working time slots.
                </p>
              </div>
              
              {/* Working Time List */}
              {formData.workingTime.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Working Time Slots:</h4>
                  {formData.workingTime.map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{time}</span>
                      <button
                        type="button"
                        onClick={() => removeWorkingTime(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="h-4 w-4 inline mr-2" />
                Image or Video URLs
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="Enter image or video URL (e.g., https://example.com/image.jpg)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMediaUrl();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addMediaUrl}
                    className="px-6 py-3"
                    disabled={!newMediaUrl.trim() || formData.images.length >= 5}
                  >
                    Add URL
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add up to 5 image or video URLs. Supported formats: JPG, PNG, GIF, MP4, WebM
                </p>
              </div>
              
              {/* Media URL Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Added Media URLs:</h4>
                  {formData.images.map((url: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <Video className="h-6 w-6 text-gray-400" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'Video' : 'Image'} #{index + 1}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:border-blue-300"
                        >
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="flex items-center text-sm font-medium text-gray-700">
                {formData.isActive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                Make service active immediately
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              {formData.isActive 
                ? "Your service will be visible to customers right away" 
                : "You can activate your service later from your profile"
              }
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Service...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
