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

    <!-- Table Listing Staff Records -->
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
              <div>{{ record.name }}</div>
              <div class="text-sm text-purple-700">{{ record.email }}</div>
            </td>
            <td class="border border-gray-300 p-2">{{ record.designation }}</td>
            <td class="border border-gray-300 p-2">{{ record.department }}</td>
            <td class="border border-gray-300 p-2">{{ record.assignmentId }}</td>
            <td class="border border-gray-300 p-2">
              <button
                @click="viewDetails(record)"
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
definePageMeta({
  title: "Staff Assessment Listing",
});

// State for search filters
const searchBy = ref("name");
const searchCondition = ref("and");
const searchQuery = ref("");

// Sample data with 15 records for staff members
const tableData = ref([
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "1972",
    name: "Jafni Azhan Bin Ibrahim",
    email: "jafni@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Pengurusan Teknologi dan Logistik",
    assignmentId: "A/24-9/0016",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "1043",
    name: "Mohd Tarmizi B Musa",
    email: "tarmizi@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Pengkomputeran",
    assignmentId: "A/24-8/0010",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "1737",
    name: "Md. Zawawi bin Abu Bakar",
    email: "zawawi@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Psikologi Gunaan, Dasar dan Kerja Sosial",
    assignmentId: "A/24-9/0013",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "4749",
    name: "Yeoh Khar Kheng",
    email: "kharkheng@uum.edu.my",
    designation: "Pensyarah Universiti (DS51)",
    department: "Pengurusan Perniagaan",
    assignmentId: "A/24-9/0021",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "5494",
    name: "Adzrool Idzwan bin Ismail",
    email: "adzrool@uum.edu.my",
    designation: "Pensyarah Universiti (DS53)",
    department: "Pengurusan Industri Kreatif dan Seni Persembahan",
    assignmentId: "A/24-9/0025",
  },
  {
    photo: "https://via.placeholder.com/50",
    staffNo: "5674",
    name: "Robiaatul Adawiah binti Edrus",
    email: "robiaatul@uum.edu.my",
    designation: "Tutor (Tanpa Skim)",
    department: "Ekonomi, Kewangan dan Perbankan",
    assignmentId: "A/24-10/0049",
  },
  // Repeat similar records to create a total of 15 records
  ...Array.from({ length: 9 }, (_, i) => ({
    photo: "https://via.placeholder.com/50",
    staffNo: `${1000 + i + 1}`,
    name: `Sample Staff ${i + 7}`,
    email: `staff${i + 7}@uum.edu.my`,
    designation: `Pensyarah Universiti (DS${50 + i % 5})`,
    department: `Sample Department ${i + 1}`,
    assignmentId: `A/24-8/00${20 + i}`,
  }))
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

// Navigate to detail page for a specific record
const viewDetails = (record) => {
  navigateTo(`/PPKAssessmentStaffDetail?staffNo=${record.staffNo}`);
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
