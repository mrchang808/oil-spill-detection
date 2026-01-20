import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, MapPin, Filter, X, Download } from 'lucide-react';
import { SearchFilters } from '../../types/oilSpill';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onExport: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ✅ FIXED: Create initial dates ONCE using useMemo
  const initialDates = useMemo(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  }), []); // Empty deps = created once, never changes

  // ✅ FIXED: Use the memoized dates
  const [filters, setFilters] = useState<SearchFilters>({
    status: 'all',
    severity: [],
    responseStatus: [],
    validationStatus: [],
    // ✅ Comment out dateRange by default to prevent infinite loops
    // Uncomment if you want date filtering:
    // dateRange: initialDates,
    searchText: '',
    tags: []
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [radius, setRadius] = useState(50);
  const [tagInput, setTagInput] = useState('');

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const responseOptions = ['Pending', 'Investigating', 'Responding', 'Contained', 'Cleaned'];
  const validationOptions = ['Unverified', 'Verified', 'False Positive'];

  // ✅ FIXED: Debounce to prevent too many calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      console.log('🔍 AdvancedSearch calling onSearch with filters:', filters);
      onSearch(filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, onSearch]); // This is OK now because filters won't change unless user acts

  const handleLocationSearch = async () => {
    if (!locationSearch) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        setFilters({
          ...filters,
          location: {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            radius: radius
          }
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const toggleArrayFilter = (array: string[], value: string, key: keyof SearchFilters) => {
    const current = filters[key] as string[] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    setFilters({ ...filters, [key]: updated });
  };

  const addTag = () => {
    if (tagInput && !filters.tags?.includes(tagInput)) {
      setFilters({
        ...filters,
        tags: [...(filters.tags || []), tagInput]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags?.filter(t => t !== tag) || []
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      severity: [],
      responseStatus: [],
      validationStatus: [],
      // ✅ Keep dateRange cleared to prevent loops
      // dateRange: initialDates,
      searchText: '',
      tags: []
    });
    setLocationSearch('');
  };

  // ✅ NEW: Handler to set date range (only when user explicitly changes it)
  const handleDateRangeChange = (startOrEnd: 'start' | 'end', value: string) => {
    const newDate = new Date(value);
    
    setFilters({
      ...filters,
      dateRange: {
        start: startOrEnd === 'start' ? newDate : (filters.dateRange?.start || initialDates.start),
        end: startOrEnd === 'end' ? newDate : (filters.dateRange?.end || initialDates.end)
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      {/* Main Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by keywords, notes, or product ID..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Date Range - Optional, only set when user explicitly changes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
                  onChange={(e) => e.target.value && handleDateRangeChange('start', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
                  onChange={(e) => e.target.value && handleDateRangeChange('end', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Search</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Enter location name..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="number"
                placeholder="Radius (km)"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleLocationSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detection Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, status: 'all' })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'Oil spill' })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'Oil spill' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Oil Spill
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'Non Oil spill' })}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'Non Oil spill' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non Oil Spill
              </button>
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map(severity => (
                <button
                  key={severity}
                  onClick={() => toggleArrayFilter(filters.severity || [], severity, 'severity')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.severity?.includes(severity)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Response Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Status</label>
            <div className="flex flex-wrap gap-2">
              {responseOptions.map(status => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter(filters.responseStatus || [], status, 'responseStatus')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.responseStatus?.includes(status)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Validation Status</label>
            <div className="flex flex-wrap gap-2">
              {validationOptions.map(status => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter(filters.validationStatus || [], status, 'validationStatus')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.validationStatus?.includes(status)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;