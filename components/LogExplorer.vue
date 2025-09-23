<template>
  <div class="log-explorer">
    <!-- Add error message display -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
    
    <h1 class="text-2xl font-bold mb-6">Real-time System Monitoring</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      Live technical system logs from Grafana Loki. These logs provide detailed insights into system operations,
      performance metrics, and technical errors that aren't stored in the database. Use this explorer to diagnose
      issues, monitor system health, and track technical events happening across the application.
    </p>
    
    <rs-card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Advanced Log Explorer</h3>
      </template>
      <template #body>
        <div class="filters grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Text search -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search Text</label>
            <input 
              type="text" 
              v-model="filters.query" 
              placeholder="Search logs..." 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          <!-- Time range -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select 
              v-model="filters.timeRange" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="3h">Last 3 hours</option>
              <option value="6h">Last 6 hours</option>
              <option value="12h">Last 12 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="2d">Last 2 days</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>
          
          <!-- Log level -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
            <select 
              v-model="filters.level" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="security-alert">Security Alert</option>
            </select>
          </div>
          
          <!-- Component filter -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Component</label>
            <select 
              v-model="filters.component" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">All Components</option>
              <option v-for="component in componentOptions" :key="component" :value="component">
                {{ component }}
              </option>
            </select>
          </div>
          
          <!-- Limit -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Result Limit</label>
            <select 
              v-model="filters.limit" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option :value="50">50 logs</option>
              <option :value="100">100 logs</option>
              <option :value="200">200 logs</option>
              <option :value="500">500 logs</option>
            </select>
          </div>
          
          <!-- Direction -->
          <div class="filter-item">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
            <select 
              v-model="filters.direction" 
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="backward">Newest First</option>
              <option value="forward">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div class="mt-4 flex justify-end">
          <rs-button 
            @click="fetchLogs" 
            variant="primary"
            :disabled="loading"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin mr-2"></i> Loading...
            </span>
            <span v-else>
              <i class="fas fa-search mr-2"></i> Search Logs
            </span>
          </rs-button>
        </div>
      </template>
    </rs-card>
    
    <!-- Stats cards -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <rs-card>
        <template #body>
          <div class="pt-4">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Logs</h4>
            <p class="text-2xl font-bold text-blue-700">{{ logs.length }}</p>
            <div class="text-xs text-gray-500 mt-1">in selected time range</div>
          </div>
        </template>
      </rs-card>
      
      <rs-card>
        <template #body>
          <div class="pt-4">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Warning/Errors</h4>
            <p class="text-2xl font-bold text-amber-700">{{ errorCount }}</p>
            <div class="text-xs text-gray-500 mt-1">requiring attention</div>
          </div>
        </template>
      </rs-card>
      
      <rs-card>
        <template #body>
          <div class="pt-4">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Security Alerts</h4>
            <p class="text-2xl font-bold text-emerald-700">{{ securityAlertCount }}</p>
            <div class="text-xs text-gray-500 mt-1">potential security issues</div>
          </div>
        </template>
      </rs-card>
      
      <rs-card>
        <template #body>
          <div class="pt-4">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">System Components</h4>
            <p class="text-2xl font-bold text-purple-700">{{ componentOptions.length }}</p>
            <div class="text-xs text-gray-500 mt-1">active system modules</div>
          </div>
        </template>
      </rs-card>
    </div>
    
    <!-- Technical visualization -->
    <rs-card class="mb-6" v-if="logs.length > 0">
      <template #header>
        <h3 class="text-lg font-semibold">Log Level Distribution</h3>
      </template>
      <template #body>
        <div class="flex space-x-1">
          <div 
            v-for="level in logLevelCounts" 
            :key="level.name"
            class="log-level-bar h-8 rounded"
            :class="{
              'bg-gray-300': level.name === 'debug',
              'bg-blue-400': level.name === 'info',
              'bg-amber-400': level.name === 'warn',
              'bg-red-500': level.name === 'error',
              'bg-emerald-500': level.name === 'security-alert'
            }"
            :style="{ width: `${level.percentage}%` }"
            :title="`${level.name}: ${level.count} (${level.percentage.toFixed(1)}%)`"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-600 mt-2">
          <div v-for="level in logLevelCounts" :key="level.name" class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-1"
              :class="{
                'bg-gray-300': level.name === 'debug',
                'bg-blue-400': level.name === 'info',
                'bg-amber-400': level.name === 'warn',
                'bg-red-500': level.name === 'error',
                'bg-emerald-500': level.name === 'security-alert'
              }"
            ></div>
            <span>{{ level.name }}: {{ level.count }}</span>
          </div>
        </div>
      </template>
    </rs-card>
    
    <!-- Results table -->
    <rs-card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">System Logs</h3>
      </template>
      <template #body>
        <div v-if="loading" class="flex justify-center py-8">
          <div class="loading-spinner">Loading logs...</div>
        </div>
        
        <div v-else-if="logs.length === 0" class="py-4 text-center text-gray-500">
          <div class="mb-2 text-4xl"><i class="fas fa-search"></i></div>
          <div class="text-lg">No logs found matching your criteria</div>
          <div class="text-sm mt-2">Try adjusting your filters</div>
        </div>
        
        <div v-else>
          <rs-table 
            :data="logsTableData"
            :options="{
              variant: 'default',
              striped: true,
              hover: true,
              borderless: false
            }"
            :optionsAdvanced="{
              sortable: true,
              filterable: true,
              responsive: true,
              outsideBorder: true
            }"
            :sort="{
              column: 'timestamp',
              direction: 'desc'
            }"
            :pageSize="10"
            advanced
          >
            <template v-slot:timestamp="data">
              <div class="whitespace-nowrap">{{ formatDateTime(data.value.timestamp) }}</div>
            </template>
            <template v-slot:level="data">
              <span 
                class="px-2 py-1 rounded text-xs font-medium inline-block" 
                :class="{
                  'bg-red-100 text-red-800': data.text === 'error', 
                  'bg-amber-100 text-amber-800': data.text === 'warn',
                  'bg-blue-100 text-blue-800': data.text === 'info',
                  'bg-gray-100 text-gray-800': data.text === 'debug',
                  'bg-emerald-100 text-emerald-800': data.text === 'security-alert'
                }"
              >
                {{ data.text }}
              </span>
            </template>
            <template v-slot:details="data">
              <rs-button 
                size="sm"
                variant="primary"
                @click="viewLogDetails(data.value)"
              >
                View Details
              </rs-button>
            </template>
          </rs-table>
        </div>
      </template>
    </rs-card>
    
    <!-- Log details modal -->
    <rs-modal v-model="showLogModalValue" title="Technical Log Details" size="lg" cancel-only>
      <template #body>
        <div v-if="selectedLog">
          <!-- Log badges -->
          <div class="flex mb-4 gap-2 flex-wrap">
            <span 
              class="px-2 py-1 rounded text-xs font-medium" 
              :class="{
                'bg-red-100 text-red-800': selectedLog.level === 'error', 
                'bg-amber-100 text-amber-800': selectedLog.level === 'warn',
                'bg-blue-100 text-blue-800': selectedLog.level === 'info',
                'bg-gray-100 text-gray-800': selectedLog.level === 'debug',
                'bg-emerald-100 text-emerald-800': selectedLog.level === 'security-alert'
              }"
            >
              {{ selectedLog.level }}
            </span>
            
            <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {{ selectedLog.component }}
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.method" class="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              {{ selectedLog.metadata.method }}
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.action" class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              {{ selectedLog.metadata.action }}
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.env" class="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {{ selectedLog.metadata.env }}
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.responseTime" class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {{ selectedLog.metadata.responseTime }}ms
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.status" class="px-2 py-1 rounded text-xs font-medium" 
              :class="{
                'bg-green-100 text-green-800': selectedLog.metadata.status < 400,
                'bg-amber-100 text-amber-800': selectedLog.metadata.status >= 400 && selectedLog.metadata.status < 500,
                'bg-red-100 text-red-800': selectedLog.metadata.status >= 500
              }"
            >
              Status {{ selectedLog.metadata.status }}
            </span>
            
            <span v-if="selectedLog.metadata && selectedLog.metadata.memory" class="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {{ typeof selectedLog.metadata.memory === 'object' ? selectedLog.metadata.memory.rss : selectedLog.metadata.memory }}
            </span>
          </div>
          
          <!-- Log metadata -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div class="font-medium text-gray-700">Timestamp</div>
              <div>{{ formatDateTime(selectedLog.timestamp) }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.username">
              <div class="font-medium text-gray-700">User</div>
              <div>{{ selectedLog.metadata.username }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.userID">
              <div class="font-medium text-gray-700">User ID</div>
              <div>{{ selectedLog.metadata.userID }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.ip">
              <div class="font-medium text-gray-700">IP Address</div>
              <div>{{ selectedLog.metadata.ip }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && (selectedLog.metadata.method || selectedLog.metadata.url)">
              <div class="font-medium text-gray-700">Request</div>
              <div>{{ selectedLog.metadata ? (selectedLog.metadata.method || '') : '' }} {{ selectedLog.metadata ? (selectedLog.metadata.url || '') : '' }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.action">
              <div class="font-medium text-gray-700">Action</div>
              <div>{{ selectedLog.metadata.action }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.app">
              <div class="font-medium text-gray-700">Application</div>
              <div>{{ selectedLog.metadata.app }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && (selectedLog.metadata.browser || selectedLog.metadata.platform)">
              <div class="font-medium text-gray-700">User Agent</div>
              <div>{{ selectedLog.metadata ? (selectedLog.metadata.browser || 'Unknown') : 'Unknown' }} / {{ selectedLog.metadata ? (selectedLog.metadata.platform || 'Unknown') : 'Unknown' }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.country">
              <div class="font-medium text-gray-700">Location</div>
              <div>{{ selectedLog.metadata ? (selectedLog.metadata.city || 'Unknown') : 'Unknown' }}, {{ selectedLog.metadata ? (selectedLog.metadata.country || 'Unknown') : 'Unknown' }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.referer">
              <div class="font-medium text-gray-700">Referer</div>
              <div class="truncate">{{ selectedLog.metadata.referer }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.env">
              <div class="font-medium text-gray-700">Environment</div>
              <div>{{ selectedLog.metadata.env }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.hasPayload">
              <div class="font-medium text-gray-700">Has Payload</div>
              <div>{{ selectedLog.metadata.hasPayload ? 'Yes' : 'No' }}</div>
            </div>
            
            <div v-if="selectedLog.metadata && selectedLog.metadata.payloadLength">
              <div class="font-medium text-gray-700">Payload Size</div>
              <div>{{ selectedLog.metadata.payloadLength }} bytes</div>
            </div>
          </div>
          
          <!-- Log message -->
          <div class="mb-4">
            <div class="font-medium text-gray-700 mb-1">Message</div>
            <div class="p-3 bg-gray-50 rounded">{{ selectedLog.message }}</div>
          </div>
          
          <!-- Technical sections -->
          <div v-if="selectedLog.metadata && selectedLog.metadata.error" class="mb-4">
            <div class="font-medium text-gray-700 mb-1">Error Details</div>
            <pre class="p-3 bg-red-50 text-red-700 rounded text-xs overflow-auto max-h-32">{{ JSON.stringify(selectedLog.metadata.error, null, 2) }}</pre>
          </div>
          
          <div v-if="selectedLog.metadata && selectedLog.metadata.performance" class="mb-4">
            <div class="font-medium text-gray-700 mb-1">Performance Metrics</div>
            <pre class="p-3 bg-blue-50 rounded text-xs overflow-auto max-h-32">{{ JSON.stringify(selectedLog.metadata.performance, null, 2) }}</pre>
          </div>
          
          <!-- Full Metadata -->
          <div v-if="selectedLog.metadata" class="mb-4">
            <div class="font-medium text-gray-700 mb-1">Full Technical Metadata</div>
            <pre class="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>
          <div v-else class="mb-4">
            <div class="font-medium text-gray-700 mb-1">Metadata</div>
            <div class="p-3 bg-gray-50 rounded text-gray-500">No additional metadata available for this log entry</div>
          </div>
        </div>
      </template>
    </rs-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Reactive data
const logs = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedLog = ref(null);
const componentOptions = ref([]);

// Filters
const filters = ref({
  query: '',
  level: '',
  component: '',
  timeRange: '1h',
  limit: 100,
  direction: 'backward'
});

// Compute start/end timestamps based on time range
const getTimeRangeParams = () => {
  const now = new Date().getTime() * 1000000; // to nanoseconds
  let start;
  
  switch (filters.value.timeRange) {
    case '15m':
      start = now - (15 * 60 * 1000 * 1000000);
      break;
    case '1h':
      start = now - (60 * 60 * 1000 * 1000000);
      break;
    case '3h':
      start = now - (3 * 60 * 60 * 1000 * 1000000);
      break;
    case '6h':
      start = now - (6 * 60 * 60 * 1000 * 1000000);
      break;
    case '12h':
      start = now - (12 * 60 * 60 * 1000 * 1000000);
      break;
    case '24h':
      start = now - (24 * 60 * 60 * 1000 * 1000000);
      break;
    case '2d':
      start = now - (2 * 24 * 60 * 60 * 1000 * 1000000);
      break;
    case '7d':
      start = now - (7 * 24 * 60 * 60 * 1000 * 1000000);
      break;
    default:
      start = now - (60 * 60 * 1000 * 1000000); // default to 1 hour
  }
  
  return {
    start: start.toString(),
    end: now.toString()
  };
};

// Fetch logs from the API
const fetchLogs = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const timeRange = getTimeRangeParams();
    
    const response = await fetch('/api/logs/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: filters.value.query,
        level: filters.value.level,
        component: filters.value.component,
        limit: filters.value.limit,
        direction: filters.value.direction,
        start: timeRange.start,
        end: timeRange.end
      })
    });
    
    const result = await response.json();
    
    if (result.statusCode === 200) {
      // Make sure each log has a metadata object
      logs.value = result.data.map(log => {
        // Create a sanitized log object with consistent properties
        const sanitizedLog = {
          // Core properties at the root level
          timestamp: log.timestamp || new Date().toISOString(),
          level: log.level || 'info',
          component: log.component || 'unknown',
          message: log.message || 'No message',
          
          // Start with an empty metadata object
          metadata: {}
        };
        
        // Copy all metadata properties from the embedded metadata object
        if (log.metadata && typeof log.metadata === 'object') {
          Object.assign(sanitizedLog.metadata, log.metadata);
        }
        
        // Also copy any metadata-like properties from the root level
        // This handles logs that have metadata fields at the top level
        const metadataFields = [
          'action', 'app', 'env', 'ip', 'method', 'url', 
          'userID', 'username', 'hasPayload', 'payloadLength',
          'browser', 'platform', 'city', 'country', 'responseTime', 'status'
        ];
        
        metadataFields.forEach(field => {
          if (log[field] !== undefined && sanitizedLog.metadata[field] === undefined) {
            sanitizedLog.metadata[field] = log[field];
          }
        });
        
        return sanitizedLog;
      });
      
      // Extract unique component values for filter dropdown
      const components = new Set();
      logs.value.forEach(log => {
        if (log.component && log.component !== 'unknown') {
          components.add(log.component);
        }
      });
      componentOptions.value = Array.from(components).sort();
    } else {
      error.value = result.message || 'Error fetching logs';
      console.error('Error fetching logs:', result);
    }
  } catch (err) {
    error.value = 'Network error while fetching logs: ' + (err.message || err);
    console.error('Network error:', err);
  } finally {
    loading.value = false;
  }
};

// Format date and time
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    // If invalid date, try parsing as ISO string
    return new Date(timestamp).toLocaleString();
  }
  
  return date.toLocaleString();
};

// View log details
const viewLogDetails = (log) => {
  // Create a sanitized log object with consistent properties
  const sanitizedLog = {
    // Core properties at the root level
    timestamp: log.timestamp || new Date().toISOString(),
    level: log.level || 'info',
    component: log.component || 'unknown',
    message: log.message || 'No message',
    
    // Start with an empty metadata object
    metadata: {}
  };
  
  // Copy all metadata properties from the embedded metadata object
  if (log.metadata && typeof log.metadata === 'object') {
    Object.assign(sanitizedLog.metadata, log.metadata);
  }
  
  // Also copy any metadata-like properties from the root level
  // This handles logs that have metadata fields at the top level
  const metadataFields = [
    'action', 'app', 'env', 'ip', 'method', 'url', 
    'userID', 'username', 'hasPayload', 'payloadLength',
    'browser', 'platform', 'city', 'country', 'responseTime', 'status'
  ];
  
  metadataFields.forEach(field => {
    if (log[field] !== undefined && sanitizedLog.metadata[field] === undefined) {
      sanitizedLog.metadata[field] = log[field];
    }
  });
  
  // Set the selected log
  selectedLog.value = sanitizedLog;
  
  // For debugging
  console.log('Viewing log details:', sanitizedLog);
};

// Modal visibility computed property
const showLogModalValue = computed({
  get: () => selectedLog.value !== null,
  set: (value) => {
    if (!value) selectedLog.value = null;
  },
});

// Computed properties for stats
const errorCount = computed(() => {
  return logs.value.filter(log => log.level === 'error' || log.level === 'warn').length;
});

const securityAlertCount = computed(() => {
  return logs.value.filter(log => log.level === 'security-alert').length;
});

// Compute log level distribution for visualization
const logLevelCounts = computed(() => {
  if (logs.value.length === 0) return [];
  
  const counts = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    'security-alert': 0
  };
  
  // Count logs by level
  logs.value.forEach(log => {
    if (counts.hasOwnProperty(log.level)) {
      counts[log.level]++;
    } else {
      // If it's an unknown level, count as debug
      counts.debug++;
    }
  });
  
  // Calculate percentages and create array
  const total = logs.value.length;
  return Object.entries(counts).map(([name, count]) => {
    return {
      name,
      count,
      percentage: (count / total) * 100
    };
  }).filter(level => level.count > 0); // Only include levels that have logs
});

// Format logs for RsTable
const logsTableData = computed(() => {
  return logs.value.map(log => {
    const metadata = log.metadata || {};
    return {
      timestamp: log.timestamp,
      level: log.level,
      component: log.component,
      message: log.message,
      action: metadata.action || '',
      method: metadata.method || '',
      username: metadata.username || '',
      ip: metadata.ip || '',
      details: log
    };
  });
});

// Initial load
onMounted(() => {
  // For debugging: show the current user's roles
  fetch('/api/auth/validate').then(res => res.json()).then(data => {
    console.log('Current user roles:', data.user?.roles);
  }).catch(err => {
    console.error('Error getting current user:', err);
  });
  
  fetchLogs();
});
</script>

<style scoped>
.loading-spinner {
  @apply text-center py-4 text-gray-600;
}

.log-explorer {
  @apply w-full;
}
</style> 