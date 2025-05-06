/**
 * Shared metrics module for tracking application performance and usage
 */

// Initialize metrics object
const metrics = {
  // Request metrics
  requestCount: 0,
  errorCount: 0,
  responseTimeTotal: 0,
  
  // User metrics
  loginCount: 0,
  logoutCount: 0,
  failedLoginCount: 0,
  
  // Session metrics
  activeSessionCount: 0,
  
  // System metrics
  startTime: Date.now(),
  
  // Geographical metrics
  countryActivity: {},
};

/**
 * Increment a metric counter
 * @param {string} metric - The metric name to increment
 * @param {number} value - The value to increment by (default: 1)
 */
export function incrementMetric(metric, value = 1) {
  if (typeof metrics[metric] === 'number') {
    metrics[metric] += value;
  }
}

/**
 * Record country activity
 * @param {string} country - The country code
 */
export function recordCountryActivity(country) {
  if (!country || country === 'Unknown') return;
  
  if (!metrics.countryActivity[country]) {
    metrics.countryActivity[country] = 0;
  }
  
  metrics.countryActivity[country]++;
}

/**
 * Get all metrics
 * @returns {Object} - The metrics object
 */
export function getMetrics() {
  return {
    ...metrics,
    uptime: Math.floor((Date.now() - metrics.startTime) / 1000), // in seconds
  };
}

/**
 * Reset specific metrics
 * @param {Array<string>} metricNames - Array of metric names to reset
 */
export function resetMetrics(metricNames = []) {
  metricNames.forEach(name => {
    if (typeof metrics[name] === 'number') {
      metrics[name] = 0;
    }
  });
}

export default {
  incrementMetric,
  recordCountryActivity,
  getMetrics,
  resetMetrics,
}; 