import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Fix for Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ 
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  markers = [],
  height = '400px',
  width = '100%',
  onMarkerClick,
  showPopups = true,
  interactive = true,
  className = '',
  markerIcon,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Create custom icon if provided
  const createIcon = () => {
    if (markerIcon) {
      return L.divIcon({
        html: `<div class="custom-marker">${markerIcon}</div>`,
        className: 'custom-marker-container',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
    }
    return new L.Icon.Default();
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        scrollWheelZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      });

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    } else {
      // Update view if map exists
      mapInstanceRef.current.setView(center, zoom);
    }

    // Clean up markers first
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];
    }

    // Add markers
    if (markers.length > 0) {
      const icon = createIcon();
      
      markers.forEach(markerData => {
        const { position, popupContent, id } = markerData;
        
        const marker = L.marker(position, { icon }).addTo(mapInstanceRef.current);
        
        if (popupContent && showPopups) {
          marker.bindPopup(popupContent);
        }
        
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(id || markerData));
        }
        
        markersRef.current.push(marker);
      });

      // Fit bounds if multiple markers
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(m => m.position));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, interactive, showPopups, onMarkerClick, markerIcon]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }} 
      className={`rounded-lg overflow-hidden shadow-md ${className}`}
    ></div>
  );
};

export default MapComponent; 