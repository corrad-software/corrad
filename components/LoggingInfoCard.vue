<template>
  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <i class="fas fa-info-circle text-blue-500"></i>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Unified System Monitoring</h3>
        <div class="mt-2 text-sm text-blue-700">
          <p class="mb-1">Our integrated monitoring system collects data from multiple sources, categorized for easy access:</p>
          <ul class="list-disc pl-5 mt-1 mb-1 space-y-1">
            <li><strong>User Activity</strong>: User interactions like logins, data operations, and system access.</li>  
            <li><strong>System Operations</strong>: Technical details about system performance, errors, and infrastructure.</li>
            <li><strong>Security Events</strong>: Security-related activities, warnings, and potential threats.</li>
            <li><strong>Performance Metrics</strong>: Resource usage, response times, and optimization insights.</li>
          </ul>
          <p class="mt-1 italic">Data is stored in both database (long-term audit records) and Grafana Loki (detailed technical logs).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No data needed for this component
</script> 