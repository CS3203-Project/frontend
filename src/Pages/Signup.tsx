import { useEffect, useMemo, useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Home, Check, Eye, EyeOff, Loader, ArrowRight, Sparkles, Shield, Star, Users, Zap, Heart, Award, TrendingUp, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Orb from '../components/Orb';
import { userApi, type RegisterUserData } from '../api/userApi';

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

const sriLankanCities = [
  'Colombo, Western',
  'Kandy, Central',
  'Galle, Southern',
  'Jaffna, Northern',
  'Negombo, Western',
  'Anuradhapura, North Central',
  'Batticaloa, Eastern',
  'Matara, Southern',
  'Kurunegala, North Western',
  'Ratnapura, Sabaragamuwa',
  'Badulla, Uva',
  'Trincomalee, Eastern',
  'Nuwara Eliya, Central',
  'Kalutara, Western',
  'Polonnaruwa, North Central',
];

export default function SignupForm() {
  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Debounced email existence check
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
        setEmailCheckLoading(true);
        setEmailExists(null);
        try {
          const result = await userApi.checkEmailExists(formData.email);
          setEmailExists(result.exists);
          if (result.exists) {
            setErrors((prev) => ({
              ...prev,
              email: 'This email is already registered. Please use a different email or try logging in.',
            }));
          } else {
            setErrors((prev) => {
              const ne = { ...prev };
              if (
                ne.email === 'This email is already registered. Please use a different email or try logging in.' ||
                ne.email === 'Email is already registered'
              ) {
                delete ne.email;
              }
              return ne;
            });
          }
        } catch {
          // silent for probe errors
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        setEmailExists(null);
      }
    };
    const t = setTimeout(checkEmail, 800);
    return () => clearTimeout(t);
  }, [formData.email]);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((p) => ({ ...p, [field]: value as any }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Per-step validation (pure)
  const getStepErrors = (step: number): Record<string, string> => {
    const ne: Record<string, string> = {};
    if (step === 1) {
      if (!formData.email) ne.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) ne.email = 'Email is invalid';
      if (emailExists === true) ne.email = 'Email is already registered';

      if (!formData.password) ne.password = 'Password is required';
      else if (formData.password.length < 6) ne.password = '⚠️ Password must have at least 6 characters. Currently: ' + formData.password.length;
      else if (formData.password.length === 6) ne.password = '⚠️ Password must be more than 6 characters for security';
      else if (formData.password.length < 8) ne.password = '⚠️ Recommendation: Consider using at least 8 characters for better security';

      if (!formData.confirmPassword) ne.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) ne.confirmPassword = 'Passwords do not match';
    }
    if (step === 2) {
      if (!formData.firstName) ne.firstName = 'First name is required';
      if (!formData.lastName) ne.lastName = 'Last name is required';
      if (!formData.phone) ne.phone = 'Phone number is required';
      else {
        const clean = formData.phone.replace(/\D/g, '');
        if (!/^94\d{9}$/.test(clean)) {
          ne.phone = 'Phone must start with 94 and be exactly 11 digits (e.g., 94712345678)';
        }
      }
    }
    if (step === 3) {
      if (!formData.location) ne.location = 'Location is required';
    }
    return ne;
  };

  const validateStepAndTouch = (step: number) => {
    const ne = getStepErrors(step);
    setErrors(ne);
    return Object.keys(ne).length === 0;
  };

  const canProceed = useMemo(
    () => Object.keys(getStepErrors(currentStep)).length === 0,
    [formData, emailExists, currentStep]
  );

  const nextStep = () => {
    if (validateStepAndTouch(currentStep)) setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStepAndTouch(currentStep)) return;
    setIsLoading(true);
    try {
      const payload: RegisterUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        location: formData.location,
        phone: formData.phone.replace(/\D/g, ''),
        address: formData.address || undefined,
      };
      await userApi.register(payload);
      toast.success('🎉 Account created successfully! Welcome aboard!');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1000);
    } catch (e: any) {
      toast.error(e?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Small, fixed-height sections per step (no scroll on desktop)
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="name@email.com"
                />
                <div className="absolute right-4 top-4 h-5 w-5 flex items-center justify-center">
                  {emailCheckLoading ? (
                    <Loader className="h-4 w-4 animate-spin text-gray-400" />
                  ) : emailExists === false ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : emailExists === true ? (
                    <span className="h-2 w-2 bg-red-400 rounded-full" />
                  ) : null}
                </div>
              </div>
              {errors.email && (
                <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.email}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-4 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password feedback */}
              {formData.password && (
                <div className="mt-2 text-xs text-gray-400">
                  Characters: {formData.password.length} {formData.password.length < 6 ? '(Need at least 6)' : ''}
                </div>
              )}
              {errors.password && (
                <div className={`mt-2 p-3 border-l-4 rounded-lg backdrop-blur-sm ${
                  formData.password && formData.password.length < 6 
                    ? 'bg-red-500/20 border-red-500' 
                    : 'bg-red-500/10 border-red-400'
                }`}>
                  <p className={`text-sm font-semibold flex items-center ${
                    formData.password && formData.password.length < 6 
                      ? 'text-red-300' 
                      : 'text-red-400'
                  }`}>
                    <span className="mr-2 text-lg">
                      {formData.password && formData.password.length < 6 ? '🚨' : '⚠️'}
                    </span>
                    {errors.password}
                  </p>
                </div>
              )}
              {!errors.password && formData.password && formData.password.length > 6 && (
                <div className="mt-2 p-3 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-medium flex items-center">
                    <span className="mr-2">✅</span>
                    Password is strong enough
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-4 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-12 top-4">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.firstName ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{errors.firstName}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.lastName ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{errors.lastName}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 0 && !value.startsWith('94')) value = '94' + value;
                    if (value.length > 11) value = value.slice(0, 11);
                    if (value.length > 2) value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
                    updateFormData('phone', value);
                  }}
                  className={`w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="94 712 345 678"
                />
                {formData.phone && formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') && (
                  <div className="absolute right-4 top-4">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.phone && (
                <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.phone}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => {
                    updateFormData('location', e.target.value);
                    setShowLocationSuggestions(e.target.value.length > 0);
                  }}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 180)}
                  onFocus={() => setShowLocationSuggestions(!!formData.location)}
                  className={`w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.location ? 'border-red-500/50 focus:ring-red-500' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="City, District (e.g., Colombo, Western)"
                />
                {showLocationSuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {sriLankanCities
                      .filter((c) => c.toLowerCase().includes(formData.location.toLowerCase()))
                      .slice(0, 6)
                      .map((city, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl text-white"
                          onClick={() => {
                            updateFormData('location', city);
                            setShowLocationSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{city}</span>
                          </div>
                        </button>
                      ))}
                    {sriLankanCities.filter((c) => c.toLowerCase().includes(formData.location.toLowerCase())).length === 0 &&
                      formData.location.length > 0 && (
                        <div className="px-4 py-3 text-gray-400 text-sm">No matching locations found</div>
                      )}
                  </div>
                )}
              </div>
              {errors.location && (
                <div className="mt-2 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.location}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address (Optional)</label>
              <div className="relative">
                <Home className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl text-white placeholder-gray-400 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Street address (optional)"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-full mr-3">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-green-300">Almost done!</h3>
              </div>
              <p className="text-sm text-green-200 mt-2">
                Review your information and use the button on the right panel to create your account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Email:</span> <span className="font-medium text-white">{formData.email || '-'}</span></div>
              <div><span className="text-gray-400">Name:</span> <span className="font-medium text-white">{formData.firstName} {formData.lastName}</span></div>
              <div><span className="text-gray-400">Phone:</span> <span className="font-medium text-white">{formData.phone || '-'}</span></div>
              <div><span className="text-gray-400">Location:</span> <span className="font-medium text-white">{formData.location || '-'}</span></div>
              {formData.address && (
                <div className="col-span-2"><span className="text-gray-400">Address:</span> <span className="font-medium text-white">{formData.address}</span></div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative">
      {/* Animated Orb Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 opacity-40">
          <Orb hue={280} hoverIntensity={0.4} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/6 w-80 h-80 opacity-30">
          <Orb hue={200} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 opacity-25">
          <Orb hue={320} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm animate-pulse border border-white/10" />
      <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm animate-pulse delay-1000 border border-white/10" />
      <div className="absolute top-1/2 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm animate-pulse delay-500 border border-white/10" />

      <Toaster 
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Glass Card Container */}
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 pointer-events-none" />
                
                {/* Logo */}
                <div className="relative z-10 text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r  rounded-2xl mb-4 shadow-lg">
                    <img src="/logo_svg_only_light.svg" alt="Logo" className="h-20 w-20" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {['Create Account', 'Personal Info', 'Set Location', 'Review & Finish'][currentStep - 1]}
                  </h2>
                  <p className="text-gray-400">
                    {['Join our community today', 'Tell us about yourself', 'Where are you located?', 'Almost done!'][currentStep - 1]}
                  </p>
                </div>

                <div className="relative z-10">
                  {renderStep()}
                </div>

                {/* Footer link */}
                <div className="relative z-10 pt-6 text-center">
                  <p className="text-gray-400">
                    Already have an account?{' '}
                    <a href="/signin" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors">
                      Sign in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Welcome Panel */}
          <div className="hidden lg:flex flex-col justify-center items-center text-center p-8">
            <div className="w-full max-w-lg space-y-8">
              
              {/* Welcome Header */}
              <div className="relative">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  Join Our Community
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  Welcome to
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Your Platform
                  </span>
                </h1>

                <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                  Connect with trusted professionals and discover exceptional services in your area
                </p>
              </div>

              {/* Interactive Feature Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                      <Shield className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold mb-1">Verified Professionals</h3>
                      <p className="text-gray-400 text-sm">All service providers are thoroughly vetted and verified</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <Star className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold mb-1">Quality Guarantee</h3>
                      <p className="text-gray-400 text-sm">Rated and reviewed by our community members</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                      <Zap className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold mb-1">Instant Booking</h3>
                      <p className="text-gray-400 text-sm">Book services instantly with real-time availability</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">1K+</div>
                  <div className="text-xs text-gray-400">Verified Pros</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">5K+</div>
                  <div className="text-xs text-gray-400">Happy Clients</div>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">4.9</div>
                  <div className="text-xs text-gray-400">Avg Rating</div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out ${
                      currentStep === 1 ? 'w-1/4' :
                      currentStep === 2 ? 'w-2/4' :
                      currentStep === 3 ? 'w-3/4' : 'w-full'
                    }`}
                  ></div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1 || isLoading}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentStep === 1 || isLoading
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-white hover:bg-white/10 hover:text-purple-300'
                    }`}
                  >
                    <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                    Back
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      onClick={nextStep}
                      disabled={!canProceed || isLoading}
                      className={`group relative overflow-hidden flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        !canProceed || isLoading
                          ? 'bg-white/20 text-white/60 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
                      }`}
                    >
                      {!canProceed || isLoading ? (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed || isLoading}
                      className={`group relative overflow-hidden flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        !canProceed || isLoading
                          ? 'bg-white/20 text-white/60 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : !canProceed ? (
                        <>
                          Create Account
                          <Check className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Create Account
                          <Check className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Floating Accents */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
