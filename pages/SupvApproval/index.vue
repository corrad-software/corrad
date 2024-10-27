<template>
  <div class="p-6">
    <!-- Search Bar Section -->
    <div class="flex items-center space-x-4 mb-4">
      <div class="flex-1">
        <label class="text-sm font-bold mb-1 block">Search By</label>
        <select v-model="searchBy" class="border rounded-md w-full">
          <option value="name">Staff Name</option>
          <option value="jobSummary">Job Summary</option>
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
        <label class="text-sm font-bold mb-1 block">Job Summary</label>
        <input v-model="jobSummary" type="text" placeholder="Enter Job Summary" class="border rounded-md w-full" />
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
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Session</th>
            <th class="border px-4 py-2">Staff No</th>
            <th class="border px-4 py-2">Name</th>
            <th class="border px-4 py-2">Designation / Department</th>
            <th class="border px-4 py-2">Job Summary</th>
            <th class="border px-4 py-2">Date</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in filteredData" :key="i" class="text-center">
            <td class="border px-4 py-2">{{ i + 1 }}</td>
            <td class="border px-4 py-2">{{ item.session }}</td>
            <td class="border px-4 py-2">{{ item.staffNo }}</td>
            <td class="border px-4 py-2">{{ item.name }}</td>
            <td class="border px-4 py-2">{{ item.designation }}<br />{{ item.department }}</td>
            <td class="border px-4 py-2">{{ item.jobSummary }}</td>
            <td class="border px-4 py-2">{{ item.date }}</td>
            <td class="border px-4 py-2">{{ item.status }}</td>
            <td class="border px-4 py-2">
              <rs-button variant="primary" @click="viewDetails(item.staffNo)">View</rs-button>
            </td>
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
import { useRouter } from 'vue-router'; // Import useRouter for navigation

// Mock Data (this should be fetched from an API)
const data = ref([
  {
    session: '2024 Staff Job Performance Review',
    staffNo: '5919',
    name: 'Nur Adeelah binti Che Ahmad Tantowi',
    designation: 'Pensyarah Universiti (DS51)',
    department: 'Ekonomi, Kewangan dan Perbankan',
    jobSummary: 'tujuan jawatan',
    date: '26 Sep 2024 10:47:41 AM',
    status: 'Pending Approval',
  },
  {
    session: '2024 Staff Job Performance Review',
    staffNo: '1107',
    name: 'Siti Zabeedah Bt Hj Saidin',
    designation: 'Pensyarah Universiti (DS54)',
    department: 'Perakaunan Tunku Intan Safinaz',
    jobSummary: 'tujuan jawatan',
    date: '24 Sep 2024 4:41:26 PM',
    status: 'Pending Approval',
  },
  {
    session: '2024 Staff Job Performance Review',
    staffNo: '1771',
    name: 'Darwina bt. Hj. Ahmad Arshad',
    designation: 'Pensyarah Universiti (DS54)',
    department: 'Pengurusan Perniagaan',
    jobSummary: 'tujuan perjawatan',
    date: '24 Sep 2024 11:59:49 AM',
    status: 'Pending Approval',
  },
]);

// Search Filters
const searchBy = ref('name');
const condition = ref('AND');
const jobSummary = ref('');

// Pagination Data
const itemsPerPage = ref(5);
const currentPage = ref(1);

// Router instance for navigation
const router = useRouter();

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

  // Simple filtering logic for "name" or "jobSummary"
  if (jobSummary.value) {
    filtered = filtered.filter(item =>
      item[searchBy.value].toLowerCase().includes(jobSummary.value.toLowerCase())
    );
  }

  // Pagination logic
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  return filtered.slice(startIndex, startIndex + itemsPerPage.value);
});

// Search Action
const search = () => {
  // Here you would trigger the search logic, for simplicity it's already reactive
  console.log('Search initiated');
};

// Navigate to /SupvApprovalDetail with the staff number
const viewDetails = (staffNo) => {
  router.push(`/SupvApprovalDetail?staffNo=${staffNo}`);
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
