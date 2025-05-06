import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

const ENV = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    // Get request details for session tracking
    const url = event.node.req.url || "";
    const method = event.node.req.method || "";
    const userAgent = event.node.req.headers['user-agent'] || "";
    const ip = getClientIP(event);
    const requestId = event.context.requestId || generateRequestId();
    
    // Skip authentication for certain paths
    if (
      url.startsWith("/_nuxt/") ||
      url.startsWith("/favicon.ico") ||
      url === "/login" || // Login page doesn't need auth
      url === "/api/auth/login" || // Login API doesn't need auth
      url.startsWith("/public/") // Public assets don't need auth
    ) {
      // Still setup minimal context
      event.context.user = {
        userID: null,
        username: null,
        roles: [],
        authenticated: false,
        sessionId: null
      };
      return;
    }
    
    const cookies = event.req.headers.cookie;
    if (!cookies) {
      logger.debug(`Unauthenticated request: ${method} ${url}`, {
        component: 'auth-middleware',
        requestId,
        ip,
        url,
        method
      });
      throw new Error("Cookie not found");
    }

    let { accessToken, refreshToken, user } = parseCookie(cookies);

    if (!accessToken) accessToken = null;
    if (!refreshToken) refreshToken = null;

    let { subdomain } = user ? JSON.parse(user) : { subdomain: null };
    if (!subdomain) subdomain = null;

    let payloadUser = null;
    let tokenRenewal = false;

    payloadUser = verifyAccessToken(accessToken);

    if (!payloadUser) {
      // Access token invalid, try refresh token
      payloadUser = verifyRefreshToken(refreshToken);
      if (!payloadUser) {
        logger.warn(`Invalid tokens for request: ${method} ${url}`, {
          component: 'auth-middleware',
          requestId,
          ip,
          url,
          method
        });
        throw new Error("Unauthorized Refresh Token");
      }

      // Generate new access token
      tokenRenewal = true;
      const newAccessToken = generateAccessToken({
        username: payloadUser.username,
        roles: payloadUser.roles,
      });

      // Set new access token
      event.res.setHeader("Set-Cookie", [
        `accessToken=${newAccessToken}; HttpOnly; Secure; SameSite=Lax; Path=/`,
      ]);
      
      logger.info(`Token renewed for user: ${payloadUser.username}`, {
        component: 'auth-middleware',
        username: payloadUser.username,
        requestId,
        ip,
        url,
        method,
        event: 'token_renewal'
      });
    }

    const getUser = await getUserInfo(payloadUser.username);
    if (!getUser) {
      logger.warn(`User not found in database: ${payloadUser.username}`, {
        component: 'auth-middleware',
        username: payloadUser.username,
        requestId,
        ip,
        url,
        method
      });
      throw new Error("User not found");
    }

    // Generate a session ID from token if not exists
    const sessionId = generateSessionId(payloadUser.username, accessToken);

    // Add user info to context
    event.context.user = {
      userID: getUser.userID || null,
      username: payloadUser.username || null,
      roles: payloadUser.roles || [],
      authenticated: true,
      sessionId,
      tokenRenewal,
      lastActive: new Date().toISOString()
    };

    // Log the authenticated request
    logger.debug(`Authenticated request: ${method} ${url}`, {
      component: 'auth-middleware',
      username: payloadUser.username,
      userID: getUser.userID.toString(),
      requestId,
      sessionId,
      ip,
      url,
      method,
      roles: payloadUser.roles.join(',')
    });

    return;
  } catch (error) {
    // Setup minimal context for unauthenticated requests
    event.context.user = {
      userID: null,
      username: null,
      roles: [],
      authenticated: false,
      sessionId: null
    };
    return;
  }
});

function parseCookie(str) {
  return str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}

function verifyAccessToken(accessToken) {
  try {
    const token = ENV.auth.secretAccess;
    return jwt.verify(accessToken, token);
  } catch (error) {
    return false;
  }
}

function verifyRefreshToken(refreshToken) {
  try {
    const token = ENV.auth.secretRefresh;
    return jwt.verify(refreshToken, token);
  } catch (error) {
    return false;
  }
}

function generateAccessToken(user) {
  try {
    const token = ENV.auth.secretAccess;
    return jwt.sign(user, token, { expiresIn: "1d" });
  } catch (error) {
    return false;
  }
}

async function getUserInfo(username) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        userUsername: username,
      },
    });

    if (!user) return null;

    return user;
  } catch (error) {
    console.log(error);
    logger.error(`Error fetching user info: ${username}`, 
      { component: 'auth-middleware', username },
      { error: error.message, stack: error.stack }
    );
  }
}

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

// Generate unique request ID
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
}

// Generate a stable session ID from username and token
function generateSessionId(username, token) {
  // Use first 8 chars of token hash as session ID
  if (!token) return null;
  const tokenFragment = token.substring(0, 12);
  return `${username}-${tokenFragment}`;
}
