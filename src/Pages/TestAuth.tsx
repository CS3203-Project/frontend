import { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';

export default function TestAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const testLogin = () => {
    // Simulate a token storage
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzIyNTk1MjAwLCJleHAiOjE3MjI1OTg4MDB9.test';
    localStorage.setItem('token', testToken);
    setToken(testToken);
  };

  const testProfileFetch = async () => {
    try {
      const response = await userApi.getProfile();
      setUser(response.user);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Current Token:</h2>
            <p className="text-sm bg-gray-100 p-2 rounded break-all">
              {token || 'No token stored'}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Current User:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {user ? JSON.stringify(user, null, 2) : 'No user data'}
            </pre>
          </div>

          {error && (
            <div>
              <h2 className="text-lg font-medium mb-2 text-red-600">Error:</h2>
              <p className="text-sm bg-red-100 p-2 rounded text-red-800">
                {error}
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Test Token
            </button>
            <button
              onClick={testProfileFetch}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Profile Fetch
            </button>
            <button
              onClick={clearToken}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
