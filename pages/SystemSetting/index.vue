<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">System Log</h1>
    
    <!-- Search Filters -->
    <div class="flex gap-4 mb-4 items-end">
      <!-- Search Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Search type</label>
        <select v-model="searchType" class="border rounded p-2 w-full">
          <option value="transcode">Transcode</option>
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
          <!-- Add other options as necessary -->
        </select>
      </div>
      
      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700">From</label>
        <input type="date" v-model="fromDate" class="border rounded p-2 w-full">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">To</label>
        <input type="date" v-model="toDate" class="border rounded p-2 w-full">
      </div>

      <!-- Company -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Company</label>
        <select v-model="company" class="border rounded p-2 w-full">
          <option value="all">All</option>
          <option value="companyA">Company A</option>
          <option value="companyB">Company B</option>
          <!-- Add more options based on your dataset -->
        </select>
      </div>

      <!-- Search Button -->
      <button @click="fetchRecords" class="btn-primary p-2 h-10 mt-5">SEARCH</button>
    </div>

    <!-- Results Table -->
    <div v-if="records.length">
      <table class="table-auto w-full mt-4 border">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-2">No.</th>
            <th class="p-2">Date</th>
            <th class="p-2">Code</th>
            <th class="p-2">Description</th>
            <th class="p-2">User</th>
            <th class="p-2">CompID</th>
            <th class="p-2">Remote IP</th>
            <th class="p-2">Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in records" :key="index" class="border-b">
            <td class="p-2 text-center">{{ index + 1 }}</td>
            <td class="p-2 text-center">{{ record.date }}</td>
            <td class="p-2 text-center">{{ record.code }}</td>
            <td class="p-2 text-center">{{ record.description }}</td>
            <td class="p-2 text-center">{{ record.user }}</td>
            <td class="p-2 text-center">{{ record.compId }}</td>
            <td class="p-2 text-center">{{ record.remoteIp }}</td>
            <td class="p-2 text-center">{{ record.reference }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center mt-4 text-gray-500">There is no record match to your query.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchType = ref('transcode')
const fromDate = ref(new Date().toISOString().slice(0, 10)) // Default to today's date
const toDate = ref(new Date().toISOString().slice(0, 10))
const company = ref('all')

// Sample data for illustration
const records = ref([
  { date: '2024-10-01', code: 'TX001', description: 'Transcode process initiated', user: 'admin', compId: '123', remoteIp: '192.168.1.1', reference: 'REF001' },
  { date: '2024-10-02', code: 'TX002', description: 'Encoding started', user: 'user1', compId: '456', remoteIp: '192.168.1.2', reference: 'REF002' },
  { date: '2024-10-03', code: 'TX003', description: 'Decoding error', user: 'user2', compId: '789', remoteIp: '192.168.1.3', reference: 'REF003' }
])

// Fetch records function - simulates a fetch, replace with API call
const fetchRecords = async () => {
  // Placeholder: Simulate filtering records based on search criteria
  // In a real app, replace with API call and pass search params
  console.log("Simulate fetch based on criteria:", searchType.value, fromDate.value, toDate.value, company.value)
  // Keep records as is for sample display
}
</script>

<style scoped>
.btn-primary { @apply bg-blue-500 text-white px-4 py-2 rounded }
.table-auto { @apply border-collapse border border-gray-300 }
.table-auto th, .table-auto td { @apply border border-gray-300 text-sm }
</style>
