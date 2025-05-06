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

    // Create the log entry
    const timestamp = Date.now() * 1000000; // Loki uses nanosecond timestamps
    const combinedLabels = {
      level,
      app: 'corrad',
      ...labels,
    };

    // Format the log labels for Loki
    const formattedLabels = Object.entries(combinedLabels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    // Format the log data
    const logData = {
      message,
      ...data,
    };

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

// Exported logger methods
export const logger = {
  debug: (message, labels = {}, data = {}) => sendToLoki('debug', message, labels, data),
  info: (message, labels = {}, data = {}) => sendToLoki('info', message, labels, data),
  warn: (message, labels = {}, data = {}) => sendToLoki('warn', message, labels, data),
  error: (message, labels = {}, data = {}) => sendToLoki('error', message, labels, data),
};

export default logger; 