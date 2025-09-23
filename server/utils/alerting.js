/**
 * Alerting utility for monitoring critical events and sending notifications
 */
import { logger } from './logger';

// Track login failures by IP and username
const loginFailures = {
  byIP: {},
  byUsername: {},
  lastCleanup: Date.now(),
};

// Alert thresholds
const thresholds = {
  failedLogins: {
    ip: 5, // 5 failed logins from same IP within timeframe
    username: 3, // 3 failed attempts for same username within timeframe
    timeframeMs: 10 * 60 * 1000, // 10 minutes
  },
  errorRate: {
    threshold: 10, // 10% of requests resulting in errors
    minSampleSize: 50, // Minimum requests to consider
    timeframeMs: 5 * 60 * 1000, // 5 minutes
  },
};

// Store detected alerts to avoid repeating the same alert
const recentAlerts = [];
const MAX_RECENT_ALERTS = 100;

/**
 * Clean up old login failure records
 */
function cleanupLoginFailures() {
  const now = Date.now();
  const timeframe = thresholds.failedLogins.timeframeMs;
  
  // Only run cleanup every minute
  if (now - loginFailures.lastCleanup < 60000) {
    return;
  }
  
  // Clean up IP records
  Object.keys(loginFailures.byIP).forEach(ip => {
    loginFailures.byIP[ip] = loginFailures.byIP[ip].filter(
      timestamp => now - timestamp < timeframe
    );
    
    if (loginFailures.byIP[ip].length === 0) {
      delete loginFailures.byIP[ip];
    }
  });
  
  // Clean up username records
  Object.keys(loginFailures.byUsername).forEach(username => {
    loginFailures.byUsername[username] = loginFailures.byUsername[username].filter(
      timestamp => now - timestamp < timeframe
    );
    
    if (loginFailures.byUsername[username].length === 0) {
      delete loginFailures.byUsername[username];
    }
  });
  
  loginFailures.lastCleanup = now;
}

/**
 * Record a failed login attempt
 * @param {string} username - Username attempted
 * @param {string} ip - IP address of the attempt
 */
export function recordLoginFailure(username, ip) {
  cleanupLoginFailures();
  
  const now = Date.now();
  
  // Record by IP
  if (!loginFailures.byIP[ip]) {
    loginFailures.byIP[ip] = [];
  }
  loginFailures.byIP[ip].push(now);
  
  // Record by username
  if (!loginFailures.byUsername[username]) {
    loginFailures.byUsername[username] = [];
  }
  loginFailures.byUsername[username].push(now);
  
  // Check for alerts after recording
  checkLoginFailureAlerts(username, ip);
}

/**
 * Check if login failures warrant an alert
 * @param {string} username - Username attempted
 * @param {string} ip - IP address of the attempt
 */
function checkLoginFailureAlerts(username, ip) {
  const ipFailures = loginFailures.byIP[ip] || [];
  const usernameFailures = loginFailures.byUsername[username] || [];
  
  // Check for too many failures from same IP
  if (ipFailures.length >= thresholds.failedLogins.ip) {
    const alertKey = `ip_login_failure_${ip}`;
    
    if (!hasRecentAlert(alertKey)) {
      logSecurityAlert(
        'Excessive login failures from IP', 
        { component: 'security-alert', alertType: 'login-failures-ip', ip },
        { 
          username, 
          failureCount: ipFailures.length,
          timeframeMinutes: thresholds.failedLogins.timeframeMs / 60000
        }
      );
      
      addRecentAlert(alertKey);
    }
  }
  
  // Check for too many failures for same username
  if (usernameFailures.length >= thresholds.failedLogins.username) {
    const alertKey = `username_login_failure_${username}`;
    
    if (!hasRecentAlert(alertKey)) {
      logSecurityAlert(
        'Excessive login failures for username', 
        { component: 'security-alert', alertType: 'login-failures-username', username },
        { 
          ip, 
          failureCount: usernameFailures.length,
          timeframeMinutes: thresholds.failedLogins.timeframeMs / 60000
        }
      );
      
      addRecentAlert(alertKey);
    }
  }
}

