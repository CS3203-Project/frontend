import { useState } from 'react';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight, Shield, Star } from 'lucide-react';
import { ShootingStars } from '../components/ui/shooting-stars';

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
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background with stars */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]" />
        <div className="stars-background absolute inset-0" />
      </div>

      {/* Multiple shooting star layers with different colors and speeds */}
      <ShootingStars
        starColor="#9E00FF"
        trailColor="#2EB9DF"
        minSpeed={15}
        maxSpeed={35}
        minDelay={1000}
        maxDelay={3000}
      />
      <ShootingStars
        starColor="#FF0099"
        trailColor="#FFB800"
        minSpeed={10}
        maxSpeed={25}
        minDelay={2000}
        maxDelay={4000}
      />
      <ShootingStars
        starColor="#00FF9E"
        trailColor="#00B8FF"
        minSpeed={20}
        maxSpeed={40}
        minDelay={1500}
        maxDelay={3500}
      />

      {/* CSS for twinkling stars background */}
      <style>{`
        .stars-background {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.5;
        }

        @keyframes twinkle {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>

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
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Welcome Content */}
          <div className="hidden lg:flex flex-col justify-center items-center text-center p-8">
            <div className="relative">
              {/* Glowing Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-black/20 dark:border-white/20 text-gray-700 dark:text-gray-300 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/60 dark:bg-white/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white"></span>
                </span>
                Secure Platform
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white mb-6 leading-tight">
                Welcome Back to
                <span className="block bg-gradient-to-r from-black/80 to-black/40 dark:from-white/80 dark:to-white/40 bg-clip-text text-transparent">
                  Zia
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Continue your journey with trusted professionals and exceptional services
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                <div className="flex items-center p-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-black/10 dark:border-white/10">
                  <div className="p-2 bg-black/10 dark:bg-white/10 rounded-lg mr-4">
                    <Shield className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-black dark:text-white font-medium">Secure & Trusted</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Verified professionals</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-black/10 dark:border-white/10">
                  <div className="p-2 bg-black/10 dark:bg-white/10 rounded-lg mr-4">
                    <Star className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-black dark:text-white font-medium">Quality Services</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Rated by community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Glass Card Container */}
              <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 dark:from-white/5 via-transparent to-gray-200/30 dark:to-white/5 pointer-events-none" />
                
                {/* Logo */}
                <div className="relative z-10 text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg">
                    <img src="/logo_svg_only_light.svg" alt="Logo" className="h-20 w-20" />
                  </div>
                  <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Sign In</h2>
                  <p className="text-gray-600 dark:text-gray-400">Welcome back! Please enter your details</p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 backdrop-blur-sm border rounded-xl text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 ${
                          error ? 'border-red-500/50 focus:ring-red-500' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'
                        }`}
                        placeholder="name@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-white/5 backdrop-blur-sm border rounded-xl text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200 ${
                          error ? 'border-red-500/50 focus:ring-red-500' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'
                        }`}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-black dark:text-white focus:ring-black dark:focus:ring-white focus:ring-offset-0" 
                        />
                        Remember me
                      </label>
                      <a href="/forgot" className="text-black dark:text-white font-medium hover:underline transition-colors">
                        Forgot Password?
                      </a>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                      <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden"
                  >
                    <div className="w-full flex items-center justify-center px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-black/25 dark:hover:shadow-white/25 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02]">
                      {isLoading ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-black dark:bg-white opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <a href="/signup" className="text-black dark:text-white font-semibold hover:underline transition-colors">
                        Sign up
                      </a>
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center leading-relaxed">
                    By signing in, you agree to our{' '}
                    <a className="underline hover:text-gray-700 dark:hover:text-gray-400 transition-colors" href="/terms">Terms of Service</a> and{' '}
                    <a className="underline hover:text-gray-700 dark:hover:text-gray-400 transition-colors" href="/privacy">Privacy Policy</a>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
