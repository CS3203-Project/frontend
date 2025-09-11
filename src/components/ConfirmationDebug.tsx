import React from 'react';

interface ConfirmationDebugProps {
  conversationId: string;
  record: any;
}

const ConfirmationDebug: React.FC<ConfirmationDebugProps> = ({ conversationId, record }) => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-purple-900 bg-opacity-90 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2 text-purple-200">Confirmation Debug</h4>
      <div className="space-y-1">
        <div><span className="text-purple-300">Conversation:</span> {conversationId.slice(0, 8)}...</div>
        <div><span className="text-purple-300">Customer:</span> {record?.customerConfirmation ? '✅' : '❌'}</div>
        <div><span className="text-purple-300">Provider:</span> {record?.providerConfirmation ? '✅' : '❌'}</div>
        <div><span className="text-purple-300">Fee:</span> {record?.serviceFee || 'Not set'}</div>
        <div><span className="text-purple-300">Last Update:</span> {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default ConfirmationDebug;
