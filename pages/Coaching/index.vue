<template>
  <div>
    <!-- Search Bar and Filters Section -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <!-- Search By Dropdown -->
        <FormKit type="select" v-model="searchBy" :options="searchByOptions" class="w-40" />

        <!-- Search Input -->
        <FormKit type="text" v-model="searchQuery" placeholder="Search..." class="w-60" />

        <!-- Filter Logic Dropdown -->
        <FormKit type="select" v-model="filterLogic" :options="filterLogicOptions" class="w-20" />

        <!-- Department Filter Dropdown -->
        <FormKit type="select" v-model="department" :options="departmentOptions" class="w-40" />

        <!-- Search Button -->
        <rs-button variant="primary" @click="performSearch">Search</rs-button>
      </div>

      <!-- Stats Section -->
      <div class="text-right">
        <span>Total Staff: <strong>{{ totalStaff }}</strong></span>&nbsp;&nbsp;
        <span>Total Supervisor: <strong>{{ totalSupervisor }}</strong></span>&nbsp;&nbsp;
        <span>Total PPP: <strong>{{ totalPPP }}</strong></span>&nbsp;&nbsp;
        <span>Total PPK: <strong>{{ totalPPK }}</strong></span>
      </div>
    </div>

    <!-- Staff List Table Section -->
    <rs-card>
      <rs-table
        :data="staffData"
        :options="{ variant: 'default', striped: true, borderless: true }"
        :options-advanced="{ sortable: true, filterable: false }"
        advanced
      >
        <!-- Table Headers -->
        <template v-slot:header>
          <tr>
            <th>No.</th>
            <th>Photo</th>
            <th>Staff No</th>
            <th>Full Name</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Subordinate</th>
          </tr>
        </template>

        <!-- Table Data Rows -->
        <template v-for="(staff, index) in staffData" :key="staff.staffNo" v-slot:default="data">
          <tr>
            <td>{{ index + 1 }}</td>
            <td><img :src="staff.photoUrl" alt="Photo" class="h-10 w-10 rounded-full" /></td>
            <td>{{ staff.staffNo }}</td>
            <td>{{ staff.fullName }}<br /><a :href="`mailto:${staff.email}`">{{ staff.email }}</a></td>
            <td>{{ staff.designation }}</td>
            <td>{{ staff.department }}</td>
            <td>{{ staff.subordinateCount }}</td>
          </tr>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Search and filter state variables
const searchBy = ref("name");
const searchQuery = ref("");
const filterLogic = ref("AND");
const department = ref("");

// Options for dropdowns
const searchByOptions = ref([
  { label: "Name", value: "name" },
  { label: "Staff No", value: "staffNo" },
]);

const filterLogicOptions = ref([
  { label: "AND", value: "AND" },
  { label: "OR", value: "OR" },
]);

const departmentOptions = ref([
  { label: "All Departments", value: "" },
  { label: "Sains Kuantitatif", value: "Sains Kuantitatif" },
  { label: "Pengkomputeran", value: "Pengkomputeran" },
  { label: "Perakaunan", value: "Perakaunan" },
  // Add more department options as needed
]);

// Dummy stats data
const totalStaff = ref(3015);
const totalSupervisor = ref(1638);
const totalPPP = ref(1638);
const totalPPK = ref(1457);

// Dummy staff data for the table
const staffData = ref([
  {
    staffNo: "5525",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Mohd Aamir Adeeb bin Abdul Rahim",
    email: "aamir@uum.edu.my",
    designation: "Pensyarah Universiti (DS51)",
    department: "Sains Kuantitatif",
    subordinateCount: 0,
  },
  {
    staffNo: "1043",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Mohd Tarmizi B Musa",
    email: "tarmizi@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Pengkomputeran",
    subordinateCount: 1,
  },
  // Add more dummy data as needed
]);

// Function to perform search
const performSearch = () => {
  console.log("Searching for:", searchQuery.value, "in", searchBy.value, "with logic", filterLogic.value, "in department", department.value);
  // Implement the search/filter logic
};
</script>

<style scoped>
/* Adjust table cell styles */
table th, table td {
  text-align: left;
  padding: 8px;
}

table th {
  background-color: #f4f4f4;
}

table td img {
  display: block;
  margin: 0 auto;
}
</style>
