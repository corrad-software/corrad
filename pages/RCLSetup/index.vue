<template>
  <div class="flex">
    <!-- Left Section: Job Grade List -->
    <div class="w-1/4 mr-4">
      <rs-card>
        <table class="table-auto w-full border-collapse border">
          <thead>
            <tr class="bg-blue-100">
              <th class="p-2 border">No</th>
              <th class="p-2 border">Job Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(grade, index) in jobGrades"
              :key="grade"
              @click="selectJobGrade(grade)"
              :class="{
                'bg-blue-100': selectedJobGrade === grade,
                'cursor-pointer': true,
              }"
            >
              <td class="p-2 border text-center">{{ index + 1 }}</td>
              <td class="p-2 border">{{ grade }}</td>
            </tr>
          </tbody>
        </table>
      </rs-card>
    </div>

    <!-- Right Section: Skill Set Table for Selected Job Grade -->
    <div class="w-3/4">
      <h3 class="mb-4">Job Grade <strong>{{ selectedJobGrade }}</strong></h3>
      <rs-card>
        <table class="table-auto w-full border-collapse border">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 border">No</th>
              <th class="p-2 border">Core</th>
              <th class="p-2 border">Skill Set</th>
              <th class="p-2 border">Level</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(skill, index) in skillSets" :key="skill.id">
              <td class="p-2 border text-center">{{ index + 1 }}</td>
              <td class="p-2 border text-center">{{ skill.category }}</td>
              <td class="p-2 border">{{ skill.name }}</td>
              <td class="p-2 border text-center">
                <select v-model="skill.level" class="border p-1">
                  <option v-for="level in levels" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
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

// Job grades data
const jobGrades = ref([
  'B19', 'B22', 'B29', 'B32', 'B41', 'B44', 'B48', 'C19', 'DG41', 'DG44', 
  'DG48', 'DG52', 'DS45', 'DS51', 'DS52', 'DS53', 'DS54', 'F41', 'F44', 'F48', 'F52'
]);

// Available skill levels
const levels = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Initial selected job grade
const selectedJobGrade = ref(jobGrades.value[0]);

// Skill sets data for the selected job grade
const skillSets = ref([
  { id: 1, category: 'Core', name: 'Analytical Thinking', level: 9 },
  { id: 2, category: 'Core', name: 'Communication and Interpersonal', level: 4 },
  { id: 3, category: 'Core', name: 'Coordinating', level: 4 },
  { id: 4, category: 'Core', name: 'Counselling Skill', level: 4 },
  { id: 5, category: 'Core', name: 'Dispute Resolution', level: 4 },
  { id: 6, category: 'Core', name: 'Employee Engagement Skill', level: 4 },
  { id: 7, category: 'Core', name: 'Entrepreneurial and Commercialization', level: 4 },
  { id: 8, category: 'Core', name: 'Event Management', level: 4 },
  { id: 9, category: 'Core', name: 'Knowledge and Best Practice', level: 4 }
]);

// Function to handle job grade selection
const selectJobGrade = (grade) => {
  selectedJobGrade.value = grade;
  // Fetch skill set based on job grade. For now, we're using static skillSets as a placeholder.
};
</script>

<style scoped>
/* Table styling */
table {
  width: 100%;
}

th, td {
  padding: 8px;
}

th {
  text-align: left;
}

tr.cursor-pointer:hover {
  background-color: #f0f8ff;
}
</style>
