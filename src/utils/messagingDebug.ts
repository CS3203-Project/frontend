// Debugging utilities for messaging issues
export const clearMessagingState = () => {
  // Clear any potential localStorage/sessionStorage state
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('conversation') || key.includes('message') || key.includes('user')) {
      console.log('Clearing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.includes('conversation') || key.includes('message') || key.includes('user')) {
      console.log('Clearing sessionStorage key:', key);
      sessionStorage.removeItem(key);
    }
  });
};

export const logCurrentUser = () => {
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  console.log('Current auth token:', authToken ? 'Present' : 'Missing');
  
  if (authToken) {
    try {
      // Decode JWT payload (without verification, just for debugging)
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      console.log('Token payload:', payload);
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }
};

export const debugMessagingState = () => {
  console.log('=== MESSAGING DEBUG ===');
  logCurrentUser();
  clearMessagingState();
  console.log('State cleared. Please refresh the page.');
};
