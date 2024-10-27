<template>
  <div class="p-6">
    <!-- Form Section -->
    <rs-card>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Left Section -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-1">Session Title :</label>
            <input v-model="form.sessionTitle" type="text" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Session Start :</label>
            <input v-model="form.sessionStart" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">JD From :</label>
            <input v-model="form.jdFrom" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Skillset From :</label>
            <input v-model="form.skillsetFrom" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">PPP Dateline :</label>
            <input v-model="form.pppDateline" type="date" class="border rounded-md w-full" />
          </div>
        </div>

        <!-- Right Section -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-1">Year :</label>
            <input v-model="form.year" type="text" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Session Finish :</label>
            <input v-model="form.sessionFinish" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">JD Dateline :</label>
            <input v-model="form.jdDateline" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Skillset Dateline :</label>
            <input v-model="form.skillsetDateline" type="date" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">PPK Dateline :</label>
            <input v-model="form.ppkDateline" type="date" class="border rounded-md w-full" />
          </div>
        </div>
      </div>

      <!-- Yearly Competency Setup Section -->
      <div class="border-t pt-4">
        <h3 class="font-bold text-lg mb-2">Yearly Competency Setup [Required Skill Set]</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold mb-1">Core :</label>
            <input v-model="form.core" type="number" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Generic :</label>
            <input v-model="form.generic" type="number" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Leadership :</label>
            <input v-model="form.leadership" type="number" class="border rounded-md w-full" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1">Functional :</label>
            <input v-model="form.functional" type="number" class="border rounded-md w-full" />
          </div>
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="mt-6 flex justify-end space-x-4">
        <rs-button variant="secondary" @click="goBack">Back</rs-button>
        <rs-button variant="primary" @click="update">Update</rs-button>
      </div>
    </rs-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Form Data
const form = ref({
  sessionTitle: '2024 CBTM Review',
  year: '',
  sessionStart: '2024-09-26',
  sessionFinish: '2024-12-31',
  jdFrom: '2024-09-26',
  jdDateline: '2024-12-31',
  skillsetFrom: '2024-09-26',
  skillsetDateline: '2024-12-31',
  pppDateline: '2024-09-26',
  ppkDateline: '2024-12-31',
  core: 1,
  generic: 2,
  leadership: 1,
  functional: 2,
});

// Methods
const update = () => {
  // Handle the form submission logic here
  console.log('Form updated:', form.value);
};

const goBack = () => {
  // Handle the back button logic here
  console.log('Go back');
};
</script>

<style scoped>
.grid {
  grid-template-columns: repeat(2, 1fr);
}
</style>
