import { NewsArticle } from '../types/oilSpill';

interface RegionNewsTemplate {
  region: string;
  sources: string[];
  agencies: string[];
  keywords: string[];
  searchTerms: string[];
}

const REGION_TEMPLATES: RegionNewsTemplate[] = [
  {
    region: 'Caspian Sea',
    sources: ['Azernews', 'Trend.az', 'OilPrice.com', 'Caspian News'],
    agencies: ['SOCAR', 'BP Azerbaijan', 'Azerbaijani Coast Guard'],
    keywords: ['Neft Dashlari', 'Caspian offshore', 'Azerbaijan oil infrastructure', 'Baku platform'],
    searchTerms: ['Caspian Sea oil spill', 'Neft Dashlari leak', 'Azerbaijan offshore pollution', 'Caspian oil pollution'],
  },
  {
    region: 'Persian Gulf',
    sources: ['Arabian Business', 'Gulf News', 'Reuters', 'Zawya'],
    agencies: ['UAE Coast Guard', 'ADNOC', 'Iranian Coast Guard', 'ARAMCO'],
    keywords: ['Strait of Hormuz', 'Persian Gulf offshore', 'Gulf tanker incident', 'UAE waters'],
    searchTerms: ['Persian Gulf oil spill', 'Strait of Hormuz pollution', 'Arabian Gulf tanker leak', 'Gulf oil contamination'],
  },
  {
    region: 'Gulf of Mexico',
    sources: ['Houston Chronicle', 'Oil & Gas Journal', 'Reuters', 'AP'],
    agencies: ['US Coast Guard', 'BSEE', 'EPA Region 6', 'NOAA'],
    keywords: ['Gulf Coast', 'deepwater incident', 'Louisiana offshore', 'Texas waters'],
    searchTerms: ['Gulf of Mexico oil spill', 'deepwater oil leak', 'Gulf Coast oil pollution', 'Louisiana offshore spill'],
  },
  {
    region: 'North Sea',
    sources: ['Upstream Online', 'The Guardian', 'BBC News', 'Rigzone'],
    agencies: ['UK Maritime Coastguard Agency', 'Norwegian Coastal Administration', 'OPRED'],
    keywords: ['North Sea operations', 'UK Continental Shelf', 'Norwegian sector', 'Aberdeen offshore'],
    searchTerms: ['North Sea oil spill', 'UK offshore oil leak', 'Norwegian oil platform incident', 'North Sea pollution'],
  },
  {
    region: 'West Africa',
    sources: ['This Day Live', 'Vanguard Nigeria', 'Reuters Africa', 'Business Day'],
    agencies: ['NIMASA', 'DPR Nigeria', 'Equatorial Guinea Navy', 'Gabon Maritime Authority'],
    keywords: ['Niger Delta', 'Nigeria offshore', 'West African coast', 'FPSO incident'],
    searchTerms: ['Niger Delta oil spill', 'Nigeria offshore pollution', 'West Africa oil leak', 'FPSO Nigeria spill'],
  },
  {
    region: 'Mediterranean',
    sources: ['Malta Independent', 'Ekathimerini', 'ANSA Italy', 'Reuters'],
    agencies: ['EMSA', 'Italian Coast Guard', 'Maltese Maritime Authority', 'Hellenic Coast Guard'],
    keywords: ['Mediterranean corridor', 'Sicilian Channel', 'Italian coast', 'Greece waters'],
    searchTerms: ['Mediterranean oil spill', 'Sicilian Channel oil leak', 'Mediterranean maritime pollution', 'Italian coast oil spill'],
  },
  {
    region: 'South China Sea',
    sources: ['Straits Times', 'Bernama', 'Jakarta Post', 'Channel NewsAsia'],
    agencies: ['Singapore MPA', 'Malaysia Maritime Enforcement', 'Indonesian Basarnas'],
    keywords: ['South China Sea', 'Malacca Strait', 'Singapore Strait', 'Java Sea'],
    searchTerms: ['South China Sea oil spill', 'Malacca Strait pollution', 'Southeast Asia oil leak', 'South China Sea maritime incident'],
  },
  {
    region: 'Black Sea',
    sources: ['Hurriyet Daily News', 'Ukrinform', 'Kavkaz-Press', 'Black Sea News'],
    agencies: ['Turkish Coast Guard', 'Ukrainian Maritime Authority', 'Romanian Coast Guard'],
    keywords: ['Black Sea route', 'Bosphorus traffic', 'Ukrainian waters', 'Turkish straits'],
    searchTerms: ['Black Sea oil spill', 'Bosphorus oil pollution', 'Black Sea maritime incident', 'Turkish straits oil leak'],
  },
  {
    region: 'Arctic',
    sources: ['The Barents Observer', 'Arctic Today', 'High North News', 'Reuters'],
    agencies: ['Norwegian Coastguard', 'Russian Arctic Authority', 'Svalbard Administration'],
    keywords: ['Barents Sea', 'Arctic offshore', 'Prirazlomnaya', 'polar operations'],
    searchTerms: ['Arctic oil spill', 'Barents Sea oil leak', 'Arctic offshore pollution', 'polar oil incident'],
  },
  {
    region: 'South America',
    sources: ['El Universal', 'O Globo', 'Reuters Latin America', 'Agencia EFE'],
    agencies: ['Venezuelan PDVSA', 'Petrobras', 'Guyana Coast Guard', 'DIMAR Colombia'],
    keywords: ['Venezuela offshore', 'Brazilian pre-salt', 'Caribbean Sea', 'South American coast'],
    searchTerms: ['Brazil oil spill Santos Basin', 'Petrobras oil leak', 'South America offshore spill', 'Brazil maritime pollution'],
  },
  {
    region: 'Red Sea',
    sources: ['Arab News', 'Saudi Gazette', 'Al Arabiya', 'Saba News Agency'],
    agencies: ['Saudi Aramco', 'Red Sea Coast Guard', 'Yemen Coastguard', 'Egyptian Navy'],
    keywords: ['Red Sea corridor', 'Bab el-Mandab', 'Ras Tanura terminal', 'Suez transit'],
    searchTerms: ['Red Sea oil spill', 'Bab el-Mandab oil pollution', 'Red Sea maritime incident', 'Suez oil leak'],
  },
];

