import { Filter } from 'lucide-react';

interface FilterControlsProps {
  showOilSpills: boolean;
  showNonOilSpills: boolean;
  onToggleOilSpills: () => void;
  onToggleNonOilSpills: () => void;
}

const FilterControls = ({
  showOilSpills,
  showNonOilSpills,
  onToggleOilSpills,
  onToggleNonOilSpills,
}: FilterControlsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={showOilSpills}
              onChange={onToggleOilSpills}
              className="w-5 h-5 rounded border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
            />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none">
            Show Oil Spills
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={showNonOilSpills}
              onChange={onToggleNonOilSpills}
              className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
            />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none">
            Show Non Oil Spills
          </span>
        </label>
      </div>
    </div>
  );
};

export default FilterControls;
