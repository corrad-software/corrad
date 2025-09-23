<script setup>
// This page requires authentication and admin role
definePageMeta({
  middleware: ["auth"],
});

// Add this import near the top of the script setup section
import LogExplorer from '~/components/LogExplorer.vue';
import LoggingInfoCard from '~/components/LoggingInfoCard.vue';

// Data
const auditLogs = ref([]);
const stats = ref({});
const selectedLog = ref(null);
const filters = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // 30 days ago
  endDate: (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  })(), // today
  userId: "",
  action: "",
  ip: "",
});
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// Options for filters
const userOptions = ref([]);
const actionOptions = ref([]);

// Add this with the other refs
const activeTab = ref('audit'); // Options: 'audit', 'logs'

// Fetch action types for filter dropdown
const fetchActionTypes = async () => {
  try {
    const response = await fetch("/api/devtool/audit/actions");
    const result = await response.json();

    if (result.statusCode === 200) {
      actionOptions.value = result.data;
    } else {
      console.error("Error fetching action types:", result.message);
      // Fallback to common action types
      actionOptions.value = [
        "User Login",
        "User Logout",
        "Data Created",
        "Data Updated",
        "Data Deleted",
        "Data Viewed",
        "GET /dashboard",
        "GET /logout",
      ];
    }
  } catch (error) {
    console.error("Error fetching action types:", error);
    // Fallback to common action types
    actionOptions.value = [
      "User Login",
      "User Logout",
      "Data Created",
      "Data Updated",
      "Data Deleted",
      "Data Viewed",
      "GET /dashboard",
      "GET /logout",
    ];
  }
};

// Fetch audit logs with current filters and pagination
const fetchAuditLogs = async () => {
  try {
    const queryParams = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
    });

    if (filters.value.startDate)
      queryParams.append("startDate", filters.value.startDate);
    if (filters.value.endDate)
      queryParams.append("endDate", filters.value.endDate);
    if (filters.value.userId)
      queryParams.append("userId", filters.value.userId);
    if (filters.value.action)
      queryParams.append("action", filters.value.action);
    if (filters.value.ip) queryParams.append("ip", filters.value.ip);

    const response = await fetch(
      `/api/devtool/audit?${queryParams.toString()}`
    );
    const result = await response.json();

    if (result.statusCode === 200) {
      auditLogs.value = result.data.logs;
      pagination.value = result.data.pagination;
    } else {
      console.error("Error fetching audit logs:", result.message);
    }
  } catch (error) {
    console.error("Error fetching audit logs:", error);
  }
};

// Fetch user list for filter dropdown
const fetchUserList = async () => {
  try {
    const response = await fetch("/api/devtool/audit/users");
    const result = await response.json();

    if (result.statusCode === 200) {
      userOptions.value = result.data.map((user) => ({
        id: user.id,
        name: user.fullName || user.username,
      }));
    } else {
      console.error("Error fetching user list:", result.message);
    }
  } catch (error) {
    console.error("Error fetching user list:", error);
  }
};

// Fetch audit statistics
const fetchAuditStats = async () => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.value.startDate)
      queryParams.append("startDate", filters.value.startDate);
    if (filters.value.endDate)
      queryParams.append("endDate", filters.value.endDate);

    const response = await fetch(
      `/api/devtool/audit/stats?${queryParams.toString()}`
    );
    const result = await response.json();

    if (result.statusCode === 200) {
      stats.value = result.data;
      // console.log("Fetched stats:", result.data);
      refreshChart();
    } else {
      console.error("Error fetching audit statistics:", result.message);
    }
  } catch (error) {
    console.error("Error fetching audit statistics:", error);
  }
};

// Apply filters and reset pagination
const applyFilters = () => {
  pagination.value.page = 1;
  fetchAuditLogs();
  fetchAuditStats();
};

// Change page
const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return;
  pagination.value.page = newPage;
  fetchAuditLogs();
};

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleString();
};

