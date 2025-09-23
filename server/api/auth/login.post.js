import sha256 from "crypto-js/sha256.js";
import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger";
import { getGeoIP } from "../../utils/geoip";
import { incrementMetric, recordCountryActivity } from "../../utils/metrics";
import { recordLoginFailure } from "../../utils/alerting";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);

    if (!username || !password) {
      logger.warn("Login attempt missing username or password", 
        { component: "auth-login" }, 
        { hasUsername: !!username }
      );
      return {
        statusCode: 400,
        message: "Username and password are required",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        userUsername: username,
      },
    });

    if (!user) {
      // Get client IP for security logging
      const ip = getClientIP(event);

      // Increment failed login metric
      incrementMetric('failedLoginCount');
      
      // Record login failure for alerting
      recordLoginFailure(username, ip);

      logger.warn(`Login attempt with non-existent username: ${username}`, 
        { component: "auth-login", username, ip }
      );
      return {
        statusCode: 404,
        message: "User does not exist",
      };
    }

    const hashedPassword = sha256(password).toString();
    if (user.userPassword !== hashedPassword) {
      // Get client IP for security logging
      const ip = getClientIP(event);

      // Increment failed login metric
      incrementMetric('failedLoginCount');
      
      // Record login failure for alerting
      recordLoginFailure(username, ip);

      logger.warn(`Invalid password for user: ${username}`, 
        { component: "auth-login", username, userID: user.userID.toString(), ip }
      );
      return {
        statusCode: 401,
        message: "Invalid password",
      };
    }

    // Get user roles
    const roles = await prisma.userrole.findMany({
      where: {
        userRoleUserID: user.userID,
      },
      select: {
        role: {
          select: {
            roleName: true,
          },
        },
      },
    });

    const roleNames = roles.map((r) => r.role.roleName);

    const accessToken = generateAccessToken({
      username: user.userUsername,
      roles: roleNames,
    });

    const refreshToken = generateRefreshToken({
      username: user.userUsername,
      roles: roleNames,
    });

    // Set cookie httpOnly
    event.res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
      `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
    ]);

    // Add user info to context for audit trail
    if (!event.context.user) {
      event.context.user = {};
    }
    event.context.user.userID = user.userID;
    event.context.user.username = user.userUsername;

    // Get client IP and geo information
    const ip = getClientIP(event);
    const geoData = await getGeoIP(ip);

    // Record metrics
    incrementMetric('loginCount');
    incrementMetric('activeSessionCount');
    recordCountryActivity(geoData.country);

    // Get user agent information
    const userAgent = event.node.req.headers["user-agent"] || "Unknown";
    const browser = detectBrowser(userAgent);
    const platform = detectPlatform(userAgent);

    // Log successful login with enhanced information
    logger.info(`User login successful: ${username}`, 
      { 
        component: "auth-login", 
        username,
        userID: user.userID.toString(),
        roles: roleNames.join(','),
        ip,
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        browser,
        platform
      },
      {
        userAgent,
        location: geoData.loc,
        loginTime: new Date().toISOString()
      }
    );

    return {
      statusCode: 200,
      message: "Login success",
      data: {
        username: user.userUsername,
        roles: roleNames,
      },
    };
  } catch (error) {
    console.log(error);
    logger.error("Internal server error during login", 
      { component: "auth-login" }, 
      { error: error.message, stack: error.stack }
    );
    return {
      statusCode: 500,
      message: "Internal server error",
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

/**
 * Detect browser from user agent
 * @param {string} userAgent - The user agent string
 * @returns {string} - The detected browser
 */
function detectBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) return 'Chrome';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) return 'Opera';
  
  return 'Other';
}

/**
 * Detect platform from user agent
 * @param {string} userAgent - The user agent string
 * @returns {string} - The detected platform
 */
function detectPlatform(userAgent) {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) return 'iOS';
  
  return 'Other';
}

function generateAccessToken(user) {
  return jwt.sign(user, ENV.auth.secretAccess, { expiresIn: "1d" });
}

function generateRefreshToken(user) {
  return jwt.sign(user, ENV.auth.secretRefresh, { expiresIn: "30d" });
}
