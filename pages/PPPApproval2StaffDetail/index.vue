<template>
  <div class="container mx-auto p-4">
    <!-- Staff Information -->
    <h1 class="text-2xl font-bold mb-4">Staff Performance Details</h1>
    <div class="bg-gray-100 p-4 rounded mb-4 flex justify-between">
      <div>
        <p><strong>Staff ID:</strong> {{ staff.staffId }}</p>
        <p><strong>Staff Name:</strong> {{ staff.name }}</p>
        <p><strong>Email:</strong> {{ staff.email }}</p>
        <p><strong>Designation:</strong> {{ staff.designation }}</p>
        <p><strong>Department:</strong> {{ staff.department }}</p>
        <p><strong>Session:</strong> {{ staff.session }}</p>
        <p><strong>Status:</strong> <span class="text-green-600 font-semibold">{{ staff.status }}</span></p>
      </div>
      <img :src="staff.photo" alt="Staff Photo" class="w-24 h-24 rounded-full" />
    </div>

    <!-- Assignment Summary -->
    <h2 class="text-lg font-semibold mb-2">1. Assignment Summary</h2>
    <div class="border rounded mb-4 p-4">
      <p><strong>Job Purpose (Tujuan Perwujudan Jawatan):</strong> {{ assignmentSummary.jobPurpose }}</p>
    </div>

    <!-- Assignment Detail -->
    <h2 class="text-lg font-semibold mb-2">2. Assignment Detail</h2>
    <div class="border rounded mb-4 p-4">
      <p>Self Score: <strong>{{ assignmentDetail.selfScore }}</strong>, PPP Score: <strong>{{ assignmentDetail.pppScore }}</strong>, PPK Score: <strong>{{ assignmentDetail.ppkScore }}</strong></p>
      <table class="table-auto w-full border border-gray-300 mb-4">
        <thead class="bg-blue-300">
          <tr>
            <th class="p-2">No</th>
            <th class="p-2">Accountability</th>
            <th class="p-2">Main Task</th>
            <th class="p-2">Target</th>
            <th class="p-2">Achievement</th>
            <th class="p-2">Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task, index) in assignmentDetail.tasks" :key="index" :class="index % 2 === 1 ? 'bg-gray-200' : ''">
            <td class="p-2 text-center">{{ index + 1 }}</td>
            <td class="p-2">{{ task.accountability }}</td>
            <td class="p-2">{{ task.mainTask }}</td>
            <td class="p-2">{{ task.target }}</td>
            <td class="p-2">{{ task.achievement }}</td>
            <td class="p-2 text-center">
              <p>Self Assessment: <strong>{{ task.selfAssessment }}</strong></p>
              <p>PPP Assessment:
                <select v-model="task.pppAssessment" class="border rounded p-1">
                  <option v-for="score in 10" :key="score" :value="score">{{ score }}</option>
                </select>
              </p>
              <div>
                <label><input type="radio" v-model="task.approval" value="accept" /> Accept</label>
                <label class="ml-2"><input type="radio" v-model="task.approval" value="reject" /> Reject</label>
              </div>
              <textarea v-model="task.remark" placeholder="Enter assessment remark" class="border rounded p-1 w-full mt-1"></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dimension -->
    <h2 class="text-lg font-semibold mb-2">3. Dimension</h2>
    <div class="border rounded mb-4 p-4">
      <table class="table-auto w-full border border-gray-300">
        <thead class="bg-blue-300">
          <tr>
            <th class="p-2">No.</th>
            <th class="p-2">Parameter</th>
            <th class="p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dimension, index) in dimensions" :key="index">
            <td class="p-2 text-center">{{ index + 1 }}</td>
            <td class="p-2">{{ dimension.parameter }}</td>
            <td class="p-2 text-center">{{ dimension.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Academic/Professional Qualification -->
    <h2 class="text-lg font-semibold mb-2">4. Academic/Professional Qualification</h2>
    <div class="border rounded mb-4 p-4">
      <p>{{ qualifications }}</p>
    </div>

    <!-- Work Experience -->
    <h2 class="text-lg font-semibold mb-2">5. Work Experience</h2>
    <div class="border rounded mb-4 p-4">
      <p>{{ workExperience }}</p>
      <p><strong>Self Summary:</strong> {{ selfSummary }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mt-4">
      <button @click="updateDetails" class="btn-primary">Update</button>
      <button @click="confirmDetails" class="btn-secondary">Confirm</button>
      <button @click="goBack" class="btn-secondary">Back</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Sample Data
const staff = ref({
  staffId: '5894',
  name: 'Hapini bin Awang',
  email: 'hapini.awang@uum.edu.my',
  designation: 'Pensyarah Universiti (DS51)',
  department: 'Pengkomputeran',
  session: '2024 Staff Job Performance Review',
  status: 'Active',
  photo: '#'
})

const assignmentSummary = ref({
  jobPurpose: 'test1'
})

const assignmentDetail = ref({
  selfScore: '66.67%',
  pppScore: '100.00%',
  ppkScore: '',
  tasks: [
    { accountability: 'tset', mainTask: 'tset', target: 'tset', achievement: 'achieved 1', selfAssessment: '10 / 10', pppAssessment: 10, approval: '', remark: '' },
    { accountability: 'task 2 8/8/2024', mainTask: 'task 2 8/8/2024', target: 'task 2 8/8/2024', achievement: 'achieved 2', selfAssessment: '10 / 10', pppAssessment: 10, approval: '', remark: '' }
  ]
})

const dimensions = ref([
  { parameter: 'test', quantity: 'test' }
])

const qualifications = ref('tset')
const workExperience = ref('tset testtt')
const selfSummary = ref('PYD assessed')

// Methods
const router = useRouter()

const updateDetails = () => {
  console.log("Details updated.")
}

const confirmDetails = () => {
  console.log("Details confirmed.")
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}

.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
}

.btn-secondary {
  @apply bg-gray-300 text-black px-4 py-2 rounded;
}

.table-auto th, .table-auto td {
  @apply border border-gray-300 text-center;
}
</style>
