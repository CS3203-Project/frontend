//locationPickerMap
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Target, Search, Loader2, Navigation, X, Plus, Minus } from 'lucide-react';
import { hybridSearchApi } from '../api/hybridSearchApi';
import type { LocationParams } from '../api/hybridSearchApi';

// Declare Google Maps global if not available
declare global {
  interface Window {
    google: typeof google;
  }
}

// Define prop types to avoid "google" namespace issues
type GoogleMapsLatLngLiteral = {
  lat: number;
  lng: number;
};

interface LocationPickerMapProps {
  value?: LocationParams;
  onChange: (location: LocationParams | null) => void;
  placeholder?: string;
  className?: string;
  allowManualRadius?: boolean;
  googleMapsApiKey?: string;
}

// Google Maps Component
const GoogleMap: React.FC<{
  center: GoogleMapsLatLngLiteral;
  zoom: number;
  onMapClick?: (position: GoogleMapsLatLngLiteral) => void;
  onMarkerDrag?: (position: GoogleMapsLatLngLiteral) => void;
  markerPosition?: GoogleMapsLatLngLiteral;
  showRadius?: boolean;
  radius?: number;
  className?: string;
}> = ({ center, zoom, onMapClick, onMarkerDrag, markerPosition, showRadius, radius, className }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(newMap);

    // Add click listener
    if (onMapClick) {
      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onMapClick(event.latLng.toJSON());
        }
      });
    }

    return () => {
      newMap.unbindAll();
    };
  }, [center, zoom, onMapClick]);

  // Update marker when position changes
  useEffect(() => {
    if (!map || !markerPosition) return;

    if (marker) {
      marker.setPosition(markerPosition);
    } else {
      const newMarker = new google.maps.Marker({
        position: markerPosition,
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
              <circle cx="16" cy="13.5" r="3.5" fill="#ffffff"/>
              <circle cx="16" cy="20.5" r="3.5" fill="#ffffff"/>
            </svg>
          `),
          anchor: new google.maps.Point(16, 32),
          scaledSize: new google.maps.Size(32, 32)
        },
        draggable: !!onMarkerDrag,
        animation: google.maps.Animation.DROP
      });

      if (onMarkerDrag) {
        newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMarkerDrag(event.latLng.toJSON());
          }
        });
      }

      setMarker(newMarker);
    }
  }, [map, markerPosition, onMarkerDrag]);

  // Update or remove marker
  useEffect(() => {
    if (!map) return;

    if (markerPosition) {
      if (marker) {
        marker.setPosition(markerPosition);
        marker.setMap(map);
      }
    } else if (marker) {
      marker.setMap(null);
    }
  }, [map, markerPosition, marker]);

  // Update radius circle
  useEffect(() => {
    if (!map || !showRadius || !radius || !markerPosition) return;

    if (circle) {
      circle.setCenter(markerPosition);
      circle.setRadius(radius * 1000); // Convert km to meters
    } else {
      const newCircle = new google.maps.Circle({
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        map,
        center: markerPosition,
        radius: radius * 1000,
      });
      setCircle(newCircle);
    }

    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [map, showRadius, radius, markerPosition, circle]);

  return <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`} />;
};

// Main Location Picker Map Component
const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = '',
  allowManualRadius = true,
  googleMapsApiKey
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mapCenter, setMapCenter] = useState<GoogleMapsLatLngLiteral>({ lat: 6.9271, lng: 79.8612 }); // Colombo default
  const [zoom, setZoom] = useState(13); // Increased zoom level for better detail
  const [showRadiusInput, setShowRadiusInput] = useState(false);
  const [manualRadius, setManualRadius] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Places Autocomplete
  const initializeAutocomplete = useCallback(() => {
    if (!searchInputRef.current || !window.google) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
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
        if (location.latitude !== undefined && location.longitude !== undefined) {
          setMapCenter({ lat: location.latitude, lng: location.longitude });
          setZoom(15);
        }
      }
    });
  }, [onChange]);

  // Update input value when location value changes externally
  useEffect(() => {
    if (value?.address && value.address !== searchQuery && showSearch) {
      setSearchQuery(value.address);
    }
    if (value?.latitude && value?.longitude) {
      setMapCenter({ lat: value.latitude, lng: value.longitude });
      setZoom(value.radius && value.radius > 0 ? 11 : 15);
    }
  }, [value, searchQuery, showSearch]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleMapClick = (position: google.maps.LatLngLiteral) => {
    const location: LocationParams = {
      latitude: position.lat,
      longitude: position.lng,
      address: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
      radius: value?.radius
    };
    onChange(location);
  };

  const handleMarkerDrag = (position: google.maps.LatLngLiteral) => {
    const location: LocationParams = {
      latitude: position.lat,
      longitude: position.lat,
      address: value?.address || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
      radius: value?.radius
    };
    onChange(location);
  };

  const clearLocation = () => {
    setSearchQuery('');
    onChange(null);
  };

  const renderMap = (status: Status) => {
    if (status === Status.FAILURE) {
      return (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load Google Maps</p>
            <p className="text-gray-600 text-sm">Please check your API key</p>
          </div>
        </div>
      );
    }

    if (status === Status.LOADING) {
      return (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    // Initialize autocomplete after Google Maps loads
    setTimeout(initializeAutocomplete, 100);

    return (
      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        onMapClick={handleMapClick}
        onMarkerDrag={handleMarkerDrag}
        markerPosition={value?.latitude && value?.longitude ? { lat: value.latitude, lng: value.longitude } : undefined}
        showRadius={showRadiusInput && manualRadius ? true : false}
        radius={manualRadius ? parseFloat(manualRadius) : undefined}
        className="border border-gray-300"
      />
    );
  };

  useEffect(() => {
    // Update radius state when value changes
    if (value?.radius !== undefined) {
      setManualRadius(value.radius.toString());
      if (value.radius > 0) {
        setShowRadiusInput(true);
      }
    }
  }, [value?.radius]);

  return (
    <div className={`relative ${className}`}>
      {/* Map Container - Made wider by using aspect ratio */}
      <div className="w-full aspect-[16/10] min-h-[280px] relative">
        <Wrapper
          apiKey={googleMapsApiKey || 'your-api-key-here'}
          libraries={['places', 'geometry']}
          render={renderMap}
        />

        {/* Search Toggle Button */}
        <button
          onClick={toggleSearch}
          className="absolute top-3 left-3 z-10 p-2 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-gray-300 transition-colors"
          title={showSearch ? "Hide search" : "Show search"}
        >
          <Search className="w-5 h-5 text-gray-700" />
        </button>

        {/* Clear Button */}
        {value && (
          <button
            onClick={clearLocation}
            className="absolute top-3 right-3 z-10 p-2 bg-white hover:bg-red-50 rounded-lg shadow-lg border border-gray-300 hover:border-red-300 transition-colors"
            title="Clear location"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        )}

        {/* Current Location Button */}
        <button
          onClick={() => navigator.geolocation.getCurrentPosition(
            (position) => {
              const location: LocationParams = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: 'Current location',
                radius: value?.radius
              };
              onChange(location);
              setMapCenter({ lat: location.latitude, lng: location.longitude });
              setZoom(15);
            },
            (error) => console.error('Geolocation error:', error)
          )}
          className="absolute top-16 left-3 z-10 p-2 bg-white hover:bg-blue-50 rounded-lg shadow-lg border border-gray-300 hover:border-blue-300 transition-colors"
          title="Use current location"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>

        {/* Search Input Overlay */}
        {showSearch && (
          <div className="absolute top-3 left-16 right-3 z-10">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!value && !showSearch && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="text-center text-white">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="font-medium">Search by typing or click on the map</p>
              <p className="text-sm opacity-90">Drag markers to adjust location</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Service Radius Section
      {allowManualRadius && value && (
        <div className="mt-3 space-y-3">
          {!showRadiusInput ? (
            <button
              onClick={() => setShowRadiusInput(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
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
                max="50"
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

                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <div className="flex space-x-2">
                {[5, 10, 25, 50].map(range => (
                  <button
                    key={range}
                    onClick={() => {
                      setManualRadius(range.toString());
                      if (value) {
                        onChange({
                          ...value,
                          radius: range
                        });
                      }
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    {range}km
                  </button>
                ))}
              </div>
              {manualRadius && (
                <p className="text-xs text-gray-600">
                  Searching within {manualRadius} km of selected location (shown as blue circle on map)
                </p>
              )}
            </div>
          )}
        </div>
      )} */}

      {/* Current Location Display
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
                  {value.radius && ` • ${value.radius}km radius`}
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default LocationPickerMap;
