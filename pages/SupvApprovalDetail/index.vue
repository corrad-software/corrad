<template>
  <div class="p-6">
    <!-- Header Section -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold mb-2">JD ASSESSMENT FORM</h2>
        <p><strong>Staff ID:</strong> {{ staffData.staffId }}</p>
        <p><strong>Staff Name:</strong> {{ staffData.name }}</p>
        <p><strong>Email:</strong> {{ staffData.email }}</p>
        <p><strong>Designation:</strong> {{ staffData.designation }}</p>
        <p><strong>Department:</strong> {{ staffData.department }}</p>
        <p><strong>Session:</strong> {{ staffData.session }}</p>
      </div>
      <div class="text-center">
        <img :src="staffData.profilePicture" alt="Profile" class="w-24 h-24 rounded-full mb-2" />
        <p><strong>Status:</strong> {{ staffData.status }}</p>
      </div>
    </div>

    <!-- Assignment Summary Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold mb-2">1. Assignment Summary ({{ assignmentData.id }})</h3>
      <p><strong>Job Purpose (Tujuan Perwujudan Jawatan):</strong> {{ assignmentData.jobPurpose }}</p>
    </rs-card>

    <!-- Assignment Detail Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold mb-2">2. Assignment Detail</h3>
      <table class="table-auto w-full border-collapse border">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Accountability</th>
            <th class="border px-4 py-2">Main Task</th>
            <th class="border px-4 py-2">Target</th>
            <th class="border px-4 py-2">Weightage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in assignmentData.details" :key="i">
            <td class="border px-4 py-2">{{ i + 1 }}</td>
            <td class="border px-4 py-2">{{ item.accountability }}</td>
            <td class="border px-4 py-2">{{ item.mainTask }}</td>
            <td class="border px-4 py-2">{{ item.target }}</td>
            <td class="border px-4 py-2">{{ item.weightage }}</td>
          </tr>
          <tr>
            <td colspan="4" class="text-right border px-4 py-2">Total Target = {{ totalTargets }}</td>
            <td class="border px-4 py-2">{{ totalWeightage }}</td>
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- Skill Set / Competency Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold mb-2">3. Skill Set / Competency</h3>
      <div class="grid grid-cols-2 gap-4">
        <!-- Core Competency Table -->
        <table class="table-auto w-full border-collapse border">
          <thead class="bg-gray-100">
            <tr>
              <th colspan="2" class="border px-4 py-2 bg-blue-100">Core</th>
            </tr>
            <tr>
              <th class="border px-4 py-2">No</th>
              <th class="border px-4 py-2">Competency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in skillSet.core" :key="i">
              <td class="border px-4 py-2">{{ i + 1 }}</td>
              <td class="border px-4 py-2">{{ item }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Generic Competency Table -->
        <table class="table-auto w-full border-collapse border">
          <thead class="bg-gray-100">
            <tr>
              <th colspan="2" class="border px-4 py-2 bg-blue-100">Generic</th>
            </tr>
            <tr>
              <th class="border px-4 py-2">No</th>
              <th class="border px-4 py-2">Competency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in skillSet.generic" :key="i">
              <td class="border px-4 py-2">{{ i + 1 }}</td>
              <td class="border px-4 py-2">{{ item }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Leadership Competency Table -->
        <table class="table-auto w-full border-collapse border">
          <thead class="bg-gray-100">
            <tr>
              <th colspan="2" class="border px-4 py-2 bg-blue-100">Leadership</th>
            </tr>
            <tr>
              <th class="border px-4 py-2">No</th>
              <th class="border px-4 py-2">Competency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in skillSet.leadership" :key="i">
              <td class="border px-4 py-2">{{ i + 1 }}</td>
              <td class="border px-4 py-2">{{ item }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Functional Competency Table -->
        <table class="table-auto w-full border-collapse border">
          <thead class="bg-gray-100">
            <tr>
              <th colspan="2" class="border px-4 py-2 bg-blue-100">Functional</th>
            </tr>
            <tr>
              <th class="border px-4 py-2">No</th>
              <th class="border px-4 py-2">Competency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in skillSet.functional" :key="i">
              <td class="border px-4 py-2">{{ i + 1 }}</td>
              <td class="border px-4 py-2">{{ item }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </rs-card>

    <!-- Close Button -->
    <div class="flex justify-center mt-4">
      <rs-button variant="secondary" @click="goBack">Close</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Mock Data (should be fetched from API)
const staffData = ref({
  staffId: '5919',
  name: 'Nur Adeelah binti Che Ahmad Tantowi',
  email: 'adeelah.che@uum.edu.my',
  designation: 'Pensyarah Universiti (DS51)',
  department: 'Ekonomi, Kewangan dan Perbankan',
  session: '2024 Staff Job Performance Review',
  profilePicture: 'path_to_profile_image', // Provide the image path
  status: 'Active',
});

const assignmentData = ref({
  id: 39,
  jobPurpose: 'tujuan jawatan',
  details: [
    {
      accountability: 'acc1',
      mainTask: 'task1',
      target: 'target1',
      weightage: 10,
    },
    {
      accountability: 'acc2',
      mainTask: 'task2',
      target: 'target2',
      weightage: 10,
    },
  ],
});

const totalTargets = ref(2);
const totalWeightage = ref(20);

// Skill Set / Competency Data
const skillSet = ref({
  core: ['add new competency on 22/9/2024', 'Analytical Thinking..', 'Communication and Interpersonal', 'Coordinating'],
  generic: ['Analytical Thinking', 'Communication and Interpersonal', 'Coordinating', 'Counselling Skill'],
  leadership: ['Career Management', 'Compensation Management', 'Competency Need Analysis'],
  functional: ['Business Acumen', 'Change Management', 'Coaching and Developing'],
});

// Navigation back to the previous page
const router = useRouter();
const goBack = () => {
  router.back();
};
</script>

<style scoped>
table {
  width: 100%;
}

th, td {
  padding: 0.5rem;
  text-align: left;
  border: 1px solid #ccc;
}

.text-right {
  text-align: right;
}
</style>
