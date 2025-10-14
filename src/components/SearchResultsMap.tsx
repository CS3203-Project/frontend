import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Loader2, Navigation2, Eye } from 'lucide-react';
import type { HybridSearchResult } from '../api/hybridSearchApi';

interface SearchResultsMapProps {
  services: HybridSearchResult[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  className?: string;
  googleMapsApiKey?: string;
}

// Google Maps Component for Search Results
const GoogleMap: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  services: HybridSearchResult[];
  userLocation?: { latitude: number; longitude: number };
  onServiceClick?: (service: HybridSearchResult) => void;
  className?: string;
}> = ({ center, zoom, services, userLocation, onServiceClick, className }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Ensure container is empty and valid
    mapRef.current.innerHTML = '';

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: center.lat || 6.9271, lng: center.lng || 79.8612 }, // Default fallback
        zoom: zoom || 10,
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

      // Create info window for service details
      const newInfoWindow = new google.maps.InfoWindow();
      setInfoWindow(newInfoWindow);

      return () => {
        if (newMap) {
          try {
            newMap.unbindAll();
            markers.forEach(marker => {
              if (marker && marker.setMap) marker.setMap(null);
            });
            if (newInfoWindow && newInfoWindow.close) newInfoWindow.close();
          } catch (error) {
            // Silent cleanup error handling
            console.warn('Map cleanup warning:', error);
          }
        }
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      return;
    }
  }, []);

  // Add markers for services
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker) marker.setMap(null);
    });

    // Create new markers
    const newMarkers: google.maps.Marker[] = [];

    services.forEach((service, index) => {
      if (service.latitude && service.longitude) {
        const markerPosition: google.maps.LatLngLiteral = {
          lat: service.latitude,
          lng: service.longitude
        };

        // Create service marker
        const marker = new google.maps.Marker({
          position: markerPosition,
          map,
          title: service.title,
          animation: google.maps.Animation.DROP,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
                <circle cx="20" cy="16.5" r="3.5" fill="#ffffff"/>
                <circle cx="20" cy="23.5" r="3.5" fill="#ffffff"/>
                <text x="20" y="28" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${index + 1}</text>
              </svg>
            `),
            anchor: new google.maps.Point(20, 40),
            scaledSize: new google.maps.Size(40, 40)
          },
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        marker.addListener('click', () => {
          if (infoWindow && onServiceClick) {
            const distanceText = service.distance_km !== null && service.distance_km !== undefined
              ? ` • ${service.distance_km.toFixed(1)} km ${userLocation ? 'from your location' : ''}`
              : '';

            const content = `
              <div style="max-width: 280px; padding: 12px;">
                <div style="margin-bottom: 8px;">
                  <h3 style="font-weight: bold; font-size: 16px; margin: 0 0 4px 0; color: #1f2937;">${service.title}</h3>
                  <p style="font-size: 14px; margin: 0; color: #6b7280;">by ${service.provider.user.firstName} ${service.provider.user.lastName}</p>
                </div>

                ${service.images && service.images.length > 0 ? `
                  <img
                    src="${service.images[0]}"
                    alt="${service.title}"
                    style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
                  />
                ` : ''}

                ${service.description ? `
                  <p style="font-size: 14px; margin: 0 0 8px 0; color: #4b5563; line-height: 1.4;">
                    ${service.description.length > 100 ? service.description.substring(0, 100) + '...' : service.description}
                  </p>
                ` : ''}

                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="font-weight: bold; font-size: 16px; color: #059669;">
                    ${service.currency || 'LKR'} ${service.price}
                  </div>
                  ${distanceText ? `
                    <div style="font-size: 12px; color: #6b7280;">
                      📍 ${distanceText}
                    </div>
                  ` : ''}
                </div>

                <button
                  onclick="window.open('/service/${service.id}', '_blank')"
                  style="
                    margin-top: 8px;
                    width: 100%;
                    padding: 8px 16px;
                    background-color: #059669;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 14px;
                  "
                >
                  View Service
                </button>
              </div>
            `;

            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          }
        });

        newMarkers.push(marker);
      }
    });

    // Add user location marker if provided
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map,
        title: 'Your Location',
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
        // Add a pulsing animation
        animation: google.maps.Animation.BOUNCE
      });

      newMarkers.push(userMarker);
    }

    setMarkers(newMarkers);
  }, [map, services, userLocation, infoWindow, onServiceClick]);

  return <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`} />;
};

const SearchResultsMap: React.FC<SearchResultsMapProps> = ({
  services,
  userLocation,
  className = '',
  googleMapsApiKey
}) => {
  // Calculate map center based on services and user location
  const mapCenter = useMemo((): google.maps.LatLngLiteral => {
    if (services.length === 0) {
      return { lat: 6.9271, lng: 79.8612 }; // Default to Colombo
    }

    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }

    // Calculate center of all services
    let totalLat = 0, totalLng = 0;
    let validServices = 0;

    services.forEach(service => {
      if (service.latitude && service.longitude) {
        totalLat += service.latitude;
        totalLng += service.longitude;
        validServices++;
      }
    });

    if (validServices > 0) {
      return {
        lat: totalLat / validServices,
        lng: totalLng / validServices
      };
    }

    return { lat: 6.9271, lng: 79.8612 };
  }, [services, userLocation]);

  // Calculate appropriate zoom level
  const calculateZoom = useMemo((): number => {
    if (services.length === 0) return 12;

    if (userLocation) {
      const distances = services
        .filter(service => service.latitude && service.longitude)
        .map(service => {
          const R = 6371; // Earth's radius in km
          const dLat = (service.latitude! - userLocation.latitude) * Math.PI / 180;
          const dLon = (service.longitude! - userLocation.longitude) * Math.PI / 180;
          const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(service.latitude! * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        });

      const maxDistance = Math.max(...distances);

      if (maxDistance < 5) return 13;
      if (maxDistance < 10) return 11;
      if (maxDistance < 25) return 9;
      if (maxDistance < 50) return 8;
      return 7;
    }

    // If no user location, zoom to fit all services
    if (services.length === 1) return 14;

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    services.forEach(service => {
      if (service.latitude && service.longitude) {
        minLat = Math.min(minLat, service.latitude);
        maxLat = Math.max(maxLat, service.latitude);
        minLng = Math.min(minLng, service.longitude);
        maxLng = Math.max(maxLng, service.longitude);
      }
    });

    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    if (latRange < 0.01 && lngRange < 0.01) return 16;
    if (latRange < 0.1 && lngRange < 0.1) return 13;
    if (latRange < 0.5 && lngRange < 0.5) return 11;
    return 9;
  }, [services, userLocation]);

  const renderMap = (status: Status) => {
    if (status === Status.FAILURE) {
      return (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <Navigation2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Failed to load map</p>
            <p className="text-gray-600 text-sm">Services will be listed below</p>
            <p className="text-gray-500 text-xs mt-2">Check your Google Maps API key</p>
          </div>
        </div>
      );
    }

    if (status === Status.LOADING) {
      return (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    }

    const center = mapCenter;
    const zoom = calculateZoom;

    return (
      <GoogleMap
        center={center}
        zoom={zoom}
        services={services}
        userLocation={userLocation}
        className="border border-gray-300"
      />
    );
  };

  const servicesWithLocation = services.filter(service => service.latitude && service.longitude);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation2 className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-medium text-gray-900">Service Locations</h3>
            <p className="text-sm text-gray-600">
              {servicesWithLocation.length} of {services.length} services shown on map
              {userLocation && ' • Your location marked'}
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-96 relative rounded-lg overflow-hidden shadow-lg">
        <Wrapper
          apiKey={googleMapsApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'your-api-key-here'}
          libraries={['geometry']}
          render={renderMap}
        />
      </div>

      {/* Map Instructions */}
      {servicesWithLocation.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>How to use this map:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-0.5">
                <li>• Click on numbered markers to view service details</li>
                <li>• Blue marker shows your search location</li>
                <li>• Green markers show available services</li>
                <li>• Click "View Service" to open the service page</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* No Location Services Notice */}
      {services.length > servicesWithLocation.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              {services.length - servicesWithLocation.length} service(s) not shown on map (location not available)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsMap;
