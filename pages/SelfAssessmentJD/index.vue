<template>
  <div class="container mx-auto p-4">
    <!-- Header with Search Filters -->
    <div class="flex flex-wrap items-center gap-4 bg-blue-200 p-4 rounded-md mb-4">
      <div class="flex gap-2 items-center">
        <span>Search By</span>
        <select v-model="searchBy" class="border border-gray-300 rounded-md p-1">
          <option value="title">Title</option>
          <option value="school">School</option>
        </select>
      </div>

      <select v-model="searchCondition" class="border border-gray-300 rounded-md p-1">
        <option value="and">AND</option>
        <option value="or">OR</option>
      </select>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Enter search term"
        class="border border-gray-300 rounded-md p-2 flex-1"
      />

      <rs-button variant="primary" class="ml-2" @click="filterRecords">
        <Icon name="ic:baseline-search" /> Search
      </rs-button>
    </div>

    <!-- Table Listing Self Assessments -->
    <rs-card class="mt-4 py-2">
      <h2 class="text-xl font-semibold mb-4">Self Assessment JD</h2>
      <table class="w-full border-collapse border border-gray-300">
        <!-- Table Headers -->
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">Title</th>
            <th class="border border-gray-300 p-2">Start Date</th>
            <th class="border border-gray-300 p-2">End Date</th>
            <th class="border border-gray-300 p-2">School</th>
            <th class="border border-gray-300 p-2">Self Dateline</th>
            <th class="border border-gray-300 p-2">PPP Dateline</th>
            <th class="border border-gray-300 p-2">PPK Dateline</th>
            <th class="border border-gray-300 p-2">Status</th>
            <th class="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>

        <!-- Table Data Rows -->
        <tbody>
          <tr v-for="(record, index) in paginatedData" :key="index" class="text-center">
            <td class="border border-gray-300 p-2">{{ record.title }}</td>
            <td class="border border-gray-300 p-2">{{ record.startDate }}</td>
            <td class="border border-gray-300 p-2">{{ record.endDate }}</td>
            <td class="border border-gray-300 p-2">{{ record.school }}</td>
            <td class="border border-gray-300 p-2">{{ record.selfDateline }}</td>
            <td class="border border-gray-300 p-2">{{ record.pppDateline }}</td>
            <td class="border border-gray-300 p-2">{{ record.ppkDateline }}</td>
            <td class="border border-gray-300 p-2">
              <span :class="record.status === 'Active' ? 'text-green-600 font-bold' : 'text-red-600'">
                {{ record.status }}
              </span>
            </td>
            <td class="border border-gray-300 p-2">
              <button
                @click="viewDetails(record)"
                class="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No data message -->
      <div v-if="filteredData.length === 0" class="text-center text-gray-500 mt-4">
        No records found.
      </div>
    </rs-card>

    <!-- Pagination -->
    <div class="flex justify-center mt-4">
      <button
        class="px-2 py-1 mx-1 border rounded"
        v-for="page in totalPages"
        :key="page"
        :class="{ 'bg-blue-500 text-white': page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

// State for search filters
const searchBy = ref("title");
const searchCondition = ref("and");
const searchQuery = ref("");

// Sample data with 10 records for self-assessment JD
const tableData = ref([
  {
    title: "2024 Staff Job Performance Review",
    startDate: "1 Jan 2024",
    endDate: "31 Dec 2024",
    school: "2024",
    selfDateline: "12 Mar 2024",
    pppDateline: "27 May 2024",
    ppkDateline: "10 Oct 2024",
    status: "Active",
  },
  // Add additional records as needed for testing
  ...Array.from({ length: 9 }, (_, i) => ({
    title: `Self Assessment JD - ${i + 1}`,
    startDate: "1 Jan 2024",
    endDate: "31 Dec 2024",
    school: `School ${i + 1}`,
    selfDateline: "12 Mar 2024",
    pppDateline: "27 May 2024",
    ppkDateline: "10 Oct 2024",
    status: i % 2 === 0 ? "Active" : "Inactive",
  })),
]);

// Filtered data based on search
const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value;
  return tableData.value.filter((record) =>
    record[searchBy.value].toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 5;

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));

const changePage = (page) => {
  currentPage.value = page;
};

// Navigate to Self Assessment JD detail page
const viewDetails = (record) => {
  router.push('/SelfAssessmentJDStaff');
};

// Filter records on search
const filterRecords = () => {
  currentPage.value = 1;
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.bg-blue-200 {
  background-color: #b3c7ff;
}
</style>