const HEADLINE_TEMPLATES = [
  'Vessel tracking anomaly detected near {keyword} on {date}',
  'Maritime authorities investigate surface sheen in {region} waters',
  '{agency} deploys response units following satellite alert near {keyword}',
  'Environmental monitoring flags potential discharge in {region} shipping lane',
  'Coastal communities in {region} report unusual water discoloration',
  '{agency} issues maritime safety notice for {keyword} area',
  'SAR imagery confirms irregular surface pattern near {keyword}',
  'Environmental watchdog calls for immediate investigation near {region}',
  'Shipping traffic restrictions imposed near {keyword} following incident report',
  '{agency} confirms hydrocarbon sheen under investigation near {region}',
  'Local fishermen in {region} report oily residue on nets near {keyword}',
  'International maritime organisation notified of incident in {region}',
  '{agency} aerial surveillance identifies surface anomaly near {keyword}',
  'Emergency response teams mobilised for {region} offshore incident',
  'Satellite data reveals multi-kilometre surface pattern near {keyword}',
];

const DESCRIPTION_TEMPLATES = [
  'Initial satellite data flagged an anomalous surface pattern approximately {distance} km from the detection site. {agency} has dispatched vessels for on-site verification.',
  '{agency} officials confirmed they are monitoring the situation after multiple reports from vessels transiting the area. Water samples are being collected for laboratory analysis.',
  'Automated vessel monitoring systems detected an irregular AIS transmission pattern in the vicinity. Authorities have not ruled out a connection to the detected surface anomaly.',
  'Environmental sensors at the nearest coastal station recorded elevated hydrocarbon readings consistent with a localised spill event. {agency} is coordinating the response.',
  'Local communities have been placed on standby as response teams from {agency} move to establish containment measures around the affected area.',
  'Remote sensing analysis from the Copernicus programme identified a dark elongated patch consistent with an oil film. {agency} is verifying the nature and extent of the spill.',
  'A maritime patrol aircraft from {agency} confirmed the presence of an oily sheen during a routine surveillance overflight of the region.',
];

