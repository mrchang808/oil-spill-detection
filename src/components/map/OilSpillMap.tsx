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
    
    // Safety timeout
    const timer = setTimeout(() => {
      if (map && mapContainerRef.current) {
        map.invalidateSize();
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Handle Container Resizing
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current && mapContainerRef.current) {
        // ✅ Safety Check: Only invalidate if map container is still in DOM
        try {
          mapRef.current.invalidateSize();
        } catch (e) {
          // Ignore resize errors during unmount
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Handle Layer Mode
  useEffect(() => {
    if (!mapRef.current) return;

    const updateLayer = async () => {
      try {
        if (layerMode === 'osi') {
          if (!osiLayerRef.current) {
            const url = await getOSILayerUrl('sentinel-2');
            if (mapRef.current) {
              const osiLayer = L.tileLayer(url, { opacity: 0.7, zIndex: 400 });
              osiLayer.addTo(mapRef.current);
              osiLayerRef.current = osiLayer;
            }
          }
        } else {
          if (osiLayerRef.current && mapRef.current) {
            mapRef.current.removeLayer(osiLayerRef.current);
            osiLayerRef.current = null;
          }
        }
      } catch (e) {
        console.error("Layer update failed", e);
      }
    };
    updateLayer();
  }, [layerMode]);

  // 4. Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    const group = markersRef.current;
    group.clearLayers();

    const filtered = detections.filter((d) => {
      if (d.status === 'Oil spill') return showOilSpills;
      if (d.status === 'Non Oil spill') return showNonOilSpills;
      return false;
    });

    filtered.forEach((d) => {
      const isOil = d.status === 'Oil spill';
      const color = isOil ? (d.severity === 'Critical' ? 'bg-red-700' : 'bg-red-500') : 'bg-green-500';
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="relative group cursor-pointer">
                <div class="${color} w-6 h-6 rounded-full border-2 border-white shadow-md"></div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([d.latitude, d.longitude], { icon });
      
      // Popup logic
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold ${isOil ? 'text-red-600' : 'text-green-600'}">${d.status}</h3>
          <p class="text-xs text-gray-600 mb-2">${new Date(d.detected_at).toLocaleDateString()}</p>
          <button id="btn-${d.id}" class="w-full bg-blue-600 text-white text-xs px-2 py-1 rounded">View Details</button>
        </div>`;
      
      div.querySelector(`#btn-${d.id}`)?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('marker-details-click', { detail: d.id }));
      });

      marker.bindPopup(div);
      marker.addTo(group);
    });

  }, [detections, showOilSpills, showNonOilSpills]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {isLoading && <MapLoadingOverlay />}
      <div className="absolute top-4 left-14 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <select 
          value={layerMode} 
          onChange={(e) => setLayerMode(e.target.value as any)}
          className="text-sm border-none focus:ring-0 cursor-pointer"
        >
          <option value="natural">Natural Color</option>
          <option value="osi">Oil Spill Analysis</option>
        </select>
      </div>
    </div>
  );
};

export default OilSpillMap;