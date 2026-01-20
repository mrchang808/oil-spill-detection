// Enhanced types for Oil Spill Detection System

export interface OilSpillDetection {
  id: string;
  latitude: number;
  longitude: number;
  status: 'Oil spill' | 'Non Oil spill';
  detected_at: string;
  confidence?: number;
  source?: string;
  created_at: string;
  
  // New fields
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  area_affected_km2?: number;
  response_status?: 'Pending' | 'Investigating' | 'Responding' | 'Contained' | 'Cleaned';
  validation_status?: 'Unverified' | 'Verified' | 'False Positive';
  sar_image_url?: string;
  optical_image_url?: string;
  copernicus_product_id?: string;
  wind_speed_ms?: number;
  sea_state?: string;
  notes?: string;
  tags?: string[];
  news_correlation?: NewsArticle[];
  updated_at?: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  published_date: string;
  source: string;
  relevance_score?: number;
}

export interface SearchFilters {
  status?: 'Oil spill' | 'Non Oil spill' | 'all';
  severity?: string[];
  responseStatus?: string[];
  validationStatus?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
  searchText?: string;
  tags?: string[];
}

export interface Statistics {
  total_detections: number;
  oil_spills: number;
  non_oil_spills: number;
  verified_spills: number;
  critical_spills: number;
  avg_area_affected: number;
  last_24h: number;
  last_week: number;
}

export interface CopernicusProduct {
  id: string;
  title: string;
  platform: string;
  instrument: string;
  acquisition_date: string;
  footprint: string; // WKT format
  preview_url?: string;
  download_url?: string;
  cloud_coverage?: number;
}
