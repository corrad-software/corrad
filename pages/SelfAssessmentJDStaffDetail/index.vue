<template>
  <div class="container mx-auto p-4">
    <!-- Staff Information Section -->
    <div class="flex gap-4 mb-4">
      <div class="w-3/4">
        <p><strong>Staff ID:</strong> 2771</p>
        <p><strong>Staff Name:</strong> Suhaila Binti Abdul Hanan</p>
        <p><strong>Email:</strong> suhai@uum.edu.my</p>
        <p><strong>Designation:</strong> Pensyarah Universiti (DS54)</p>
        <p><strong>Department:</strong> Pengurusan Teknologi dan Logistik</p>
        <p><strong>Session:</strong> 2024 Staff Job Performance Review</p>
        <p><strong class="text-red-500">PPP Rejected</strong> - <span class="text-red-500">reject satu</span></p>
      </div>
      <div class="w-1/4 flex justify-center items-start">
        <img src="https://via.placeholder.com/100" alt="Staff Photo" class="rounded-full" />
      </div>
    </div>

    <!-- Assignment Summary Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold">1. Assignment Summary (23)</h3>
      <table class="w-full border-collapse border border-gray-300 mt-2">
        <thead>
          <tr>
            <th class="border border-gray-300 p-2">Job Purpose (Tujuan Perwujudan Jawatan)</th>
            <th class="border border-gray-300 p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2">Job Purpose</td>
            <td class="border border-gray-300 p-2">
              Menganalisa dan mengurus projek/aplikasi berkaitan emerging technology, pembangunan model pengoperasian makmal inovasi dan pemindahan teknologi baharu untuk menyediakan perkhidmatan yang menyokong pendigitalan kampus
            </td>
          </tr>
        </tbody>
      </table>
    </rs-card>

    <!-- Assignment Detail Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold">2. Assignment Detail <span class="text-gray-600">Self Score: 50%</span></h3>
      <table class="w-full border-collapse border border-gray-300 mt-2">
        <thead>
          <tr class="bg-blue-200">
            <th class="border border-gray-300 p-2">No</th>
            <th class="border border-gray-300 p-2">Accountability</th>
            <th class="border border-gray-300 p-2">Main Task</th>
            <th class="border border-gray-300 p-2">Target</th>
            <th class="border border-gray-300 p-2">Achievement</th>
            <th class="border border-gray-300 p-2">Score</th>
            <th class="border border-gray-300 p-2">Document Upload</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task, index) in tasks" :key="index">
            <td class="border border-gray-300 p-2" :rowspan="task.subTasks.length">{{ index + 1 }}</td>
            <td class="border border-gray-300 p-2" :rowspan="task.subTasks.length">{{ task.accountability }}</td>
            <td v-for="(subTask, subIndex) in task.subTasks" :key="subIndex" class="border border-gray-300 p-2">
              <template v-if="subIndex === 0">
                {{ subTask.mainTask }}
              </template>
              <td class="border border-gray-300 p-2">{{ subTask.target }}</td>
              <td class="border border-gray-300 p-2">
                <textarea v-model="subTask.achievement" class="w-full border rounded-md p-2"></textarea>
              </td>
              <td class="border border-gray-300 p-2">
                <select v-model="subTask.score" class="border p-1 rounded-md">
                  <option v-for="score in 10" :key="score" :value="score">{{ score }}</option>
                </select> /10
              </td>
              <td class="border border-gray-300 p-2 text-center">
                <Icon name="ic:baseline-attach-file" class="text-blue-500 cursor-pointer" />
              </td>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-end mt-2 font-semibold">
        Total Target = 8 | <span class="ml-2">40 / 80</span>
      </div>
    </rs-card>

    <!-- Academic/Professional Qualification Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold">3. Academic/Professional Qualification</h3>
      <p class="p-2">
        Mengurus dan menyenggara aplikasi di bawah Unit ADD agar dapat memenuhi keperluan semasa pengguna
      </p>
    </rs-card>

    <!-- Work Experience Section -->
    <rs-card class="mb-4">
      <h3 class="text-lg font-semibold">4. Work Experience</h3>
      <p class="p-2">Mengurus dan menyelesaikan aduan pengguna mengikut tempoh masa yang telah ditetapkan.</p>
      <div class="flex gap-2 mt-2">
        <span>Overall Summary</span>
        <textarea v-model="overallSummary" class="w-full border rounded-md p-2"></textarea>
      </div>
    </rs-card>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-4">
      <button @click="updateDetails" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Update
      </button>
      <button @click="confirmDetails" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Confirm
      </button>
      <button @click="goBack" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
// import Icon from '@iconify/vue';
const router = useRouter();

const overallSummary = ref("ok");

const tasks = ref([
  {
    accountability: "Menganalisa dan mengurus projek/aplikasi berkaitan emerging technology",
    subTasks: [
      {
        mainTask: "Menganalisa dan mengurus projek/aplikasi berkaitan emerging technology",
        target: "Menganalisa dan mengurus projek/aplikasi berkaitan emerging technology",
        achievement: "model pengoperasian makmal inovasi dan pemindahan teknologi baharu untuk menyediakan perkhidmatan yang menyokong pendigitalan kampus",
        score: 10,
      },
      {
        mainTask: "pembangunan model pengoperasian makmal inovasi dan pemindahan teknologi",
        target: "pembangunan model pengoperasian makmal inovasi dan pemindahan teknologi",
        achievement: "",
        score: 10,
      },
    ],
  },
  {
    accountability: "Pengurusan makmal inovasi",
    subTasks: [
      {
        mainTask: "Pengurusan makmal inovasi",
        target: "Menyokong pengoperasian makmal",
        achievement: "Perkhidmatan yang menyokong pendigitalan kampus",
        score: 10,
      },
    ],
  },
]);

// Functions for navigation and actions
const updateDetails = () => {
  alert("Details Updated");
};

const confirmDetails = () => {
  alert("Details Confirmed");
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
