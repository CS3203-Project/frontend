import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios'; // Import the configured axios instance
import type { SearchUser } from '../../api/chatApi';
import { debounce } from 'lodash';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: SearchUser) => void;
  token: string; // Token is now handled by the interceptor, but we can keep it for now
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function will be debounced
  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Use the apiClient which has the interceptor
      const response = await apiClient.get(
        `/users/search?q=${searchQuery}`
      );
      setResults(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to search for users. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a debounced version of the search function
  const debouncedSearch = useCallback(debounce(searchUsers, 300), []);

  useEffect(() => {
    // Call the debounced function when the query changes
    debouncedSearch(query);
    
    // Cleanup the debounced function on component unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (user: SearchUser) => {
    onSelectUser(user);
    setQuery(''); // Reset query after selection
    setResults([]); // Clear results
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300"
         onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300"
           onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Start a New Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
            autoFocus
          />
        </div>
        <div className="px-4 pb-4 h-64 overflow-y-auto">
          {isLoading && <div className="text-center p-4 text-gray-500">Loading...</div>}
          {error && <div className="text-center p-4 text-red-500">{error}</div>}
          {!isLoading && !error && results.length === 0 && query.length > 1 && (
            <div className="text-center p-4 text-gray-500">No users found.</div>
          )}
          <ul className="divide-y divide-gray-200">
            {results.map((user) => (
              <li
                key={user.id}
                onClick={() => handleSelect(user)}
                className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors rounded-md"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
