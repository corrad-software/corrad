<template>
  <div class="p-4">
    <!-- Search Section -->
    <div class="flex mb-4">
      <div class="flex-grow mr-2">
        <label for="search" class="block text-sm font-medium text-gray-700"
          >Search By</label
        >
        <select
          id="search"
          v-model="searchBy"
          class="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
        >
          <option value="competency">Competency</option>
          <option value="category">Category</option>
        </select>
      </div>

      <div class="flex-grow mr-2">
        <label for="category" class="block text-sm font-medium text-gray-700"
          >Category</label
        >
        <select
          id="category"
          v-model="categoryFilter"
          class="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
        >
          <option value="all">All</option>
          <option value="core">Core</option>
          <option value="generic">Generic</option>
          <option value="leadership">Leadership</option>
          <option value="functional">Functional</option>
        </select>
      </div>

      <rs-button class="self-end" variant="primary" @click="performSearch">
        Search
      </rs-button>

      <rs-button class="ml-4 self-end" variant="success" @click="newCompetency">
        New Competency
      </rs-button>
    </div>

    <!-- Competency Table -->
    <rs-card>
      <table class="table-auto w-full border-collapse border">
        <thead>
          <tr class="bg-blue-100">
            <th class="p-2 border">No.</th>
            <th class="p-2 border">Core</th>
            <th class="p-2 border">Competency</th>
            <th class="p-2 border">Op. Definition</th>
            <th class="p-2 border">#Scale</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(competency, index) in competencies"
            :key="competency.id"
            class="bg-yellow-50"
          >
            <td class="p-2 border text-center">{{ index + 1 }}</td>
            <td class="p-2 border">{{ competency.core }}</td>
            <td class="p-2 border">{{ competency.name }}</td>
            <td class="p-2 border">{{ competency.definition }}</td>
            <td class="p-2 border text-center">
              {{ competency.scale.length }}
            </td>
            <td class="p-2 border text-center">
              <rs-button
                size="sm"
                variant="secondary"
                @click="editCompetency(competency)"
              >
                Edit
              </rs-button>
            </td>
          </tr>

          <!-- Rubric Rows -->
          <tr v-for="rubric in competencies.scale" :key="rubric.level">
            <td colspan="2" class="p-2 border bg-gray-100">Rubric:</td>
            <td colspan="4" class="p-2 border">
              <div class="grid grid-cols-10 gap-4">
                <div
                  v-for="(description, index) in rubric.descriptions"
                  :key="index"
                  class="border p-2"
                >
                  <strong>({{ index + 1 }})</strong> {{ description }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </rs-card>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Dummy data for competencies
const competencies = ref([
  {
    id: 1,
    core: "Core",
    name: "Analytical Thinking..",
    definition:
      "Creates a sense of direction and purpose, promoting an understanding of individual contributions...",
    scale: [
      {
        level: 1,
        descriptions: [
          "Works cooperatively with others to produce innovative solutions.",
          "Understanding new knowledge to propose new product or service.",
        ],
      },
      {
        level: 2,
        descriptions: [
          "Works cooperatively with others to produce innovative solutions.",
          "Understanding new knowledge to propose new product or service.",
        ],
      },
      {
        level: 3,
        descriptions: [
          "Works cooperatively with others to produce innovative solutions.",
          "Understanding new knowledge to propose new product or service.",
        ],
      },
    ],
  },
  {
    id: 2,
    core: "Core",
    name: "Communication and Interpersonal",
    definition:
      "The ability to develop new and improved method or products or procedures, or technologies...",
    scale: [
      {
        level: 1,
        descriptions: [
          "Works cooperatively with others to produce innovative solutions.",
          "Understanding new knowledge to propose new product or service.",
        ],
      },
      {
        level: 2,
        descriptions: [
          "Identify a new product or service.",
          "Identify a new method or approach.",
        ],
      },
      {
        level: 3,
        descriptions: [
          "Apply a new product or service.",
          "Apply better, faster, or less expensive ways to do things.",
        ],
      },
    ],
  },
]);

// Search filters
const searchBy = ref("competency");
const categoryFilter = ref("all");

// Methods to perform search and manage competencies
const performSearch = () => {
  console.log(
    "Search Competencies by:",
    searchBy.value,
    "Category:",
    categoryFilter.value
  );
};

const newCompetency = () => {
  console.log("Creating a new competency");
};

const editCompetency = (competency) => {
  console.log("Editing competency:", competency);
};
</script>

<style scoped>
table {
  width: 100%;
}

th,
td {
  text-align: left;
  padding: 8px;
}

.grid {
  display: grid;
  gap: 1rem;
}

button {
  padding: 0.5rem;
  margin: 0.5rem;
}

tr.cursor-pointer:hover {
  background-color: #f0f8ff;
}
</style>
