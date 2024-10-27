<template>
  <div class="flex justify-between p-4">
    <!-- Left Section: Designation List -->
    <div class="w-1/2 mr-8">
      <!-- Create New Designation Link -->
      <div class="flex items-center mb-4">
        <a href="#" class="text-blue-500 underline flex items-center">
          <Icon name="mdi:shield-account" class="mr-2" />
          Click to create new Designation
        </a>
      </div>

      <!-- Search Bar -->
      <div class="flex items-center mb-4">
        <input
          v-model="searchQuery"
          placeholder="Search keyword"
          class="border p-2 w-full mr-2"
          type="text"
        />
        <rs-button variant="primary" @click="performSearch">SEARCH</rs-button>
      </div>

      <!-- Designation Table -->
      <rs-card>
        <table class="table-auto w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 border">No</th>
              <th class="p-2 border">Code</th>
              <th class="p-2 border">Title</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(designation, index) in filteredDesignations"
              :key="designation.code"
              @click="selectDesignation(designation)"
              :class="{
                'bg-blue-100': selectedDesignation?.code === designation.code,
              }"
              class="cursor-pointer"
            >
              <td class="p-2 border text-center">{{ index + 1 }}</td>
              <td class="p-2 border">{{ designation.code }}</td>
              <td class="p-2 border">{{ designation.title }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-2 text-center">
          <span>First | &lt; Previous | Next &gt; | Last</span>
          <p>Page 1 of {{ totalPages }}</p>
        </div>
      </rs-card>
    </div>

    <!-- Right Section: Designation Form -->
    <div class="w-1/2">
      <h4 class="mb-4">
        Below is objective detail. Please enter/update details and click SAVE
        button to continue.
      </h4>

      <div class="mb-4">
        <label for="code" class="block font-bold">Code</label>
        <input
          id="code"
          v-model="form.code"
          class="border p-2 w-full"
          type="text"
          placeholder="Designation Code"
          readonly
        />
      </div>

      <div class="mb-4">
        <label for="title" class="block font-bold">Title</label>
        <input
          id="title"
          v-model="form.title"
          class="border p-2 w-full"
          type="text"
          placeholder="Designation Title"
        />
      </div>

      <div class="mb-4">
        <label for="jobGrade" class="block font-bold">Job Grade</label>
        <select
          id="jobGrade"
          v-model="form.jobGrade"
          class="border p-2 w-full"
        >
          <option value="" disabled>Select Job Grade</option>
          <option v-for="grade in jobGrades" :key="grade" :value="grade">
            {{ grade }}
          </option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <rs-button variant="primary" @click="updateDesignation">UPDATE</rs-button>
        <rs-button variant="danger" @click="deleteDesignation">DELETE</rs-button>
        <rs-button variant="secondary" @click="goBack">BACK</rs-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Dummy data for designations
const designations = ref([
  { code: "B29", title: "Ahli Muzik (B29)" },
  { code: "J41", title: "Arkitek (J41)" },
  { code: "J48", title: "Arkitek (J48)" },
  { code: "J52", title: "Arkitek Landskap (Fleksi) J52" },
  { code: "J41", title: "Arkitek Landskap (J41)" },
  { code: "DS45", title: "Felo Universiti (Kategori DS45)" },
  { code: "DS53", title: "Felo Universiti (Kategori DS53)" },
  { code: "DG41", title: "Guru Bahasa (DG41)" },
  { code: "DG44", title: "Guru Bahasa (DG44)" },
  { code: "DG48", title: "Guru Bahasa (DG48)" },
]);

// Job grade options
const jobGrades = ref(["B29", "J41", "J48", "J52", "DS45", "DS53", "DG41", "DG44", "DG48"]);

// Form data
const form = ref({
  code: "",
  title: "",
  jobGrade: "",
});

// Pagination
const totalPages = ref(26);

// Search and selected designation
const searchQuery = ref("");
const selectedDesignation = ref(null);

// Computed property for filtered designations
const filteredDesignations = computed(() => {
  if (searchQuery.value === "") return designations.value;
  return designations.value.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Select designation from the table
const selectDesignation = (designation) => {
  selectedDesignation.value = designation;
  form.value = { ...designation, jobGrade: designation.code };
};

// Dummy search function
const performSearch = () => {
  console.log("Search keyword:", searchQuery.value);
};

// Dummy update function
const updateDesignation = () => {
  console.log("Updated designation:", form.value);
};

// Dummy delete function
const deleteDesignation = () => {
  console.log("Deleted designation:", form.value);
};

// Dummy back function
const goBack = () => {
  console.log("Back button clicked");
};
</script>

<style scoped>
/* Simple table styling */
table {
  width: 100%;
}

th,
td {
  text-align: left;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr.cursor-pointer:hover {
  background-color: #e0f7fa;
}
</style>
