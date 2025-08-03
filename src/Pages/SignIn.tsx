
import { useState } from 'react';
import { userApi } from '../api/userApi';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, Loader, Check } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await userApi.login({ email, password });
      console.log('Full API response:', result);
      console.log('Type of result:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
      console.log('Token value:', result?.token);
      console.log('Token type:', typeof result?.token);
      
      if (result && result.token) {
        toast.success('Signed in successfully!');
        localStorage.setItem('token', result.token);
        console.log('Login token:', result.token);
        console.log('Token stored in localStorage:', localStorage.getItem('token'));
        setTimeout(() => {
          window.location.href = '/'; // Redirect to homepage or dashboard
        }, 2000);
      } else {
        console.log('Login failed - no token in response');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster />
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <Lock className="h-5 w-5" /> : <Loader className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <Check className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
