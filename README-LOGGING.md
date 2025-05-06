# Logging with Grafana and Loki

This project includes logging integration with Grafana and Loki for monitoring and visualizing application events.

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```
# Logging
LOG_LEVEL=info         # debug, info, warn, error
LOKI_URL=http://localhost:3100
```

### 2. Start the Monitoring Stack

Start the Grafana and Loki stack using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- Loki on port 3100
- Grafana on port 3200

### 3. Configure Grafana

1. Open Grafana at http://localhost:3200
2. Log in with default credentials (admin/admin)
3. Go to Configuration > Data sources > Add data source
4. Select Loki
5. Set the URL to http://loki:3100
6. Click "Save & Test"

### 4. Create a Dashboard

1. Go to Dashboards > New dashboard > Add a new panel
2. Select Loki as the data source
3. Use the following query to see all logs:
   ```
   {app="corrad"}
   ```
4. For specific components:
   ```
   {app="corrad", component="auth-login"}
   ```
5. For errors only:
   ```
   {app="corrad", level="error"}
   ```

## Advanced Logging Features

### Geographical Tracking
The system now logs geographical information for user logins and important events. This data is available in Grafana dashboards and includes:

- Country
- Region
- City
- Coordinates

### User Agent Analysis
Logs include information about:
- Browser type (Chrome, Firefox, Safari, etc.)
- Operating system (Windows, Mac, Linux, Android, iOS)

### Performance Metrics
The system tracks and logs:
- Response times
- Request counts
- Error rates
- Active sessions

### Security Monitoring
Enhanced security logging includes:
- Failed login attempts
- Suspicious activity by location
- Authentication events

## API Endpoints

### Metrics Endpoint
The system exposes a metrics endpoint at `/api/metrics` that provides real-time information about:

- Database statistics
- User activity
- System performance
- Geographical distribution of users

## Implementing More Logging

Logging is implemented in the following files:

- `server/utils/logger.js` - Logger utility
- `server/utils/geoip.js` - Geolocation services
- `server/utils/metrics.js` - Shared metrics tracking
- `server/middleware/1_audit.js` - Request auditing with logging
- `server/api/auth/login.post.js` - Login endpoint logging
- `server/api/auth/logout.get.js` - Logout endpoint logging
- `server/api/metrics/index.get.js` - Metrics endpoint

To add logging to other files, import the logger:

```javascript
import { logger } from '../utils/logger';

// Then use one of:
logger.debug(message, labels, data);
logger.info(message, labels, data);
logger.warn(message, labels, data);
logger.error(message, labels, data);
```

Where:
- `message` is a string describing the event
- `labels` is an object of key-value pairs used for querying in Grafana (e.g., `{ component: 'my-component', userID: '123' }`)
- `data` is additional data to include in the log (e.g., `{ error: error.message, stack: error.stack }`)

## Recommended Grafana Dashboards

### User Activity Dashboard
- Login/logout frequency
- Failed login attempts
- Geographic distribution of users

### System Health Dashboard
- Response times
- Error rates
- Memory usage

### Security Dashboard
- Failed login attempts by IP
- Authentication events
- Suspicious activity alerts