import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Mail, Lock, User, Phone, MapPin, Home, Check, Loader, Eye, EyeOff, Sparkles } from 'lucide-react';
import { userApi, type RegisterUserData } from '../api/userApi';
import toast, { Toaster } from 'react-hot-toast';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  address: string;
  notifications: boolean;
  marketing: boolean;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
  address: '',
  notifications: true,
  marketing: false,
};

export default function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const totalSteps = 4;
  
  const sriLankanCities = [
    "Colombo, Western",
    "Kandy, Central",
    "Galle, Southern", 
    "Jaffna, Northern",
    "Negombo, Western",
    "Anuradhapura, North Central",
    "Batticaloa, Eastern",
    "Matara, Southern",
    "Kurunegala, North Western",
    "Ratnapura, Sabaragamuwa",
    "Badulla, Uva",
    "Trincomalee, Eastern",
    "Nuwara Eliya, Central",
    "Kalutara, Western",
    "Polonnaruwa, North Central"
  ];

  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced email check
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
        setEmailCheckLoading(true);
        setEmailExists(null);
        
        try {
          const result = await userApi.checkEmailExists(formData.email);
          setEmailExists(result.exists);
          
          if (result.exists) {
            setErrors(prev => ({ ...prev, email: 'This email is already registered. Please use a different email or try logging in.' }));
          } else {
            // Clear email error if it was about existing email
            setErrors(prev => {
              const newErrors = { ...prev };
              if (newErrors.email === 'This email is already registered. Please use a different email or try logging in.' || 
                  newErrors.email === 'Email is already registered') {
                delete newErrors.email;
              }
              return newErrors;
            });
          }
        } catch (error: any) {
          console.error('Email check error:', error);
          // Don't show error to user for email check failures
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        setEmailExists(null);
      }
    };

    const timeoutId = setTimeout(checkEmail, 1000); // 1 second delay
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;

      case 2:
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else {
          const cleanPhone = formData.phone.replace(/\D/g, '');
          if (!/^94\d{9}$/.test(cleanPhone)) {
            newErrors.phone = 'Phone number must start with 94 and be exactly 11 digits (e.g., 94712345678)';
          }
        }
        break;

      case 3:
        if (!formData.location) newErrors.location = 'Location is required';
        // Address is optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for API call (excluding confirmPassword and preferences)
      const registrationData: RegisterUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        location: formData.location,
        phone: formData.phone.replace(/\D/g, ''), // Remove all non-digit characters
        address: formData.address || undefined, // Optional field
      };

      const response = await userApi.register(registrationData);
      
      // Success notification
      toast.success('🎉 Account created successfully! Welcome aboard!');
      
      // You can redirect or handle success here
      console.log('Registration successful:', response);
      
      // Optional: Reset form or redirect
      // setFormData(initialFormData);
      // setCurrentStep(1);
      // Redirect to sign-in page after successful signup
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1200); // Wait for toast to show
      
    } catch (error: any) {
      // Error notification
      toast.error(error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">Enter your credentials to get started</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-500 shadow-md shadow-red-100' : 
                      emailExists === false ? 'border-green-500 shadow-md shadow-green-100' :
                      emailExists === true ? 'border-red-500 shadow-md shadow-red-100' :
                      focusedField === 'email' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your email"
                  />
                  {/* Email status indicator */}
                  <div className="absolute right-3 top-3 h-5 w-5 flex items-center justify-center">
                    {emailCheckLoading ? (
                      <Loader className="h-4 w-4 animate-spin text-blue-500" />
                    ) : emailExists === false ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : emailExists === true ? (
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    ) : null}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.email}</span>
                  </p>
                )}
                {emailExists === false && !errors.email && (
                  <p className="text-green-600 text-sm mt-1 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Email is available!</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-500 shadow-md shadow-red-100' : 
                      focusedField === 'password' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            formData.password.length >= (i + 1) * 2 ? 
                              formData.password.length >= 8 ? 'bg-green-500' :
                              formData.password.length >= 6 ? 'bg-yellow-500' :
                              'bg-red-500'
                            : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      formData.password.length >= 8 ? 'text-green-600' :
                      formData.password.length >= 6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formData.password.length >= 8 ? 'Strong password' :
                       formData.password.length >= 6 ? 'Medium password' :
                       'Weak password'}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500 shadow-md shadow-red-100' : 
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500 shadow-md shadow-green-100' :
                      focusedField === 'confirmPassword' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {/* Password match indicator */}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute right-10 top-3">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Passwords match!</span>
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.firstName ? 'border-red-500 shadow-md shadow-red-100' : 
                        focusedField === 'firstName' ? 'border-blue-400 shadow-md shadow-blue-100' :
                        'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.firstName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.lastName ? 'border-red-500 shadow-md shadow-red-100' : 
                      focusedField === 'lastName' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Auto-format phone number
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 0 && !value.startsWith('94')) {
                        value = '94' + value;
                      }
                      if (value.length > 11) {
                        value = value.slice(0, 11);
                      }
                      // Format as 94 XXX XXX XXX
                      if (value.length > 2) {
                        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
                      }
                      updateFormData('phone', value);
                    }}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-500 shadow-md shadow-red-100' : 
                      formData.phone && formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') ? 'border-green-500 shadow-md shadow-green-100' :
                      focusedField === 'phone' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="94 712 345 678"
                  />
                  {/* Phone validation indicator */}
                  {formData.phone && formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') && (
                    <div className="absolute right-3 top-3">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Sri Lankan mobile number starting with 94</p>
                  {formData.phone && (
                    <p className={`text-xs ${
                      formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }`}>
                      {formData.phone.replace(/\D/g, '').length}/11 digits
                    </p>
                  )}
                </div>
                {formData.phone && formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') && !errors.phone && (
                  <p className="text-green-600 text-sm mt-1 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Valid phone number!</span>
                  </p>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Details</h2>
              <p className="text-gray-600">Tell us where you're located</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      updateFormData('location', e.target.value);
                      setShowLocationSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      setFocusedField('location');
                      setShowLocationSuggestions(formData.location.length > 0);
                    }}
                    onBlur={() => {
                      setFocusedField(null);
                      // Delay hiding suggestions to allow selection
                      setTimeout(() => setShowLocationSuggestions(false), 200);
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.location ? 'border-red-500 shadow-md shadow-red-100' : 
                      focusedField === 'location' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="City, District (e.g., Colombo, Western)"
                  />
                  
                  {/* Location suggestions dropdown */}
                  {showLocationSuggestions && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {sriLankanCities
                        .filter(city => 
                          city.toLowerCase().includes(formData.location.toLowerCase())
                        )
                        .slice(0, 6)
                        .map((city, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => {
                              updateFormData('location', city);
                              setShowLocationSuggestions(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{city}</span>
                            </div>
                          </button>
                        ))
                      }
                      {sriLankanCities.filter(city => 
                        city.toLowerCase().includes(formData.location.toLowerCase())
                      ).length === 0 && formData.location.length > 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No matching locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.address ? 'border-red-500 shadow-md shadow-red-100' : 
                      focusedField === 'address' ? 'border-blue-400 shadow-md shadow-blue-100' :
                      'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Street address (optional)"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
              <p className="text-gray-600">Customize your experience</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="group flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Receive updates about your account activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => updateFormData('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="group flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-purple-200 bg-gradient-to-r from-purple-50/50 to-transparent">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      Marketing Communications
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Receive tips, updates, and special offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketing}
                      onChange={(e) => updateFormData('marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-100 rounded-full translate-y-8 -translate-x-8 opacity-30"></div>
                <div className="relative">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-full mr-3">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium text-green-800">Almost done!</h3>
                  </div>
                  <p className="text-sm text-green-700 mt-2 leading-relaxed">
                    Review your information and click "Create Account" to complete your registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
            style: {
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#065f46',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
            style: {
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
            },
          },
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {[...Array(totalSteps)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index + 1 <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-110' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1 <= currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                    index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {['Account', 'Personal', 'Location', 'Finish'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 border border-white/50">
            <div className={`transition-all duration-500 ease-in-out transform ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md transform hover:scale-105'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Check className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
