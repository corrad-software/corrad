<template>
  <div>
    <!-- Search and Filter Section -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <!-- Search By Dropdown -->
        <FormKit
          type="select"
          v-model="searchBy"
          :options="searchByOptions"
          class="w-40"
        />
        <!-- Search Input -->
        <FormKit
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="w-60"
        />
        <!-- Filter Logic Dropdown -->
        <FormKit
          type="select"
          v-model="filterLogic"
          :options="filterLogicOptions"
          class="w-20"
        />
        <!-- Department Filter Dropdown -->
        <FormKit
          type="select"
          v-model="department"
          :options="departmentOptions"
          class="w-40"
        />
        <!-- Search Button -->
        <rs-button variant="primary" @click="performSearch">Search</rs-button>
      </div>

      <!-- Statistics Section -->
      <div class="text-right">
        <span>Total Staff: <strong>{{ totalStaff }}</strong></span>&nbsp;&nbsp;
        <span>Total Supervisor: <strong>{{ totalSupervisor }}</strong></span>&nbsp;&nbsp;
        <span>Total PPP: <strong>{{ totalPPP }}</strong></span>&nbsp;&nbsp;
        <span>Total PPK: <strong>{{ totalPPK }}</strong></span>
      </div>
    </div>

    <!-- Staff List Table -->
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

        <!-- Table Rows -->
        <template v-for="(staff, index) in staffData" :key="staff.staffNo" v-slot:default="data">
          <tr>
            <td>{{ index + 1 }}</td>
            <td>
              <img :src="staff.photoUrl" alt="Photo" class="h-10 w-10 rounded-full" />
            </td>
            <td>{{ staff.staffNo }}</td>
            <td>
              {{ staff.fullName }}<br />
              <a :href="`mailto:${staff.email}`">{{ staff.email }}</a>
            </td>
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

// Search and filter state
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
  // Add more departments as needed
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
    subordinateCount: 0,
  },
  {
    staffNo: "1737",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Md. Zawawi bin Abu Bakar",
    email: "zawawi@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Psikologi Gunaan, Dasar dan Kerja Sosial",
    subordinateCount: 0,
  },
  {
    staffNo: "5832",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Annuar Aswan bin Mohd Noor",
    email: "a.aswan.mohd@uum.edu.my",
    designation: "Pensyarah Universiti (DS51)",
    department: "Pengurusan Perniagaan",
    subordinateCount: 0,
  },
  {
    staffNo: "1777",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Sazali bin Saad",
    email: "sazali@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Perakaunan Tunku Puteri Intan Safinaz",
    subordinateCount: 0,
  },
  {
    staffNo: "1972",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Jafni Azhan Bin Ibrahim",
    email: "jafni@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Pengurusan Teknologi dan Logistik",
    subordinateCount: 0,
  },
  {
    staffNo: "2336",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Mohammad Badri Bin Rozali @ Abd. Hamid",
    email: "badri@uum.edu.my",
    designation: "Pensyarah Universiti (DS45)",
    department: "Ekonomi, Kewangan dan Perbankan",
    subordinateCount: 0,
  },
  {
    staffNo: "2376",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Abd. Rahim Bin Romle",
    email: "abd.rahim@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Kerajaan",
    subordinateCount: 0,
  },
  {
    staffNo: "2696",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Muhammad Fauzi Bin Mokhtar",
    email: "mdfauzi@uum.edu.my",
    designation: "Pensyarah Universiti (DS52)",
    department: "Pengurusan Pelancongan, Hospitaliti dan Acara",
    subordinateCount: 0,
  },
  {
    staffNo: "1781",
    photoUrl: "https://via.placeholder.com/50",
    fullName: "Mohamad Khadafi bin Hj. Rofie",
    email: "khadafi@uum.edu.my",
    designation: "Pensyarah Universiti (DS54)",
    department: "Pusat Islam",
    subordinateCount: 0,
  },
]);

// Search function (placeholder for logic)
const performSearch = () => {
  console.log(
    "Searching for:",
    searchQuery.value,
    "in",
    searchBy.value,
    "with logic",
    filterLogic.value,
    "in department",
    department.value
  );
  // Implement search/filter logic here
};
</script>

<style scoped>
/* Styles for adjusting table appearance */
table th,
table td {
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
