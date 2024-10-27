<template>
  <div class="flex p-4">
    <!-- Left Section: Category List -->
    <div class="w-1/2 mr-4">
      <!-- Search Section -->
      <div class="flex items-center mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search keyword"
          class="border p-2 w-full mr-2"
        />
        <rs-button variant="primary" @click="performSearch">SEARCH</rs-button>
      </div>

      <!-- Category Table -->
      <rs-card>
        <table class="table-auto w-full border-collapse border">
          <thead>
            <tr class="bg-blue-100">
              <th class="p-2 border">No</th>
              <th class="p-2 border">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(category, index) in filteredCategories"
              :key="category.code"
              @click="selectCategory(category)"
              :class="{ 'bg-blue-200': selectedCategory.code === category.code }"
              class="cursor-pointer"
            >
              <td class="p-2 border text-center">{{ index + 1 }}</td>
              <td class="p-2 border">{{ category.name }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Section -->
        <div class="mt-4 text-center">
          <span>First | Next &gt;&gt; | &lt; Previous | Last</span>
          <p>Page 1 of 1</p>
        </div>
      </rs-card>
    </div>

    <!-- Right Section: Category Details Form -->
    <div class="w-1/2">
      <h4 class="mb-4">
        Below is assessment detail. Please enter/update details and click SAVE
        button to continue.
      </h4>

      <!-- Form Section -->
      <div class="mb-4">
        <label for="code" class="block font-bold">Code</label>
        <input
          id="code"
          v-model="form.code"
          type="text"
          placeholder="Category Code"
          class="border p-2 w-full"
          readonly
        />
      </div>

      <div class="mb-4">
        <label for="category" class="block font-bold">Category</label>
        <input
          id="category"
          v-model="form.name"
          type="text"
          placeholder="Category Name"
          class="border p-2 w-full"
        />
      </div>

      <!-- Action Buttons -->
      <rs-button variant="secondary" @click="goBack">BACK</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Dummy data for category list
const categories = ref([
  { code: 1, name: 'Core' },
  { code: 2, name: 'Generic' },
  { code: 3, name: 'Leadership' },
  { code: 4, name: 'Functional' }
]);

// Form data for selected category
const form = ref({
  code: '',
  name: ''
});

// State for search query
const searchQuery = ref('');

// State for selected category
const selectedCategory = ref({});

// Computed property to filter categories based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  return categories.value.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Function to select category and populate the form
const selectCategory = (category) => {
  selectedCategory.value = category;
  form.value = { ...category };
};

// Dummy search function (you can replace with actual API call)
const performSearch = () => {
  console.log('Search query:', searchQuery.value);
};

// Dummy go back function
const goBack = () => {
  console.log('Back button clicked');
};
</script>

<style scoped>
/* Table styles */
table {
  width: 100%;
}

th, td {
  text-align: left;
  padding: 8px;
}

tr.cursor-pointer:hover {
  background-color: #f0f8ff;
}

/* Form section styles */
input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
}

label {
  font-weight: bold;
  margin-bottom: 4px;
}

button {
  margin-top: 16px;
}
</style>
