import { getCopernicusToken } from './copernicusAuth';

// Oil Spill Index Evalscript (B03 + B04) / B02
// We encode this in Base64 for the URL
const OSI_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  if (sample.dataMask === 0) return [0, 0, 0, 0];
  
  // Oil Spill Index
  let osi = (sample.B03 + sample.B04) / sample.B02;
  
  // Visualization: 
  // Red = High Probability (> 2.0)
  // Yellow = Medium Probability (> 1.2)
  // Transparent = Water/Land
  
  if (osi > 2.0) return [1, 0, 0, 1];
  if (osi > 1.2) return [1, 1, 0, 1];
  
  return [0, 0, 0, 0]; // Transparent
}
`;

export const getOSILayerUrl = async (instanceId: string = 'sentinel-2') => {
  const token = await getCopernicusToken();
  const encodedScript = btoa(OSI_EVALSCRIPT);
  
  // Use local proxy in DEV mode
  const baseUrl = import.meta.env.DEV ? '/wms' : 'https://sh.dataspace.copernicus.eu/ogc/wms';
  
  // Construct WMS URL with Token
  // We use the "INSTANCE_ID" which for the public CDSE WMS can often be just the dataset ID if using the public endpoint with a token
  return `${baseUrl}/${instanceId}?service=WMS&version=1.3.0&request=GetMap&layers=SENTINEL-2&format=image/png&transparent=true&evalscript=${encodedScript}&access_token=${token}`;
};