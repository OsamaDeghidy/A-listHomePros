import React, { useEffect, useRef, useCallback } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Google Maps Component
const GoogleMapComponent = ({
  center = [30.0444, 31.2357], // Default to Cairo, Egypt
  zoom = 13,
  markers = [],
  height = '400px',
  width = '100%',
  onMarkerClick,
  showPopups = true,
  interactive = true,
  className = '',
  markerIcon,
  apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Initialize the map
  const initMap = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    // Create a new Google Map
    const mapOptions = {
      center: { lat: center[0], lng: center[1] },
      zoom,
      zoomControl: interactive,
      draggable: interactive,
      scrollwheel: interactive,
      disableDoubleClickZoom: !interactive,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Add markers
    if (markers.length > 0) {
      markers.forEach((markerData) => {
        const { position, popupContent, id } = markerData;
        
        const marker = new window.google.maps.Marker({
          position: { lat: position[0], lng: position[1] },
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
          icon: markerIcon ? {
            url: markerIcon,
            scaledSize: new window.google.maps.Size(30, 30),
          } : undefined,
        });

        if (popupContent && showPopups) {
          marker.addListener('click', () => {
            infoWindowRef.current.setContent(popupContent);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
            
            if (onMarkerClick) {
              onMarkerClick(id || markerData);
            }
          });
        } else if (onMarkerClick) {
          marker.addListener('click', () => {
            onMarkerClick(id || markerData);
          });
        }

        markersRef.current.push(marker);
      });

      // Fit bounds if multiple markers
      if (markers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(markerData => {
          bounds.extend({ lat: markerData.position[0], lng: markerData.position[1] });
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [center, zoom, markers, interactive, showPopups, onMarkerClick, markerIcon]);

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }
  }, [apiKey, initMap]);

  // Update map when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Update center and zoom
      mapInstanceRef.current.setCenter({ lat: center[0], lng: center[1] });
      mapInstanceRef.current.setZoom(zoom);

      // Clear existing markers
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // Re-add markers
      if (markers.length > 0) {
        markers.forEach((markerData) => {
          const { position, popupContent, id } = markerData;
          
          const marker = new window.google.maps.Marker({
            position: { lat: position[0], lng: position[1] },
            map: mapInstanceRef.current,
            icon: markerIcon ? {
              url: markerIcon,
              scaledSize: new window.google.maps.Size(30, 30),
            } : undefined,
          });

          if (popupContent && showPopups) {
            marker.addListener('click', () => {
              infoWindowRef.current.setContent(popupContent);
              infoWindowRef.current.open(mapInstanceRef.current, marker);
              
              if (onMarkerClick) {
                onMarkerClick(id || markerData);
              }
            });
          } else if (onMarkerClick) {
            marker.addListener('click', () => {
              onMarkerClick(id || markerData);
            });
          }

          markersRef.current.push(marker);
        });

        // Fit bounds if multiple markers
        if (markers.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach(markerData => {
            bounds.extend({ lat: markerData.position[0], lng: markerData.position[1] });
          });
          mapInstanceRef.current.fitBounds(bounds);
        }
      }
    }
  }, [center, zoom, markers, showPopups, onMarkerClick, markerIcon]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }} 
      className={`rounded-lg overflow-hidden shadow-md ${className}`}
      aria-label="Google Map"
    ></div>
  );
};

export default GoogleMapComponent; 