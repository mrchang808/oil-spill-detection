// Data Export Service for Oil Spill Detection System

import { OilSpillDetection } from '../types/oilSpill';

export class ExportService {
  /**
   * Export detections to CSV format
   */
  static exportToCSV(detections: OilSpillDetection[], filename: string = 'oil_spill_detections.csv'): void {
    // Define CSV headers
    const headers = [
      'ID',
      'Status',
      'Latitude',
      'Longitude',
      'Detected At',
      'Confidence',
      'Severity',
      'Area Affected (km²)',
      'Response Status',
      'Validation Status',
      'Source',
      'Wind Speed (m/s)',
      'Sea State',
      'SAR Image URL',
      'Optical Image URL',
      'Copernicus Product ID',
      'Tags',
      'Notes',
      'Created At',
      'Updated At'
    ];

    // Convert detections to CSV rows
    const rows = detections.map(d => [
      d.id,
      d.status,
      d.latitude,
      d.longitude,
      d.detected_at,
      d.confidence || '',
      d.severity || '',
      d.area_affected_km2 || '',
      d.response_status || '',
      d.validation_status || '',
      d.source || '',
      d.wind_speed_ms || '',
      d.sea_state || '',
      d.sar_image_url || '',
      d.optical_image_url || '',
      d.copernicus_product_id || '',
      d.tags?.join('; ') || '',
      d.notes?.replace(/,/g, ';') || '', // Replace commas in notes to avoid CSV issues
      d.created_at,
      d.updated_at || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export detections to JSON format
   */
  static exportToJSON(detections: OilSpillDetection[], filename: string = 'oil_spill_detections.json'): void {
    const jsonContent = JSON.stringify(detections, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Export to GeoJSON format for GIS applications
   */
  static exportToGeoJSON(detections: OilSpillDetection[], filename: string = 'oil_spill_detections.geojson'): void {
    const geoJSON = {
      type: 'FeatureCollection',
      features: detections.map(d => ({
        type: 'Feature',
        properties: {
          id: d.id,
          status: d.status,
          detected_at: d.detected_at,
          confidence: d.confidence,
          severity: d.severity,
          area_affected_km2: d.area_affected_km2,
          response_status: d.response_status,
          validation_status: d.validation_status,
          source: d.source,
          wind_speed_ms: d.wind_speed_ms,
          sea_state: d.sea_state,
          sar_image_url: d.sar_image_url,
          optical_image_url: d.optical_image_url,
          copernicus_product_id: d.copernicus_product_id,
          tags: d.tags,
          notes: d.notes,
          news_correlation: d.news_correlation,
          created_at: d.created_at,
          updated_at: d.updated_at
        },
        geometry: {
          type: 'Point',
          coordinates: [d.longitude, d.latitude]
        }
      }))
    };

    const jsonContent = JSON.stringify(geoJSON, null, 2);
    this.downloadFile(jsonContent, filename, 'application/geo+json');
  }

  /**
   * Export to KML format for Google Earth
   */
  static exportToKML(detections: OilSpillDetection[], filename: string = 'oil_spill_detections.kml'): void {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Oil Spill Detections</name>
    <description>Oil spill detection data exported from the monitoring system</description>
    
    <!-- Define styles for different statuses -->
    <Style id="oil_spill">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/warning.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="non_oil_spill">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>0.8</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/info.png</href>
        </Icon>
      </IconStyle>
    </Style>`;

    const placemarks = detections.map(d => {
      const styleId = d.status === 'Oil spill' ? 'oil_spill' : 'non_oil_spill';
      const description = `
        <![CDATA[
          <b>Status:</b> ${d.status}<br/>
          <b>Detected:</b> ${new Date(d.detected_at).toLocaleString()}<br/>
          ${d.confidence ? `<b>Confidence:</b> ${(d.confidence * 100).toFixed(1)}%<br/>` : ''}
          ${d.severity ? `<b>Severity:</b> ${d.severity}<br/>` : ''}
          ${d.area_affected_km2 ? `<b>Area Affected:</b> ${d.area_affected_km2} km²<br/>` : ''}
          ${d.response_status ? `<b>Response Status:</b> ${d.response_status}<br/>` : ''}
          ${d.validation_status ? `<b>Validation:</b> ${d.validation_status}<br/>` : ''}
          ${d.source ? `<b>Source:</b> ${d.source}<br/>` : ''}
          ${d.notes ? `<b>Notes:</b> ${d.notes}<br/>` : ''}
        ]]>
      `;

      return `
    <Placemark>
      <name>${d.status} - ${d.id.substring(0, 8)}</name>
      <description>${description}</description>
      <styleUrl>#${styleId}</styleUrl>
      <Point>
        <coordinates>${d.longitude},${d.latitude},0</coordinates>
      </Point>
      <TimeStamp>
        <when>${new Date(d.detected_at).toISOString()}</when>
      </TimeStamp>
    </Placemark>`;
    }).join('');

    const kmlFooter = `
  </Document>
</kml>`;

    const kmlContent = kmlHeader + placemarks + kmlFooter;
    this.downloadFile(kmlContent, filename, 'application/vnd.google-earth.kml+xml');
  }

  /**
   * Generate summary report
   */
  static generateSummaryReport(detections: OilSpillDetection[]): string {
    const oilSpills = detections.filter(d => d.status === 'Oil spill');
    const nonOilSpills = detections.filter(d => d.status === 'Non Oil spill');
    const verifiedSpills = oilSpills.filter(d => d.validation_status === 'Verified');
    const criticalSpills = oilSpills.filter(d => d.severity === 'Critical');
    const highSpills = oilSpills.filter(d => d.severity === 'High');
    
    const totalArea = oilSpills
      .filter(d => d.area_affected_km2)
      .reduce((sum, d) => sum + (d.area_affected_km2 || 0), 0);

    const avgArea = totalArea / oilSpills.filter(d => d.area_affected_km2).length || 0;

    const last24h = detections.filter(d => {
      const hours = (Date.now() - new Date(d.detected_at).getTime()) / (1000 * 60 * 60);
      return hours <= 24;
    });

    const last7days = detections.filter(d => {
      const days = (Date.now() - new Date(d.detected_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    });

    const report = `
OIL SPILL DETECTION SYSTEM - SUMMARY REPORT
Generated: ${new Date().toLocaleString()}
============================================

OVERVIEW
--------
Total Detections: ${detections.length}
Oil Spills: ${oilSpills.length}
Non-Oil Spills: ${nonOilSpills.length}
Verified Spills: ${verifiedSpills.length}

SEVERITY BREAKDOWN
------------------
Critical: ${criticalSpills.length}
High: ${highSpills.filter(d => d.severity === 'High').length}
Medium: ${oilSpills.filter(d => d.severity === 'Medium').length}
Low: ${oilSpills.filter(d => d.severity === 'Low').length}
Unassessed: ${oilSpills.filter(d => !d.severity).length}

RESPONSE STATUS
---------------
Pending: ${oilSpills.filter(d => d.response_status === 'Pending').length}
Investigating: ${oilSpills.filter(d => d.response_status === 'Investigating').length}
Responding: ${oilSpills.filter(d => d.response_status === 'Responding').length}
Contained: ${oilSpills.filter(d => d.response_status === 'Contained').length}
Cleaned: ${oilSpills.filter(d => d.response_status === 'Cleaned').length}

IMPACT METRICS
--------------
Total Area Affected: ${totalArea.toFixed(2)} km²
Average Area per Spill: ${avgArea.toFixed(2)} km²

RECENT ACTIVITY
---------------
Last 24 Hours: ${last24h.length} detections (${last24h.filter(d => d.status === 'Oil spill').length} oil spills)
Last 7 Days: ${last7days.length} detections (${last7days.filter(d => d.status === 'Oil spill').length} oil spills)

TOP AFFECTED REGIONS
--------------------
${this.getTopRegions(oilSpills)}

VALIDATION STATUS
-----------------
Verified: ${detections.filter(d => d.validation_status === 'Verified').length}
Unverified: ${detections.filter(d => d.validation_status === 'Unverified').length}
False Positives: ${detections.filter(d => d.validation_status === 'False Positive').length}

============================================
End of Report
`;

    return report;
  }

  /**
   * Helper function to identify top affected regions
   */
  private static getTopRegions(detections: OilSpillDetection[], limit: number = 5): string {
    // Group by approximate region (grid cells of 1 degree)
    const regions = new Map<string, number>();
    
    detections.forEach(d => {
      const gridLat = Math.floor(d.latitude);
      const gridLon = Math.floor(d.longitude);
      const key = `${gridLat},${gridLon}`;
      regions.set(key, (regions.get(key) || 0) + 1);
    });

    const sortedRegions = Array.from(regions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sortedRegions
      .map(([coords, count], index) => {
        const [lat, lon] = coords.split(',').map(Number);
        return `${index + 1}. Region around ${lat}°, ${lon}°: ${count} detections`;
      })
      .join('\n');
  }

  /**
   * Helper function to trigger file download
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export multiple formats at once
   */
  static exportAll(detections: OilSpillDetection[]): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    
    this.exportToCSV(detections, `oil_spills_${timestamp}.csv`);
    this.exportToJSON(detections, `oil_spills_${timestamp}.json`);
    this.exportToGeoJSON(detections, `oil_spills_${timestamp}.geojson`);
    this.exportToKML(detections, `oil_spills_${timestamp}.kml`);
    
    // Also generate and download the summary report
    const report = this.generateSummaryReport(detections);
    this.downloadFile(report, `oil_spills_report_${timestamp}.txt`, 'text/plain');
  }
}
