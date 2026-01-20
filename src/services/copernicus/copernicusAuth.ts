/**
 * Copernicus Data Space Authentication Service
 * Handles OAuth 2.0 authentication for Copernicus API
 * 
 * Documentation: https://documentation.dataspace.copernicus.eu/APIs/OData.html
 */

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class CopernicusAuth {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;
  private static isRefreshing: boolean = false;
  private static refreshPromise: Promise<string> | null = null;

  /**
   * Get a valid access token
   * Automatically refreshes if expired
   */
  static async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 1-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start token refresh
    this.isRefreshing = true;
    this.refreshPromise = this.fetchNewToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Fetch a new access token from Copernicus
   */
  private static async fetchNewToken(): Promise<string> {
    const clientId = import.meta.env.VITE_COPERNICUS_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_COPERNICUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing Copernicus credentials. Please set VITE_COPERNICUS_CLIENT_ID and VITE_COPERNICUS_CLIENT_SECRET in your .env file.'
      );
    }

    try {
      const response = await fetch(
        'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      console.log('✅ Copernicus authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Copernicus authentication error:', error);
      throw error;
    }
  }

  /**
   * Clear the cached token (useful for logout or testing)
   */
  static clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Check if currently authenticated
   */
  static isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiry(): number {
    if (!this.accessToken) return 0;
    return Math.max(0, Math.floor((this.tokenExpiry - Date.now()) / 1000));
  }
}

/**
 * Fetch with automatic authentication
 * Use this instead of regular fetch for Copernicus API calls
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await CopernicusAuth.getAccessToken();

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  };

  const response = await fetch(url, authOptions);

  // If unauthorized, clear token and retry once
  if (response.status === 401) {
    console.warn('⚠️ Token expired, refreshing...');
    CopernicusAuth.clearToken();
    const newToken = await CopernicusAuth.getAccessToken();
    
    authOptions.headers = {
      ...authOptions.headers,
      Authorization: `Bearer ${newToken}`,
    };
    
    return fetch(url, authOptions);
  }

  return response;
}

export const getCopernicusToken = async (): Promise<string> => {
  return await CopernicusAuth.getAccessToken();
};