<template>
  <div class="p-6">
    <!-- Staff Information -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <div><strong>Staff ID:</strong> {{ staffData.staffId }}</div>
        <div><strong>Staff Name:</strong> {{ staffData.staffName }}</div>
        <div><strong>Email:</strong> {{ staffData.email }}</div>
        <div><strong>Designation:</strong> {{ staffData.designation }}</div>
        <div><strong>Department:</strong> {{ staffData.department }}</div>
        <div><strong>Session:</strong> {{ staffData.session }}</div>
      </div>
      <div class="flex justify-end">
        <img :src="staffData.photoUrl" alt="Staff Photo" class="rounded-full w-32 h-32">
      </div>
    </div>

    <!-- Assignment Summary -->
    <rs-card class="mb-6">
      <h2 class="font-bold text-lg mb-2">1. Assignment Summary - ID: {{ assignmentSummary.id }}</h2>
      <div class="mb-4">
        <strong>Job Purpose (Tujuan Perwujudan Jawatan):</strong> {{ assignmentSummary.jobPurpose }}
      </div>
    </rs-card>

    <!-- Competency Section -->
    <rs-card class="mb-6">
      <h2 class="font-bold text-lg mb-2">Skill Set / Competency</h2>
      <!-- Competency Table -->
      <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse border">
          <!-- Headers -->
          <thead class="bg-blue-100">
            <tr>
              <th class="border px-4 py-2">No.</th>
              <th class="border px-4 py-2">Competency / Skill Set</th>
              <th class="border px-4 py-2">Scale</th>
              <th class="border px-4 py-2">RCL</th>
              <th class="border px-4 py-2">Assessment</th>
              <th class="border px-4 py-2">GAP</th>
              <th class="border px-4 py-2">Roadblock</th>
              <th class="border px-4 py-2">IDP</th>
              <th class="border px-4 py-2">Save</th>
            </tr>
          </thead>
          <!-- Core Competencies -->
          <tbody>
            <tr>
              <td colspan="9" class="bg-gray-200 font-bold px-4 py-2">Core</td>
            </tr>
            <tr v-for="(core, index) in competencies.core" :key="index">
              <td class="border px-4 py-2">{{ index + 1 }}</td>
              <td class="border px-4 py-2">{{ core.name }}</td>
              <td class="border px-4 py-2">{{ core.scale }}</td>
              <td class="border px-4 py-2">{{ core.rcl }}</td>
              <td class="border px-4 py-2">{{ core.assessment }}</td>
              <td class="border px-4 py-2">{{ core.gap }}</td>
              <td class="border px-4 py-2">{{ core.roadblock }}</td>
              <td class="border px-4 py-2">{{ core.idp }}</td>
              <td class="border px-4 py-2">
                <rs-button variant="primary">Save</rs-button>
              </td>
            </tr>

            <!-- Similar structure for other categories -->
            <tr>
              <td colspan="9" class="bg-gray-200 font-bold px-4 py-2">Generic</td>
            </tr>
            <tr v-for="(generic, index) in competencies.generic" :key="index">
              <td class="border px-4 py-2">{{ index + 1 }}</td>
              <td class="border px-4 py-2">{{ generic.name }}</td>
              <td class="border px-4 py-2">{{ generic.scale }}</td>
              <td class="border px-4 py-2">{{ generic.rcl }}</td>
              <td class="border px-4 py-2">{{ generic.assessment }}</td>
              <td class="border px-4 py-2">{{ generic.gap }}</td>
              <td class="border px-4 py-2">{{ generic.roadblock }}</td>
              <td class="border px-4 py-2">{{ generic.idp }}</td>
              <td class="border px-4 py-2">
                <rs-button variant="primary">Save</rs-button>
              </td>
            </tr>

            <!-- Leadership Section -->
            <tr>
              <td colspan="9" class="bg-gray-200 font-bold px-4 py-2">Leadership</td>
            </tr>
            <tr v-for="(leadership, index) in competencies.leadership" :key="index">
              <td class="border px-4 py-2">{{ index + 1 }}</td>
              <td class="border px-4 py-2">{{ leadership.name }}</td>
              <td class="border px-4 py-2">{{ leadership.scale }}</td>
              <td class="border px-4 py-2">{{ leadership.rcl }}</td>
              <td class="border px-4 py-2">{{ leadership.assessment }}</td>
              <td class="border px-4 py-2">{{ leadership.gap }}</td>
              <td class="border px-4 py-2">{{ leadership.roadblock }}</td>
              <td class="border px-4 py-2">{{ leadership.idp }}</td>
              <td class="border px-4 py-2">
                <rs-button variant="primary">Save</rs-button>
              </td>
            </tr>

            <!-- Functional Section -->
            <tr>
              <td colspan="9" class="bg-gray-200 font-bold px-4 py-2">Functional</td>
            </tr>
            <tr v-for="(functional, index) in competencies.functional" :key="index">
              <td class="border px-4 py-2">{{ index + 1 }}</td>
              <td class="border px-4 py-2">{{ functional.name }}</td>
              <td class="border px-4 py-2">{{ functional.scale }}</td>
              <td class="border px-4 py-2">{{ functional.rcl }}</td>
              <td class="border px-4 py-2">{{ functional.assessment }}</td>
              <td class="border px-4 py-2">{{ functional.gap }}</td>
              <td class="border px-4 py-2">{{ functional.roadblock }}</td>
              <td class="border px-4 py-2">{{ functional.idp }}</td>
              <td class="border px-4 py-2">
                <rs-button variant="primary">Save</rs-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </rs-card>

    <!-- Self Summary -->
    <rs-card class="mb-6">
      <h2 class="font-bold text-lg mb-2">Self Summary</h2>
      <textarea v-model="selfSummary" class="border rounded-md w-full h-24 p-2"></textarea>
    </rs-card>

    <!-- Action Buttons -->
    <div class="flex space-x-4">
      <rs-button variant="primary" @click="update">Update</rs-button>
      <rs-button variant="primary" @click="confirm">Confirm</rs-button>
      <rs-button variant="secondary" @click="goBack">Back</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Mock Data for demonstration purposes
