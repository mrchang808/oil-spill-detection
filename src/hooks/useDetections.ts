import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import { OilSpillDetection, SearchFilters } from '../types/oilSpill';

interface UseDetectionsOptions {
  filters?: SearchFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDetectionsReturn {
  detections: OilSpillDetection[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateDetection: (id: string, updates: Partial<OilSpillDetection>) => Promise<void>;
  deleteDetection: (id: string) => Promise<void>;
  stats: {
    total: number;
    oilSpills: number;
    nonOilSpills: number;
    verified: number;
    critical: number;
  };
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Custom hook for managing oil spill detections
 * ✅ FIXED - Prevents infinite loops
 */
export const useDetections = (options: UseDetectionsOptions = {}): UseDetectionsReturn => {
  const {
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  const [detections, setDetections] = useState<OilSpillDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // ✅ Prevent infinite loops with ref
  const isFetchingRef = useRef(false);

  /**
   * Fetch detections from Supabase
   */
  const fetchDetections = useCallback(async () => {
    // ✅ Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('⚠️ Fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      let query = supabase
        .from('oil_spill_detections')
        .select('*')
        .order('detected_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.severity && filters.severity.length > 0) {
          query = query.in('severity', filters.severity);
        }

        if (filters.responseStatus && filters.responseStatus.length > 0) {
          query = query.in('response_status', filters.responseStatus);
        }

        if (filters.validationStatus && filters.validationStatus.length > 0) {
          query = query.in('validation_status', filters.validationStatus);
        }

        if (filters.dateRange) {
          query = query
            .gte('detected_at', filters.dateRange.start.toISOString())
            .lte('detected_at', filters.dateRange.end.toISOString());
        }

        if (filters.searchText) {
          query = query.or(
            `notes.ilike.%${filters.searchText}%,copernicus_product_id.ilike.%${filters.searchText}%`
          );
        }

        if (filters.tags && filters.tags.length > 0) {
          query = query.contains('tags', filters.tags);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      // Apply location filter (client-side)
      if (filters?.location) {
        const { lat, lng, radius } = filters.location;
        filteredData = filteredData.filter((d) => {
          const distance = calculateDistance(lat, lng, d.latitude, d.longitude);
          return distance <= radius;
        });
      }

      setDetections(filteredData);
      console.log(`✅ Fetched ${filteredData.length} detections`);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('❌ Error fetching detections:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [filters]);

  /**
   * Update a detection
   */
  const updateDetection = useCallback(
    async (id: string, updates: Partial<OilSpillDetection>) => {
      try {
        // Optimistic update
        setDetections((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d))
        );

        const { error } = await supabase
          .from('oil_spill_detections')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        const error = err as Error;
        console.error('❌ Error updating detection:', error);
        await fetchDetections();
        throw error;
      }
    },
    [fetchDetections]
  );

  /**
   * Delete a detection
   */
  const deleteDetection = useCallback(
    async (id: string) => {
      try {
        setDetections((prev) => prev.filter((d) => d.id !== id));

        const { error } = await supabase.from('oil_spill_detections').delete().eq('id', id);

        if (error) throw error;
      } catch (err) {
        const error = err as Error;
        console.error('❌ Error deleting detection:', error);
        await fetchDetections();
        throw error;
      }
    },
    [fetchDetections]
  );

  /**
   * Compute statistics
   */
  const stats = useMemo(() => {
    const oilSpills = detections.filter((d) => d.status === 'Oil spill');
    
    return {
      total: detections.length,
      oilSpills: oilSpills.length,
      nonOilSpills: detections.filter((d) => d.status === 'Non Oil spill').length,
      verified: detections.filter((d) => d.validation_status === 'Verified').length,
      critical: oilSpills.filter((d) => d.severity === 'Critical').length,
    };
  }, [detections]);

  /**
   * ✅ Fetch on mount and when filters change
   */
  useEffect(() => {
    console.log('🔄 Fetch triggered (mount or filters changed)');
    fetchDetections();
  }, [fetchDetections]);

  /**
   * ✅ Set up real-time subscription
   */
  useEffect(() => {
    console.log('🔌 Setting up real-time subscription');
    
    const channel = supabase
      .channel('oil-spills-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'oil_spill_detections' },
        (payload) => {
          console.log('✅ New detection inserted:', payload.new);
          setDetections((prev) => [payload.new as OilSpillDetection, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'oil_spill_detections' },
        (payload) => {
          console.log('✅ Detection updated:', payload.new);
          setDetections((prev) =>
            prev.map((d) => (d.id === payload.new.id ? (payload.new as OilSpillDetection) : d))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'oil_spill_detections' },
        (payload) => {
          console.log('✅ Detection deleted:', payload.old);
          setDetections((prev) => prev.filter((d) => d.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      channel.unsubscribe();
    };
  }, []); // ← Empty deps = only set up once

  /**
   * ✅ Auto-refresh (optional)
   */
  useEffect(() => {
    if (!autoRefresh) return;

    console.log(`⏰ Auto-refresh enabled (every ${refreshInterval}ms)`);
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered');
      fetchDetections();
    }, refreshInterval);

    return () => {
      console.log('⏰ Clearing auto-refresh');
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchDetections]);

  return {
    detections,
    loading,
    error,
    refetch: fetchDetections,
    updateDetection,
    deleteDetection,
    stats,
  };
};

export default useDetections;