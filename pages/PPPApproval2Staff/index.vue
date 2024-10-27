<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">2024 Staff Job Performance Review</h1>

    <!-- Filter Section -->
    <div class="flex items-center gap-4 mb-4 bg-blue-200 p-4 rounded">
      <div>
        <label>Search By</label>
        <select v-model="searchBy" class="border rounded p-2 w-full">
          <option value="name">Name</option>
          <option value="department">Department</option>
          <option value="designation">Designation</option>
        </select>
      </div>
      <input v-model="searchQuery" placeholder="Enter search value" class="border rounded p-2 w-full" />
      <button @click="fetchData" class="btn-primary p-2">Search</button>
    </div>

    <!-- Data Table -->
    <table class="table-auto w-full border border-gray-300 mb-4">
      <thead class="bg-blue-300">
        <tr>
          <th class="p-2">No.</th>
          <th class="p-2">Photo</th>
          <th class="p-2">Staff No</th>
          <th class="p-2">Full Name</th>
          <th class="p-2">Designation</th>
          <th class="p-2">Department</th>
          <th class="p-2">Assignment ID</th>
          <th class="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(staff, index) in paginatedData" :key="staff.staffNo" class="border-b">
          <td class="p-2 text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
          <td class="p-2 text-center">
            <img :src="staff.photo" alt="Photo" class="w-12 h-12 rounded-full mx-auto" />
          </td>
          <td class="p-2 text-center">{{ staff.staffNo }}</td>
          <td class="p-2">
            {{ staff.fullName }}
            <br />
            <span class="text-sm text-gray-600">{{ staff.email }}</span>
          </td>
          <td class="p-2">{{ staff.designation }}</td>
          <td class="p-2">{{ staff.department }}</td>
          <td class="p-2 text-center">{{ staff.assignmentId }}</td>
          <td class="p-2 text-center">
            <button @click="viewDetail(staff.staffNo)" class="btn-detail">Detail</button>
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
const searchBy = ref('name')
const searchQuery = ref('')

// Sample Data - Staff Information
const staffList = ref([
  { staffNo: 5894, fullName: 'Hapini bin Awang', email: 'hapini.awang@uum.edu.my', designation: 'Pensyarah Universiti (DS51)', department: 'Pengkomputeran', assignmentId: 'A/24-8/0004', photo: '/images/hapini.jpg' },
  { staffNo: 1043, fullName: 'Mohd Tarmizi B Musa', email: 'tarmizi@uum.edu.my', designation: 'Pensyarah Universiti (DS52)', department: 'Pengkomputeran', assignmentId: 'A/24-8/0010', photo: '/images/tarmizi.jpg' },
  { staffNo: 1737, fullName: 'Md. Zawawi bin Abu Bakar', email: 'zawawi@uum.edu.my', designation: 'Pensyarah Universiti (DS54)', department: 'Psikologi Gunaan, Dasar dan Kerja Sosial', assignmentId: 'A/24-9/0013', photo: '/images/zawawi.jpg' },
  { staffNo: 4749, fullName: 'Yeoh Khar Kheng', email: 'kharkheng@uum.edu.my', designation: 'Pensyarah Universiti (DS51)', department: 'Pengurusan Perniagaan', assignmentId: 'A/24-9/0021', photo: '/images/yeoh.jpg' },
  { staffNo: 5494, fullName: 'Adzrool Idzwan bin Ismail', email: 'adzrool@uum.edu.my', designation: 'Pensyarah Universiti (DS53)', department: 'Pengurusan Industri Kreatif dan Seni Persembahan', assignmentId: 'A/24-9/0025', photo: '/images/idzwan.jpg' },
  { staffNo: 5674, fullName: 'Robiatul Adawiah binti Edrus', email: 'robiatul@uum.edu.my', designation: 'Tutor (Tanpa Skim)', department: 'Ekonomi, Kewangan dan Perbankan', assignmentId: 'A/24-10/0049', photo: '/images/robiatul.jpg' },
])

// Pagination Variables
const pageSize = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(staffList.value.length / pageSize))

// Paginated Data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return staffList.value.slice(start, start + pageSize)
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

// Detail button action to navigate to the detailed staff page
const viewDetail = (staffNo) => {
  router.push(`/PPPApproval2StaffDetail?staffNo=${staffNo}`)
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

.btn-detail {
  @apply bg-green-500 text-white px-4 py-1 rounded;
}

.table-auto th, .table-auto td {
  @apply border border-gray-300 text-center;
}

img {
  object-fit: cover;
}
</style>
