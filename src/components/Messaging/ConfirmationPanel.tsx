import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import confirmationApi from '../../api/confirmationApi';
import type { ConversationConfirmation } from '../../types/confirmation';
import { useConfirmationSocket } from '../../hooks/useConfirmationSocket';
import { useAuth } from '../../contexts/AuthContext';

type Role = 'USER' | 'PROVIDER' | string;

interface Props {
  conversationId: string;
  currentUserRole: Role;
}

const ConfirmationPanel: React.FC<Props> = ({ conversationId, currentUserRole }) => {
  const { user } = useAuth();
  const [record, setRecord] = useState<ConversationConfirmation | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [serviceFeeInput, setServiceFeeInput] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const isCustomer = currentUserRole === 'USER';
  const isProvider = currentUserRole === 'PROVIDER';

  // Clear state when conversation changes
  useEffect(() => {
    if (conversationId !== currentConversationId) {
      setRecord(null);
      setServiceFeeInput('');
      setHasUnsavedChanges(false);
      setSaving(false);
      setCurrentConversationId(conversationId);
    }
  }, [conversationId, currentConversationId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rec = await confirmationApi.ensure(conversationId);
        if (mounted && conversationId === currentConversationId) {
          setRecord(rec);
          setServiceFeeInput(rec.serviceFee?.toString() || '');
        }
      } catch (e) {
        console.error('Failed to load confirmation record:', e);
      }
    })();
    return () => { 
      mounted = false;
    };
  }, [conversationId, currentConversationId]);

  // Function to save service fee (called on Enter or blur)
  const saveServiceFee = async () => {
    if (!record || !isProvider) return;
    
    setSaving(true);
    setHasUnsavedChanges(false);
    
    try {
      const patch: Partial<ConversationConfirmation> = {};
      
      if (serviceFeeInput === '') {
        patch.serviceFee = null;
      } else {
        const numValue = parseFloat(serviceFeeInput);
        if (!isNaN(numValue) && numValue >= 0) {
          patch.serviceFee = numValue;
        } else {
          // Invalid input, revert to current value
          setServiceFeeInput(record.serviceFee?.toString() || '');
          setSaving(false);
          return;
        }
      }
      
      const updated = await confirmationApi.upsert(conversationId, patch);
      setRecord(updated);
      setServiceFeeInput(updated.serviceFee?.toString() || '');
    } catch (e) {
      console.error('Failed to update service fee', e);
      // Revert to previous value on error
      setServiceFeeInput(record.serviceFee?.toString() || '');
    } finally {
      setSaving(false);
    }
  };

  const update = async (patch: Partial<ConversationConfirmation>) => {
    if (!record) return;
    setSaving(true);
    try {
      const updated = await confirmationApi.upsert(conversationId, patch);
      setRecord(updated);
    } catch (e) {
      console.error('Failed to update confirmation', e);
    } finally {
      setSaving(false);
    }
  };

  useConfirmationSocket(conversationId, (confirmation) => {
    // Only update if it's for the current conversation
    if (confirmation.conversationId === conversationId) {
      setRecord(confirmation);
      setServiceFeeInput(confirmation.serviceFee?.toString() || '');
    }
  }, user?.id || '');

  if (!record) return null;

  const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
  const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

  // Calculate confirmation status
  const bothConfirmed = record.customerConfirmation && record.providerConfirmation;
  const partialConfirmed = record.customerConfirmation || record.providerConfirmation;
  const hasDateTime = record.startDate && record.endDate;
  const hasServiceFee = record.serviceFee !== null && record.serviceFee !== undefined && record.serviceFee > 0;
  const isComplete = bothConfirmed && hasDateTime && (isProvider ? hasServiceFee : true); // Provider must set fee for completion

  // Status indicator
  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (partialConfirmed) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isComplete) return 'Booking Confirmed';
    if (isProvider && !hasServiceFee && (partialConfirmed || hasDateTime)) return 'Set Service Fee';
    if (partialConfirmed) return 'Pending Confirmation';
    return 'Awaiting Confirmation';
  };

  const getStatusColor = () => {
    if (isComplete) return 'bg-green-50 border-green-200';
    if (partialConfirmed) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Minimized floating view
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg border p-3 max-w-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div className="flex-1">
              <span className="text-sm font-medium block">{getStatusText()}</span>
              {hasServiceFee && (
                <span className="text-xs text-gray-600">
                  {record.currency} {record.serviceFee?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {!isComplete && (
          <div className="text-xs text-gray-500 mt-1">
            {isProvider && !hasServiceFee ? 'Set service fee to continue' : 'Click to expand and confirm booking'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`sticky top-0 z-10 border-b border-gray-200 ${getStatusColor()} transition-all duration-300`}>
      {/* Header with status and controls */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-gray-800">{getStatusText()}</h3>
            {saving && (
              <div className="flex items-center space-x-1 text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-xs">Saving...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Minimize"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center space-x-4 mt-2 flex-wrap">
          <div className={`flex items-center space-x-1 text-xs ${record.customerConfirmation ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${record.customerConfirmation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Customer</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${record.providerConfirmation ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${record.providerConfirmation ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Provider</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${hasDateTime ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${hasDateTime ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Schedule</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${hasServiceFee ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${hasServiceFee ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Service Fee</span>
          </div>
        </div>
      </div>

      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-[500px]'}`}>
        <div className="px-4 pb-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={!!record.customerConfirmation}
                disabled={!isCustomer || saving}
                onChange={(e) => update({ customerConfirmation: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Customer Confirmation</span>
              {isCustomer && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">You</span>
              )}
            </label>

            <label className="flex items-center space-x-3 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={!!record.providerConfirmation}
                disabled={!isProvider || saving}
                onChange={(e) => update({ providerConfirmation: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Provider Confirmation</span>
              {isProvider && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">You</span>
              )}
            </label>

            {/* Service Fee - Only for Providers */}
            <div className={`md:col-span-2 bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${!isProvider ? 'bg-gray-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-600">
                  Service Fee
                  {isProvider && <span className="text-red-500 ml-1">*</span>}
                </label>
                {!isProvider && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Provider Only</span>
                )}
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !isProvider ? 'bg-gray-100 cursor-not-allowed' : ''
                    } ${hasUnsavedChanges ? 'border-yellow-400 bg-yellow-50' : ''}`}
                    value={serviceFeeInput}
                    disabled={!isProvider || saving}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setServiceFeeInput(inputValue);
                      setHasUnsavedChanges(inputValue !== (record?.serviceFee?.toString() || ''));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveServiceFee();
                      }
                    }}
                    onBlur={() => {
                      if (hasUnsavedChanges) {
                        saveServiceFee();
                      }
                    }}
                  />
                  {hasUnsavedChanges && !saving && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center space-x-1 text-xs text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span>Press Enter</span>
                      </div>
                    </div>
                  )}
                </div>
                {hasUnsavedChanges && isProvider && (
                  <button
                    onClick={saveServiceFee}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
                <select
                  className={`border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isProvider ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  value={record.currency || 'USD'}
                  disabled={!isProvider || saving}
                  onChange={(e) => update({ currency: e.target.value })}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="LKR">LKR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              {isProvider && (
                <div className="mt-2 text-xs text-gray-500">
                  💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 border rounded">Enter</kbd> or click outside to save your changes
                </div>
              )}
              {isProvider && !hasServiceFee && (
                <p className="text-xs text-orange-600 mt-2 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Please set the service fee to complete the booking</span>
                </p>
              )}
              {!isProvider && hasServiceFee && (
                <p className="text-sm text-green-700 mt-2 font-medium">
                  {record.currency} {record.serviceFee?.toFixed(2)}
                </p>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-sm font-medium text-gray-600 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={toLocalInput(record.startDate)}
                disabled={saving}
                onChange={(e) => update({ startDate: fromLocalInput(e.target.value) })}
              />
            </div>

            <div className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-sm font-medium text-gray-600 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={toLocalInput(record.endDate)}
                disabled={saving}
                onChange={(e) => update({ endDate: fromLocalInput(e.target.value) })}
              />
            </div>
          </div>

          {/* Summary when complete */}
          {isComplete && (
            <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-green-800 text-lg">Booking Confirmed!</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-green-800">Service Fee:</span>
                  <span className="text-green-700 ml-2">
                    {record.currency} {record.serviceFee?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-green-800">Duration:</span>
                  <span className="text-green-700 ml-2">
                    {record.startDate && record.endDate && 
                      `${Math.ceil((new Date(record.endDate).getTime() - new Date(record.startDate).getTime()) / (1000 * 60 * 60))} hours`
                    }
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-green-800">Scheduled:</span>
                  <span className="text-green-700 ml-2">
                    {record.startDate && new Date(record.startDate).toLocaleString()} -{' '}
                    {record.endDate && new Date(record.endDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Incomplete warning for provider */}
          {isProvider && !isComplete && (partialConfirmed || hasDateTime) && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Action Required</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {!hasServiceFee ? 'Please set the service fee to complete the booking confirmation.' : 
                 'Please confirm all details to finalize the booking.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPanel;
