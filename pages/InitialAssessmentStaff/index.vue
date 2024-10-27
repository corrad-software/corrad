<template>
  <div class="p-6">
    <!-- Search Bar Section -->
    <div class="flex items-center space-x-4 mb-4">
      <div class="flex-1">
        <label class="text-sm font-bold mb-1 block">Search By</label>
        <select v-model="searchBy" class="border rounded-md w-full">
          <option value="name">Name</option>
          <option value="department">Department</option>
        </select>
      </div>

      <div class="flex-1">
        <label class="text-sm font-bold mb-1 block">AND / OR</label>
        <select v-model="condition" class="border rounded-md w-full">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <div class="flex-1">
        <label class="text-sm font-bold mb-1 block">Department</label>
        <input v-model="department" type="text" placeholder="Enter Department" class="border rounded-md w-full" />
      </div>

      <div class="flex items-end">
        <rs-button variant="primary" @click="search">Search</rs-button>
      </div>
    </div>

    <!-- Table Section -->
    <rs-card>
      <table class="table-auto w-full border-collapse border">
        <thead class="bg-blue-100">
          <tr>
            <th class="border px-4 py-2">Photo</th>
            <th class="border px-4 py-2">Staff No</th>
            <th class="border px-4 py-2">Full Name</th>
            <th class="border px-4 py-2">Designation</th>
            <th class="border px-4 py-2">Department</th>
            <th class="border px-4 py-2">Assignment ID</th>
            <th class="border px-4 py-2">Action</th> <!-- Added Action Column -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in filteredData" :key="i" class="text-center">
            <td class="border px-4 py-2"><img :src="item.photo" alt="Photo" class="w-10 h-10 rounded-full mx-auto" /></td>
            <td class="border px-4 py-2">{{ item.staffNo }}</td>
            <td class="border px-4 py-2">{{ item.fullName }}</td>
            <td class="border px-4 py-2">{{ item.designation }}</td>
            <td class="border px-4 py-2">{{ item.department }}</td>
            <td class="border px-4 py-2">{{ item.assignmentId }}</td>
            <td class="border px-4 py-2">
              <rs-button variant="primary" @click="goToUpdate(item)">Update</rs-button>
            </td> <!-- Added Update Button -->
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- Pagination Section -->
    <div class="mt-4 flex justify-end">
      <rs-button v-if="currentPage > 1" @click="prevPage" variant="secondary">Previous</rs-button>
      <rs-button>{{ currentPage }}</rs-button>
      <rs-button v-if="currentPage < totalPages" @click="nextPage" variant="secondary">Next</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';  // Import useRouter for navigation

// Mock Data (should be fetched from an API)
const data = ref([
  {
    photo: 'https://via.placeholder.com/40',
    staffNo: '2409',
    fullName: 'Harryzman Bin Harun',
    designation: 'Pensyarah Universiti (DS52)',
    department: 'Teknologi Multimedia dan Komunikasi',
    assignmentId: 'A/24-9/0012',
  },
  {
    photo: 'https://via.placeholder.com/40',
    staffNo: '2336',
    fullName: 'Mohammad Badri Bin Rozali @ Abd. Hamid',
    designation: 'Pensyarah Universiti (DS45)',
    department: 'Ekonomi,Kewangan dan Perbankan',
    assignmentId: 'A/24-9/0019',
  },
  // Add more records here...
]);

// Search Filters
const searchBy = ref('name');
const condition = ref('AND');
const department = ref('');
const searchText = ref('');

// Pagination Data
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Methods for Pagination
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value));

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Filtered and Paginated Data
const filteredData = computed(() => {
  let filtered = data.value;

  // Simple filtering logic for "name" or "department"
  if (searchText.value) {
    filtered = filtered.filter(item =>
      item[searchBy.value].toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  // Pagination logic
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  return filtered.slice(startIndex, startIndex + itemsPerPage.value);
});

// Router for navigation
const router = useRouter();

// Function to navigate to the update page
const goToUpdate = (item) => {
  router.push({ path: '/InitialAssessmentStaffDetail', query: { staffNo: item.staffNo, assignmentId: item.assignmentId } });
};

// Search Action
const search = () => {
  console.log('Search initiated');
};
</script>

<style scoped>
table {
  width: 100%;
}

th, td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #ccc;
}

img {
  border-radius: 50%;
}
</style>
