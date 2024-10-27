<template>
  <div>
    <!-- Competency Weightage Section -->
    <h3>Competency Weightage</h3>
    <rs-card class="mb-4">
      <table class="table-auto w-full border-collapse border">
        <thead>
          <tr class="bg-blue-100">
            <th class="p-2 border">No.</th>
            <th class="p-2 border">Competency</th>
            <th class="p-2 border">Weightage</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(competency, index) in competencies" :key="competency.id">
            <td class="p-2 border text-center">{{ index + 1 }}</td>
            <td class="p-2 border">{{ competency.name }}</td>
            <td class="p-2 border text-center">
              <input type="number" v-model="competency.weightage" class="w-16 border" />
            </td>
            <td class="p-2 border text-center">
              <rs-button variant="primary" size="sm">OK</rs-button>
            </td>
          </tr>
          <tr>
            <td colspan="2" class="p-2 text-right font-bold">Total :</td>
            <td class="p-2 text-center font-bold">{{ totalWeightage }}</td>
            <td class="p-2 border"></td>
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- JD Scoring Rubric Section -->
    <h3>JD Scoring Rubric</h3>
    <rs-card class="mb-4">
      <table class="table-auto w-full border-collapse border">
        <thead>
          <tr class="bg-blue-100">
            <th class="p-2 border">No.</th>
            <th class="p-2 border">ID</th>
            <th class="p-2 border">From</th>
            <th class="p-2 border">To</th>
            <th class="p-2 border">Rubric/Title</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(jd, index) in jdScoring" :key="jd.id">
            <td class="p-2 border text-center">{{ index + 1 }}</td>
            <td class="p-2 border text-center">{{ jd.id }}</td>
            <td class="p-2 border">
              <input type="number" v-model="jd.from" class="w-12 border" />
            </td>
            <td class="p-2 border">
              <input type="number" v-model="jd.to" class="w-12 border" />
            </td>
            <td class="p-2 border">
              <input type="text" v-model="jd.rubric" class="w-full border" />
            </td>
            <td class="p-2 border text-center">
              <rs-button variant="primary" size="sm">OK</rs-button>
              <rs-button variant="success" size="sm">+</rs-button>
              <rs-button variant="danger" size="sm">
                <Icon name="ic:baseline-delete" />
              </rs-button>
            </td>
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- Competency Scoring Rubric Section -->
    <h3>Competency Scoring Rubric</h3>
    <rs-card>
      <table class="table-auto w-full border-collapse border">
        <thead>
          <tr class="bg-blue-100">
            <th class="p-2 border">No.</th>
            <th class="p-2 border">ID</th>
            <th class="p-2 border">From</th>
            <th class="p-2 border">To</th>
            <th class="p-2 border">Rubric</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rubric, index) in competencyRubrics" :key="rubric.id">
            <td class="p-2 border text-center">{{ index + 1 }}</td>
            <td class="p-2 border text-center">{{ rubric.id }}</td>
            <td class="p-2 border">
              <input type="number" v-model="rubric.from" class="w-12 border" />
            </td>
            <td class="p-2 border">
              <input type="number" v-model="rubric.to" class="w-12 border" />
            </td>
            <td class="p-2 border">
              <input type="text" v-model="rubric.rubric" class="w-full border" />
            </td>
            <td class="p-2 border text-center">
              <rs-button variant="primary" size="sm">OK</rs-button>
              <rs-button variant="success" size="sm">+</rs-button>
              <rs-button variant="danger" size="sm">
                <Icon name="ic:baseline-delete" />
              </rs-button>
            </td>
          </tr>
        </tbody>
      </table>
    </rs-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Competency weightage data
const competencies = ref([
  { id: 1, name: "Core", weightage: 25 },
  { id: 2, name: "Generic", weightage: 25 },
  { id: 3, name: "Leadership", weightage: 25 },
  { id: 4, name: "Functional", weightage: 25 },
]);

// JD Scoring Rubric data
const jdScoring = ref([
  { id: "R4", from: 9, to: 10, rubric: "Pakar" },
  { id: "R3", from: 7, to: 8.99, rubric: "Mahir" },
  { id: "R2", from: 4, to: 6.99, rubric: "Cekap" },
  { id: "R1", from: 1, to: 3.99, rubric: "Asas" },
]);

// Competency Scoring Rubric data
const competencyRubrics = ref([
  { id: "R1", from: 9, to: 10, rubric: "Pakar" },
  { id: "R1", from: 7, to: 8, rubric: "Mahir" },
  { id: "R1", from: 4, to: 6, rubric: "Cekap" },
  { id: "R1", from: 1, to: 3, rubric: "Asas" },
]);

// Computed property to calculate total weightage
const totalWeightage = computed(() => {
  return competencies.value.reduce((total, competency) => total + competency.weightage, 0);
});
</script>

<style scoped>
/* Style adjustments for better table appearance */
table {
  width: 100%;
}

th, td {
  padding: 8px;
  text-align: center;
}

input {
  text-align: center;
}
</style>
