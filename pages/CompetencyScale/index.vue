<template>
  <div class="p-4">
    <!-- Category Sections -->
    <div v-for="(category, index) in categories" :key="index" class="mb-6">
      <!-- Category Title -->
      <h2 class="text-lg font-bold mb-2">{{ category.title }}</h2>
      
      <!-- Category Table -->
      <rs-card>
        <table class="table-auto w-full border-collapse border">
          <thead>
            <tr class="bg-blue-100">
              <th class="p-2 border">No.</th>
              <th class="p-2 border">Likert</th>
              <th class="p-2 border">Description</th>
              <th class="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in category.data" :key="i" class="bg-white">
              <td class="p-2 border text-center">{{ i + 1 }}</td>
              <td class="p-2 border text-center">
                <input type="number" v-model="item.likert" class="border rounded-md w-full text-center">
              </td>
              <td class="p-2 border">
                <input type="text" v-model="item.description" class="border rounded-md w-full">
              </td>
              <td class="p-2 border text-center">
                <div class="flex justify-center space-x-2">
                  <rs-button size="sm" variant="primary" @click="confirmUpdate(item)">OK</rs-button>
                  <rs-button size="sm" variant="success" @click="addItem(category)">+</rs-button>
                  <rs-button size="sm" variant="warning" @click="editItem(item)">✎</rs-button>
                  <rs-button size="sm" variant="danger" @click="deleteItem(category, i)">🗑️</rs-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </rs-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Sample categories data
const categories = ref([
  {
    title: 'Core',
    data: [
      { likert: 1, description: 'Basic' },
      { likert: 2, description: 'Novice' },
      { likert: 3, description: 'Novice' },
      { likert: 4, description: 'Qualified' },
      { likert: 5, description: 'Qualified' },
      { likert: 6, description: 'Qualified' },
      { likert: 7, description: 'Proficient' },
      { likert: 8, description: 'Proficient' },
      { likert: 9, description: 'Expert' },
      { likert: 10, description: 'Expert' },
    ],
  },
  {
    title: 'Generic',
    data: [
      { likert: 1, description: 'Novice' },
      { likert: 2, description: 'Novice' },
      { likert: 3, description: 'Novice' },
      { likert: 4, description: 'Qualified' },
      { likert: 5, description: 'Qualified' },
      { likert: 6, description: 'Qualified' },
      { likert: 7, description: 'Proficient' },
      { likert: 8, description: 'Proficient' },
      { likert: 9, description: 'Expert' },
      { likert: 10, description: 'Expert' },
    ],
  },
  {
    title: 'Leadership',
    data: [
      { likert: 1, description: 'Basic' },
      { likert: 2, description: 'Novice' },
      { likert: 3, description: 'Novice' },
      { likert: 4, description: 'Qualified' },
    ],
  },
  {
    title: 'Functional',
    data: [
      { likert: 1, description: 'Basic' },
      { likert: 2, description: 'Novice' },
      { likert: 3, description: 'Novice' },
      { likert: 4, description: 'Qualified' },
    ],
  },
]);

// Methods
const confirmUpdate = (item) => {
  console.log('Confirm update:', item);
};

const addItem = (category) => {
  const newItem = { likert: '', description: '' };
  category.data.push(newItem);
  console.log('New item added:', category.title);
};

const editItem = (item) => {
  console.log('Edit item:', item);
};

const deleteItem = (category, index) => {
  category.data.splice(index, 1);
  console.log('Item deleted from:', category.title);
};
</script>

<style scoped>
table {
  width: 100%;
}

th, td {
  text-align: left;
  padding: 8px;
}

button {
  padding: 0.5rem;
  margin: 0.5rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.flex {
  display: flex;
  align-items: center;
}
</style>
