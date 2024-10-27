<template>
  <div class="p-6">
    <!-- JD Assessment Form Title -->
    <h2 class="text-2xl font-bold text-center mb-4">JD ASSESSMENT FORM</h2>

    <!-- Staff Information Section -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div>
        <p><strong>Staff ID</strong>: {{ formData.staffId }}</p>
        <p><strong>Staff Name</strong>: {{ formData.staffName }}</p>
        <p><strong>Email</strong>: {{ formData.email }}</p>
      </div>
      <div>
        <p><strong>Designation</strong>: {{ formData.designation }}</p>
        <p><strong>Department</strong>: {{ formData.department }}</p>
      </div>
      <div class="text-center">
        <img :src="formData.profilePicture" class="mx-auto rounded-full w-24 h-24 mb-2" />
        <p><strong>Session</strong>: {{ formData.session }}</p>
      </div>
    </div>

    <!-- Assignment Summary Section -->
    <rs-card class="mb-6">
      <h3 class="font-bold mb-2">1. Assignment Summary - ID : {{ formData.assignmentId }}</h3>
      <div class="flex space-x-4">
        <p><strong>Job Purpose (Tujuan Perwujudan Jawatan)</strong>: {{ formData.jobPurpose }}</p>
        <p>{{ formData.jobPurposeDetail }}</p>
      </div>
    </rs-card>

    <!-- Assignment Details Section -->
    <rs-card class="mb-6">
      <h3 class="font-bold mb-2">2. Assignment Detail</h3>
      <table class="table-auto w-full border-collapse border">
        <thead class="bg-yellow-100">
          <tr>
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Accountability</th>
            <th class="border px-4 py-2">Main Task</th>
            <th class="border px-4 py-2">Target</th>
            <th class="border px-4 py-2">Achievement</th>
            <th class="border px-4 py-2">Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(assignment, index) in formData.assignments" :key="index">
            <td class="border px-4 py-2">{{ index + 1 }}</td>
            <td class="border px-4 py-2">{{ assignment.accountability }}</td>
            <td class="border px-4 py-2">{{ assignment.mainTask }}</td>
            <td class="border px-4 py-2">{{ assignment.target }}</td>
            <td class="border px-4 py-2">{{ assignment.achievement }}</td>
            <td class="border px-4 py-2">
              <p><strong>Self Assessment</strong>: {{ assignment.selfAssessment }} / 10</p>
              <p><strong>PPP Assessment</strong>: {{ assignment.pppAssessment }} / 10</p>
              <p><strong>PPK Assessment</strong>: {{ assignment.ppkAssessment }} / 10</p>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Total Scores -->
      <div class="mt-4">
        <p><strong>Total Scores</strong>: Self {{ formData.selfTotal }} / PPP {{ formData.pppTotal }} / PPK {{ formData.ppkTotal }}</p>
      </div>
    </rs-card>

    <!-- Dimension Section -->
    <rs-card class="mb-6">
      <h3 class="font-bold mb-2">3. Dimension</h3>
      <table class="table-auto w-full border-collapse border">
        <thead class="bg-blue-100">
          <tr>
            <th class="border px-4 py-2">No</th>
            <th class="border px-4 py-2">Parameter</th>
            <th class="border px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dimension, index) in formData.dimensions" :key="index">
            <td class="border px-4 py-2">{{ index + 1 }}</td>
            <td class="border px-4 py-2">{{ dimension.parameter }}</td>
            <td class="border px-4 py-2">{{ dimension.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- Academic / Professional Qualification -->
    <rs-card class="mb-6">
      <h3 class="font-bold mb-2">4. Academic / Professional Qualification</h3>
      <p>{{ formData.academicQualification }}</p>
    </rs-card>

    <!-- Work Experience -->
    <rs-card class="mb-6">
      <h3 class="font-bold mb-2">5. Work Experience</h3>
      <p>{{ formData.workExperience }}</p>
    </rs-card>

    <!-- Assessment Summary -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div>
        <p><strong>Self Summary</strong>: {{ formData.selfSummary }}</p>
      </div>
      <div>
        <p><strong>PPP Summary</strong>: {{ formData.pppSummary }}</p>
      </div>
      <div>
        <p><strong>PPK Summary</strong>: {{ formData.ppkSummary }}</p>
      </div>
    </div>

    <!-- Close Button -->
    <div class="text-center mt-6">
      <rs-button variant="primary" @click="closeForm">Close</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { navigateTo } from '#app';

// Mock Data for the form
const formData = ref({
  staffId: '5674',
  staffName: 'Robiaatul Adawiah binti Edrus',
  email: 'robiaatul@uum.edu.my',
  designation: 'Tutor (Tanpa Skim)',
  department: 'Ekonomi, Kewangan dan Perbankan',
  session: '2024 Staff Job Performance Review',
  profilePicture: '/path/to/image.jpg', // Placeholder for profile picture
  assignmentId: 49,
  jobPurpose: 'Job Purpose (Tujuan Perwujudan Jawatan)',
  jobPurposeDetail: 'job purpose',
  assignments: [
    {
      accountability: 'acc1',
      mainTask: 'task1',
      target: 'target1',
      achievement: 'achieved',
      selfAssessment: 8,
      pppAssessment: 9,
      ppkAssessment: 0,
    },
    {
      accountability: 'acc2',
      mainTask: 'task2',
      target: 'target2',
      achievement: 'achieved test',
      selfAssessment: 5,
      pppAssessment: 7,
      ppkAssessment: 0,
    },
  ],
  selfTotal: '13/20',
  pppTotal: '16/20',
  ppkTotal: '0/20',
  dimensions: [
    {
      parameter: 'para1',
      quantity: 'quantity',
    },
  ],
  academicQualification: 'academic',
  workExperience: 'work exp',
  selfSummary: 'PYD assessed',
  pppSummary: 'PPP Summary',
  ppkSummary: 'PPK Summary',
});

// Close Button Action
const closeForm = () => {
  navigateTo('/previous-page'); // Adjust this to navigate to the desired page
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

img {
  max-width: 100%;
  height: auto;
}

h3 {
  background-color: #f1f5f9;
  padding: 0.5rem;
}
</style>
