import { AlertCircle, CheckCircle, Database, TrendingUp } from 'lucide-react';
import { OilSpillDetection } from '../../types/oilSpill';

interface StatsPanelProps {
  detections: OilSpillDetection[];
  loading?: boolean;
}

const SkeletonStat: React.FC = () => (
  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="space-y-2">
      <div className="h-6 w-12 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-100 rounded" />
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ detections, loading = false }) => {
  const totalDetections = detections.length;
  const oilSpills = detections.filter(d => d.status === 'Oil spill').length;
  const nonOilSpills = detections.filter(d => d.status === 'Non Oil spill').length;
  const verifiedCount = detections.filter(d => d.validation_status === 'Verified').length;
  const verifiedPct = totalDetections > 0 ? Math.round((verifiedCount / totalDetections) * 100) : 0;

  if (loading) {
    return (
      <div data-testid="stats-panel" className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 gap-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="stats-panel" className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Statistics</h2>

      <div className="grid grid-cols-1 gap-4">
        <div data-testid="stat-total" className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-700" data-testid="total-count">
              {totalDetections}
            </div>
            <div className="text-sm text-gray-600">Total Detections</div>
          </div>
        </div>

        <div data-testid="stat-oil-spills" className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-700" data-testid="oil-spill-count">
              {oilSpills}
            </div>
            <div className="text-sm text-gray-600">Oil Spills</div>
          </div>
        </div>

        <div data-testid="stat-non-oil" className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700" data-testid="non-oil-count">
              {nonOilSpills}
            </div>
            <div className="text-sm text-gray-600">Non Oil Spills</div>
          </div>
        </div>

        {totalDetections > 0 && (
          <div data-testid="stat-verified" className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700" data-testid="verified-pct">
                {verifiedPct}%
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;
