import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Waves, RefreshCw, BarChart3, Bell, Play, Pause, Newspaper } from 'lucide-react';
import StatsPanel from './components/stats/StatsPanel';
import FilterControls from './components/filters/FilterControls';
import Legend from './components/map/Legend';
import AdvancedSearch from './components/filters/AdvancedSearch';

const OilSpillMap = lazy(() => import('./components/map/OilSpillMap'));
const DetectionDetailsModal = lazy(() => import('./components/modals/DetectionDetailsModal'));
const NewsCorrelationPanel = lazy(() => import('./components/news/NewsCorrelationPanel'));
import { supabase } from './services/supabase';
import { OilSpillDetection, SearchFilters, Statistics } from './types/oilSpill';
import { ExportService } from './services/exportService';
import LoadingScreen from './components/layout/LoadingScreen';
import { useDetections } from './hooks/useDetections';
import { refreshNeftDashlari } from './services/neftDashlariService';

function App() {
  const [showOilSpills, setShowOilSpills] = useState(true);
  const [showNonOilSpills, setShowNonOilSpills] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedDetection, setSelectedDetection] = useState<OilSpillDetection | null>(null);
  const [newsDetection, setNewsDetection] = useState<OilSpillDetection | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    status: 'all',
    severity: [],
    responseStatus: [],
    validationStatus: [],
    searchText: ''
  });
  const [globalStatistics, setGlobalStatistics] = useState<Statistics | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineDateIndex, setTimelineDateIndex] = useState(Number.MAX_SAFE_INTEGER);

  const {
    detections,
    loading,
    refetch,
    updateDetection,
  } = useDetections({
    filters: searchFilters,
    autoRefresh: false,
  });

  const fetchStatistics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('oil_spill_statistics')
        .select('*')
        .single();
      
      if (error) throw error;
      setGlobalStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  }, []);

  const handleUpdateDetection = useCallback(async (id: string, updates: Partial<OilSpillDetection>) => {
    try {
      await updateDetection(id, updates);
      setSelectedDetection(prev => prev?.id === id ? { ...prev!, ...updates } : prev);
      addNotification('Detection updated successfully');
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error updating detection:', err);
      addNotification('Error updating detection. Please try again.');
    }
  }, [updateDetection, addNotification]);

  const handleExport = useCallback(() => {
    const format = prompt('Export format: csv, json, geojson, kml, or all?') || 'csv';
    
    const filteredData = detections.filter(detection => {
      if (detection.status === 'Oil spill') return showOilSpills;
      if (detection.status === 'Non Oil spill') return showNonOilSpills;
      return false;
    });

    switch (format.toLowerCase()) {
      case 'csv':
        ExportService.exportToCSV(filteredData);
        break;
      case 'json':
        ExportService.exportToJSON(filteredData);
        break;
      case 'geojson':
        ExportService.exportToGeoJSON(filteredData);
        break;
      case 'kml':
        ExportService.exportToKML(filteredData);
        break;
      case 'all':
        ExportService.exportAll(filteredData);
        break;
      default:
        alert('Invalid format. Please choose: csv, json, geojson, kml, or all');
    }
  }, [detections, showOilSpills, showNonOilSpills]);

  const handleMarkerClick = useCallback((detection: OilSpillDetection) => {
    setSelectedDetection(detection);
    if (detection.status === 'Oil spill') {
      setNewsDetection(detection);
    }
  }, []);

  useEffect(() => {
    const handleMarkerDetailsClick = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const detectionId = customEvent.detail;
      const detection = detections.find((d) => d.id === detectionId);
      if (detection) {
        handleMarkerClick(detection);
      }
    };

    window.addEventListener('marker-details-click', handleMarkerDetailsClick);

    return () => {
      window.removeEventListener('marker-details-click', handleMarkerDetailsClick);
    };
  }, [detections, handleMarkerClick]);

  const handleRefresh = useCallback(async () => {
    try {
      const count = await refreshNeftDashlari();
      if (count > 0) {
        addNotification(`Neft Dashlari: ${count} detection(s) updated`);
      }
    } catch (err) {
      console.error('Neft Dashlari refresh failed:', err);
    }
    await refetch();
    await fetchStatistics();
    setLastRefresh(new Date());
  }, [refetch, fetchStatistics, addNotification]);

  // Unique sorted detection dates — each one becomes a slider stop
  const uniqueDates = useMemo(() => {
    const dateSet = new Set(
      detections.map(d => {
        const dt = new Date(d.detected_at);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      })
    );
    return [...dateSet].sort();
  }, [detections]);

  const filteredDetections = useMemo(() => {
    const statusFiltered = detections.filter(detection => {
      if (detection.status === 'Oil spill') return showOilSpills;
      if (detection.status === 'Non Oil spill') return showNonOilSpills;
      return false;
    });

    if (uniqueDates.length === 0) return statusFiltered;

    const idx = Math.min(timelineDateIndex, uniqueDates.length - 1);
    const selectedDate = uniqueDates[idx];

    return statusFiltered.filter(detection => {
      const dt = new Date(detection.detected_at);
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return dateStr === selectedDate;
    });
  }, [detections, showOilSpills, showNonOilSpills, timelineDateIndex, uniqueDates]);

  const currentTimelineDate = useMemo(() => {
    if (uniqueDates.length === 0) return new Date();
    const idx = Math.min(timelineDateIndex, uniqueDates.length - 1);
    return new Date(uniqueDates[idx] + 'T12:00:00');
  }, [uniqueDates, timelineDateIndex]);

  useEffect(() => {
    if (!isTimelinePlaying) return;

    const interval = setInterval(() => {
      setTimelineDateIndex((prev) => {
        const maxIdx = uniqueDates.length - 1;
        const next = Math.min(prev, maxIdx) + 1;
        if (next >= uniqueDates.length) {
          setIsTimelinePlaying(false);
          return maxIdx;
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isTimelinePlaying, uniqueDates.length]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading && detections.length === 0) {
    return <LoadingScreen message="Loading Detections" />;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg z-10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Waves className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Oil Spill Detection System</h1>
                <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">Real-time monitoring and visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                data-testid="toggle-stats-btn"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Statistics</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                data-testid="refresh-btn"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:inline">Refresh</span>
              </button>
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[1500] space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 animate-slide-in-right max-w-xs">
              <p className="text-sm text-gray-700">{notification}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <AdvancedSearch onSearch={setSearchFilters} onExport={handleExport} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:block w-72 lg:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            <StatsPanel detections={filteredDetections} loading={loading} />

            {globalStatistics && showStats && (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
                <h3 className="font-semibold text-gray-800">Global Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Detections:</span>
                    <span className="font-medium">{globalStatistics.total_detections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified Spills:</span>
                    <span className="font-medium text-green-600">{globalStatistics.verified_spills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical Spills:</span>
                    <span className="font-medium text-red-600">{globalStatistics.critical_spills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Area:</span>
                    <span className="font-medium">{globalStatistics.avg_area_affected?.toFixed(2)} km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last 24h:</span>
                    <span className="font-medium">{globalStatistics.last_24h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Week:</span>
                    <span className="font-medium">{globalStatistics.last_week}</span>
                  </div>
                </div>
              </div>
            )}

            <FilterControls
              showOilSpills={showOilSpills}
              showNonOilSpills={showNonOilSpills}
              onToggleOilSpills={() => setShowOilSpills(!showOilSpills)}
              onToggleNonOilSpills={() => setShowNonOilSpills(!showNonOilSpills)}
            />

            {(() => {
              const neftDetections = filteredDetections.filter(d => d.source?.includes('Neft Dashlari'));
              if (neftDetections.length === 0) return null;
              return (
                <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Neft Dashlari ({neftDetections.length})</h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {neftDetections.map(d => (
                      <button
                        key={d.id}
                        onClick={() => handleMarkerClick(d)}
                        data-testid={`neft-detection-${d.id}`}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs flex items-center justify-between gap-2 border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === 'Oil spill' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-gray-700">{new Date(d.detected_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`font-medium ${d.status === 'Oil spill' ? 'text-red-600' : 'text-green-600'}`}>
                          {d.confidence != null ? `${(d.confidence * 100).toFixed(0)}%` : '—'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="text-xs text-gray-500 text-center">
              Last updated: {lastRefresh.toLocaleTimeString()}
              <br />
              Showing {filteredDetections.length} of {detections.length} detections
            </div>
          </div>
        </aside>

        <main className="flex-1 relative" data-testid="map-container">
          <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
            <OilSpillMap
              detections={filteredDetections}
              showOilSpills={showOilSpills}
              showNonOilSpills={showNonOilSpills}
              onMarkerClick={handleMarkerClick}
            />
          </Suspense>
          <Legend />

          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 sm:p-4 z-[1000]">
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600" data-testid="overlay-oil-count">
                  {filteredDetections.filter(d => d.status === 'Oil spill').length}
                </div>
                <div className="text-xs text-gray-600">Oil Spills</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="overlay-clear-count">
                  {filteredDetections.filter(d => d.status === 'Non Oil spill').length}
                </div>
                <div className="text-xs text-gray-600">Clear</div>
              </div>
            </div>
            <button
              onClick={() => setNewsDetection(prev => prev ? null : selectedDetection)}
              data-testid="toggle-news-panel"
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              title="Toggle News Correlation"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(900px,calc(100%-2rem))] bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 sm:p-4 z-[1000]">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsTimelinePlaying((prev) => !prev)}
                data-testid="timeline-play-btn"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                aria-label={isTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
              >
                {isTimelinePlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, uniqueDates.length - 1)}
                  step={1}
                  value={Math.min(timelineDateIndex, Math.max(0, uniqueDates.length - 1))}
                  onChange={(e) => {
                    setIsTimelinePlaying(false);
                    setTimelineDateIndex(Number(e.target.value));
                  }}
                  data-testid="timeline-slider"
                  className="w-full"
                  aria-label="Timeline date slider"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span className="truncate">{uniqueDates.length > 0 ? new Date(uniqueDates[0] + 'T12:00:00').toLocaleDateString() : ''}</span>
                  <span className="font-medium flex-shrink-0 mx-1">{currentTimelineDate.toLocaleDateString()}</span>
                  <span className="truncate text-right">{uniqueDates.length > 0 ? new Date(uniqueDates[uniqueDates.length - 1] + 'T12:00:00').toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <DetectionDetailsModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onUpdate={handleUpdateDetection}
        />
      </Suspense>

      <Suspense fallback={null}>
        <NewsCorrelationPanel
          detection={newsDetection}
          onClose={() => setNewsDetection(null)}
        />
      </Suspense>
    </div>
  );
}

export default App;