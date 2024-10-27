<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">PPP Assessment</h1>

    <!-- Filter Section -->
    <div class="flex items-center gap-4 mb-4 bg-blue-200 p-4 rounded">
      <div>
        <label>Search By</label>
        <select v-model="searchBy" class="border rounded p-2 w-full">
          <option value="title">Title</option>
          <option value="school">School</option>
          <option value="year">Year</option>
        </select>
      </div>
      <input v-model="searchQuery" placeholder="Enter search value" class="border rounded p-2 w-full" />
      <button @click="fetchData" class="btn-primary p-2">Search</button>
    </div>

    <!-- Data Table -->
    <table class="table-auto w-full border border-gray-300 mb-4">
      <thead class="bg-blue-300">
        <tr>
          <th class="p-2">Title</th>
          <th class="p-2">Start Date</th>
          <th class="p-2">End Date</th>
          <th class="p-2">School</th>
          <th class="p-2">Self Dateline</th>
          <th class="p-2">PPP Dateline</th>
          <th class="p-2">PPK Dateline</th>
          <th class="p-2">Status</th>
          <th class="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(record, index) in paginatedData" :key="index" class="border-b">
          <td class="p-2">{{ record.title }}</td>
          <td class="p-2 text-center">{{ record.startDate }}</td>
          <td class="p-2 text-center">{{ record.endDate }}</td>
          <td class="p-2 text-center">{{ record.school }}</td>
          <td class="p-2 text-center">{{ record.selfDateline }}</td>
          <td class="p-2 text-center">{{ record.pppDateline }}</td>
          <td class="p-2 text-center">{{ record.ppkDateline }}</td>
          <td class="p-2 text-center">{{ record.status }}</td>
          <td class="p-2 text-center">
            <button @click="viewAssessment(record.id)" class="btn-view">View</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="flex justify-between items-center">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn-secondary">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-secondary">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Router for navigation
const router = useRouter()

// Filter Variables
const searchBy = ref('title')
const searchQuery = ref('')

// Sample Data with 10 Records
const assessments = ref([
  { id: 1, title: '2024 Staff Job Performance Review', startDate: '1 Jan 2024', endDate: '31 Dec 2024', school: 'School of Business', selfDateline: '12 Mar 2024', pppDateline: '27 May 2024', ppkDateline: '10 Oct 2024', status: 'Active' },
  { id: 2, title: '2023 Staff Job Performance Review', startDate: '1 Jan 2023', endDate: '31 Dec 2023', school: 'School of Engineering', selfDateline: '15 Mar 2023', pppDateline: '20 Jun 2023', ppkDateline: '15 Oct 2023', status: 'Completed' },
  { id: 3, title: '2022 Staff Job Performance Review', startDate: '1 Jan 2022', endDate: '31 Dec 2022', school: 'School of Education', selfDateline: '10 Mar 2022', pppDateline: '25 Jun 2022', ppkDateline: '20 Oct 2022', status: 'Completed' },
  { id: 4, title: '2021 Staff Job Performance Review', startDate: '1 Jan 2021', endDate: '31 Dec 2021', school: 'School of Health Sciences', selfDateline: '5 Mar 2021', pppDateline: '15 Jun 2021', ppkDateline: '18 Oct 2021', status: 'Archived' },
  { id: 5, title: '2020 Staff Job Performance Review', startDate: '1 Jan 2020', endDate: '31 Dec 2020', school: 'School of Information Technology', selfDateline: '2 Mar 2020', pppDateline: '22 Jun 2020', ppkDateline: '17 Oct 2020', status: 'Archived' },
  { id: 6, title: '2019 Staff Job Performance Review', startDate: '1 Jan 2019', endDate: '31 Dec 2019', school: 'School of Arts', selfDateline: '12 Mar 2019', pppDateline: '27 May 2019', ppkDateline: '10 Oct 2019', status: 'Archived' },
  { id: 7, title: '2018 Staff Job Performance Review', startDate: '1 Jan 2018', endDate: '31 Dec 2018', school: 'School of Business', selfDateline: '10 Mar 2018', pppDateline: '20 Jun 2018', ppkDateline: '12 Oct 2018', status: 'Archived' },
  { id: 8, title: '2017 Staff Job Performance Review', startDate: '1 Jan 2017', endDate: '31 Dec 2017', school: 'School of Education', selfDateline: '8 Mar 2017', pppDateline: '18 Jun 2017', ppkDateline: '15 Oct 2017', status: 'Archived' },
  { id: 9, title: '2016 Staff Job Performance Review', startDate: '1 Jan 2016', endDate: '31 Dec 2016', school: 'School of Engineering', selfDateline: '6 Mar 2016', pppDateline: '17 Jun 2016', ppkDateline: '14 Oct 2016', status: 'Archived' },
  { id: 10, title: '2015 Staff Job Performance Review', startDate: '1 Jan 2015', endDate: '31 Dec 2015', school: 'School of Arts', selfDateline: '4 Mar 2015', pppDateline: '16 Jun 2015', ppkDateline: '13 Oct 2015', status: 'Archived' }
])

// Pagination Variables
const pageSize = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(assessments.value.length / pageSize))

// Paginated Data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return assessments.value.slice(start, start + pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Search and Filter Function
const fetchData = () => {
  console.log(`Fetching data for ${searchBy.value}: ${searchQuery.value}`)
  // Add logic to filter or fetch data from an API based on search query if needed
}

// View button action to navigate to the detailed assessment page
const viewAssessment = (id) => {
  router.push(`/PPKAssessment2Staff?id=${id}`)
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}

.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
}

.btn-secondary {
  @apply bg-gray-300 text-black px-4 py-2 rounded;
}

.btn-view {
  @apply bg-green-500 text-white px-4 py-1 rounded;
}

.table-auto th, .table-auto td {
  @apply border border-gray-300 text-center;
}
</style>
