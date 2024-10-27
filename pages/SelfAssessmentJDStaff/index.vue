<template>
  <div class="container mx-auto p-4">
    <!-- Header with Search Filters -->
    <div class="flex flex-wrap items-center gap-4 bg-blue-200 p-4 rounded-md mb-4">
      <div class="flex gap-2 items-center">
        <span>Search By</span>
        <select v-model="searchBy" class="border border-gray-300 rounded-md p-1">
          <option value="name">Name</option>
          <option value="department">Department</option>
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
      <h2 class="text-xl font-semibold mb-4">2024 Staff Job Performance Review</h2>
      <table class="w-full border-collapse border border-gray-300">
        <!-- Table Headers -->
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">No.</th>
            <th class="border border-gray-300 p-2">Photo</th>
            <th class="border border-gray-300 p-2">Staff No</th>
            <th class="border border-gray-300 p-2">Full Name</th>
            <th class="border border-gray-300 p-2">Designation</th>
            <th class="border border-gray-300 p-2">Department</th>
            <th class="border border-gray-300 p-2">Assignment ID</th>
            <th class="border border-gray-300 p-2">Status</th>
            <th class="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>

        <!-- Table Data Rows -->
        <tbody>
          <tr v-for="(record, index) in paginatedData" :key="index" class="text-center">
            <td class="border border-gray-300 p-2">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
            <td class="border border-gray-300 p-2">
              <img :src="record.photo" alt="Photo" class="w-10 h-10 rounded-full mx-auto" />
            </td>
            <td class="border border-gray-300 p-2">{{ record.staffNo }}</td>
            <td class="border border-gray-300 p-2">
              <div>{{ record.fullName }}</div>
              <div class="text-sm text-purple-700">{{ record.email }}</div>
            </td>
            <td class="border border-gray-300 p-2">{{ record.designation }}</td>
            <td class="border border-gray-300 p-2">{{ record.department }}</td>
            <td class="border border-gray-300 p-2">{{ record.assignmentId }}</td>
            <td class="border border-gray-300 p-2">{{ record.status }}</td>
            <td class="border border-gray-300 p-2">
              <button
                @click="viewDetails(record.staffNo)"
                class="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                Detail
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
const searchBy = ref("name");
const searchCondition = ref("and");
const searchQuery = ref("");

// Sample data with 10 records for staff self-assessment JD
const tableData = ref([
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "2771",
    fullName: "Suhaila Binti Abdul Hanan",
    email: "suhai@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Pengurusan Teknologi dan Logistik",
    assignmentId: "A/24-9/0023",
    status: "PPP Rejected",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "1879",
    fullName: "Hasimah binti Sapiri",
    email: "hasimah@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Sains Kuantitatif",
    assignmentId: "A/24-9/0029",
    status: "PPK Rejected",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "6011",
    fullName: "Nursyazwani Binti Mohamad Noor",
    email: "nursyazwanim@uum.edu.my",
    designation: "Tutor (Tanpa Skim)",
    department: "Sains Kuantitatif",
    assignmentId: "A/24-9/0030",
    status: "Approved",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "923",
    fullName: "Fauziah Bt Baharom",
    email: "fauziah@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Pengkomputeran",
    assignmentId: "A/24-9/0031",
    status: "Approved",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "2125",
    fullName: "Norhafezah Binti Yusof",
    email: "norhafezah@uum.edu.my",
    designation: "Pensyarah Universiti (VK7)",
    department: "Awang Had Salleh Graduate School of Arts and Sciences",
    assignmentId: "A/24-9/0032",
    status: "Approved",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "1755",
    fullName: "Masanita binti Mat Noh",
    email: "masanita@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Pusat Asasi Pengurusan",
    assignmentId: "A/24-9/0038",
    status: "Approved",
  },
  // Repeat similar records for demonstration
  ...Array.from({ length: 4 }, (_, i) => ({
    photo: "https://via.placeholder.com/50",
    staffNo: `${2800 + i}`,
    fullName: `Sample Staff ${i + 7}`,
    email: `sample${i + 7}@uum.edu.my`,
    designation: `Pensyarah Universiti (DS${50 + i % 5})`,
    department: `Sample Department ${i + 1}`,
    assignmentId: `A/24-9/00${40 + i}`,
    status: i % 2 === 0 ? "PPP Rejected" : "Approved",
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
const viewDetails = (staffNo) => {
  router.push(`/SelfAssessmentJDStaffDetail?staffNo=${staffNo}`);
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