// Format JSON payload for display
const formatPayload = (payload) => {
  if (!payload) return "";

  try {
    // If it's already a JSON string, parse and re-stringify with indentation
    const parsed = JSON.parse(payload);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If it's not valid JSON, return as is
    return payload;
  }
};

// Prepare data for rs-table
const activeUsersTableData = computed(() => {
  if (!stats.value.activeUsers) return [];
  return stats.value.activeUsers.map((user) => ({
    user: user.userFullName || user.userUsername || "Unknown User",
    activityCount: user.activityCount,
  }));
});

const commonIPsTableData = computed(() => {
  if (!stats.value.commonIPs) return [];
  return stats.value.commonIPs.map((ip) => ({
    ipAddress: ip.auditIP || "Unknown",
    count: ip.count,
  }));
});

const auditLogsTableData = computed(() => {
  return auditLogs.value.map((log) => ({
    time: formatDateTime(log.auditCreatedDate),
    user: log.user?.userFullName || log.user?.userUsername || log.auditUsername || "Unknown",
    action: log.auditAction,
    ipAddress: log.auditIP,
    details: log
  }));
});

// Initialize
onMounted(() => {
  fetchAuditLogs();
  fetchAuditStats();
  fetchUserList();
  fetchActionTypes();

  // Initialize chart refresh with a longer delay to ensure data is loaded
  setTimeout(() => {
    // console.log("Activity data:", stats.value.activityByDay);
    changeKey.value++;
  }, 1000);
});

// Chart data and options
const activityChartData = ref([]);
const changeKey = ref(0);
const hasData = ref(false);

// Manually refresh the chart
const refreshChart = () => {
  setTimeout(() => {
    changeKey.value++;
  }, 100);
};

// Process activity data for chart when stats change
watch(
  () => stats.value,
  (newStats) => {
    // console.log("Stats updated:", newStats);

    const newActivityData = newStats?.activityByDay || [];

    if (newActivityData && newActivityData.length > 0) {
      // Make sure we have valid dates for categories
      const validDates = newActivityData.filter(
        (day) => day.date && day.date.trim() !== ""
      );

      if (validDates.length > 0) {
        hasData.value = true;

        // Transform the data for the chart, ensuring all values are valid numbers
        activityChartData.value = [
          {
            name: "Login Activities",
            data: validDates.map((day) => {
              const loginAction = day.actions?.find(
                (a) => a.action === "User Login"
              );
              const logoutAction = day.actions?.find(
                (a) => a.action === "User Logout"
              );
              return Math.max(
                0,
                (loginAction?.count || 0) + (logoutAction?.count || 0)
              );
            }),
          },
          {
            name: "Data Operations",
            data: validDates.map((day) => {
              const createAction = day.actions?.find(
                (a) => a.action === "Data Created"
              );
              const updateAction = day.actions?.find(
                (a) => a.action === "Data Updated"
              );
              const deleteAction = day.actions?.find(
                (a) => a.action === "Data Deleted"
              );
              const viewAction = day.actions?.find(
                (a) => a.action === "Data Viewed"
              );

              return Math.max(
                0,
                (createAction?.count || 0) +
                  (updateAction?.count || 0) +
                  (deleteAction?.count || 0) +
                  (viewAction?.count || 0)
              );
            }),
          },
          {
            name: "Other Activities",
            data: validDates.map((day) => {
              // Calculate total of all actions
              const actionsTotal =
                day.actions?.reduce((sum, action) => sum + action.count, 0) ||
                0;

              // Calculate total of login and data operations
              const loginCount =
                day.actions?.find((a) => a.action === "User Login")?.count || 0;
              const logoutCount =
                day.actions?.find((a) => a.action === "User Logout")?.count ||
                0;
              const createCount =
                day.actions?.find((a) => a.action === "Data Created")?.count ||
                0;
              const updateCount =
                day.actions?.find((a) => a.action === "Data Updated")?.count ||
                0;
              const deleteCount =
                day.actions?.find((a) => a.action === "Data Deleted")?.count ||
                0;
              const viewCount =
                day.actions?.find((a) => a.action === "Data Viewed")?.count ||
                0;

              const operationsTotal =
                loginCount +
                logoutCount +
                createCount +
                updateCount +
                deleteCount +
                viewCount;

              // Return the difference (other activities)
              return Math.max(0, actionsTotal - operationsTotal);
            }),
          },
        ];

        // Force chart to refresh
        refreshChart();
      } else {
        hasData.value = false;
        activityChartData.value = [];
        refreshChart();
      }
    } else {
      hasData.value = false;
      activityChartData.value = [];
      refreshChart();
    }
  },
  { deep: true, immediate: true }
);

