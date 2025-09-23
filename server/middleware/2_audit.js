/**
 * Secondary Audit Middleware (Database Only)
 * 
 * This middleware is responsible for maintaining database audit records only.
 * It does NOT log to Loki to avoid duplicate logs, as the 1_audit.js middleware
 * already handles that. This middleware exists to ensure proper database auditing
 * is maintained, which provides a permanent record of user activities accessible
 * through the UI's Database Audit Logs section.
 * 
 * The 1_audit.js middleware handles:
 * - Logging to Loki (real-time system logs)
 * - Performance metrics
 * - Response time tracking
 * - Geo-location tracking
 * - Security alerting
 * 
 * This 2_audit.js middleware handles:
 * - Database record creation (permanent audit trail)
 */

import { logger } from '../utils/logger';

export default defineEventHandler(async (event) => {
  try {
    // Skip audit for certain paths
    const url = event.node.req.url || "";

    // Skip audit for static assets, metrics endpoints, and the audit API itself
    if (
      url.startsWith("/_nuxt/") ||
      url.startsWith("/favicon.ico") ||
      url.startsWith("/api/metrics") ||
      url.startsWith("/api/audit") ||
      url.includes("/api/auth/validate") // Skip validation requests as they happen frequently
    ) {
      return;
    }

    // Get user information from context (set by auth middleware)
    const user = event.context.user || {};
    const userID = user.userID ? parseInt(user.userID) : null;

    // Get request details
    const method = event.node.req.method || "";
    const ip = getClientIP(event);

    // For POST/PUT/PATCH requests, get the payload
    let payload = null;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        // Clone the request to avoid consuming the body
        payload = await readBody(event);

        // If payload contains sensitive data, redact it for security
        if (payload && typeof payload === "object") {
          const sanitizedPayload = { ...payload };
          const sensitiveFields = ["password", "token", "secret", "key", "apiKey", "api_key"];
          
          sensitiveFields.forEach(field => {
            if (field in sanitizedPayload) {
              sanitizedPayload[field] = "***REDACTED***";
            }
          });
          
          payload = JSON.stringify(sanitizedPayload);
        } else {
          payload = JSON.stringify(payload);
        }
      } catch (e) {
        payload = "Error reading payload";
      }
    }

    // Determine the action based on the URL and method
    const action = determineAction(url, method, payload);
    
    // Skip if action is null (meaning we don't want to audit this request)
    if (!action) {
      return;
    }

    // Create audit record in the database
    await prisma.audit.create({
      data: {
        auditUserID: userID,
        auditUsername: user.username || null,
        auditAction: action,
        auditDetails: `${method} request to ${url}`,
        auditIP: ip,
        auditURL: url,
        auditURLMethod: method,
        auditURLPayload: payload,
      },
    });

    // Add audit info to the event context for potential use in handlers
    event.context.audit = {
      userID,
      action,
      ip,
      timestamp: new Date(),
    };

    // We're not logging to Loki here anymore as that's handled by 1_audit.js
    // This prevents duplicate logs in Loki while still maintaining DB audit records
  } catch (error) {
    console.error("Error in audit middleware:", error);
    logger.error(`Error in audit middleware`, 
      { component: 'audit-middleware' },
      { error: error.message, stack: error.stack }
    );
  }
});

/**
 * Determines the appropriate action name based on URL, method, and payload
 * @param {string} url - The request URL
 * @param {string} method - The HTTP method
 * @param {string} payload - The request payload (JSON string)
 * @returns {string|null} - The action name or null if the request should not be audited
 */
function determineAction(url, method, payload) {
  // Authentication actions
  if (url.includes("/api/auth/login") && method === "POST") {
    return "User Login";
  } else if (url.includes("/api/auth/logout") || url === "/logout") {
    return "User Logout";
  } else if (url.includes("/api/auth/register") && method === "POST") {
    return "User Registration";
  } else if (url.includes("/api/auth/reset-password") && method === "POST") {
    return "Password Reset Request";
  } else if (url.includes("/api/auth/change-password") && method === "POST") {
    return "Password Change";
  }

  // Handle page views (GET requests to non-API URLs)
  if (method === "GET" && !url.includes('/api/')) {
    // Common pages
    if (url === "/" || url === "/dashboard" || url.includes("/dashboard")) {
      return "GET /dashboard";
    } else if (url === "/logout") {
      return "GET /logout";
    } else if (url.includes("/audit")) {
      return "GET /audit";
    } else {
      // For other pages, use the URL path
      const cleanUrl = url.split('?')[0]; // Remove query parameters
      return `GET ${cleanUrl}`;
    }
  }
  
  // API endpoints
  if (url.includes('/api/')) {
    // Data operations - detect based on URL pattern and method
    if (method === "GET") {
      return "Data Viewed";
    } else if (method === "POST") {
      return "Data Created";
    } else if (method === "PUT" || method === "PATCH") {
      return "Data Updated";
    } else if (method === "DELETE") {
      return "Data Deleted";
    }
  }
  
  // Default action format
  return `${method} ${url}`;
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
