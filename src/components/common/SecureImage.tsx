import { useState, useEffect } from 'react';
import { getCopernicusToken } from '../../services/copernicus/copernicusAuth';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

interface SecureImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const SecureImage = ({ src, alt, className }: SecureImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const fetchImage = async () => {
      if (!src) return;
      
      try {
        setLoading(true);
        setError(false);

        const token = await getCopernicusToken();

        // HANDLE PROCESS COMMAND
        // Format: PROCESS|PLATFORM|ID|BBOX|DATE
        if (src.startsWith('PROCESS|')) {
          const parts = src.split('|');
          if (parts.length < 5) throw new Error("Invalid Process Command");

          const [, platform, , bboxStr, dateStr] = parts;
          const bbox = bboxStr.split(',').map(Number);
          const date = new Date(dateStr);

          // SAR: log-scale stretch with nodata guard to avoid pure-black tiles
          const evalscriptSAR = `
            //VERSION=3
            function setup() { return { input: ["VV", "dataMask"], output: { bands: 4 } }; }
            function evaluatePixel(sample) {
              if (sample.dataMask === 0) return [0.1, 0.1, 0.1, 0];
              var val = Math.log(sample.VV * 100 + 1) / Math.log(101);
              val = Math.min(1, Math.max(0, val * 2.2));
              return [val, val, val, 1];
            }
          `;

          // Optical: true-colour with gamma + nodata guard to avoid pure-black tiles
          const evalscriptOptical = `
            //VERSION=3
            function setup() { return { input: ["B04", "B03", "B02", "dataMask"], output: { bands: 4 } }; }
            function evaluatePixel(sample) {
              if (sample.dataMask === 0) return [0.1, 0.1, 0.15, 0];
              var r = Math.pow(Math.min(1, sample.B04 * 3.5), 0.65);
              var g = Math.pow(Math.min(1, sample.B03 * 3.5), 0.65);
              var b = Math.pow(Math.min(1, sample.B02 * 3.5), 0.65);
              return [r, g, b, 1];
            }
          `;

          // Try progressively wider time windows until we get a valid response
          const windowsMs = [3 * 86400000, 7 * 86400000, 14 * 86400000];
          let lastErr = '';

          for (const windowMs of windowsMs) {
            const start = new Date(date.getTime() - windowMs).toISOString();
            const end = new Date(date.getTime() + windowMs).toISOString();

            const body = {
              input: {
                bounds: {
                  bbox: bbox,
                  properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
                },
                data: [{
                  type: platform === 'SENTINEL-1' ? 'sentinel-1-grd' : 'sentinel-2-l2a',
                  dataFilter: {
                    timeRange: { from: start, to: end },
                    mosaickingOrder: "mostRecent"
                  }
                }]
              },
              output: {
                width: 512,
                height: 340,
                responses: [{ identifier: "default", format: { type: "image/png" } }]
              },
              evalscript: platform === 'SENTINEL-1' ? evalscriptSAR : evalscriptOptical
            };

            const response = await fetch('/process-api', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            });

            if (response.ok) {
              const blob = await response.blob();
              if (isMounted) {
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
              }
              break;
            }

            lastErr = `Process API ${response.status}`;
          }

          if (!objectUrl) throw new Error(lastErr || 'Process API failed for all retry windows');
        } 
        // FALLBACK: Standard URL
        else {
           setImageUrl(src); 
        }

      } catch (err) {
        console.error('Error loading secure image:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) return <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}><ImageIcon className="text-gray-400" /></div>;
  if (error || !imageUrl) return <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}><AlertCircle className="w-6 h-6" /></div>;

  return <img src={imageUrl} alt={alt} className={className} />;
};