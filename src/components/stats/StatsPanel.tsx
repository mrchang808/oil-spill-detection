import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { OilSpillDetection } from '../lib/supabase';

interface StatsPanelProps {
  detections: OilSpillDetection[];
}

const StatsPanel = ({ detections }: StatsPanelProps) => {
  const totalDetections = detections.length;
  const oilSpills = detections.filter(d => d.status === 'Oil spill').length;
  const nonOilSpills = detections.filter(d => d.status === 'Non Oil spill').length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Statistics</h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-700">{totalDetections}</div>
            <div className="text-sm text-gray-600">Total Detections</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-700">{oilSpills}</div>
            <div className="text-sm text-gray-600">Oil Spills</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{nonOilSpills}</div>
            <div className="text-sm text-gray-600">Non Oil Spills</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
