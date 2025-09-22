'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Thermometer, Droplets } from 'lucide-react';

export default function MapView({ floats, selectedFloat, onFloatSelect, fullHeight = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        // Ensure Leaflet CSS is loaded
        try {
          await import('leaflet/dist/leaflet.css');
        } catch {}
        
        // Fix for default markers in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map with better default view
          const map = L.map(mapRef.current, {
            center: [15.0, 70.0],
            zoom: 6,
            zoomControl: true,
            attributionControl: true
          });
          
          mapInstanceRef.current = map;
          setIsMapLoaded(true);

          // Add tile layer with better performance
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 2
          }).addTo(map);

          // Set up global function for float selection
          window.selectFloat = (floatId) => {
            if (onFloatSelect) {
              const selectedFloat = floats.find(f => f.float_id === floatId);
              onFloatSelect(selectedFloat);
            }
          };
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Separate effect for updating markers when floats change
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded && floats.length > 0) {
      const L = require('leaflet');
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add new markers
      const validFloats = floats.filter(float => 
        float.latitude && 
        float.longitude && 
        !isNaN(parseFloat(float.latitude)) && 
        !isNaN(parseFloat(float.longitude))
      );

      if (validFloats.length === 0) {
        console.warn('No valid float coordinates found');
        return;
      }

      validFloats.forEach(float => {
        const lat = parseFloat(float.latitude);
        const lng = parseFloat(float.longitude);
        
        // Create custom marker based on status
        const markerColor = String(float.status).toLowerCase() === 'active' ? '#0284c7' : '#6b7280';
        
        const marker = L.circleMarker([lat, lng], {
          radius: 7,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(mapInstanceRef.current);

        // Add popup
        marker.bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-ocean-900 mb-2">Float ${float.float_id}</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-medium">WMO:</span> ${float.wmo_id}</p>
              <p><span class="font-medium">Region:</span> ${float.ocean_region}</p>
              <p><span class="font-medium">Status:</span> 
                <span class="px-2 py-1 rounded text-xs ${String(float.status).toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  ${float.status}
                </span>
              </p>
              <p><span class="font-medium">Profiles:</span> ${float.total_profiles}</p>
              <p><span class="font-medium">Location:</span> ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E</p>
            </div>
            <button 
              onclick="window.selectFloat('${float.float_id}')"
              class="mt-3 w-full px-3 py-2 bg-ocean-600 text-white text-sm rounded hover:bg-ocean-700 transition-colors"
            >
              View Details
            </button>
          </div>
        `);

        // Add click handler
        marker.on('click', () => {
          if (onFloatSelect) {
            onFloatSelect(float);
          }
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds.pad(0.12), { animate: true, duration: 0.4 });
        }
      }
    }
  }, [floats, isMapLoaded, onFloatSelect]);

  // Effect for highlighting selected float
  useEffect(() => {
    if (mapInstanceRef.current && selectedFloat) {
      // Find and highlight the selected float marker
      markersRef.current.forEach(marker => {
        const lat = parseFloat(selectedFloat.latitude);
        const lng = parseFloat(selectedFloat.longitude);
        const markerLat = marker.getLatLng().lat;
        const markerLng = marker.getLatLng().lng;
        
        if (Math.abs(markerLat - lat) < 0.001 && Math.abs(markerLng - lng) < 0.001) {
          // Highlight selected marker
          marker.setStyle({
            radius: 12,
            fillColor: '#dc2626',
            color: '#ffffff',
            weight: 3
          });
          
          // Open popup for selected float
          marker.openPopup();
          
          // Center map on selected float
          mapInstanceRef.current.setView([lat, lng], 8);
        } else {
          // Reset other markers to default style
          const isActive = selectedFloat.status === 'active';
          marker.setStyle({
            radius: 8,
            fillColor: isActive ? '#0284c7' : '#6b7280',
            color: '#ffffff',
            weight: 2
          });
        }
      });
    }
  }, [selectedFloat]);

  return (
    <div className={`bg-white rounded-xl shadow-lg ${fullHeight ? 'h-[600px]' : 'h-[400px]'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-ocean-600" />
            <h3 className="text-lg font-semibold text-ocean-900">ARGO Float Locations</h3>
          </div>
          <div className="text-sm text-gray-600">
            {floats.length} floats
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-ocean-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Active Floats</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Inactive Floats</span>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative overflow-hidden">
        <div 
          ref={mapRef} 
          className={`w-full ${fullHeight ? 'h-[520px]' : 'h-[320px]'} rounded-b-xl`}
          style={{ minHeight: fullHeight ? '520px' : '320px' }}
        />
        
        {/* Loading indicator */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-b-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* No data message */}
        {isMapLoaded && floats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-b-xl">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No float data available</p>
              <p className="text-sm text-gray-500 mt-1">Try running a query to see float locations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}