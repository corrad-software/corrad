<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>
    
    <!-- Search Section -->
    <div class="flex gap-4 items-end mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Search by</label>
        <select v-model="searchBy" class="border rounded p-2 w-full">
          <option value="userId">User ID</option>
          <option value="email">Email</option>
        </select>
      </div>
      <input v-model="searchQuery" placeholder="Enter search value" class="border rounded p-2 w-full" />
      <button @click="fetchUsers" class="btn-primary p-2">SEARCH</button>
    </div>
    
    <!-- Users Table -->
    <div v-if="users.length">
      <table class="table-auto w-full border mt-4">
        <thead>
          <tr class="bg-blue-200">
            <th class="p-2">User ID</th>
            <th class="p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" @click="selectUser(user)" class="cursor-pointer hover:bg-blue-100">
            <td class="p-2">{{ user.userId }}</td>
            <td class="p-2">{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4">First | Next  |  Previous | Last</div>
    </div>
    <div v-else class="text-center mt-4 text-gray-500">No matching users found.</div>
    
    <!-- User Detail Section (Info and Group tabs) -->
    <div v-if="selectedUser" class="mt-8">
      <!-- Tab Navigation -->
      <div class="flex space-x-4 bg-blue-200 p-2 rounded">
        <button @click="activeTab = 'info'" :class="{ 'font-bold': activeTab === 'info' }">Info</button>
        <button @click="activeTab = 'group'" :class="{ 'font-bold': activeTab === 'group' }">Group</button>
      </div>

      <!-- Info Tab -->
      <div v-if="activeTab === 'info'" class="mt-4">
        <h2 class="text-lg font-bold mb-2">Info</h2>
        <p>Below is user detail. To edit data, update the form and click UPDATE button.</p>
        
        <form @submit.prevent="updateUserInfo">
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label>User ID</label>
              <div class="text-blue-600">{{ selectedUser.userId }}</div>
            </div>
            <div>
              <label>Full Name</label>
              <input v-model="selectedUser.fullName" type="text" class="border rounded p-2 w-full" />
            </div>
            <div>
              <label>Description</label>
              <textarea v-model="selectedUser.description" class="border rounded p-2 w-full"></textarea>
            </div>
            <div>
              <label>Account Type</label>
              <select v-model="selectedUser.accountType" class="border rounded p-2 w-full">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label>Email</label>
              <input v-model="selectedUser.email" type="email" class="border rounded p-2 w-full" />
            </div>
            <div>
              <label>Change Password</label>
              <input v-model="selectedUser.newPassword" type="password" class="border rounded p-2 w-full" />
              <p class="text-xs text-gray-500">* New Password will overwrite old password.</p>
            </div>
            <div>
              <label>Account Settings</label>
              <div>
                <input type="radio" v-model="selectedUser.settings" value="change_password" /> User must change password at next logon<br>
                <input type="radio" v-model="selectedUser.settings" value="never_expires" /> Password never expires<br>
                <input type="radio" v-model="selectedUser.settings" value="blocked" /> Account is blocked (Failed Password Attempt)<br>
                <input type="radio" v-model="selectedUser.settings" value="disabled" /> Account is disabled
              </div>
            </div>
          </div>
          
          <div class="flex space-x-4 mt-4">
            <button type="submit" class="btn-primary">UPDATE</button>
            <button @click="deleteUser" type="button" class="btn-danger">DELETE</button>
            <button @click="cancelEdit" type="button" class="btn-secondary">CANCEL</button>
          </div>
        </form>
      </div>

      <!-- Group Tab -->
      <div v-if="activeTab === 'group'" class="mt-4">
        <h2 class="text-lg font-bold mb-2">Group</h2>
        <p>Please select existing group and click ADD button to complete.</p>
        
        <form @submit.prevent="addGroup">
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label>User ID</label>
              <div class="text-blue-600">{{ selectedUser.userId }}</div>
            </div>
            <div>
              <label>Full Name</label>
              <div class="text-blue-600">{{ selectedUser.fullName }}</div>
            </div>
            <div>
              <label>Email</label>
              <div class="text-blue-600">{{ selectedUser.email }}</div>
            </div>
            <div>
              <label>Choose Group</label>
              <select v-model="selectedUser.group" class="border rounded p-2 w-full">
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>
          
          <div class="flex space-x-4 mt-4">
            <button type="submit" class="btn-primary">ADD</button>
            <button @click="cancelEdit" type="button" class="btn-secondary">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchBy = ref('userId')
const searchQuery = ref('')
const users = ref([
  { id: 1, userId: 'tiekui', email: 'tiekui@uum.edu.my' },
  { id: 2, userId: 'johndoe', email: 'johndoe@company.com' },
  { id: 3, userId: 'janedoe', email: 'janedoe@company.com' },
  { id: 4, userId: 'alicew', email: 'alicew@school.edu' },
  { id: 5, userId: 'bobsmith', email: 'bobsmith@company.com' },
  { id: 6, userId: 'carolj', email: 'carolj@techfirm.org' },
  { id: 7, userId: 'davidlee', email: 'davidlee@hospital.org' },
  { id: 8, userId: 'emilyr', email: 'emilyr@financegroup.com' },
  { id: 9, userId: 'frankg', email: 'frankg@retailstore.net' },
  { id: 10, userId: 'gracem', email: 'gracem@university.edu' }
])
const selectedUser = ref(null)
const activeTab = ref('info')

const fetchUsers = () => {
  console.log("Searching users based on:", searchBy.value, searchQuery.value)
  // Perform fetch logic here
}

const selectUser = (user) => {
  selectedUser.value = {
    userId: user.userId,
    fullName: `${user.userId.charAt(0).toUpperCase() + user.userId.slice(1)} Fullname`,
    description: 'IT',
    accountType: 'user',
    email: user.email,
    settings: 'never_expires',
    newPassword: '',
    group: 'IT'
  }
}

const updateUserInfo = () => {
  console.log("Updating user info:", selectedUser.value)
}

const deleteUser = () => {
  console.log("Deleting user:", selectedUser.value.userId)
}

const cancelEdit = () => {
  selectedUser.value = null
}

const addGroup = () => {
  console.log("Adding group:", selectedUser.value.group, "for user:", selectedUser.value.userId)
}
</script>

<style scoped>
.btn-primary { @apply bg-blue-500 text-white px-4 py-2 rounded }
.btn-secondary { @apply bg-gray-500 text-white px-4 py-2 rounded }
.btn-danger { @apply bg-red-500 text-white px-4 py-2 rounded }
.table-auto { @apply border-collapse border border-gray-300 w-full }
.table-auto th, .table-auto td { @apply border border-gray-300 p-2 text-left }
</style>
