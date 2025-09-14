import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Minimize2 } from 'lucide-react';
import confirmationApi from '../../api/confirmationApi';
import type { ConversationConfirmation } from '../../types/confirmation';
import { useConfirmationSocket } from '../../hooks/useConfirmationSocket';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  conversationId: string;
  currentUserRole: 'USER' | 'PROVIDER';
  onReviewClick?: () => void;
}

const ConfirmationPanel: React.FC<Props> = ({ conversationId, currentUserRole, onReviewClick }) => {
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
    if (isComplete) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (partialConfirmed) return <Clock className="h-5 w-5 text-yellow-400" />;
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  };

  const getStatusText = () => {
    if (isComplete) return 'Booking Confirmed';
    if (isProvider && !hasServiceFee && (partialConfirmed || hasDateTime)) return 'Set Service Fee';
    if (partialConfirmed) return 'Pending Confirmation';
    return 'Awaiting Confirmation';
  };

  const getStatusColor = () => {
    if (isComplete) return 'bg-green-500/20 border-green-400/30';
    if (partialConfirmed) return 'bg-yellow-500/20 border-yellow-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  // Minimized floating view
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-black/95 backdrop-blur-xl shadow-2xl rounded-xl border border-white/20 p-4 max-w-xs relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <span className="text-sm font-medium text-white block">{getStatusText()}</span>
              {hasServiceFee && (
                <span className="text-xs text-white/60">
                  {record.currency} {record.serviceFee?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white/70 hover:text-white ml-2 p-1 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {!isComplete && (
          <div className="text-xs text-white/60 mt-2 relative z-10">
            {isProvider && !hasServiceFee ? 'Set service fee to continue' : 'Click to expand and confirm booking'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/60 backdrop-blur-xl transition-all duration-300 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 animate-pulse"></div>
      
      {/* Header with status and controls */}
      <div className={`px-4 py-4 border-b border-white/20 relative z-10 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-white">{getStatusText()}</h3>
            {saving && (
              <div className="flex items-center space-x-1 text-blue-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="text-xs">Saving...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all duration-300"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all duration-300"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center space-x-4 mt-3 flex-wrap">
          <div className={`flex items-center space-x-1 text-xs ${record.customerConfirmation ? 'text-green-400' : 'text-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${record.customerConfirmation ? 'bg-green-400' : 'bg-white/30'}`}></div>
            <span>Customer</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${record.providerConfirmation ? 'text-green-400' : 'text-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${record.providerConfirmation ? 'bg-green-400' : 'bg-white/30'}`}></div>
            <span>Provider</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${hasDateTime ? 'text-green-400' : 'text-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${hasDateTime ? 'bg-green-400' : 'bg-white/30'}`}></div>
            <span>Schedule</span>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${hasServiceFee ? 'text-green-400' : 'text-white/50'}`}>
            <div className={`w-2 h-2 rounded-full ${hasServiceFee ? 'bg-green-400' : 'bg-white/30'}`}></div>
            <span>Service Fee</span>
          </div>
        </div>
      </div>

      {/* Collapsible content - Takes remaining height */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : ''} relative z-10`}>
        <div className="h-full overflow-y-auto px-4 pb-4 pt-4">
          <div className="space-y-6">
            {/* Confirmation Status Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide border-b border-white/20 pb-2">
                Confirmation Status
              </h4>
              
              <label className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <input
                  type="checkbox"
                  checked={!!record.customerConfirmation}
                  disabled={!isCustomer || saving}
                  onChange={(e) => update({ customerConfirmation: e.target.checked })}
                  className="rounded text-blue-500 focus:ring-blue-400 focus:ring-offset-gray-800 bg-white/20 border-white/30 relative z-10"
                />
                <span className="font-medium text-white relative z-10">Customer Confirmation</span>
                {isCustomer && (
                  <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-400/30 relative z-10">You</span>
                )}
              </label>

              <label className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <input
                  type="checkbox"
                  checked={!!record.providerConfirmation}
                  disabled={!isProvider || saving}
                  onChange={(e) => update({ providerConfirmation: e.target.checked })}
                  className="rounded text-blue-500 focus:ring-blue-400 focus:ring-offset-gray-800 bg-white/20 border-white/30 relative z-10"
                />
                <span className="font-medium text-white relative z-10">Provider Confirmation</span>
                {isProvider && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-400/30 relative z-10">You</span>
                )}
              </label>
            </div>

            {/* Service Fee Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide border-b border-white/20 pb-2">
                Service Fee
              </h4>
              
              <div className={`bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group ${!isProvider ? 'opacity-60' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <label className="block text-sm font-medium text-white/90">
                    Amount
                    {isProvider && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {!isProvider && (
                    <span className="text-xs text-white/60 bg-white/20 px-2 py-1 rounded border border-white/30">Provider Only</span>
                  )}
                </div>
                <div className="flex space-x-2 relative z-10">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border border-white/30 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/20 text-white placeholder-white/50 backdrop-blur-sm ${
                        !isProvider ? 'cursor-not-allowed opacity-50' : ''
                      } ${hasUnsavedChanges ? 'border-yellow-400 bg-yellow-500/20' : ''}`}
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
                        <div className="flex items-center space-x-1 text-xs text-yellow-400">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span>Press Enter</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <select
                    className={`border border-white/30 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/20 text-white backdrop-blur-sm ${
                      !isProvider ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    value={record.currency || 'USD'}
                    disabled={!isProvider || saving}
                    onChange={(e) => update({ currency: e.target.value })}
                  >
                    <option value="USD" className="bg-gray-800 text-white">USD</option>
                    <option value="EUR" className="bg-gray-800 text-white">EUR</option>
                    <option value="GBP" className="bg-gray-800 text-white">GBP</option>
                    <option value="LKR" className="bg-gray-800 text-white">LKR</option>
                    <option value="INR" className="bg-gray-800 text-white">INR</option>
                  </select>
                </div>
                {hasUnsavedChanges && isProvider && (
                  <button
                    onClick={saveServiceFee}
                    disabled={saving}
                    className="mt-3 w-full px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent relative z-10"></div>
                        <span className="relative z-10">Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Save Amount</span>
                      </>
                    )}
                  </button>
                )}
                {isProvider && (
                  <div className="mt-2 text-xs text-white/60 relative z-10">
                    💡 Tip: Press <kbd className="px-1 py-0.5 bg-white/20 border border-white/30 rounded text-white/80">Enter</kbd> or click outside to save your changes
                  </div>
                )}
                {isProvider && !hasServiceFee && (
                  <p className="text-xs text-orange-400 mt-2 flex items-center space-x-1 relative z-10">
                    <AlertCircle className="h-3 w-3" />
                    <span>Please set the service fee to complete the booking</span>
                  </p>
                )}
                {!isProvider && hasServiceFee && (
                  <div className="mt-3 p-3 bg-green-500/20 rounded-xl border border-green-400/30 relative z-10">
                    <p className="text-sm text-green-400 font-medium text-center">
                      {record.currency} {record.serviceFee?.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide border-b border-white/20 pb-2">
                Schedule
              </h4>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <label className="block text-sm font-medium text-white/90 mb-2 relative z-10">Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full border border-white/30 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/20 text-white backdrop-blur-sm relative z-10"
                  value={toLocalInput(record.startDate)}
                  disabled={saving}
                  onChange={(e) => update({ startDate: fromLocalInput(e.target.value) })}
                />
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <label className="block text-sm font-medium text-white/90 mb-2 relative z-10">End Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full border border-white/30 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/20 text-white backdrop-blur-sm relative z-10"
                  value={toLocalInput(record.endDate)}
                  disabled={saving}
                  onChange={(e) => update({ endDate: fromLocalInput(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Summary when complete */}
          {isComplete && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-green-400/10 to-green-400/5 animate-pulse rounded-xl"></div>
              <div className="flex items-center space-x-2 mb-3 relative z-10">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="font-semibold text-green-400 text-lg">Booking Confirmed!</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm relative z-10">
                <div>
                  <span className="font-medium text-green-400">Service Fee:</span>
                  <span className="text-white ml-2">
                    {record.currency} {record.serviceFee?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-green-400">Duration:</span>
                  <span className="text-white ml-2">
                    {record.startDate && record.endDate && 
                      `${Math.ceil((new Date(record.endDate).getTime() - new Date(record.startDate).getTime()) / (1000 * 60 * 60))} hours`
                    }
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-green-400">Scheduled:</span>
                  <span className="text-white ml-2">
                    {record.startDate && new Date(record.startDate).toLocaleString()} -{' '}
                    {record.endDate && new Date(record.endDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Incomplete warning for provider */}
          {isProvider && !isComplete && (partialConfirmed || hasDateTime) && (
            <div className="mt-4 p-4 bg-orange-500/20 border border-orange-400/30 rounded-xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-orange-400/10 to-orange-400/5 animate-pulse rounded-xl"></div>
              <div className="flex items-center space-x-2 relative z-10">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="font-medium text-orange-400">Action Required</span>
              </div>
              <p className="text-sm text-white/80 mt-1 relative z-10">
                {!hasServiceFee ? 'Please set the service fee to complete the booking confirmation.' : 
                 'Please confirm all details to finalize the booking.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Button at the bottom */}
      {onReviewClick && (
        <div className="p-4 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm relative z-10">
          <button
            className="w-full px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-medium border border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm relative overflow-hidden group"
            onClick={onReviewClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
            <span className="relative z-10">
              {currentUserRole === 'USER'
                ? '⭐ Rate Service & Provider'
                : '⭐ Rate Customer'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmationPanel;
