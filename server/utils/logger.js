/**
 * Logger utility for sending logs to Loki
 */

// Log levels in order of severity
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Rate limiting - to avoid overwhelming Loki during high traffic
const rateLimits = {
  debug: { count: 0, lastReset: Date.now(), maxPerMinute: 100 },
  info: { count: 0, lastReset: Date.now(), maxPerMinute: 200 },
  warn: { count: 0, lastReset: Date.now(), maxPerMinute: 50 },
  error: { count: 0, lastReset: Date.now(), maxPerMinute: 20 },
};

/**
 * Check if we should rate limit this log entry
 * @param {string} level - Log level
 * @returns {boolean} - True if should be rate limited
 */
function checkRateLimit(level) {
  const now = Date.now();
  const limit = rateLimits[level];
  
  // Reset counter if a minute has passed
  if (now - limit.lastReset > 60000) {
    limit.count = 0;
    limit.lastReset = now;
  }
  
  // Check if we're over the limit
  if (limit.count >= limit.maxPerMinute) {
    return true;
  }
  
  // Increment counter
  limit.count++;
  return false;
}

/**
 * Send a log entry to Loki
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} message - Log message
 * @param {Object} labels - Additional labels for the log entry
 * @param {Object} data - Additional data to include in the log entry
 */
async function sendToLoki(level, message, labels = {}, data = {}) {
  try {
    const config = useRuntimeConfig();
    const LOG_LEVEL = config.logging?.level || 'info';
    const LOKI_URL = config.logging?.lokiUrl || 'http://localhost:3100';

    // Check if we should log this level
    if (LOG_LEVELS[level] < LOG_LEVELS[LOG_LEVEL]) {
      return;
    }
    
    // Apply rate limiting to avoid overwhelming Loki
    if (checkRateLimit(level)) {
      // If we're being rate limited and it's an error, at least log to console
      if (level === 'error') {
        console.error('[RATE LIMITED]', message, data);
      }
      return;
    }

    // Create the log entry
    const timestamp = Date.now() * 1000000; // Loki uses nanosecond timestamps
    const combinedLabels = {
      level,
      app: 'corrad',
      ...labels,
    };
    
    // Add environment label
    combinedLabels.env = process.env.NODE_ENV || 'development';

    // Format the log labels for Loki
    const formattedLabels = Object.entries(combinedLabels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    // Format the log data
    const logData = {
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    // Add runtime information to logs
    if (level === 'error') {
      logData.memory = {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      };
    }

    // Send to Loki
    const response = await fetch(`${LOKI_URL}/loki/api/v1/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streams: [
          {
            stream: combinedLabels,
            values: [
              [
                timestamp.toString(),
                typeof logData === 'string' ? logData : JSON.stringify(logData),
              ],
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send log to Loki: ${response.statusText}`);
    }
  } catch (error) {
    // Fallback to console if Loki is unavailable
    console.error('Error sending log to Loki:', error);
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
}

// Create a batch of logs to be sent at once (reduces network requests)
const logBatch = {
  logs: [],
  lastSent: Date.now(),
  maxBatchSize: 10,
  maxWaitTime: 5000, // 5 seconds
};

/**
 * Add log to batch and send if batch is full or max wait time is reached
 */
function batchLog(level, message, labels = {}, data = {}) {
  logBatch.logs.push({ level, message, labels, data, timestamp: Date.now() });
  
  const shouldSendNow = 
    logBatch.logs.length >= logBatch.maxBatchSize || 
    Date.now() - logBatch.lastSent > logBatch.maxWaitTime;
  
  if (shouldSendNow) {
    // For errors, send immediately without batching
    if (level === 'error') {
      sendToLoki(level, message, labels, data);
      return;
    }
    
    // Process the batch
    processLogBatch();
  }
}

/**
 * Process and send the batch of logs
 */
function processLogBatch() {
  if (logBatch.logs.length === 0) return;
  
  // Send each log in the batch
  logBatch.logs.forEach(log => {
    sendToLoki(log.level, log.message, log.labels, log.data);
  });
  
  // Reset the batch
  logBatch.logs = [];
  logBatch.lastSent = Date.now();
}

// Set up a timer to process log batches periodically
setInterval(processLogBatch, logBatch.maxWaitTime);

// Exported logger methods
export const logger = {
  debug: (message, labels = {}, data = {}) => batchLog('debug', message, labels, data),
  info: (message, labels = {}, data = {}) => batchLog('info', message, labels, data),
  warn: (message, labels = {}, data = {}) => batchLog('warn', message, labels, data),
  error: (message, labels = {}, data = {}) => batchLog('error', message, labels, data),
};

export default logger; 