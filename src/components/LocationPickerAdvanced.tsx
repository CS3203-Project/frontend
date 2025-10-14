//locationPickerAdvanced

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Target, Search, Loader2, Navigation, X, Map } from 'lucide-react';
import { hybridSearchApi } from '../api/hybridSearchApi';
import type { LocationParams } from '../api/hybridSearchApi';
import LocationPickerMap from './LocationPickerMap';

interface LocationPickerProps {
  value?: LocationParams;
  onChange: (location: LocationParams | null) => void;
  placeholder?: string;
  className?: string;
  showRadius?: boolean;
  defaultRadius?: number;
  maxRadius?: number;
  autoDetect?: boolean;
  disabled?: boolean;
  allowManualRadius?: boolean; // Allow manual radius input instead of slider
  showMap?: boolean; // New prop to show/hide map integration
}

interface LocationSuggestion {
  description: string;
  placeId: string;
  types: string[];
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Enter location or use current location",
  className = '',
  showRadius = true,
  defaultRadius = 10,
  maxRadius = 50,
  autoDetect = false,
  disabled = false,
  allowManualRadius = true,
  showMap = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRadiusInput, setShowRadiusInput] = useState(false);
  const [manualRadius, setManualRadius] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    if (autoDetect && !value) {
      handleCurrentLocation();
    }
  }, [autoDetect, value]);

  // Update manual radius input when value changes externally
  useEffect(() => {
    if (value?.radius !== undefined && value.radius !== parseFloat(manualRadius)) {
      setManualRadius(value.radius.toString());
    }
  }, [value?.radius]);

  // Update input value when location value changes externally
  useEffect(() => {
    if (value?.address && value.address !== inputValue) {
      setInputValue(value.address);
    } else if (value?.latitude && value?.longitude && !value.address) {
      setInputValue(`${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`);
    }
  }, [value]);

  // Declare google maps types for autocomplete
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Places Autocomplete for the main input field
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      fields: ['place_id', 'geometry', 'formatted_address', 'name']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const location: LocationParams = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address || place.name,
          radius: undefined
        };
        onChange(location);
        setIsOpen(false);
        setSuggestions([]);
      }
    });
  }, [onChange]);

  // Initialize autocomplete when component mounts (wait for Google Maps to load)
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      } else {
        // Retry after a short delay if Google Maps not yet loaded
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, [initializeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);

    if (newValue.trim()) {
      // Google Places Autocomplete will handle suggestions automatically
      setIsOpen(false);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      onChange(null);
    }
  };

  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    setIsOpen(false);
    setSuggestions([]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await hybridSearchApi.geocodeAddress(suggestion.description);
      if (response.success && response.data) {
        const location: LocationParams = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          address: response.data.address || suggestion.description,
          radius: undefined // Start without radius, let user add it if needed
        };
        onChange(location);
      } else {
        throw new Error('Failed to geocode address');
      }
    } catch (err) {
      setError('Failed to get location details');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    setError(null);

    try {
      // Try browser geolocation first
      const position = await hybridSearchApi.getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const response = await hybridSearchApi.reverseGeocode(latitude, longitude);
      
      const location: LocationParams = {
        latitude,
        longitude,
        address: response.data?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        radius: undefined // Start without radius, let user add it if needed
      };

      setInputValue(location.address || 'Current location');
      onChange(location);
    } catch (err) {
      // Fallback to IP-based location
      try {
        const response = await hybridSearchApi.getLocationFromIP();
        if (response.success && response.data) {
          const location: LocationParams = {
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            address: response.data.address || 'Current location (approximate)',
            radius: showRadius ? undefined : undefined // Start without radius, let user add it if needed
          };
          setInputValue(location.address || 'Current location');
          onChange(location);
        } else {
          throw new Error('IP location failed');
        }
      } catch (ipErr) {
        setError('Unable to detect current location. Please enter manually.');
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Remove the old handleRadiusChange function that references undefined setRadius

  const handleClear = () => {
    setInputValue('');
    setIsOpen(false);
    setSuggestions([]);
    setError(null);
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Location Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled || isLoading || isGettingLocation}
          className={`
            block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {(isLoading || isGettingLocation) && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {inputValue && !isLoading && !isGettingLocation && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          
          <button
            onClick={handleCurrentLocation}
            disabled={disabled || isLoading || isGettingLocation}
            className="p-1 text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
            title="Use current location"
          >
            <Navigation className={`h-4 w-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center space-x-3">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Service Radius Button and Input */}
      {showRadius && value && allowManualRadius && (
        <div className="mt-3 space-y-3">
          {!showRadiusInput ? (
            <button
              onClick={() => setShowRadiusInput(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Service Radius
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Search Radius (km)
                </label>
                <button
                  onClick={() => {
                    setShowRadiusInput(false);
                    setManualRadius('');
                    if (value) {
                      onChange({
                        ...value,
                        radius: undefined
                      });
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="number"
                min="1"
                max={maxRadius}
                value={manualRadius}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setManualRadius(newValue);
                  const numValue = newValue ? parseFloat(newValue) : undefined;
                  if (value && numValue && numValue > 0) {
                    onChange({
                      ...value,
                      radius: numValue
                    });
                  } else if (value) {
                    onChange({
                      ...value,
                      radius: undefined
                    });
                  }
                }}
                placeholder="Enter radius in km (leave empty for unlimited)"
                disabled={disabled}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {manualRadius && (
                <p className="text-xs text-gray-600">
                  Searching within {manualRadius} km of selected location
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Visualizer - Show when map is enabled and there's a location */}
      {showMap && value && value.latitude && value.longitude && (
        <div className="mt-4">
          <LocationPickerMap
            value={value}
            onChange={onChange}
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            allowManualRadius={allowManualRadius}
            className="w-full"
          />
        </div>
      )}

      {/* Current Location Display */}
      {value && (value.latitude || value.address) && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Target className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {value.address || 'Selected location'}
              </div>
              {value.latitude && value.longitude && (
                <div className="text-xs text-blue-600 truncate">
                  {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
                  {showRadius && value.radius && ` • ${value.radius}km radius`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
