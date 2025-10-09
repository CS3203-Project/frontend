import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Target, Wifi, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import LocationService from '../services/locationService';
import type { LocationInfo } from '../services/locationService';

// Extended interface for the picker component
interface ExtendedLocationInfo extends LocationInfo {
  serviceRadiusKm?: number;
}

interface LocationPickerProps {
  value?: ExtendedLocationInfo;
  onChange: (location: ExtendedLocationInfo) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  placeholder = 'Enter your service location'
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualLocation, setManualLocation] = useState<LocationInfo>({});
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'ip'>('auto');

  const {
    coordinates,
    locationInfo,
    loading,
    error,
    permissionStatus,
    getCurrentLocation,
    getLocationFromIP,
    geocodeAddress,
    clearError
  } = useLocation();

  // Update form when location is detected, but only if value is different
  useEffect(() => {
    if (coordinates && locationInfo) {
      const fullLocation: LocationInfo = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        ...locationInfo
      };
      // Only call onChange if value is different
      if (
        !value ||
        value.latitude !== fullLocation.latitude ||
        value.longitude !== fullLocation.longitude ||
        value.address !== fullLocation.address
      ) {
        onChange(fullLocation);
      }
    }
  }, [coordinates, locationInfo, onChange, value]);

  // Handle GPS location request
  const handleGetCurrentLocation = useCallback(async () => {
    clearError();
    try {
      await getCurrentLocation();
    } catch (err) {
      console.error('Failed to get current location:', err);
    }
  }, [getCurrentLocation, clearError]);

  // Handle IP-based location request
  const handleGetIPLocation = useCallback(async () => {
    clearError();
    try {
      await getLocationFromIP();
    } catch (err) {
      console.error('Failed to get IP location:', err);
    }
  }, [getLocationFromIP, clearError]);

  // Handle address search
  const handleAddressSearch = useCallback(async () => {
    if (!addressInput.trim()) return;
    
    clearError();
    try {
      await geocodeAddress(addressInput.trim());
      setShowSuggestions(false);
    } catch (err) {
      console.error('Failed to geocode address:', err);
    }
  }, [addressInput, geocodeAddress, clearError]);

  // Handle manual location input
  const handleManualLocationChange = (field: keyof LocationInfo, value: string | number) => {
    const updatedLocation = { ...manualLocation, [field]: value };
    setManualLocation(updatedLocation);
    
    // If coordinates are provided, update immediately
    if (field === 'latitude' || field === 'longitude') {
      if (updatedLocation.latitude && updatedLocation.longitude) {
        onChange(updatedLocation);
      }
    } else {
      onChange(updatedLocation);
    }
  };

  // Handle service radius change
  const handleRadiusChange = (radius: number) => {
    if (value) {
      onChange({ ...value, serviceRadiusKm: radius });
    }
  };

  const currentLocation = value || locationInfo;
  const isLocationSet = currentLocation && (currentLocation.latitude || currentLocation.address);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Method Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('auto')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'auto'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={disabled}
        >
          <Target className="w-4 h-4 inline mr-1" />
          GPS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={disabled}
        >
          <Search className="w-4 h-4 inline mr-1" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ip')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ip'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={disabled}
        >
          <Wifi className="w-4 h-4 inline mr-1" />
          Auto
        </button>
      </div>

      {/* GPS Location Tab */}
      {activeTab === 'auto' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Use current location</span>
              {permissionStatus === 'granted' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {permissionStatus === 'denied' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={disabled || loading || permissionStatus === 'denied'}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Target className="w-3 h-3 mr-1" />
              )}
              Get Location
            </button>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Location access denied. Please enable location permissions in your browser settings.
            </div>
          )}
        </div>
      )}

      {/* Address Search Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
              placeholder="Enter address (e.g., 123 Main St, City, Country)"
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={disabled || loading || !addressInput.trim()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* IP Location Tab */}
      {activeTab === 'ip' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Detect location automatically</span>
            <button
              type="button"
              onClick={handleGetIPLocation}
              disabled={disabled || loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Wifi className="w-3 h-3 mr-1" />
              )}
              Auto-detect
            </button>
          </div>
          <div className="text-xs text-gray-500">
            This uses your IP address to estimate your location (less accurate than GPS).
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error.message}
        </div>
      )}

      {/* Current Location Display */}
      {isLocationSet && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-green-800">
                Location Selected
              </div>
              <div className="text-xs text-green-600 mt-1">
                {currentLocation.address || LocationService.getLocationDisplayString(currentLocation)}
              </div>
              {currentLocation.latitude && currentLocation.longitude && (
                <div className="text-xs text-green-500 mt-1">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Radius Selector */}
      {isLocationSet && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Service Radius
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={currentLocation.serviceRadiusKm || 10}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={disabled}
            />
            <span className="text-sm text-gray-600 min-w-[60px]">
              {currentLocation.serviceRadiusKm || 10} km
            </span>
          </div>
          <div className="text-xs text-gray-500">
            This is the maximum distance you're willing to travel for service delivery.
          </div>
        </div>
      )}

      {/* Required Field Indicator */}
      {required && !isLocationSet && (
        <div className="text-xs text-red-600">
          * Location is required
        </div>
      )}
    </div>
  );
};

export default LocationPicker;