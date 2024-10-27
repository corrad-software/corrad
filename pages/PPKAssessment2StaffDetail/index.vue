<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Staff Performance Management System</h1>
    <p>CBTM PROCESS • PPP ASSESSMENT</p>

    <!-- Header Information -->
    <div class="grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded mb-4">
      <div>
        <p><strong>Staff ID:</strong> 1740</p>
        <p><strong>Staff Name:</strong> Zarina binti Mat Saad</p>
        <p><strong>Email:</strong> zms@uum.edu.my</p>
        <p><strong>Designation:</strong> Pensyarah Universiti (DS54)</p>
        <p><strong>Department:</strong> Psikologi Gunaan, Dasar dan Kerja Sosial</p>
        <p><strong>Session:</strong> 2024 Staff Job Performance Review</p>
      </div>
      <div class="flex justify-center">
        <img src="#" alt="Staff Photo" class="w-32 h-32 rounded-full" />
      </div>
      <div class="bg-blue-100 p-4 rounded">
        <h2 class="font-semibold">Scoring</h2>
        <ul>
          <li>Core (25%): 0.00</li>
          <li>Generic (25%): 0.00</li>
          <li>Leadership (25%): 0.00</li>
          <li>Functional (25%): 0.00</li>
          <li><strong>Total Score:</strong> 0.00</li>
        </ul>
      </div>
    </div>

    <!-- Assignment Summary -->
    <div class="bg-gray-200 p-4 rounded mb-4">
      <h2 class="font-semibold">Assignment Summary - ID: 9</h2>
      <p><strong>Job Purpose:</strong> mengenai kerja tujuan pewujudan jawatan saya</p>
    </div>

    <!-- Tabs for Competency Categories -->
    <div>
      <div class="flex border-b mb-4">
        <button @click="activeTab = 'core'" :class="{ 'font-bold border-b-2 border-blue-500': activeTab === 'core' }" class="p-2">Core</button>
        <button @click="activeTab = 'generic'" :class="{ 'font-bold border-b-2 border-blue-500': activeTab === 'generic' }" class="p-2">Generic</button>
        <button @click="activeTab = 'leadership'" :class="{ 'font-bold border-b-2 border-blue-500': activeTab === 'leadership' }" class="p-2">Leadership</button>
        <button @click="activeTab = 'functional'" :class="{ 'font-bold border-b-2 border-blue-500': activeTab === 'functional' }" class="p-2">Functional</button>
      </div>

      <!-- Core Competency Tab -->
      <div v-if="activeTab === 'core'" class="mb-4">
        <h2 class="font-semibold">Core Competency</h2>
        <table class="table-auto w-full border border-gray-300 mb-4">
          <thead class="bg-blue-300">
            <tr>
              <th class="p-2">No.</th>
              <th class="p-2">Competency / Skill Set</th>
              <th class="p-2">Scale</th>
              <th class="p-2">RCL</th>
              <th class="p-2">Assessment</th>
              <th class="p-2">GAP</th>
              <th class="p-2">Roadblock</th>
              <th class="p-2">IDP</th>
              <th class="p-2">Save</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in coreData" :key="index">
              <td class="p-2 text-center">{{ index + 1 }}</td>
              <td class="p-2">{{ item.skill }}</td>
              <td class="p-2 text-center">{{ item.scale }}</td>
              <td class="p-2 text-center">{{ item.rcl }}</td>
              <td class="p-2 text-center">
                <select v-model="item.assessment" class="border rounded p-1">
                  <option value="1 - Basic">1 - Basic</option>
                  <option value="2 - Novice">2 - Novice</option>
                  <option value="3 - Qualified">3 - Qualified</option>
                  <option value="4 - Expert">4 - Expert</option>
                </select>
              </td>
              <td class="p-2 text-center">{{ item.gap }}</td>
              <td class="p-2 text-center"><img src="#" alt="Edit" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="IDP" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="Save" class="w-6 h-6 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Generic Competency Tab -->
      <div v-if="activeTab === 'generic'" class="mb-4">
        <h2 class="font-semibold">Generic Competency</h2>
        <table class="table-auto w-full border border-gray-300 mb-4">
          <thead class="bg-blue-300">
            <tr>
              <th class="p-2">No.</th>
              <th class="p-2">Competency / Skill Set</th>
              <th class="p-2">Scale</th>
              <th class="p-2">RCL</th>
              <th class="p-2">Assessment</th>
              <th class="p-2">GAP</th>
              <th class="p-2">Roadblock</th>
              <th class="p-2">IDP</th>
              <th class="p-2">Save</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in genericData" :key="index">
              <td class="p-2 text-center">{{ index + 1 }}</td>
              <td class="p-2">{{ item.skill }}</td>
              <td class="p-2 text-center">{{ item.scale }}</td>
              <td class="p-2 text-center">{{ item.rcl }}</td>
              <td class="p-2 text-center">
                <select v-model="item.assessment" class="border rounded p-1">
                  <option value="1 - Basic">1 - Basic</option>
                  <option value="2 - Novice">2 - Novice</option>
                  <option value="3 - Qualified">3 - Qualified</option>
                  <option value="4 - Expert">4 - Expert</option>
                </select>
              </td>
              <td class="p-2 text-center">{{ item.gap }}</td>
              <td class="p-2 text-center"><img src="#" alt="Edit" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="IDP" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="Save" class="w-6 h-6 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Leadership Competency Tab -->
      <div v-if="activeTab === 'leadership'" class="mb-4">
        <h2 class="font-semibold">Leadership Competency</h2>
        <table class="table-auto w-full border border-gray-300 mb-4">
          <thead class="bg-blue-300">
            <tr>
              <th class="p-2">No.</th>
              <th class="p-2">Competency / Skill Set</th>
              <th class="p-2">Scale</th>
              <th class="p-2">RCL</th>
              <th class="p-2">Assessment</th>
              <th class="p-2">GAP</th>
              <th class="p-2">Roadblock</th>
              <th class="p-2">IDP</th>
              <th class="p-2">Save</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in leadershipData" :key="index">
              <td class="p-2 text-center">{{ index + 1 }}</td>
              <td class="p-2">{{ item.skill }}</td>
              <td class="p-2 text-center">{{ item.scale }}</td>
              <td class="p-2 text-center">{{ item.rcl }}</td>
              <td class="p-2 text-center">
                <select v-model="item.assessment" class="border rounded p-1">
                  <option value="1 - Basic">1 - Basic</option>
                  <option value="2 - Novice">2 - Novice</option>
                  <option value="3 - Qualified">3 - Qualified</option>
                  <option value="4 - Expert">4 - Expert</option>
                </select>
              </td>
              <td class="p-2 text-center">{{ item.gap }}</td>
              <td class="p-2 text-center"><img src="#" alt="Edit" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="IDP" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="Save" class="w-6 h-6 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Functional Competency Tab -->
      <div v-if="activeTab === 'functional'" class="mb-4">
        <h2 class="font-semibold">Functional Competency</h2>
        <table class="table-auto w-full border border-gray-300 mb-4">
          <thead class="bg-blue-300">
            <tr>
              <th class="p-2">No.</th>
              <th class="p-2">Competency / Skill Set</th>
              <th class="p-2">Scale</th>
              <th class="p-2">RCL</th>
              <th class="p-2">Assessment</th>
              <th class="p-2">GAP</th>
              <th class="p-2">Roadblock</th>
              <th class="p-2">IDP</th>
              <th class="p-2">Save</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in functionalData" :key="index">
              <td class="p-2 text-center">{{ index + 1 }}</td>
              <td class="p-2">{{ item.skill }}</td>
              <td class="p-2 text-center">{{ item.scale }}</td>
              <td class="p-2 text-center">{{ item.rcl }}</td>
              <td class="p-2 text-center">
                <select v-model="item.assessment" class="border rounded p-1">
                  <option value="1 - Basic">1 - Basic</option>
                  <option value="2 - Novice">2 - Novice</option>
                  <option value="3 - Qualified">3 - Qualified</option>
                  <option value="4 - Expert">4 - Expert</option>
                </select>
              </td>
              <td class="p-2 text-center">{{ item.gap }}</td>
              <td class="p-2 text-center"><img src="#" alt="Edit" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="IDP" class="w-6 h-6 mx-auto" /></td>
              <td class="p-2 text-center"><img src="#" alt="Save" class="w-6 h-6 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="bg-gray-100 p-4 rounded mb-4">
      <h2 class="font-semibold">Summary</h2>
      <p><strong>Self Summary:</strong> update without isi IDP</p>
      <textarea v-model="ppkSummary" placeholder="Enter PPK Summary" class="border rounded p-2 w-full mt-2"></textarea>
      <div class="flex gap-4 mt-4">
        <button @click="updateSummary" class="btn-primary">Update</button>
        <button @click="confirmSummary" class="btn-secondary">Confirm</button>
        <button @click="goBack" class="btn-secondary">Back</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Active tab state
const activeTab = ref('core')

// Sample data for each competency tab
const coreData = ref([{ skill: 'Analytical Thinking', scale: 1, rcl: 9, assessment: '1 - Basic', gap: -8 }])
const genericData = ref([{ skill: 'Analytical Thinking', scale: 1, rcl: 4, assessment: '1 - Novice', gap: -3 }])
const leadershipData = ref([{ skill: 'Career Management', scale: 1, rcl: 4, assessment: '2 - Novice', gap: -2 }])
const functionalData = ref([{ skill: 'Business Acumen', scale: 4, rcl: 4, assessment: '4 - Qualified', gap: 0 }])

// Summary state
const ppkSummary = ref('')

// Methods
const updateSummary = () => { console.log("Updated summary") }
const confirmSummary = () => { console.log("Confirmed summary") }
const goBack = () => { console.log("Back to previous page") }
</script>

<style scoped>
.container { max-width: 1000px; }
.btn-primary { @apply bg-blue-500 text-white px-4 py-2 rounded; }
.btn-secondary { @apply bg-gray-300 text-black px-4 py-2 rounded; }
.table-auto th, .table-auto td { @apply border border-gray-300 text-center; }
</style>
