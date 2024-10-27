<template>
  <div class="container mx-auto p-4">
    <!-- Staff Information Section -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <p><strong>Staff ID</strong>: 1972</p>
        <p><strong>Staff Name</strong>: Jafni Azhan Bin Ibrahim</p>
        <p><strong>Email</strong>: <a href="mailto:jafni@uum.edu.my" class="text-blue-600">jafni@uum.edu.my</a></p>
        <p><strong>Designation</strong>: Pensyarah Universiti (DS54)</p>
        <p><strong>Department</strong>: Pengurusan Teknologi dan Logistik</p>
        <p><strong>Session</strong>: 2024 Staff Job Performance Review</p>
      </div>
      <div>
        <p><strong>Status</strong>: <span class="text-green-600 font-bold">Active</span></p>
        <p><strong>Supervisor</strong></p>
        <p><strong>PPP</strong></p>
        <p><strong>PPK</strong></p>
        <p><strong>Peer Approver</strong></p>
      </div>
      <img src="https://via.placeholder.com/100" alt="Staff Photo" class="rounded-full w-24 h-24 border border-gray-300">
    </div>

    <!-- Assignment Summary Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">1. Assignment Summary</h3>
      <div class="p-4">
        <p><strong>Job Purpose (Tujuan Perwujudan Jawatan)</strong>: tujuan perwujudan jawatan saya</p>
      </div>
    </div>

    <!-- Assignment Detail Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">
        2. Assignment Detail 
        <span class="text-sm">Self Score: <strong>105.26%</strong>, PPP Score: <strong>105.26%</strong>, PPK Score: <strong>100.00%</strong></span>
      </h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">No</th>
            <th class="border border-gray-300 p-2">Accountability</th>
            <th class="border border-gray-300 p-2">Main Task</th>
            <th class="border border-gray-300 p-2">Target</th>
            <th class="border border-gray-300 p-2">Achievement</th>
            <th class="border border-gray-300 p-2">Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(assignment, index) in assignmentData" :key="index">
            <td class="border border-gray-300 p-2">{{ index + 1 }}</td>
            <td class="border border-gray-300 p-2">{{ assignment.accountability }}</td>
            <td class="border border-gray-300 p-2">{{ assignment.mainTask }}</td>
            <td class="border border-gray-300 p-2">{{ assignment.target }}</td>
            <td class="border border-gray-300 p-2">
              {{ assignment.achievement }}
              <span class="text-green-600 cursor-pointer ml-2">✔ View Document</span>
            </td>
            <td class="border border-gray-300 p-2">
              <p>Self Assessment: <strong>{{ assignment.selfAssessment }}</strong></p>
              <p>PPP Assessment: <strong>{{ assignment.pppAssessment }}</strong></p>
              <textarea class="border rounded w-full mt-2 p-1" rows="2">{{ assignment.remarks }}</textarea>
              <p class="mt-2">PPK Assessment:</p>
              <select class="border rounded p-1 mb-2" v-model="assignment.ppkScore">
                <option v-for="i in 10" :key="i" :value="i">{{ i }}</option>
              </select>
              <div class="flex items-center gap-2">
                <input type="radio" id="accept" name="assessment" />
                <label for="accept" class="text-green-600">Accept</label>
                <input type="radio" id="reject" name="assessment" />
                <label for="reject" class="text-red-600">Reject</label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dimension Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">3. Dimension</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">No.</th>
            <th class="border border-gray-300 p-2">Parameter</th>
            <th class="border border-gray-300 p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dimension, index) in dimensionData" :key="index">
            <td class="border border-gray-300 p-2">{{ index + 1 }}</td>
            <td class="border border-gray-300 p-2">{{ dimension.parameter }}</td>
            <td class="border border-gray-300 p-2">{{ dimension.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Academic/Professional Qualification Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">4. Academic/Professional Qualification</h3>
      <div class="p-4">
        <p>my qualification</p>
      </div>
    </div>

    <!-- Work Experience Section -->
    <div class="border border-gray-300 rounded-md mb-6">
      <h3 class="bg-gray-200 p-2 font-semibold">5. Work Experience</h3>
      <div class="p-4">
        <p>my experience</p>
        <p><strong>Self Summary</strong>: PYDcomment</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4">
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" @click="navigateToDetail">Detail</button>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Update</button>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Confirm</button>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Back</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Sample data for assignments and dimensions
const assignmentData = [
  {
    accountability: "acc1",
    mainTask: "task1",
    target: "target1",
    achievement: "10",
    selfAssessment: "10 / 10",
    pppAssessment: "10 / 10",
    remarks: "please check, reject task 1",
    ppkScore: 10,
  },
  {
    accountability: "acc2",
    mainTask: "task2",
    target: "target2",
    achievement: "9",
    selfAssessment: "10 / 9",
    pppAssessment: "10 / 9",
    remarks: "ok task 2",
    ppkScore: 9,
  },
];

const dimensionData = [
  {
    parameter: "parameter 1",
    quantity: 5,
  }
];

// Navigation function
const router = useRouter();
const navigateToDetail = () => {
  router.push('/PPKAssessmentStaffDetail');
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.bg-blue-200 {
  background-color: #b3c7ff;
}
</style>
