"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({ donors = [], onDonorClick, userLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [donorMarkers, setDonorMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return; // Prevent running before ref is attached
    const initMap = async () => {
      try {
        console.log("Initializing map...", mapRef.current);
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        
        // Default center (will be updated with user location)
        const defaultCenter = { lat: 40.7128, lng: -74.0060 };
        const center = userLocation && userLocation.lat && userLocation.lng ? userLocation : defaultCenter;
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        setMap(mapInstance);

        // Add user location marker if available
        if (userLocation) {
          const userMarkerInstance = new google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }
          });

          // Add 10km radius circle
          const radiusCircle = new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.3,
            strokeWeight: 2,
            fillColor: '#4285F4',
            fillOpacity: 0.1,
            map: mapInstance,
            center: userLocation,
            radius: 10000, // 10km in meters
          });

          setUserMarker(userMarkerInstance);
        }

        setLoading(false);
        console.log("Map initialized");
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Check your API key and network.');
        setLoading(false);
      }
    };

    initMap();
  }, [userLocation, mapRef]);

  // Update donor markers when donors array changes
  useEffect(() => {
    if (!map) return;

    // Clear existing donor markers
    donorMarkers.forEach(marker => marker.setMap(null));

    const newMarkers = donors.map(donor => {
      const marker = new google.maps.Marker({
        position: { lat: donor.lat, lng: donor.lng },
        map: map,
        title: `${donor.donor} - ${donor.type}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#34A853"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 24)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onDonorClick(donor);
      });

      return marker;
    });

    setDonorMarkers(newMarkers);
  }, [map, donors, onDonorClick]);

  if (loading) {
    return (
      <div className="w-full h-64 rounded overflow-hidden border" style={{ position: 'relative' }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-100 flex items-center justify-center rounded">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded overflow-hidden border" style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default GoogleMap; 