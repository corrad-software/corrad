/**
 * Utility to get geolocation data from IP address
 * Uses a simple fetch to ipinfo.io's free tier API
 */

/**
 * Get geolocation data from IP address
 * @param {string} ip - The client IP address
 * @returns {Promise<Object>} - Geolocation data
 */
export async function getGeoIP(ip) {
  try {
    // Skip for localhost, private, or invalid IPs
    if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '0.0.0.0') {
      return {
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        loc: '0,0',
      };
    }

    // Fetch from ipinfo.io (free tier has rate limits of 50K requests/month)
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    
    if (!response.ok) {
      throw new Error(`Failed to get geolocation: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      loc: data.loc || '0,0', // latitude,longitude
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    // Return default data on failure
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      loc: '0,0',
    };
  }
}

export default { getGeoIP }; 