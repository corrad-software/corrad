/**
 * API endpoint to fetch and filter logs from Loki
 * This endpoint allows frontend components to fetch logs with advanced filtering
 */

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const LOKI_URL = config.logging?.lokiUrl || 'http://localhost:3100';
    
    // Get filter criteria from request body
    const { 
      query, 
      start, 
      end, 
      limit, 
      direction,
      level,
      component,
    } = await readBody(event);

    // Validate user has appropriate permissions
    const user = event.context.user || {};
    const roles = user.roles || [];
    
    // Check for admin/monitoring roles, case-insensitive, including Developer
    if (
      !roles.some(role => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'monitoring' ||
        role === 'Admin' ||
        role === 'Superadmin' ||
        role === 'Developer'
      )
    ) {
      return {
        statusCode: 403,
        message: 'Permission denied. You need admin, monitoring, or developer role to access logs.',
      };
    }
    
    // Build the Loki query
    let lokiQuery = '{app="corrad"';
    
    // Add level filter if specified
    if (level) {
      lokiQuery += `, level="${level}"`;
    }
    
    // Add component filter if specified
    if (component) {
      lokiQuery += `, component="${component}"`;
    }
    
    lokiQuery += '}';
    
    // Add text search if specified
    if (query) {
      lokiQuery += ` |= "${query}"`;
    }
    
    // Set default query parameters
    const now = new Date().getTime() * 1000000; // nanoseconds
    const params = new URLSearchParams({
      query: lokiQuery,
      limit: limit || 100,
      direction: direction || 'backward', // backward = newest first
      start: start || (now - 3600000000000).toString(), // 1 hour ago by default
      end: end || now.toString(),
    });
    
    // Fetch logs from Loki
    const response = await fetch(`${LOKI_URL}/loki/api/v1/query_range?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs from Loki: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process logs to make them more readable
    const formattedLogs = [];
    
    if (data.data?.result?.length > 0) {
      for (const stream of data.data.result) {
        const labels = stream.stream || {};
        
        for (const [timestamp, value] of stream.values) {
          try {
            // Parse log value (might be JSON or plain text)
            let parsedValue;
            try {
              parsedValue = JSON.parse(value);
            } catch (e) {
              parsedValue = { message: value };
            }
            
            // Create a more readable log format
            formattedLogs.push({
              timestamp: new Date(timestamp / 1000000), // convert nanoseconds to milliseconds
              level: labels.level || 'unknown',
              component: labels.component || 'unknown',
              message: parsedValue.message || value,
              metadata: {
                ...labels,
                ...parsedValue,
              },
            });
          } catch (e) {
            console.error('Error parsing log:', e);
          }
        }
      }
    }
    
    return {
      statusCode: 200,
      data: formattedLogs,
      total: formattedLogs.length,
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    return {
      statusCode: 500,
      message: 'Error fetching logs',
      error: error.message,
    };
  }
}); 