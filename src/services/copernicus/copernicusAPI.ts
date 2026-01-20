/**
 * Copernicus Data Space API Integration (UPDATED VERSION)
 * Now includes proper authentication and error handling
 * 
 * Documentation: https://documentation.dataspace.copernicus.eu/APIs/OData.html
 */

import { CopernicusProduct } from '../../types/oilSpill';
import { authenticatedFetch } from './copernicusAuth';

const COPERNICUS_BASE_URL = 'https://catalogue.dataspace.copernicus.eu/odata/v1';
const COPERNICUS_STAC_URL = 'https://catalogue.dataspace.copernicus.eu/stac';

interface CopernicusSearchParams {
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  platform?: 'SENTINEL-1' | 'SENTINEL-2' | 'SENTINEL-3';
  productType?: string;
  maxCloudCoverage?: number;
  bufferKm?: number;
}

export class CopernicusService {
  /**
   * Create a bounding box around a point
   */
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

  /**
   * Create WKT polygon from bounding box
   */
  private static createWKTPolygon(bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number }): string {
    return `POLYGON((${bbox.minLng} ${bbox.minLat},${bbox.maxLng} ${bbox.minLat},${bbox.maxLng} ${bbox.maxLat},${bbox.minLng} ${bbox.maxLat},${bbox.minLng} ${bbox.minLat}))`;
  }

  /**
   * Search for Sentinel-1 SAR products
   */
  static async searchSentinel1SAR(params: CopernicusSearchParams): Promise<CopernicusProduct[]> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);
    const footprint = this.createWKTPolygon(bbox);

    const startDateStr = params.startDate.toISOString();
    const endDateStr = params.endDate.toISOString();

    // OData query for Sentinel-1 GRD products
    const query =
      `${COPERNICUS_BASE_URL}/Products?$filter=` +
      `Collection/Name eq 'SENTINEL-1' and ` +
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'GRD') and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr} and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')` +
      `&$top=10&$orderby=ContentDate/Start desc&$expand=Attributes`;

    try {
      const response = await authenticatedFetch(query);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Copernicus API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.value || data.value.length === 0) {
        console.warn(' No Sentinel-1 products found for the given parameters');
        return [];
      }

      return data.value.map((item: any) => ({
        id: item.Id,
        title: item.Name,
        platform: 'SENTINEL-1',
        instrument: 'SAR',
        acquisition_date: item.ContentDate.Start,
        footprint: item.Footprint,
        preview_url: item.Id ? `${COPERNICUS_BASE_URL}/Products(${item.Id})/Quicklook/$value` : undefined,
        download_url: `${COPERNICUS_BASE_URL}/Products(${item.Id})/$value`,
        cloud_coverage: null,
      }));
    } catch (error) {
      console.error(' Error fetching Sentinel-1 data:', error);
      throw error;
    }
  }

  /**
   * Search for Sentinel-2 optical products
   */
  static async searchSentinel2MSI(params: CopernicusSearchParams): Promise<CopernicusProduct[]> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);
    const footprint = this.createWKTPolygon(bbox);

    const startDateStr = params.startDate.toISOString();
    const endDateStr = params.endDate.toISOString();
    const maxCloud = params.maxCloudCoverage || 20;

    // OData query for Sentinel-2 L2A products with cloud coverage filter
    const query =
      `${COPERNICUS_BASE_URL}/Products?$filter=` +
      `Collection/Name eq 'SENTINEL-2' and ` +
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'S2MSI2A') and ` +
      `ContentDate/Start ge ${startDateStr} and ContentDate/Start le ${endDateStr} and ` +
      `Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le ${maxCloud}) and ` +
      `OData.CSC.Intersects(area=geography'SRID=4326;${footprint}')` +
      `&$top=10&$orderby=ContentDate/Start desc&$expand=Attributes`;

    try {
      // USING AUTHENTICATED FETCH
      const response = await authenticatedFetch(query);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Copernicus API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.value || data.value.length === 0) {
        console.warn(' No Sentinel-2 products found for the given parameters');
        return [];
      }

      return data.value.map((item: any) => {
        const cloudCover = item.Attributes?.find((att: any) => att.Name === 'cloudCover')?.Value;

        return {
          id: item.Id,
          title: item.Name,
          platform: 'SENTINEL-2',
          instrument: 'MSI',
          acquisition_date: item.ContentDate.Start,
          footprint: item.Footprint,
          preview_url: item.Id ? `${COPERNICUS_BASE_URL}/Products(${item.Id})/Quicklook/$value` : undefined,
          download_url: `${COPERNICUS_BASE_URL}/Products(${item.Id})/$value`,
          cloud_coverage: cloudCover,
        };
      });
    } catch (error) {
      console.error(' Error fetching Sentinel-2 data:', error);
      throw error;
    }
  }

  /**
   * Get quicklook/preview URL for a product
   */
  static getQuicklookUrl(productId: string): string {
    return `${COPERNICUS_BASE_URL}/Products(${productId})/Quicklook/$value`;
  }

  /**
   * STAC API search (alternative modern approach)
   */
  static async searchSTAC(params: CopernicusSearchParams): Promise<any> {
    const bbox = this.createBoundingBox(params.latitude, params.longitude, params.bufferKm || 50);

    const searchBody = {
      bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
      datetime: `${params.startDate.toISOString()}/${params.endDate.toISOString()}`,
      collections: params.platform
        ? [`${params.platform.toLowerCase()}-grd`]
        : ['sentinel-1-grd', 'sentinel-2-l2a'],
      limit: 10,
      query: params.maxCloudCoverage
        ? {
            'eo:cloud_cover': {
              lte: params.maxCloudCoverage,
            },
          }
        : undefined,
    };

    try {
      const response = await fetch(`${COPERNICUS_STAC_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        throw new Error(`STAC API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching STAC data:', error);
      return null;
    }
  }

  /**
   * Get WMS layer URL for visualization
   */
  static getWMSUrl(productId: string, bands?: string): string {
    const baseWMS = 'https://sh.dataspace.copernicus.eu/ogc/wms';
    return `${baseWMS}/${productId}?service=WMS&version=1.3.0&request=GetMap&layers=${bands || 'TRUE_COLOR'}&format=image/png`;
  }

  /** Batch search for multiple products */
  static async batchSearch(
    locations: Array<{ lat: number; lng: number }>,
    params: Omit<CopernicusSearchParams, 'latitude' | 'longitude'>
  ): Promise<Map<string, CopernicusProduct[]>> {
    const results = new Map<string, CopernicusProduct[]>();

    await Promise.all(
      locations.map(async (loc) => {
        try {
          const products = await this.searchSentinel1SAR({
            ...params,
            latitude: loc.lat,
            longitude: loc.lng,
          });
          const key = `${loc.lat},${loc.lng}`;
          results.set(key, products);
        } catch (error) {
          console.error(`Error searching for location ${loc.lat},${loc.lng}:`, error);
          results.set(`${loc.lat},${loc.lng}`, []);
        }
      })
    );

    return results;
  }
}

/**
Helper function with error handling
 */
export async function findSatelliteImagery(
  latitude: number,
  longitude: number,
  detectionDate: Date,
  daysBefore: number = 3,
  daysAfter: number = 3
): Promise<{ sar: CopernicusProduct[]; optical: CopernicusProduct[]; error?: string }> {
  const startDate = new Date(detectionDate);
  startDate.setDate(startDate.getDate() - daysBefore);
  
  const endDate = new Date(detectionDate);
  endDate.setDate(endDate.getDate() + daysAfter);

  const searchParams: CopernicusSearchParams = {
    latitude,
    longitude,
    startDate,
    endDate,
    bufferKm: 30,
  };

  try {
    const [sarProducts, opticalProducts] = await Promise.allSettled([
      CopernicusService.searchSentinel1SAR(searchParams),
      CopernicusService.searchSentinel2MSI({ ...searchParams, maxCloudCoverage: 20 }),
    ]);

    return {
      sar: sarProducts.status === 'fulfilled' ? sarProducts.value : [],
      optical: opticalProducts.status === 'fulfilled' ? opticalProducts.value : [],
      error:
        sarProducts.status === 'rejected' || opticalProducts.status === 'rejected'
          ? 'Some imagery could not be loaded'
          : undefined,
    };
  } catch (error) {
    console.error('Error in findSatelliteImagery:', error);
    return {
      sar: [],
      optical: [],
      error: error instanceof Error ? error.message : 'Failed to load satellite imagery',
    };
  }
}
