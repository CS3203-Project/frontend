import { useState } from 'react';
import { X, Building, MapPin, Phone, Globe, Image } from 'lucide-react';
import Button from '../Button';
import { userApi } from '../../api/userApi';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../../api/userApi';
import toast from 'react-hot-toast';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (company: Company) => void;
  company?: Company | null;
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    description: company?.description || '',
    logo: company?.logo || '',
    address: company?.address || '',
    contact: company?.contact || '',
    socialmedia: company?.socialmedia || []
  });
  const [socialMediaInput, setSocialMediaInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSocialMedia = () => {
    if (socialMediaInput.trim() && !formData.socialmedia.includes(socialMediaInput.trim())) {
      setFormData(prev => ({
        ...prev,
        socialmedia: [...prev.socialmedia, socialMediaInput.trim()]
      }));
      setSocialMediaInput('');
    }
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialmedia: prev.socialmedia.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result: Company;
      
      if (company) {
        // Update existing company
        const updateData: UpdateCompanyData = {};
        if (formData.name !== company.name) updateData.name = formData.name;
        if (formData.description !== company.description) updateData.description = formData.description;
        if (formData.logo !== company.logo) updateData.logo = formData.logo;
        if (formData.address !== company.address) updateData.address = formData.address;
        if (formData.contact !== company.contact) updateData.contact = formData.contact;
        if (JSON.stringify(formData.socialmedia) !== JSON.stringify(company.socialmedia)) {
          updateData.socialmedia = formData.socialmedia;
        }
        
        result = await userApi.updateCompany(company.id, updateData);
        toast.success('Company updated successfully!');
      } else {
        // Create new company
        const createData: CreateCompanyData = {
          name: formData.name,
          description: formData.description || undefined,
          logo: formData.logo || undefined,
          address: formData.address || undefined,
          contact: formData.contact || undefined,
          socialmedia: formData.socialmedia.length > 0 ? formData.socialmedia : undefined
        };
        
        result = await userApi.createCompany(createData);
        toast.success('Company created successfully!');
      }

      onSuccess(result);
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${company ? 'update' : 'create'} company`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {company ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your company..."
            />
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo URL
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company address"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phone number or email"
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Links
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={socialMediaInput}
                    onChange={(e) => setSocialMediaInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/yourcompany"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSocialMedia();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addSocialMedia}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Add
                </Button>
              </div>
              
              {formData.socialmedia.length > 0 && (
                <div className="space-y-2">
                  {formData.socialmedia.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700 truncate flex-1">{link}</span>
                      <button
                        type="button"
                        onClick={() => removeSocialMedia(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
