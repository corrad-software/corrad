import { logger } from "../../utils/logger";
import { getGeoIP } from "../../utils/geoip";
import { incrementMetric } from "../../utils/metrics";

export default defineEventHandler(async (event) => {
  try {
    // Get user info from context if available
    const user = event.context.user || {};
    const username = user.username || 'unknown';
    const userID = user.userID || 'unknown';

    // Get client IP and geo information
    const ip = getClientIP(event);
    const geoData = await getGeoIP(ip);

    event.res.setHeader("Set-Cookie", [
      `accessToken=; HttpOnly; Secure; SameSite=Lax; Path=/`,
      `refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/`,
    ]);

    // Update metrics
    incrementMetric('logoutCount');
    incrementMetric('activeSessionCount', -1); // Decrement active sessions

    // Log the successful logout
    logger.info(`User logout successful`, {
      component: "auth-logout",
      username,
      userID: userID.toString(),
      ip,
      country: geoData.country,
      region: geoData.region,
      city: geoData.city
    });

    return {
      statusCode: 200,
      message: "Logout success",
    };
  } catch (error) {
    console.log(error);
    logger.error("Error during logout", 
      { component: "auth-logout" }, 
      { error: error.message, stack: error.stack }
    );
    return {
      statusCode: 400,
      message: "Server error",
    };
  }
});

// Helper function to get client IP address
function getClientIP(event) {
  // Try to get IP from various headers
  const forwardedFor = event.node.req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, the first one is the client
    return forwardedFor.split(",")[0].trim();
  }

  // Try other common headers
  const realIP = event.node.req.headers["x-real-ip"];
  if (realIP) {
    return realIP;
  }

  // Fallback to remote address
  return event.node.req.socket?.remoteAddress || "0.0.0.0";
}
