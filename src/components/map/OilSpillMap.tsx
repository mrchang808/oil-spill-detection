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
  initialCenter = [20, 0],
  initialZoom = 2,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const osiLayerRef = useRef<L.TileLayer | null>(null);
  const initialCenterRef = useRef<[number, number]>(initialCenter);
  const initialZoomRef = useRef<number>(initialZoom);
  const [isLoading, setIsLoading] = useState(true);
  const [layerMode, setLayerMode] = useState<'natural' | 'osi'>('natural');

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
      minZoom: 2,
      maxBounds: [[-90, -200], [90, 200]],
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current && mapContainerRef.current) {
        try {
          mapRef.current.invalidateSize();
        } catch {
          // ignore resize errors during unmount
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
        console.error('Layer update failed', e);
      }
    };
    updateLayer();
  }, [layerMode]);

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
      const isCritical = d.severity === 'Critical';
      const isHigh = d.severity === 'High';

      const fillColor = isOil
        ? isCritical ? '#b91c1c'
        : isHigh ? '#ef4444'
        : '#f97316'
        : '#22c55e';

      const radius = isOil
        ? isCritical ? 7
        : isHigh ? 6
        : 5
        : 4;

      const circle = L.circleMarker([d.latitude, d.longitude], {
        radius,
        fillColor,
        color: '#fff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: isOil ? 0.85 : 0.65,
      });

      const dateStr = new Date(d.detected_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      });

      const severityBadge = d.severity
        ? `<span style="background:${isCritical ? '#b91c1c' : isHigh ? '#ef4444' : '#f97316'};color:#fff;padding:1px 6px;border-radius:9999px;font-size:10px;">${d.severity}</span>`
        : '';

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width:180px;padding:4px 2px;">
          <div style="font-weight:700;font-size:13px;color:${isOil ? '#dc2626' : '#16a34a'};margin-bottom:2px;">${d.status}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${dateStr}</div>
          ${severityBadge}
          ${d.area_affected_km2 ? `<div style="font-size:11px;margin-top:4px;color:#374151;">Area: <b>${d.area_affected_km2} km²</b></div>` : ''}
          ${d.confidence ? `<div style="font-size:11px;color:#374151;">Confidence: <b>${Math.round(d.confidence * 100)}%</b></div>` : ''}
          <button id="btn-${d.id}" style="margin-top:8px;width:100%;background:#2563eb;color:#fff;font-size:11px;padding:4px 8px;border:none;border-radius:4px;cursor:pointer;">View Details</button>
        </div>`;

      popupContent.querySelector(`#btn-${d.id}`)?.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerClick?.(d);
        window.dispatchEvent(new CustomEvent('marker-details-click', { detail: d.id }));
      });

      circle.bindPopup(popupContent, { maxWidth: 220 });
      circle.on('click', () => circle.openPopup());
      circle.addTo(group);
    });
  }, [detections, showOilSpills, showNonOilSpills, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {isLoading && <MapLoadingOverlay />}
      <div className="absolute top-4 left-14 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <select
          value={layerMode}
          onChange={(e) => setLayerMode(e.target.value as 'natural' | 'osi')}
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