// Chart options for activity timeline
const chartOptionsActivity = computed(() => {
  // Ensure we have valid date categories
  let categories = [];

  if (stats.value.activityByDay?.length > 0) {
    categories =
      stats.value.activityByDay
        ?.filter((day) => day.date && day.date.trim() !== "")
        ?.map((day) => day.date) || [];
  }

  // console.log("Chart categories:", categories);

  return {
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
      },
      fontFamily: "inherit",
      background: "transparent",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#6366F1", "#F97316", "#10B981"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
        formatter: (value) => {
          return value !== undefined && !isNaN(value) ? Math.round(value) : 0;
        },
      },
      title: {
        text: "Activity Count",
        style: {
          color: "#9CA3AF",
        },
      },
      min: 0,
      tickAmount: 5,
    },
    xaxis: {
      type: "category",
      categories: categories,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
        formatter: function (value) {
          // Format the date for display
          if (!value) return "";
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          } catch (e) {
            return value;
          }
        },
      },
      tooltip: {
        enabled: false,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    tooltip: {
      x: {
        formatter: function (value, { dataPointIndex, w }) {
          const category = w.config.xaxis.categories[dataPointIndex];
          if (!category) return "";
          try {
            const date = new Date(category);
            if (isNaN(date.getTime())) return category;
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          } catch (e) {
            return category;
          }
        },
      },
      y: {
        formatter: (value) => {
          return value !== undefined && !isNaN(value) ? Math.round(value) : 0;
        },
      },
      shared: true,
      intersect: false,
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#9CA3AF",
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    noData: {
      text: "No activity data available for the selected period. Try adjusting your filters.",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#9CA3AF",
        fontSize: "16px",
        fontFamily: "inherit",
      },
    },
  };
});

// Modal visibility computed property
const showLogModal = computed({
  get: () => selectedLog.value !== null,
  set: (value) => {
    if (!value) selectedLog.value = null;
  },
});
</script>