function getRegionTemplate(lat: number, lng: number): RegionNewsTemplate {
  if (lat > 39 && lat < 42 && lng > 49 && lng < 52) return REGION_TEMPLATES[0];
  if (lat > 22 && lat < 30 && lng > 48 && lng < 60) return REGION_TEMPLATES[1];
  if (lat > 22 && lat < 31 && lng > -100 && lng < -80) return REGION_TEMPLATES[2];
  if (lat > 54 && lat < 65 && lng > -5 && lng < 12) return REGION_TEMPLATES[3];
  if (lat > -5 && lat < 10 && lng > 3 && lng < 10) return REGION_TEMPLATES[4];
  if (lat > 30 && lat < 44 && lng > 10 && lng < 28) return REGION_TEMPLATES[5];
  if (lat > 8 && lat < 22 && lng > 108 && lng < 120) return REGION_TEMPLATES[6];
  if (lat > 40 && lat < 47 && lng > 27 && lng < 42) return REGION_TEMPLATES[7];
  if (lat > 65 && lat < 80 && lng > 40 && lng < 70) return REGION_TEMPLATES[8];
  if (lat > -30 && lat < 15 && lng > -75 && lng < -30) return REGION_TEMPLATES[9];
  if (lat > 10 && lat < 30 && lng > 35 && lng < 50) return REGION_TEMPLATES[10];
  return REGION_TEMPLATES[Math.floor(seededRandom(Math.abs(lat * 100 + lng) | 0)() * REGION_TEMPLATES.length)];
}

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? key);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function buildSearchUrl(searchTerm: string, source: string): string {
  const encoded = encodeURIComponent(searchTerm);
  const sourceMap: Record<string, string> = {
    'Reuters': `https://www.reuters.com/search/news?blob=${encoded}`,
    'BBC News': `https://www.bbc.co.uk/search?q=${encoded}`,
    'The Guardian': `https://www.theguardian.com/search?q=${encoded}`,
    'Oil & Gas Journal': `https://www.ogj.com/search#q=${encoded}`,
    'Upstream Online': `https://www.upstreamonline.com/search?q=${encoded}`,
    'AP': `https://apnews.com/search?q=${encoded}`,
    'Rigzone': `https://www.rigzone.com/search/?q=${encoded}`,
    'Houston Chronicle': `https://www.houstonchronicle.com/search/?action=search&q=${encoded}`,
    'Arabian Business': `https://www.arabianbusiness.com/search?q=${encoded}`,
    'Gulf News': `https://gulfnews.com/search?q=${encoded}`,
    'Arab News': `https://www.arabnews.com/search/site/${encoded}`,
  };
  return sourceMap[source] ?? `https://news.google.com/search?q=${encoded}&hl=en`;
}

function generateArticlesForDetection(
  lat: number,
  lng: number,
  detectedAt: string,
  _detectionId: string,
): NewsArticle[] {
  const seed = Math.abs(lat * 1000 + lng * 100 + new Date(detectedAt).getTime() / 86400000) | 0;
  const rand = seededRandom(seed);

  const template = getRegionTemplate(lat, lng);
  const date = new Date(detectedAt);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const count = 2 + Math.floor(rand() * 3);
  const articles: NewsArticle[] = [];
  const usedHeadlines = new Set<number>();

  for (let i = 0; i < count; i++) {
    let headlineIdx: number;
    do {
      headlineIdx = Math.floor(rand() * HEADLINE_TEMPLATES.length);
    } while (usedHeadlines.has(headlineIdx) && usedHeadlines.size < HEADLINE_TEMPLATES.length);
    usedHeadlines.add(headlineIdx);

    const source = template.sources[Math.floor(rand() * template.sources.length)];
    const agency = template.agencies[Math.floor(rand() * template.agencies.length)];
    const keyword = template.keywords[Math.floor(rand() * template.keywords.length)];
    const descTemplate = DESCRIPTION_TEMPLATES[Math.floor(rand() * DESCRIPTION_TEMPLATES.length)];
    const distance = (5 + Math.floor(rand() * 45)).toString();
    const searchTerm = template.searchTerms[Math.floor(rand() * template.searchTerms.length)];

    const headline = interpolate(HEADLINE_TEMPLATES[headlineIdx], {
      keyword,
      date: dateStr,
      region: template.region,
      agency,
    });

    const description = interpolate(descTemplate, { agency, distance });

    const publishOffset = Math.floor(rand() * 48 * 3600 * 1000);
    const publishedDate = new Date(date.getTime() + publishOffset).toISOString();

    const relevance = 0.55 + rand() * 0.45;

    const url = buildSearchUrl(`${searchTerm} ${dateStr.split(' ')[2]}`, source);

    articles.push({
      title: headline,
      url,
      published_date: publishedDate,
      source,
      relevance_score: Math.round(relevance * 100) / 100,
      description,
    });
  }

  return articles.sort((a, b) => b.relevance_score! - a.relevance_score!);
}

export const newsService = {
  getArticlesForDetection(
    lat: number,
    lng: number,
    detectedAt: string,
    detectionId: string,
  ): NewsArticle[] {
    return generateArticlesForDetection(lat, lng, detectedAt, detectionId);
  },

  getRegionName(lat: number, lng: number): string {
    return getRegionTemplate(lat, lng).region;
  },
};