/**
 * Check if there's a recent alert with the same key to avoid duplicates
 * @param {string} alertKey - Unique identifier for the alert
 * @returns {boolean} - Whether a recent alert exists
 */
function hasRecentAlert(alertKey) {
  return recentAlerts.includes(alertKey);
}

/**
 * Add an alert to the recent alerts list
 * @param {string} alertKey - Unique identifier for the alert
 */
function addRecentAlert(alertKey) {
  recentAlerts.push(alertKey);
  
  // Keep the recent alerts list from growing too large
  if (recentAlerts.length > MAX_RECENT_ALERTS) {
    recentAlerts.shift();
  }
}

/**
 * Log a security alert
 * @param {string} message - Alert message
 * @param {Object} labels - Labels for filtering
 * @param {Object} data - Additional alert data
 */
function logSecurityAlert(message, labels = {}, data = {}) {
  logger.warn(message, 
    { ...labels, level: 'security-alert' }, 
    { 
      timestamp: new Date().toISOString(), 
      ...data 
    }
  );
  
  // Here you could also send emails, SMS, or other notifications
  // for critical alerts if you implement those services
}

// Record system error for potential alerting
const errorTracker = {
  errors: [],
  requests: 0,
  lastReset: Date.now(),
};

/**
 * Record a system error for potential alerting
 * @param {string} errorType - Type of error
 * @param {Object} details - Error details
 */
export function recordSystemError(errorType, details = {}) {
  const now = Date.now();
  
  // Reset tracker if the timeframe has passed
  if (now - errorTracker.lastReset > thresholds.errorRate.timeframeMs) {
    errorTracker.errors = [];
    errorTracker.requests = 0;
    errorTracker.lastReset = now;
  }
  
  // Record the error
  errorTracker.errors.push({
    type: errorType,
    timestamp: now,
    details,
  });
  
  // Check if error rate is too high
  checkErrorRateAlert();
}

/**
 * Record a request for error rate calculation
 */
export function recordRequest() {
  const now = Date.now();
  
  // Reset tracker if the timeframe has passed
  if (now - errorTracker.lastReset > thresholds.errorRate.timeframeMs) {
    errorTracker.errors = [];
    errorTracker.requests = 0;
    errorTracker.lastReset = now;
  }
  
  // Record the request
  errorTracker.requests++;
}

/**
 * Check if error rate warrants an alert
 */
function checkErrorRateAlert() {
  // Only check if we have enough samples
  if (errorTracker.requests < thresholds.errorRate.minSampleSize) {
    return;
  }
  
  const errorRate = errorTracker.errors.length / errorTracker.requests * 100;
  
  if (errorRate >= thresholds.errorRate.threshold) {
    const alertKey = `high_error_rate_${errorTracker.lastReset}`;
    
    if (!hasRecentAlert(alertKey)) {
      logSecurityAlert(
        'High system error rate detected', 
        { component: 'system-alert', alertType: 'high-error-rate' },
        { 
          errorRate: `${errorRate.toFixed(2)}%`,
          errorCount: errorTracker.errors.length,
          requestCount: errorTracker.requests,
          timeframeMinutes: thresholds.errorRate.timeframeMs / 60000,
          mostCommonError: getMostCommonError(),
        }
      );
      
      addRecentAlert(alertKey);
    }
  }
}

/**
 * Get the most common error type from recent errors
 * @returns {string} - The most common error type
 */
function getMostCommonError() {
  const errorCounts = {};
  
  errorTracker.errors.forEach(error => {
    if (!errorCounts[error.type]) {
      errorCounts[error.type] = 0;
    }
    errorCounts[error.type]++;
  });
  
  let mostCommonType = 'unknown';
  let highestCount = 0;
  
  Object.entries(errorCounts).forEach(([type, count]) => {
    if (count > highestCount) {
      mostCommonType = type;
      highestCount = count;
    }
  });
  
  return mostCommonType;
}

export default {
  recordLoginFailure,
  recordSystemError,
  recordRequest,
}; 