<template>
  <div>
    <!-- Info card explaining the difference between log types -->
    <LoggingInfoCard />
    
    <!-- Tab navigation -->
    <div class="mb-6 border-b border-gray-200">
      <div class="flex -mb-px">
        <button 
          @click="activeTab = 'audit'" 
          class="px-4 py-2 text-sm font-medium border-b-2 focus:outline-none mr-4"
          :class="activeTab === 'audit' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Database Audit Logs
        </button>
        <button 
          @click="activeTab = 'logs'" 
          class="px-4 py-2 text-sm font-medium border-b-2 focus:outline-none"
          :class="activeTab === 'logs' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          Real-time System Logs
        </button>
      </div>
    </div>

    <!-- Audit Logs Tab -->
    <div v-if="activeTab === 'audit'">
      <h1 class="text-2xl font-bold mb-6">Database Audit Trail</h1>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Historical record of user activities stored in the database. This audit trail shows permanent records of
        user interactions with the system, focused on user-driven actions and business operations.
      </p>

      <div class="audit-trail-display">
        <!-- Filters -->
        <rs-card class="mb-6">
          <template #header>
            <h3 class="text-lg font-semibold">Filters</h3>
          </template>
          <template #body>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Date Range</label
                >
                <div class="flex space-x-2">
                  <div class="flex-1">
                    <FormKit
                      type="date"
                      v-model="filters.startDate"
                      placeholder="Start date"
                      outer-class="mb-0"
                    />
                  </div>
                  <div class="flex-1">
                    <FormKit
                      type="date"
                      v-model="filters.endDate"
                      placeholder="End date"
                      outer-class="mb-0"
                    />
                  </div>
                </div>
              </div>
              <div>
                <FormKit
                  type="select"
                  v-model="filters.userId"
                  label="User"
                  placeholder="All Users"
                  :options="
                    userOptions.map((user) => ({
                      value: user.id,
                      label: user.name,
                    }))
                  "
                  outer-class="mb-0"
                />
              </div>
              <div>
                <FormKit
                  type="select"
                  v-model="filters.action"
                  label="Action"
                  placeholder="All Actions"
                  :options="
                    actionOptions.map((action) => ({
                      value: action,
                      label: action,
                    }))
                  "
                  outer-class="mb-0"
                />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <rs-button @click="applyFilters" variant="primary">
                Apply Filters
              </rs-button>
            </div>
          </template>
        </rs-card>

        <!-- Statistics Cards -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <rs-card>
            <template #body>
              <div class="pt-4">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Activities
                </h3>
                <p class="text-2xl font-bold">{{ stats.totalActivities || 0 }}</p>
              </div>
            </template>
          </rs-card>
          <rs-card>
            <template #body>
              <div class="pt-4">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Login Count
                </h3>
                <p class="text-2xl font-bold">{{ stats.loginCount || 0 }}</p>
              </div>
            </template>
          </rs-card>
          <rs-card>
            <template #body>
              <div class="pt-4">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Data Operations
                </h3>
                <p class="text-2xl font-bold">
                  {{
                    (stats.createCount || 0) +
                    (stats.updateCount || 0) +
                    (stats.deleteCount || 0) +
                    (stats.viewCount || 0)
                  }}
                </p>
                <div
                  class="flex flex-wrap justify-between text-xs text-gray-500 mt-1"
                >
                  <span>Create: {{ stats.createCount || 0 }}</span>
                  <span>Update: {{ stats.updateCount || 0 }}</span>
                  <span>Delete: {{ stats.deleteCount || 0 }}</span>
                  <span>View: {{ stats.viewCount || 0 }}</span>
                </div>
              </div>
            </template>
          </rs-card>
          <rs-card>
            <template #body>
              <div class="pt-4">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Unique Users
                </h3>
                <p class="text-2xl font-bold">
                  {{ stats.activeUsers?.length || 0 }}
                </p>
              </div>
            </template>
          </rs-card>
        </div>

        <!-- Activity Chart -->
        <rs-card class="mb-6">
          <template #header>
            <h3 class="text-lg font-semibold">Activity Timeline</h3>
          </template>
          <template #body>
            <div class="h-full">
              <client-only>
                <VueApexCharts
                  :key="changeKey"
                  width="100%"
                  height="300"
                  type="area"
                  :options="chartOptionsActivity"
                  :series="activityChartData"
                ></VueApexCharts>
                <div
                  v-if="!hasData"
                  class="text-center text-gray-500 mt-2 text-sm italic"
                >
                  <p>
                    No activity data available for the selected period. Try
                    adjusting your filters.
                  </p>
                </div>
              </client-only>
            </div>
          </template>
        </rs-card>

        <!-- Top Users and IPs -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <rs-card>
            <template #header>
              <h3 class="text-lg font-semibold">Most Active Users</h3>
            </template>
            <template #body>
              <rs-table
                :data="activeUsersTableData"
                :options="{
                  variant: 'default',
                  striped: true,
                  borderless: true,
                }"
                v-if="activeUsersTableData.length > 0"
              >
                <template v-slot:activityCount="data">
                  <div class="text-right">{{ data.text }}</div>
                </template>
              </rs-table>
              <div v-else class="py-4 text-center text-gray-500">
                No user activity data available
              </div>
            </template>
          </rs-card>
          <rs-card>
            <template #header>
              <h3 class="text-lg font-semibold">Most Common IP Addresses</h3>
            </template>
            <template #body>
              <rs-table
                :data="commonIPsTableData"
                :options="{
                  variant: 'default',
                  striped: true,
                  borderless: true,
                }"
                v-if="commonIPsTableData.length > 0"
              >
                <template v-slot:count="data">
                  <div class="text-right">{{ data.text }}</div>
                </template>
              </rs-table>
              <div v-else class="py-4 text-center text-gray-500">
                No IP data available
              </div>
            </template>
          </rs-card>
        </div>

        <!-- Audit Logs Table -->
        <rs-card class="mb-6">
          <template #header>
            <h3 class="text-lg font-semibold">Audit Logs</h3>
          </template>
          <template #body>
            <rs-table 
              :data="auditLogsTableData"
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
                column: 'time',
                direction: 'desc'
              }"
              :pageSize="10"
              advanced
            >
              <template v-slot:time="data">
                <div class="whitespace-nowrap">{{ data.text }}</div>
              </template>
              <template v-slot:details="data">
                <rs-button 
                  size="sm"
                  variant="primary"
                  @click="selectedLog = data.value"
                >
                  View Details
                </rs-button>
              </template>
            </rs-table>
            
            <div v-if="auditLogs.length === 0" class="py-4 text-center text-gray-500">
              No audit logs found
            </div>

            <!-- Pagination -->
            <div class="mt-4 flex justify-between items-center">
              <div class="text-sm text-gray-500">
                Showing {{ auditLogs.length }} of {{ pagination.total }} results
              </div>
              <div class="flex space-x-2">
                <rs-button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  variant="primary-outline"
                  size="sm"
                >
                  Previous
                </rs-button>
                <rs-button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.totalPages"
                  variant="primary-outline"
                  size="sm"
                >
                  Next
                </rs-button>
              </div>
            </div>
          </template>
        </rs-card>

        <!-- Log Details Modal -->
        <rs-modal v-model="showLogModal" title="Audit Log Details" size="lg" cancel-only>
          <template #body>
            <div v-if="selectedLog">
              <!-- Log badges -->
              <div class="flex mb-4 gap-2 flex-wrap">
                <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ selectedLog.auditAction }}
                </span>
                
                <span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ selectedLog.auditURLMethod || 'Unknown' }}
                </span>
                
                <span class="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  {{ selectedLog.auditIP || 'Unknown IP' }}
                </span>
              </div>
              
              <!-- Log metadata -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div class="font-medium text-gray-700">Timestamp</div>
                  <div>{{ formatDateTime(selectedLog.auditCreatedDate) }}</div>
                </div>
                
                <div>
                  <div class="font-medium text-gray-700">User</div>
                  <div>{{ selectedLog.user?.userFullName || selectedLog.user?.userUsername || selectedLog.auditUsername || "Unknown" }}</div>
                </div>
                
                <div>
                  <div class="font-medium text-gray-700">URL</div>
                  <div>{{ selectedLog.auditURL || 'N/A' }}</div>
                </div>
                
                <div v-if="selectedLog.auditDetails">
                  <div class="font-medium text-gray-700">Details</div>
                  <div>{{ selectedLog.auditDetails }}</div>
                </div>
                
                <div v-if="selectedLog.user?.userEmail">
                  <div class="font-medium text-gray-700">Email</div>
                  <div>{{ selectedLog.user.userEmail }}</div>
                </div>
                
                <div v-if="selectedLog.auditUserId">
                  <div class="font-medium text-gray-700">User ID</div>
                  <div>{{ selectedLog.auditUserId }}</div>
                </div>
              </div>
              
              <!-- Payload section -->
              <div v-if="selectedLog.auditURLPayload" class="mb-4">
                <div class="font-medium text-gray-700 mb-1">Payload</div>
                <pre class="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">{{ formatPayload(selectedLog.auditURLPayload) }}</pre>
              </div>
              
              <!-- Additional Data -->
              <div class="mb-4">
                <div class="font-medium text-gray-700 mb-1">Full Technical Data</div>
                <pre class="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
              </div>
            </div>
          </template>
        </rs-modal>
      </div>
    </div>

    <!-- System Logs (Loki) Tab -->
    <div v-if="activeTab === 'logs'">
      <LogExplorer />
    </div>
  </div>
</template>
