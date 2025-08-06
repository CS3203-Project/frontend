import { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  workingTime: string;
  isActive: boolean;
  mediaUrls: string[];
}

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [formData, setFormData] = useState<ServiceForm>({
    title: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    workingTime: '',
    isActive: true,
    mediaUrls: []
  });

  const categories = [
    'Home Services',
    'Technical Services',
    'Business Services',
    'Creative Services',
    'Personal Services'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

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
    if (formData.mediaUrls.includes(newMediaUrl)) {
      toast.error('This URL has already been added');
      return;
    }
    
    // Add URL to the list (maximum 5 URLs)
    if (formData.mediaUrls.length >= 5) {
      toast.error('Maximum 5 media URLs allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, newMediaUrl]
    }));
    
    // Clear the input
    setNewMediaUrl('');
    toast.success('Media URL added successfully');
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
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
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (!formData.workingTime.trim()) {
      toast.error('Please enter working time');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement actual API call to create service
      // const serviceData = {
      //   title: formData.title,
      //   description: formData.description,
      //   category: formData.category,
      //   price: parseFloat(formData.price),
      //   currency: formData.currency,
      //   workingTime: formData.workingTime,
      //   isActive: formData.isActive,
      //   mediaUrls: formData.mediaUrls
      // };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, SIMULATED_API_DELAY_MS));
      
      toast.success('Service created successfully!');
      navigate('/profile');
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your new service offering</p>
        </div>

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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
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

            {/* Working Time */}
            <div>
              <label htmlFor="workingTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Working Time *
              </label>
              <input
                type="text"
                id="workingTime"
                name="workingTime"
                value={formData.workingTime}
                onChange={handleInputChange}
                placeholder="e.g., 2-3 hours, 1-2 days, 1 week"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Estimated time to complete this service</p>
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
                    disabled={!newMediaUrl.trim() || formData.mediaUrls.length >= 5}
                  >
                    Add URL
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add up to 5 image or video URLs. Supported formats: JPG, PNG, GIF, MP4, WebM
                </p>
              </div>
              
              {/* Media URL Preview */}
              {formData.mediaUrls.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Added Media URLs:</h4>
                  {formData.mediaUrls.map((url, index) => (
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



