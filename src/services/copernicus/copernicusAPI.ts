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

interface CopernicusAttribute {
  Name: string;
  Value?: number;
}

interface CopernicusODataProduct {
  Id: string;
  Name: string;
  ContentDate: {
    Start: string;
  };
  Footprint: string;
  Attributes?: CopernicusAttribute[];
}

interface CopernicusODataResponse {
  value?: CopernicusODataProduct[];
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return 'Unable to read error response body';
  }
}

function buildProductsQuery(filter: string, top: number = 10): string {
  const params = new URLSearchParams({
    '$filter': filter,
    '$top': String(top),
    '$orderby': 'ContentDate/Start desc',
  });
  return `${COPERNICUS_BASE_URL}/Products?${params.toString()}`;
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
    } catch {
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

  private static createWktFromPoint(lat: number, lng: number, bufferKm: number = 8): string {
    const bbox = this.createBoundingBox(lat, lng, bufferKm);
    return `POLYGON((${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},${bbox.minLng} ${bbox.minLat}))`;
  }

  static createFallbackProcessProducts(lat: number, lng: number, date: Date): { sar: CopernicusProduct[]; optical: CopernicusProduct[] } {
    const detectionDate = date.toISOString();
    const wkt = this.createWktFromPoint(lat, lng, 8);

    return {
      sar: [
        {
          id: `fallback-s1-${detectionDate}`,
          title: 'Sentinel-1 (Fallback Area Preview)',
          platform: 'SENTINEL-1',
          instrument: 'SAR',
          acquisition_date: detectionDate,
          footprint: wkt,
          preview_url: this.getProcessCommand('SENTINEL-1', 'fallback', wkt, detectionDate),
        }
      ],
      optical: [
        {
          id: `fallback-s2-${detectionDate}`,
          title: 'Sentinel-2 (Fallback Area Preview)',
          platform: 'SENTINEL-2',
          instrument: 'MSI',
          acquisition_date: detectionDate,
          footprint: wkt,
          preview_url: this.getProcessCommand('SENTINEL-2', 'fallback', wkt, detectionDate),
        }
      ]
    };
  }

  static async searchSentinel1SAR(params: CopernicusSearchParams): Promise<CopernicusProduct[]> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);
    const footprint = `POLYGON((${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},${bbox.minLng} ${bbox.minLat}))`;
    const startDateStr = params.startDate.toISOString();
    const endDateStr = params.endDate.toISOString();

    const strictFilter =
      `Collection/Name eq 'SENTINEL-1' and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr} and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')`;

    const fallbackFilter =
      `Collection/Name eq 'SENTINEL-1' and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr}`;

    try {
      const response = await authenticatedFetch(buildProductsQuery(strictFilter));
      if (!response.ok) {
        const errorBody = await parseErrorResponse(response);
        console.error(`Sentinel-1 query failed (${response.status}):`, errorBody);
        return [];
      }
      const data = (await response.json()) as CopernicusODataResponse;

      let products = data.value || [];
      if (products.length === 0) {
        const fallbackResponse = await authenticatedFetch(buildProductsQuery(fallbackFilter));
        if (fallbackResponse.ok) {
          const fallbackData = (await fallbackResponse.json()) as CopernicusODataResponse;
          products = fallbackData.value || [];
        }
      }

      return products.map((item) => ({
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
    const startDateStr = params.startDate.toISOString();
    const endDateStr = params.endDate.toISOString();

    const filters = [
      `Collection/Name eq 'SENTINEL-2'`,
      `ContentDate/Start ge ${startDateStr}`,
      `ContentDate/Start le ${endDateStr}`,
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')`,
    ];

    if (typeof params.maxCloudCoverage === 'number') {
      filters.push(`Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le ${params.maxCloudCoverage})`);
    }

    const strictFilter = filters.join(' and ');
    const fallbackFilter =
      `Collection/Name eq 'SENTINEL-2' and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr}`;

    try {
      const response = await authenticatedFetch(buildProductsQuery(strictFilter));
      if (!response.ok) {
        const errorBody = await parseErrorResponse(response);
        console.error(`Sentinel-2 query failed (${response.status}):`, errorBody);
        return [];
      }
      const data = (await response.json()) as CopernicusODataResponse;

      let products = data.value || [];
      if (products.length === 0) {
        const fallbackResponse = await authenticatedFetch(buildProductsQuery(fallbackFilter));
        if (fallbackResponse.ok) {
          const fallbackData = (await fallbackResponse.json()) as CopernicusODataResponse;
          products = fallbackData.value || [];
        }
      }

      return products.map((item) => ({
        id: item.Id,
        title: item.Name,
        platform: 'SENTINEL-2',
        instrument: 'MSI',
        acquisition_date: item.ContentDate.Start,
        footprint: item.Footprint,
        cloud_coverage: item.Attributes?.find((a) => a.Name === 'cloudCover')?.Value,
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
  
  let [sar, optical] = await Promise.all([
    CopernicusService.searchSentinel1SAR(params),
    CopernicusService.searchSentinel2MSI(params)
  ]);

  if (sar.length === 0 && optical.length === 0) {
    const fallbackStart = new Date(date); fallbackStart.setDate(fallbackStart.getDate() - 14);
    const fallbackEnd = new Date(date); fallbackEnd.setDate(fallbackEnd.getDate() + 14);
    const fallbackParams = {
      latitude: lat,
      longitude: lng,
      startDate: fallbackStart,
      endDate: fallbackEnd,
      bufferKm: 60,
      maxCloudCoverage: undefined,
    };

    console.warn('No satellite products in primary window, retrying with wider search window...');

    [sar, optical] = await Promise.all([
      CopernicusService.searchSentinel1SAR(fallbackParams),
      CopernicusService.searchSentinel2MSI(fallbackParams)
    ]);
  }

  if (sar.length === 0 && optical.length === 0) {
    console.warn('No catalog products found after retries. Using process-area fallback previews.');
    return CopernicusService.createFallbackProcessProducts(lat, lng, date);
  }

  return { sar, optical };
}