const staffData = ref({
  staffId: '2409',
  staffName: 'Harryzman Bin Harun',
  email: 'harry@uum.edu.my',
  designation: 'Pensyarah Universiti (DS52)',
  department: 'Teknologi Multimedia dan Komunikasi',
  session: '2024 Staff Job Performance Review',
  photoUrl: 'https://via.placeholder.com/100',
});

const assignmentSummary = ref({
  id: '12',
  jobPurpose: 'tujuan pewujudan jawatan',
});

const competencies = ref({
  core: [
    { name: 'Analytical Thinking', scale: '', rcl: '', assessment: '', gap: '', roadblock: '', idp: '' },
    // Add more core competencies here...
  ],
  generic: [
    { name: 'Communication and Interpersonal', scale: '', rcl: '', assessment: '', gap: '', roadblock: '', idp: '' },
    // Add more generic competencies here...
  ],
  leadership: [
    { name: 'Leadership Skill', scale: '', rcl: '', assessment: '', gap: '', roadblock: '', idp: '' },
    // Add more leadership competencies here...
  ],
  functional: [
    { name: 'Technical Expertise', scale: '', rcl: '', assessment: '', gap: '', roadblock: '', idp: '' },
    // Add more functional competencies here...
  ],
});

const selfSummary = ref('');

// Methods for buttons
const update = () => {
  console.log('Update clicked');
};

const confirm = () => {
  console.log('Confirm clicked');
};

const goBack = () => {
  console.log('Back clicked');
};
</script>

<style scoped>
table {
  width: 100%;
}
th, td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #ccc;
}
</style>
