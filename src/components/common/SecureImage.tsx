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

        // ✅ HANDLE PROCESS COMMAND
        // Format: PROCESS|PLATFORM|ID|BBOX|DATE
        if (src.startsWith('PROCESS|')) {
          const parts = src.split('|');
          if (parts.length < 5) throw new Error("Invalid Process Command");
          
          const [_, platform, id, bboxStr, dateStr] = parts;
          const bbox = bboxStr.split(',').map(Number);
          
          // Calculate precise time window (+/- 2 minutes) to isolate the image
          const date = new Date(dateStr);
          const start = new Date(date.getTime() - 120000).toISOString();
          const end = new Date(date.getTime() + 120000).toISOString();

          // Standard Sentinel Hub V3 Evalscripts
          const evalscriptSAR = `
            //VERSION=3
            function setup() { return { input: ["VV"], output: { bands: 3 } }; }
            function evaluatePixel(sample) { 
              // Simple grayscale visualization for radar
              var val = 2.5 * sample.VV; 
              return [val, val, val]; 
            }
          `;
          
          const evalscriptOptical = `
            //VERSION=3
            function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
            function evaluatePixel(sample) { 
              // True color (RGB) gain adjusted
              return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02]; 
            }
          `;

          const body = {
            input: {
              bounds: {
                bbox: bbox,
                properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
              },
              data: [
                {
                  type: platform === 'SENTINEL-1' ? 'sentinel-1-grd' : 'sentinel-2-l2a',
                  dataFilter: {
                    timeRange: { from: start, to: end },
                    mosaickingOrder: "leastRecent"
                  }
                }
              ]
            },
            output: {
              width: 512,
              height: 340,
              responses: [{ identifier: "default", format: { type: "image/jpeg" } }]
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

          if (!response.ok) {
            const errText = await response.text();
            console.error("Process API Error:", errText);
            throw new Error(`Process API Error: ${response.status}`);
          }
          
          const blob = await response.blob();
          if (isMounted) {
            objectUrl = URL.createObjectURL(blob);
            setImageUrl(objectUrl);
          }
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