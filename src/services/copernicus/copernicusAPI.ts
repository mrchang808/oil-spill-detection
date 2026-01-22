/**
 * Copernicus Data Space API Integration
 */

import { CopernicusProduct } from '../../types/oilSpill';
import { authenticatedFetch } from './copernicusAuth';

// Use local proxy in DEV mode
const COPERNICUS_BASE_URL = import.meta.env.DEV 
  ? '/odata/v1' 
  : 'https://catalogue.dataspace.copernicus.eu/odata/v1';

interface CopernicusSearchParams {
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  platform?: 'SENTINEL-1' | 'SENTINEL-2';
  maxCloudCoverage?: number;
  bufferKm?: number;
}

export class CopernicusService {
  /**
   * Helper: Parse WKT Polygon to get BBox string "minX,minY,maxX,maxY"
   */
  private static getBboxFromWkt(wkt: string): string {
    try {
      // Remove POLYGON(( and )) and split coordinates
      const clean = wkt.replace(/^POLYGON\(\((.*)\)\)$/, '$1');
      const pairs = clean.split(',');
      let minX = 180, minY = 90, maxX = -180, maxY = -90;
      
      pairs.forEach(pair => {
        const [x, y] = pair.trim().split(' ').map(Number);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
      
      return `${minX},${minY},${maxX},${maxY}`;
    } catch (e) {
      console.warn("Failed to parse WKT:", wkt);
      return "-180,-90,180,90"; // Fallback global
    }
  }

  /**
   * Generate the Process Command String
   * Format: PROCESS|PLATFORM|ID|BBOX|DATE
   */
  static getProcessCommand(platform: 'SENTINEL-1' | 'SENTINEL-2', productId: string, wktFootprint: string, date: string): string {
    const bbox = this.getBboxFromWkt(wktFootprint);
    return `PROCESS|${platform}|${productId}|${bbox}|${date}`;
  }

  private static createBoundingBox(lat: number, lng: number, bufferKm: number = 50) {
    const kmPerDegree = 111.32;
    const latBuffer = bufferKm / kmPerDegree;
    const lngBuffer = bufferKm / (kmPerDegree * Math.cos((lat * Math.PI) / 180));
    return {
      minLat: lat - latBuffer,
      maxLat: lat + latBuffer,
      minLng: lng - lngBuffer,
      maxLng: lng + lngBuffer,
    };
  }

  static async searchSentinel1SAR(params: CopernicusSearchParams): Promise<CopernicusProduct[]> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);
    const footprint = `POLYGON((${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},${bbox.minLng} ${bbox.minLat}))`;
    const startDateStr = params.startDate.toISOString();
    const endDateStr = params.endDate.toISOString();

    const query = `${COPERNICUS_BASE_URL}/Products?$filter=` +
      `Collection/Name eq 'SENTINEL-1' and contains(Name, 'GRD') and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr} and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')` +
      `&$top=10&$orderby=ContentDate/Start desc`;

    try {
      const response = await authenticatedFetch(query);
      if (!response.ok) return [];
      const data = await response.json();
      
      return (data.value || []).map((item: any) => ({
        id: item.Id,
        title: item.Name,
        platform: 'SENTINEL-1',
        instrument: 'SAR',
        acquisition_date: item.ContentDate.Start,
        footprint: item.Footprint,
        // ✅ NEW: Embed BBox and Date into the command
        preview_url: this.getProcessCommand('SENTINEL-1', item.Name, item.Footprint, item.ContentDate.Start),
        download_url: `${COPERNICUS_BASE_URL}/Products(${item.Id})/$value`,
      }));
    } catch (error) {
      console.error('Error fetching Sentinel-1:', error);
      return [];
    }
  }

  static async searchSentinel2MSI(params: CopernicusSearchParams): Promise<CopernicusProduct[]> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);
    const footprint = `POLYGON((${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},${bbox.minLng} ${bbox.minLat}))`;
    
    const query = `${COPERNICUS_BASE_URL}/Products?$filter=` +
      `Collection/Name eq 'SENTINEL-2' and contains(Name, 'L2A') and ` +
      `ContentDate/Start ge ${params.startDate.toISOString()} and ContentDate/Start le ${params.endDate.toISOString()} and ` +
      `Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le ${params.maxCloudCoverage || 20}) and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')` +
      `&$top=10&$orderby=ContentDate/Start desc`;

    try {
      const response = await authenticatedFetch(query);
      if (!response.ok) return [];
      const data = await response.json();

      return (data.value || []).map((item: any) => ({
        id: item.Id,
        title: item.Name,
        platform: 'SENTINEL-2',
        instrument: 'MSI',
        acquisition_date: item.ContentDate.Start,
        footprint: item.Footprint,
        cloud_coverage: item.Attributes?.find((a: any) => a.Name === 'cloudCover')?.Value,
        // ✅ NEW: Embed BBox and Date into the command
        preview_url: this.getProcessCommand('SENTINEL-2', item.Name, item.Footprint, item.ContentDate.Start),
        download_url: `${COPERNICUS_BASE_URL}/Products(${item.Id})/$value`,
      }));
    } catch (error) {
      console.error('Error fetching Sentinel-2:', error);
      return [];
    }
  }
}

export async function findSatelliteImagery(lat: number, lng: number, date: Date) {
  const start = new Date(date); start.setDate(start.getDate() - 3);
  const end = new Date(date); end.setDate(end.getDate() + 3);
  const params = { latitude: lat, longitude: lng, startDate: start, endDate: end, bufferKm: 30 };
  
  const [sar, optical] = await Promise.all([
    CopernicusService.searchSentinel1SAR(params),
    CopernicusService.searchSentinel2MSI(params)
  ]);
  return { sar, optical };
}