<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Report</h1>

    <!-- Report List -->
    <div class="space-y-6">
      <!-- Report Item 1 -->
      <div @click="navigateTo('/report1')" class="flex items-start cursor-pointer hover:bg-gray-100 p-4 rounded border border-gray-200">
        <img src="#" alt="Report Icon" class="w-12 h-12 mr-4" />
        <div>
          <h2 class="font-bold text-lg">1. Student Performance By Modules</h2>
          <p class="text-gray-600">This report will display the student performance competency based on online assessments taken during class sessions.</p>
        </div>
      </div>

      <!-- Report Item 2 -->
      <div @click="navigateTo('/report2')" class="flex items-start cursor-pointer hover:bg-gray-100 p-4 rounded border border-gray-200">
        <img src="#" alt="Report Icon" class="w-12 h-12 mr-4" />
        <div>
          <h2 class="font-bold text-lg">2. Student Performance By Class</h2>
          <p class="text-gray-600">This report will display the student performance competency based on online assessments taken during class sessions.</p>
        </div>
      </div>

      <!-- Report Item 3 -->
      <div @click="navigateTo('/report3')" class="flex items-start cursor-pointer hover:bg-gray-100 p-4 rounded border border-gray-200">
        <img src="#" alt="Report Icon" class="w-12 h-12 mr-4" />
        <div>
          <h2 class="font-bold text-lg">3. Question Analysis By Modules</h2>
          <p class="text-gray-600">This report will show all question answered analysis by students in exam sessions, based on selected modules and duration.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* Add styling for the component */
.container {
  max-width: 800px;
}
</style>
