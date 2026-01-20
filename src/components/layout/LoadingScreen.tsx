import { Waves, Satellite, MapPin } from 'lucide-react';
import React from 'react';


interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

/**
 * Enhanced Loading Screen Component
 * Shows a professional loading animation with optional progress and message
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading Detection Data', 
  progress 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="text-center max-w-md px-6">
        {/* Animated Logo/Icon */}
        <div className="relative mb-8 inline-block">
          {/* Outer Ring */}
          <div className="w-32 h-32 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          
          {/* Spinning Ring */}
          <div className="w-32 h-32 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          
          {/* Center Icon with Pulse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Waves className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>

          {/* Orbiting Satellites */}
          <div className="absolute top-0 left-0 w-32 h-32 animate-spin" style={{ animationDuration: '3s' }}>
            <Satellite className="w-6 h-6 text-blue-500 absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
          
          <div className="absolute top-0 left-0 w-32 h-32 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <MapPin className="w-6 h-6 text-cyan-500 absolute bottom-0 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 animate-fade-in">
          {message}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Fetching satellite data and analyzing oil spill detections...
        </p>

        {/* Progress Bar (if provided) */}
        {progress !== undefined && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        )}

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Status Messages (rotating) */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-fade-in">
            <StatusMessage />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Rotating status messages
 */
const StatusMessage: React.FC = () => {
  const messages = [
    'Connecting to Copernicus Data Space...',
    'Retrieving Sentinel-1 SAR imagery...',
    'Processing satellite detections...',
    'Analyzing ocean patterns...',
    'Loading geospatial data...',
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 overflow-hidden">
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${currentMessage * 24}px)` }}
      >
        {messages.map((msg, index) => (
          <p key={index} className="h-6 flex items-center justify-center">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

/**
 * Minimal Loading Spinner Component
 * Use this for inline loading states
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`spinner ${sizeClasses[size]}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton Loader for Cards
 * Use this while content is loading
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
};

/**
 * Shimmer Loading Effect
 * Use this for inline content loading
 */
export const ShimmerLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`} />
  );
};

/**
 * Map Loading Overlay
 * Special loader for map component
 */
export const MapLoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="text-center">
        <div className="relative mb-4 inline-block">
          <MapPin className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-bounce-subtle" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Loading map data...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
