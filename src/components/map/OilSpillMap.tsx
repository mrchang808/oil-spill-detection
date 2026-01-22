import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OilSpillDetection } from '../../types/oilSpill';
import { MapLoadingOverlay } from '../layout/LoadingScreen';
import { getOSILayerUrl } from '../../services/copernicus/layers';

interface OilSpillMapProps {
  detections: OilSpillDetection[];
  showOilSpills: boolean;
  showNonOilSpills: boolean;
  onMarkerClick?: (detection: OilSpillDetection) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const OilSpillMap: React.FC<OilSpillMapProps> = ({
  detections,
  showOilSpills,
  showNonOilSpills,
  onMarkerClick,
  initialCenter = [25, 0],
  initialZoom = 2,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const osiLayerRef = useRef<L.TileLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layerMode, setLayerMode] = useState<'natural' | 'osi'>('natural');

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    
    // Safety timeout to ensure map renders correctly after init
    setTimeout(() => {
      map.invalidateSize();
      setIsLoading(false);
    }, 500);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. NEW: Handle Container Resizing (Fixes the "Disappearing Map" bug)
  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 2.5 Handle Layer Mode (Async Token Fetching)
  useEffect(() => {
    if (!mapRef.current) return;

    const updateLayer = async () => {
      if (layerMode === 'osi') {
        // Fetch URL (which now gets a fresh token)
        try {
          const url = await getOSILayerUrl('29f8cc0a-0402-4545-978d-6979603d204d'); // Use a public Sentinel Hub ID or the generic one
          // Note: For CDSE WMS, you often use a specific configuration ID. 
          // If you don't have one, we can try the generic OGC endpoint pattern.
          // Let's rely on the layers.ts logic we just wrote.
          
          if (!osiLayerRef.current) {
            const osiLayer = L.tileLayer(url, {
              opacity: 0.7,
              attribution: '© Copernicus Data Space Ecosystem',
              zIndex: 400,
            });
            osiLayer.addTo(mapRef.current!);
            osiLayerRef.current = osiLayer;
          }
        } catch (e) {
          console.error("Failed to load OSI Layer", e);
        }
      } else {
        if (osiLayerRef.current && mapRef.current.hasLayer(osiLayerRef.current)) {
          mapRef.current.removeLayer(osiLayerRef.current);
          osiLayerRef.current = null;
        }
      }
    };

    updateLayer();
  }, [layerMode]);

  // 3. Update Markers (Optimized to not clear if not needed)
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // Ensure layer group is attached
    if (!mapRef.current.hasLayer(markersRef.current)) {
      markersRef.current.addTo(mapRef.current);
    }

    markersRef.current.clearLayers();

    // Filter detections based on visibility settings
    const filteredDetections = detections.filter((detection) => {
      if (detection.status === 'Oil spill') return showOilSpills;
      if (detection.status === 'Non Oil spill') return showNonOilSpills;
      return false;
    });

    // Add markers for each detection
    filteredDetections.forEach((detection) => {
      const isOilSpill = detection.status === 'Oil spill';
      
      // Determine severity color for oil spills
      const getSeverityColor = () => {
        if (!isOilSpill) return 'bg-green-500';
        switch (detection.severity) {
          case 'Critical':
            return 'bg-red-700';
          case 'High':
            return 'bg-red-500';
          case 'Medium':
            return 'bg-orange-500';
          case 'Low':
            return 'bg-yellow-500';
          default:
            return 'bg-red-500';
        }
      };

      // Create custom marker icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="${getSeverityColor()} w-8 h-8 rounded-full border-3 border-white shadow-xl flex items-center justify-center transform transition-transform hover:scale-125 cursor-pointer">
              <div class="${isOilSpill ? 'bg-red-700' : 'bg-green-700'} w-3 h-3 rounded-full"></div>
            </div>
            ${
              detection.severity === 'Critical'
                ? '<div class="absolute inset-0 bg-red-500 rounded-full animate-pulse-ring opacity-50"></div>'
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      // Create marker
      const marker = L.marker([detection.latitude, detection.longitude], { icon });

      // Create Popup using DOM elements instead of HTML strings
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-3 min-w-[250px]">
          <div class="flex items-center justify-between mb-3">
            <div class="font-bold text-lg ${isOilSpill ? 'text-red-600' : 'text-green-600'}">
              ${detection.status}
            </div>
            ${
              detection.severity
                ? `<span class="px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadgeClass(detection.severity)}">
                    ${detection.severity}
                  </span>`
                : ''
            }
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-start">
              <span class="font-semibold text-gray-600 min-w-[80px]">Location:</span>
              <span class="text-gray-800">${detection.latitude.toFixed(4)}, ${detection.longitude.toFixed(4)}</span>
            </div>
            
            <div class="flex items-start">
              <span class="font-semibold text-gray-600 min-w-[80px]">Detected:</span>
              <span class="text-gray-800">${new Date(detection.detected_at).toLocaleString()}</span>
            </div>
            
            ${
              detection.confidence
                ? `<div class="flex items-start">
                    <span class="font-semibold text-gray-600 min-w-[80px]">Confidence:</span>
                    <span class="text-gray-800">${(detection.confidence * 100).toFixed(1)}%</span>
                  </div>`
                : ''
            }
            
            ${
              detection.area_affected_km2
                ? `<div class="flex items-start">
                    <span class="font-semibold text-gray-600 min-w-[80px]">Area:</span>
                    <span class="text-gray-800">${detection.area_affected_km2.toFixed(2)} km²</span>
                  </div>`
                : ''
            }
            
            ${
              detection.response_status
                ? `<div class="flex items-start">
                    <span class="font-semibold text-gray-600 min-w-[80px]">Response:</span>
                    <span class="px-2 py-0.5 rounded text-xs font-medium ${getResponseStatusClass(detection.response_status)}">
                      ${detection.response_status}
                    </span>
                  </div>`
                : ''
            }
            
            ${
              detection.validation_status
                ? `<div class="flex items-start">
                    <span class="font-semibold text-gray-600 min-w-[80px]">Status:</span>
                    <span class="px-2 py-0.5 rounded text-xs font-medium ${getValidationStatusClass(detection.validation_status)}">
                      ${detection.validation_status}
                    </span>
                  </div>`
                : ''
            }
          </div>
          
          <div class="mt-3 pt-3 border-t border-gray-200">
            <button 
              id="btn-${detection.id}"
              class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      `;

      // Bind click event to the button inside the popup
      popupContent.querySelector(`#btn-${detection.id}`)?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onMarkerClick) {
          onMarkerClick(detection);
        }
        // Also dispatch custom event for alternative handling
        window.dispatchEvent(new CustomEvent('marker-details-click', { detail: detection.id }));
      });

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
      });

      marker.on('mouseover', function (this: L.Marker) {
        this.openPopup();
      });

      marker.addTo(markersRef.current!);
    });

    // Fit bounds to show all markers (if there are any)
    if (filteredDetections.length > 0) {
      const bounds = L.latLngBounds(
        filteredDetections.map((d) => [d.latitude, d.longitude])
      );
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });
    }
  }, [detections, showOilSpills, showNonOilSpills, onMarkerClick]);

  /**
   * Helper functions for styling
   */
  const getSeverityBadgeClass = (severity: string): string => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-200 text-red-900';
      case 'High':
        return 'bg-orange-200 text-orange-900';
      case 'Medium':
        return 'bg-yellow-200 text-yellow-900';
      case 'Low':
        return 'bg-blue-200 text-blue-900';
      default:
        return 'bg-gray-200 text-gray-900';
    }
  };

  const getResponseStatusClass = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Investigating':
        return 'bg-blue-100 text-blue-800';
      case 'Responding':
        return 'bg-purple-100 text-purple-800';
      case 'Contained':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cleaned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationStatusClass = (status: string): string => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Unverified':
        return 'bg-yellow-100 text-yellow-800';
      case 'False Positive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {isLoading && <MapLoadingOverlay />}
      
      {/* Layer Mode Control */}
      <div className="absolute top-4 left-14 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Visualization Mode</label>
        <select
          value={layerMode}
          onChange={(e) => setLayerMode(e.target.value as 'natural' | 'osi')}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="natural">Natural Color</option>
          <option value="osi">Oil Spill Index</option>
        </select>
      </div>
      
      {/* Custom CSS for popup styling */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-popup .leaflet-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default OilSpillMap;
