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

        // 1. Get a fresh token directly
        const token = await getCopernicusToken();
        
        // 2. Fetch the image as a BLOB with the Auth header
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-xs">Unavailable</span>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} />;
};