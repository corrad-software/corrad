<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Student Performance by Modules</h1>

    <!-- Filter Section -->
    <div class="flex items-center gap-4 mb-4 bg-blue-200 p-4 rounded">
      <div>
        <label>Year</label>
        <select v-model="year" class="border rounded p-2 w-full">
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div>
        <label>Class Date (From)</label>
        <input type="date" v-model="fromDate" class="border rounded p-2 w-full" />
      </div>
      <div>
        <label>Class Date (To)</label>
        <input type="date" v-model="toDate" class="border rounded p-2 w-full" />
      </div>
      <button @click="fetchData" class="btn-primary p-2">Search</button>
    </div>

    <!-- Report Title -->
    <div class="text-center font-semibold mb-4">
      STUDENT PERFORMANCE BY MODULES, class date between {{ formattedFromDate }} until {{ formattedToDate }}
    </div>

    <!-- Data Table -->
    <table class="table-auto w-full border border-gray-300 mb-4">
      <thead class="bg-gray-200">
        <tr>
          <th class="p-2">No</th>
          <th class="p-2">Code</th>
          <th class="p-2">Module Title</th>
          <th class="p-2">Total Student</th>
          <th class="p-2">Excellent (100-81)%</th>
          <th class="p-2">Very Good (80-61)%</th>
          <th class="p-2">Good (60-41)%</th>
          <th class="p-2">Average (40-21)%</th>
          <th class="p-2">Bad (20-0)%</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(module, index) in paginatedData" :key="module.code" class="border-b">
          <td class="p-2 text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
          <td class="p-2 text-center">{{ module.code }}</td>
          <td class="p-2">{{ module.title }}</td>
          <td class="p-2 text-center">{{ module.totalStudents }}</td>
          <td class="p-2 text-center">{{ module.excellent }}%</td>
          <td class="p-2 text-center">{{ module.veryGood }}%</td>
          <td class="p-2 text-center">{{ module.good }}%</td>
          <td class="p-2 text-center">{{ module.average }}%</td>
          <td class="p-2 text-center">{{ module.bad }}%</td>
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

// Filters
const year = ref('2024')
const fromDate = ref('2024-10-01')
const toDate = ref('2024-10-26')
const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

// Sample Data - Local Malaysian University Courses
const modules = ref([
  { code: 'ITS101', title: 'Introduction to Information Technology', totalStudents: 120, excellent: 15, veryGood: 30, good: 45, average: 20, bad: 10 },
  { code: 'ENG201', title: 'Academic English', totalStudents: 100, excellent: 10, veryGood: 25, good: 30, average: 20, bad: 15 },
  { code: 'BMK301', title: 'Basic Marketing Principles', totalStudents: 85, excellent: 20, veryGood: 25, good: 25, average: 10, bad: 5 },
  { code: 'MAT102', title: 'Calculus I', totalStudents: 95, excellent: 25, veryGood: 20, good: 30, average: 15, bad: 5 },
  { code: 'CMP202', title: 'Computer Programming II', totalStudents: 110, excellent: 18, veryGood: 28, good: 35, average: 15, bad: 14 }
])

// Pagination Variables
const pageSize = 2
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(modules.value.length / pageSize))

// Pagination Functions
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return modules.value.slice(start, start + pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Search Function
const fetchData = () => {
  console.log(`Fetching data for Year: ${year.value}, From: ${fromDate.value}, To: ${toDate.value}`)
  // Additional fetch logic can be added here if needed.
}

const formattedFromDate = computed(() => new Date(fromDate.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
const formattedToDate = computed(() => new Date(toDate.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
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

.table-auto {
  @apply border-collapse border border-gray-300;
}

.table-auto th, .table-auto td {
  @apply border border-gray-300 text-center;
}
</style>
