import React, { useState, useEffect } from 'react';
import { MapPin, Target, Filter, X, Loader2 } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import type { LocationSearchParams } from '../api/serviceApi';

interface LocationFilterProps {
  onFilterChange: (filters: Partial<LocationSearchParams>) => void;
  isLoading?: boolean;
  className?: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  onFilterChange,
  isLoading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const {
    coordinates,
    locationInfo,
    loading: locationLoading,
    error,
    getCurrentLocation,
    getLocationFromIP,
    clearLocation
  } = useLocation();

  // Update filters when location changes
  useEffect(() => {
    if (isLocationEnabled && coordinates) {
      onFilterChange({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radiusKm: radiusKm
      });
    } else {
      onFilterChange({
        latitude: undefined,
        longitude: undefined,
        radiusKm: undefined
      });
    }
  }, [isLocationEnabled, coordinates, radiusKm, onFilterChange]);

  const handleEnableLocation = async () => {
    try {
      await getCurrentLocation();
      setIsLocationEnabled(true);
    } catch (err) {
      // Try IP fallback
      try {
        await getLocationFromIP();
        setIsLocationEnabled(true);
      } catch (ipErr) {
        console.error('Failed to get location:', err);
      }
    }
  };

  const handleDisableLocation = () => {
    setIsLocationEnabled(false);
    clearLocation();
  };

  const locationDisplayText = locationInfo?.city 
    ? `${locationInfo.city}${locationInfo.state ? `, ${locationInfo.state}` : ''}`
    : coordinates 
    ? `${coordinates.latitude.toFixed(3)}, ${coordinates.longitude.toFixed(3)}`
    : 'No location set';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Location Filter</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Filter className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Location Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="location-enabled"
                checked={isLocationEnabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleEnableLocation();
                  } else {
                    handleDisableLocation();
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={locationLoading || isLoading}
              />
              <label htmlFor="location-enabled" className="text-sm font-medium text-gray-700">
                Filter by location
              </label>
            </div>
            
            {locationLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>

          {/* Current Location Display */}
          {isLocationEnabled && (coordinates || locationInfo) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-blue-800">Current Location</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {locationDisplayText}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDisableLocation}
                  className="p-1 text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">{error.message}</div>
              <button
                onClick={handleEnableLocation}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Try again
              </button>
            </div>
          )}

          {/* Radius Selector */}
          {isLocationEnabled && coordinates && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isLocationEnabled && (
            <div className="space-y-2">
              <button
                onClick={handleEnableLocation}
                disabled={locationLoading || isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Enable Location Filter
              </button>
              <div className="text-xs text-gray-500 text-center">
                Find services near you with precise location-based filtering
              </div>
            </div>
          )}

          {/* Info Text */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Tip:</strong> Location filtering helps you find services that can reach your area. 
            Services will be sorted by distance from your location.
          </div>
        </div>
      )}

      {/* Compact Display When Collapsed */}
      {!isExpanded && isLocationEnabled && coordinates && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Target className="w-3 h-3" />
              <span>Within {radiusKm} km of {locationDisplayText}</span>
            </div>
            <button
              onClick={handleDisableLocation}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;