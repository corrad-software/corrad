<template>
  <div class="p-6">
    <!-- Search Bar Section -->
    <div class="flex items-center space-x-4 mb-4">
      <div class="flex-1">
        <label class="text-sm font-bold mb-1 block">Search By</label>
        <select v-model="searchBy" class="border rounded-md w-full">
          <option value="title">Title</option>
          <option value="school">School</option>
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
        <label class="text-sm font-bold mb-1 block">School</label>
        <input v-model="school" type="text" placeholder="Enter School" class="border rounded-md w-full" />
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
            <th class="border px-4 py-2">Title</th>
            <th class="border px-4 py-2">Start Date</th>
            <th class="border px-4 py-2">End Date</th>
            <th class="border px-4 py-2">School</th>
            <th class="border px-4 py-2">Self Dateline</th>
            <th class="border px-4 py-2">PPP Dateline</th>
            <th class="border px-4 py-2">PPK Dateline</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2">Action</th> <!-- Added Action Column -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in filteredData" :key="i" class="text-center">
            <td class="border px-4 py-2">{{ item.title }}</td>
            <td class="border px-4 py-2">{{ item.startDate }}</td>
            <td class="border px-4 py-2">{{ item.endDate }}</td>
            <td class="border px-4 py-2">{{ item.school }}</td>
            <td class="border px-4 py-2">{{ item.selfDateline }}</td>
            <td class="border px-4 py-2">{{ item.pppDateline }}</td>
            <td class="border px-4 py-2">{{ item.ppkDateline }}</td>
            <td class="border px-4 py-2">{{ item.status }}</td>
            <td class="border px-4 py-2">
              <rs-button variant="primary" @click="goToDetail(item)">Detail</rs-button>
            </td> <!-- Added Button -->
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
import { useRouter } from 'vue-router';  // Importing useRouter for navigation

// Mock Data (this should be fetched from an API)
const data = ref([
  {
    title: '2024 Staff Job Performance Review',
    startDate: '1 Jan 2024',
    endDate: '31 Dec 2024',
    school: '2024',
    selfDateline: '12 Mar 2024',
    pppDateline: '27 May 2024',
    ppkDateline: '10 Oct 2024',
    status: 'Active',
  },
]);

// Search Filters
const searchBy = ref('title');
const condition = ref('AND');
const school = ref('');
const searchText = ref('');

// Pagination Data
const itemsPerPage = ref(5);
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

  // Simple filtering logic for "title" or "school"
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

// Function to navigate to the detail page
const goToDetail = (item) => {
  router.push({ path: '/InitialAssessmentStaff', query: { title: item.title } });  // Passing title as query param
};

// Search Action
const search = () => {
  // Here you would trigger the search logic, for simplicity it's already reactive
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
</style>
