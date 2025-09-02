import { useEffect, useMemo, useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Home, Check, Eye, EyeOff, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import StepMedia from '../components/StepMedia';
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
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="name@email.com"
                />
                <div className="absolute right-3 top-3 h-5 w-5 flex items-center justify-center">
                  {emailCheckLoading ? (
                    <Loader className="h-4 w-4 animate-spin text-gray-600" />
                  ) : emailExists === false ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : emailExists === true ? (
                    <span className="h-2 w-2 bg-red-500 rounded-full" />
                  ) : null}
                </div>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password feedback */}
              {formData.password && (
                <div className="mt-2 text-xs text-gray-500">
                  Characters: {formData.password.length} {formData.password.length < 6 ? '(Need at least 6)' : ''}
                </div>
              )}
              {errors.password && (
                <div className={`mt-2 p-3 border-l-4 rounded-lg animate-pulse ${
                  formData.password && formData.password.length < 6 
                    ? 'bg-red-100 border-red-600' 
                    : 'bg-red-50 border-red-400'
                }`}>
                  <p className={`text-sm font-semibold flex items-center ${
                    formData.password && formData.password.length < 6 
                      ? 'text-red-800' 
                      : 'text-red-700'
                  }`}>
                    <span className="mr-2 text-lg">
                      {formData.password && formData.password.length < 6 ? '🚨' : '⚠️'}
                    </span>
                    {errors.password}
                  </p>
                </div>
              )}
              {!errors.password && formData.password && formData.password.length > 6 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm font-medium flex items-center">
                    <span className="mr-1">✅</span>
                    Password is strong enough
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-10 top-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="94 712 345 678"
                />
                {formData.phone && formData.phone.replace(/\D/g, '').length === 11 && formData.phone.replace(/\D/g, '').startsWith('94') && (
                  <div className="absolute right-3 top-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500 z-10" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => {
                    updateFormData('location', e.target.value);
                    setShowLocationSuggestions(e.target.value.length > 0);
                  }}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 180)}
                  onFocus={() => setShowLocationSuggestions(!!formData.location)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City, District (e.g., Colombo, Western)"
                />
                {showLocationSuggestions && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {sriLankanCities
                      .filter((c) => c.toLowerCase().includes(formData.location.toLowerCase()))
                      .slice(0, 6)
                      .map((city, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
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
                        <div className="px-4 py-2 text-gray-500 text-sm">No matching locations found</div>
                      )}
                  </div>
                )}
              </div>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Address (Optional)</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 border-gray-300"
                  placeholder="Street address (optional)"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="rounded-xl p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-full mr-3">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-green-800">Almost done!</h3>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Review your information and use the button on the right panel to create your account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email || '-'}</span></div>
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{formData.phone || '-'}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{formData.location || '-'}</span></div>
              {formData.address && (
                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{formData.address}</span></div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Create your account', 'Tell us about you', 'Set your location', 'Review & finish'];
  const stepSubtitles = [
    'Enter your credentials to get started',
    'We use this to personalize your experience',
    'Find services near you',
    'Confirm details and create account',
  ];

  return (
    <div className="h-svh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full-page background video like login */}
      <div className="absolute inset-0 z-0">
        <video className="h-full w-full object-cover opacity-10" autoPlay loop muted playsInline>
          <source src="/media/profile.webm" type="video/webm" />
          <source src="/media/profile.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <Toaster />

      {/* Card/grid: fills viewport height */}
      <div className="w-full max-w-6xl h-full grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative z-10">
        {/* Left: Form (no scroll on desktop—keep content compact) */}
        <div className="p-8 md:p-10 lg:p-12 flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <img src="/logo_svg_dark.svg" alt="Logo" className="h-40 w-auto" />
          </div>

          {/* Title changes with step */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{['Account', 'Personal Info', 'Location', 'Finish'][currentStep - 1]}</h2>
            <p className="text-gray-600 text-sm">
              {['Enter your credentials', 'Tell us about you', 'Where are you located?', 'Review & confirm'][currentStep - 1]}
            </p>
          </div>

          {/* Form body */}
          <div className="flex-1">
            {renderStep()}
          </div>

          {/* Footer link */}
          <div className="pt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="text-black-600 hover:text-blue-700 font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Right: One video + indicators + nav buttons */}
        <StepMedia
          currentStep={currentStep}
          totalSteps={totalSteps}
          canProceed={canProceed}
          isLoading={isLoading}
          onPrev={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit}
          video={{ webm: '/media/profile.webm', mp4: '/media/profile.mp4' }}   // <-- single video for all steps
          poster="/media/profile-poster.png"
          stepTitles={stepTitles}
          stepSubtitles={stepSubtitles}
          logoLightSrc="/logo_svg_only_light.svg"
        />
      </div>
    </div>
  );
}
