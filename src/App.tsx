import { useEffect, useState, useCallback, useMemo } from 'react';
import { Waves, RefreshCw, BarChart3, Bell } from 'lucide-react';
import OilSpillMap from './components/map/OilSpillMap';
import StatsPanel from './components/stats/StatsPanel';
import FilterControls from './components/filters/FilterControls';
import Legend from './components/map/Legend';
import AdvancedSearch from './components/filters/AdvancedSearch';
import DetectionDetailsModal from './components/modals/DetectionDetailsModal';
import { supabase } from './services/supabase';
import { OilSpillDetection, SearchFilters, Statistics } from './types/oilSpill';
import { ExportService } from './services/exportService';
import LoadingScreen from './components/layout/LoadingScreen';
import { useDetections } from './hooks/useDetections';

function App() {
  const [showOilSpills, setShowOilSpills] = useState(true);
  const [showNonOilSpills, setShowNonOilSpills] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedDetection, setSelectedDetection] = useState<OilSpillDetection | null>(null);
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

  const {
    detections,
    loading,
    error,
    refetch,
    updateDetection,
    deleteDetection,
    stats: detectionsStats,
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

  useEffect(() => {
    const handleMarkerDetailsClick = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const detectionId = customEvent.detail;
      const detection = detections.find((d) => d.id === detectionId);
      if (detection) {
        setSelectedDetection(detection);
      }
    };

    window.addEventListener('marker-details-click', handleMarkerDetailsClick);

    return () => {
      window.removeEventListener('marker-details-click', handleMarkerDetailsClick);
    };
  }, [detections]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    await fetchStatistics(); // Also refresh statistics
    setLastRefresh(new Date());
  }, [refetch, fetchStatistics]);

  const filteredDetections = useMemo(() => {
    return detections.filter(detection => {
      if (detection.status === 'Oil spill') return showOilSpills;
      if (detection.status === 'Non Oil spill') return showNonOilSpills;
      return false;
    });
  }, [detections, showOilSpills, showNonOilSpills]);

  useEffect(() => {
    console.log('📊 Fetching statistics (once on mount)');
    fetchStatistics();
  }, []);

  if (loading && detections.length === 0) {
    return <LoadingScreen message="Loading Detections" />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Oil Spill Detection System</h1>
                <p className="text-sm text-blue-100">Real-time monitoring and visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Statistics</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[1500] space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 animate-slide-in">
              <p className="text-sm text-gray-700">{notification}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <AdvancedSearch onSearch={setSearchFilters} onExport={handleExport} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all">
          <div className="p-6 space-y-6">
            <StatsPanel detections={filteredDetections} />
            
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
            
            <div className="text-xs text-gray-500 text-center">
              Last updated: {lastRefresh.toLocaleTimeString()}
              <br />
              Showing {filteredDetections.length} of {detections.length} detections
            </div>
          </div>
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 relative">
          <OilSpillMap
            detections={filteredDetections}
            showOilSpills={showOilSpills}
            showNonOilSpills={showNonOilSpills}
            onMarkerClick={setSelectedDetection}
          />
          <Legend />
          
          {/* Quick Stats Overlay */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredDetections.filter(d => d.status === 'Oil spill').length}
                </div>
                <div className="text-xs text-gray-600">Oil Spills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredDetections.filter(d => d.status === 'Non Oil spill').length}
                </div>
                <div className="text-xs text-gray-600">Clear</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detection Details Modal */}
      <DetectionDetailsModal
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
        onUpdate={handleUpdateDetection}
      />
    </div>
  );
}

export default App;