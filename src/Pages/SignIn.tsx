import { useState } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await userApi.login({ email, password });
      if (result && result.token) {
        toast.success('Signed in successfully!');
        localStorage.setItem('token', result.token);
        
        // Get user profile and update AuthContext
        try {
          const userData = await userApi.getProfile();
          login(userData); // Update AuthContext with user data
        } catch (profileError) {
          console.error('Failed to fetch user profile after login:', profileError);
        }
        
        setTimeout(() => (window.location.href = '/'), 1200);
      } else {
        setError(result?.message || 'Sign in failed');
        toast.error(result?.message || 'Sign in failed');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-svh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover opacity-10"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/media/intro.webm" type="video/webm" />
          <source src="/media/intro.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <Toaster />

      <div className="w-full max-w-6xl h-full grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative z-10">
        {/* Left: Form */}
        <div className="p-8 md:p-12 lg:p-16 overflow-y-auto">
          {/* Logo */}
          <div className=" flex items-center justify-center md:justify-start">
            <img src="/logo_svg_dark.svg" alt="Logo" className="h-30 w-auto" />
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Please enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  Remember me
                </label>
                <a href="/forgot" className="text-black hover:text-gray-700 font-medium transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-xl -mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transform hover:scale-[1.01] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                </>
              )}
            </button>

            

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By creating an account, you agree to our{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="/terms">Terms of Service</a> and{' '}
              <a className="underline hover:text-gray-700 transition-colors" href="/privacy">Privacy Policy</a>.
            </p>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-700">
              Don't have an account?{' '}
              <a href="/signup" className="text-black hover:text-gray-700 font-semibold hover:underline transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Right: Video Side Panel */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
          <div className="relative w-full h-full max-w-sm">
            {/* Main Video Container (fills height) */}
            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm border border-white/10">
              <video
                className="h-full w-full object-contain bg-black"
                autoPlay
                loop
                muted
                playsInline
                poster="/media/intro-poster.png"
              >
                <source src="/media/intro.webm" type="video/webm" />
                <source src="/media/intro.mp4" type="video/mp4" />
              </video>

              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              
              {/* Content Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">

                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">Explore the Experts</h3>
                <p className="text-sm text-white/90 mb-4 drop-shadow">A global marketplace where your skills find the right audience, and every project becomes an opportunity to grow.</p>


              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm animate-pulse delay-1000" />
          </div>
        </div>
      </div>
    </div>
  );
}
