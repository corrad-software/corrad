<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Question Analysis by Module</h1>

    <!-- Filter Section -->
    <div class="flex items-center gap-4 mb-4 bg-blue-200 p-4 rounded">
      <div>
        <label>Module</label>
        <select v-model="selectedModule" class="border rounded p-2 w-full">
          <option v-for="module in moduleOptions" :key="module.code" :value="module.code">
            {{ module.title }}
          </option>
        </select>
      </div>
      <div>
        <label>Date (From)</label>
        <input type="date" v-model="fromDate" class="border rounded p-2 w-full" />
      </div>
      <div>
        <label>Date (To)</label>
        <input type="date" v-model="toDate" class="border rounded p-2 w-full" />
      </div>
      <button @click="fetchAnalysisData" class="btn-primary p-2">Search</button>
    </div>

    <!-- Report Title -->
    <div class="text-center font-semibold mb-4">
      QUESTION ANALYSIS BY MODULE: {{ selectedModuleTitle }}, date between {{ formattedFromDate }} and {{ formattedToDate }}
    </div>

    <!-- Data Table -->
    <table class="table-auto w-full border border-gray-300 mb-4">
      <thead class="bg-gray-200">
        <tr>
          <th class="p-2">No</th>
          <th class="p-2">Question Code</th>
          <th class="p-2">Question</th>
          <th class="p-2">Total Attempts</th>
          <th class="p-2">Correct Answers</th>
          <th class="p-2">Incorrect Answers</th>
          <th class="p-2">Percentage Correct</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(question, index) in paginatedData" :key="question.code" class="border-b">
          <td class="p-2 text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
          <td class="p-2 text-center">{{ question.code }}</td>
          <td class="p-2">{{ question.text }}</td>
          <td class="p-2 text-center">{{ question.attempts }}</td>
          <td class="p-2 text-center">{{ question.correct }}</td>
          <td class="p-2 text-center">{{ question.incorrect }}</td>
          <td class="p-2 text-center">{{ question.percentageCorrect }}%</td>
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
const selectedModule = ref('ITS101')
const fromDate = ref('2024-01-01')
const toDate = ref('2024-12-31')

// Module options
const moduleOptions = [
  { code: 'ITS101', title: 'Introduction to Information Technology' },
  { code: 'CMP202', title: 'Computer Programming II' },
  { code: 'MAT102', title: 'Calculus I' },
  { code: 'ENG201', title: 'Academic English' },
  { code: 'BMK301', title: 'Basic Marketing Principles' }
]

// Sample data - Analysis by module
const analysisData = ref([
  { code: 'Q1', text: 'What is an algorithm?', attempts: 120, correct: 80, incorrect: 40, percentageCorrect: 67 },
  { code: 'Q2', text: 'Define a data structure.', attempts: 100, correct: 60, incorrect: 40, percentageCorrect: 60 },
  { code: 'Q3', text: 'What is Big O notation?', attempts: 90, correct: 55, incorrect: 35, percentageCorrect: 61 },
  { code: 'Q4', text: 'Explain binary search algorithm.', attempts: 85, correct: 50, incorrect: 35, percentageCorrect: 59 },
  { code: 'Q5', text: 'Define recursion in programming.', attempts: 110, correct: 70, incorrect: 40, percentageCorrect: 64 }
])

// Pagination variables
const pageSize = 2
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(analysisData.value.length / pageSize))

// Paginated data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return analysisData.value.slice(start, start + pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Fetch data function
const fetchAnalysisData = () => {
  console.log(`Fetching data for Module: ${selectedModule.value}, From: ${fromDate.value}, To: ${toDate.value}`)
  // Here, integrate with an API if needed to fetch real data
}

const selectedModuleTitle = computed(() => moduleOptions.find(m => m.code === selectedModule.value)?.title || 'Selected Module')
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
