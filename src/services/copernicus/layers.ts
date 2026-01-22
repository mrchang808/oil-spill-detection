// This script allows the browser to request processed "Oil Spill Index" tiles directly
// Logic derived from your uploaded PDF: (B03 + B04) / B02

export const getOSILayerUrl = (productId: string) => {
  const baseUrl = 'https://sh.dataspace.copernicus.eu/ogc/wms';
  
  // The Evalscript from your PDF, encoded for the URL
  // We map the OSI values to colors:
  // < 1.0 : Water (Blue)
  // > 1.0 : Potential Oil (Yellow/Red)
  const evalscript = `
    //VERSION=3
    function setup() {
      return {
        input: ["B02", "B03", "B04", "dataMask"],
        output: { bands: 4 }
      };
    }

    function evaluatePixel(sample) {
      // OSI Formula from PDF
      let osi = (sample.B03 + sample.B04) / sample.B02;
      
      // Visualization Logic
      if (sample.dataMask === 0) return [0, 0, 0, 0]; // No data
      
      if (osi > 2.0) return [1, 0, 0, 1];       // High confidence (Red)
      if (osi > 1.2) return [1, 1, 0, 1];       // Low confidence (Yellow)
      
      // Return transparent for normal water so we can see the map below
      return [0, 0, 1, 0.3]; 
    }
  `;

  // Base64 encode the script to pass it safely in the URL
  const encodedScript = btoa(evalscript);

  return `${baseUrl}/${productId}?service=WMS&version=1.3.0&request=GetMap&format=image/png&transparent=true&layers=Sentinel-2&evalscript=${encodedScript}`;
};