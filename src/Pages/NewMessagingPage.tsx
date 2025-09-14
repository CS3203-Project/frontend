import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MessagingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get('conversation');

  useEffect(() => {
    // Redirect to the new conversation structure
    if (conversationId) {
      // If there's a specific conversation, go directly to it
      navigate(`/conversation/${conversationId}`, { replace: true });
    } else {
      // Otherwise, go to the conversation hub
      navigate('/conversation-hub', { replace: true });
    }
  }, [conversationId, navigate]);

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to messaging...</p>
      </div>
    </div>
  );
};

export default MessagingPage;
