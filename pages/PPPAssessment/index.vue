<template>
  <div>
    <!-- Header with search filters -->
    <div class="flex flex-wrap items-center gap-4 bg-blue-200 p-4 rounded-md">
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

    <!-- Table listing PPP assessments -->
    <rs-card class="mt-4 py-2">
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
              <span
                :class="record.status === 'Active' ? 'text-green-600' : 'text-red-600'"
              >
                {{ record.status }}
              </span>
            </td>
            <td class="border border-gray-300 p-2">
              <button
                @click="viewAssessment"
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
definePageMeta({
  title: "PPP Assessment Listing",
});

// State for search filters
const searchBy = ref("title");
const searchCondition = ref("and");
const searchQuery = ref("");

// Sample data
const tableData = ref([
  {
    title: "2024 Staff Job Performance Review",
    startDate: "1 Jan 2024",
    endDate: "31 Dec 2024",
    school: "School A",
    selfDateline: "12 Mar 2024",
    pppDateline: "27 May 2024",
    ppkDateline: "10 Oct 2024",
    status: "Active",
  },
  {
    title: "2023 Annual Review",
    startDate: "1 Feb 2023",
    endDate: "30 Nov 2023",
    school: "School B",
    selfDateline: "10 Mar 2023",
    pppDateline: "25 May 2023",
    ppkDateline: "15 Sep 2023",
    status: "Completed",
  },
  {
    title: "2025 Mid-Year Assessment",
    startDate: "1 Mar 2025",
    endDate: "31 Aug 2025",
    school: "School C",
    selfDateline: "5 Apr 2025",
    pppDateline: "20 Jun 2025",
    ppkDateline: "5 Aug 2025",
    status: "Pending",
  },
  {
    title: "2026 Staff Evaluation",
    startDate: "1 Jan 2026",
    endDate: "31 Dec 2026",
    school: "School D",
    selfDateline: "10 Feb 2026",
    pppDateline: "30 Apr 2026",
    ppkDateline: "10 Oct 2026",
    status: "Active",
  },
  {
    title: "Q1 2024 Performance Review",
    startDate: "1 Jan 2024",
    endDate: "31 Mar 2024",
    school: "School E",
    selfDateline: "20 Jan 2024",
    pppDateline: "15 Feb 2024",
    ppkDateline: "25 Mar 2024",
    status: "Active",
  },
  {
    title: "Q2 2024 Performance Review",
    startDate: "1 Apr 2024",
    endDate: "30 Jun 2024",
    school: "School F",
    selfDateline: "15 Apr 2024",
    pppDateline: "20 May 2024",
    ppkDateline: "10 Jun 2024",
    status: "Active",
  },
  {
    title: "2024 Mid-Year Performance Review",
    startDate: "1 Jan 2024",
    endDate: "31 Jul 2024",
    school: "School G",
    selfDateline: "15 Feb 2024",
    pppDateline: "10 Apr 2024",
    ppkDateline: "5 Jul 2024",
    status: "Pending",
  }
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

// Functions
const filterRecords = () => {
  currentPage.value = 1;
};

const viewAssessment = () => {
  navigateTo("/PPPAssessmentStaff2");
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
