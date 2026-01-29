import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, MapPin, Filter, X, Download } from 'lucide-react';
import { SearchFilters } from '../../types/oilSpill';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onExport: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchText, setLocalSearchText] = useState('');
  
  // Initial state for filters
  const initialFilters: SearchFilters = useMemo(() => ({
    status: 'all',
    severity: [],
    responseStatus: [],
    validationStatus: [],
    searchText: '',
    tags: []
  }), []);

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [locationSearch, setLocationSearch] = useState('');
  const [radius, setRadius] = useState(50);
  const [tagInput, setTagInput] = useState('');

  // 1. DEBOUNCE TEXT SEARCH ONLY (Prevents loop on typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger if text actually changed from what's in filters
      if (localSearchText !== filters.searchText) {
        const newFilters = { ...filters, searchText: localSearchText };
        setFilters(newFilters);
        onSearch(newFilters);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchText]); // Only depend on local text state

  // 2. IMMEDIATE UPDATE HELPER (For buttons/selects)
  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onSearch(newFilters); // Trigger App update immediately
  };

  const handleLocationSearch = async () => {
    if (!locationSearch) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        updateFilters({
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

  const toggleArrayFilter = (array: string[] | undefined, value: string, key: keyof SearchFilters) => {
    const current = array || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    updateFilters({ ...filters, [key]: updated });
  };

  const addTag = () => {
    if (tagInput && !filters.tags?.includes(tagInput)) {
      updateFilters({
        ...filters,
        tags: [...(filters.tags || []), tagInput]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({
      ...filters,
      tags: filters.tags?.filter(t => t !== tag) || []
    });
  };

  const clearFilters = () => {
    setLocalSearchText('');
    setLocationSearch('');
    updateFilters(initialFilters);
  };

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const responseOptions = ['Pending', 'Investigating', 'Responding', 'Contained', 'Cleaned'];
  const validationOptions = ['Unverified', 'Verified', 'False Positive'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      {/* Main Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by keywords..."
            value={localSearchText}
            onChange={(e) => setLocalSearchText(e.target.value)}
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
              {['all', 'Oil spill', 'Non Oil spill'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateFilters({ ...filters, status: status as any })}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    filters.status === status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map(severity => (
                <button
                  key={severity}
                  onClick={() => toggleArrayFilter(filters.severity, severity, 'severity')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.severity?.includes(severity) ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity}
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
              <button onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags?.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-blue-600"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={clearFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Clear All Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;