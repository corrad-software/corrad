<template>
  <div>
    <!-- Staff Details Section -->
    <div class="flex items-center justify-center mb-6">
      <div class="flex-1">
        <p><strong>Staff ID:</strong> 1737</p>
        <p><strong>Staff Name:</strong> Md. Zawawi bin Abu Bakar</p>
        <p><strong>Email:</strong> zawawi@uum.edu.my</p>
        <p><strong>Designation:</strong> Pensyarah Universiti (DS54)</p>
        <p><strong>Department:</strong> Psikologi Gunaan, Dasar dan Kerja Sosial</p>
      </div>
      <div class="ml-4">
        <!-- Staff Photo -->
        <img
          src="https://via.placeholder.com/100"
          alt="Staff Photo"
          class="rounded-full border"
        />
      </div>
    </div>

    <!-- Dual List Selection Section -->
    <div class="flex justify-center gap-8">
      <!-- Available Staff List -->
      <div>
        <h3 class="text-blue-600 font-bold">All Staff</h3>
        <FormKit
          type="text"
          v-model="availableSearch"
          placeholder="Keyword [Name / Staff No]"
          class="mb-2 w-full"
        />
        <select multiple v-model="selectedAvailableStaff" class="h-64 w-full border">
          <option
            v-for="(staff, index) in filteredAvailableStaff"
            :key="index"
            :value="staff"
          >
            {{ staff.name }} [{{ staff.staffNo }}]
          </option>
        </select>
      </div>

      <!-- Add/Remove Buttons -->
      <div class="flex flex-col justify-center gap-4">
        <rs-button variant="primary" @click="addStaff" class="w-24">&gt;&gt; Add</rs-button>
        <rs-button variant="danger" @click="removeStaff" class="w-24">&lt;&lt; Remove</rs-button>
      </div>

      <!-- Selected Staff List -->
      <div>
        <h3 class="text-blue-600 font-bold">Staff Selected</h3>
        <FormKit
          type="text"
          v-model="selectedSearch"
          placeholder="Keyword [Name / Staff No]"
          class="mb-2 w-full"
        />
        <select multiple v-model="selectedSelectedStaff" class="h-64 w-full border">
          <option
            v-for="(staff, index) in filteredSelectedStaff"
            :key="index"
            :value="staff"
          >
            {{ staff.name }} [{{ staff.staffNo }}]
          </option>
        </select>
      </div>
    </div>

    <!-- Action Buttons Section -->
    <div class="flex justify-end gap-4 mt-4">
      <rs-button variant="primary" @click="update">Update</rs-button>
      <rs-button variant="danger" @click="goBack">Back</rs-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// Dummy data for available staff
const availableStaff = ref([
  { name: "Faizul bin Mamat", staffNo: 3806 },
  { name: "Ku Nurhanim binti Ku Baudin", staffNo: 5496 },
  { name: "Mahani Binti Ahmad", staffNo: 3137 },
  { name: "Mohamad Adzwan bin Mohamad Akhir", staffNo: 5263 },
  { name: "Mohd Fitry Bin Ibrahim", staffNo: 2289 },
  { name: "Mua'azam bin Mohamad", staffNo: 5547 },
  { name: "Muhammad Al-Mustaqeem bin Mohd Rudyhizat", staffNo: 6406 },
  { name: "Muhammad Amier Shauqi bin Mazlan", staffNo: 5541 },
  { name: "Muhammad Wafiyuddin bin Abdul Manaf", staffNo: 5871 },
  { name: "Prof. Madya Dr. Mohd. Hasani bin Dali", staffNo: "KS4324" },
  { name: "Wan Rosni bin Wan Chik", staffNo: 5259 },
  { name: "Zaheruddin Bin Othman", staffNo: 1527 },
  // Add more dummy staff here
]);

// Dummy data for selected staff
const selectedStaff = ref([
  { name: "Basri Bin Lazim", staffNo: 1312 },
  { name: "Khairul Anuar Bin Ahmad", staffNo: 2357 },
  { name: "Suhaila Binti Abdul Hanan", staffNo: 2771 },
  { name: "Noor Azura Binti Hamzan", staffNo: 3206 },
  { name: "Norhasliza binti Harun", staffNo: 5424 },
  { name: "Shariza Bt. Salleh", staffNo: 1268 },
  { name: "Zulkifli bin Halim", staffNo: 5749 },
]);

// Search keywords
const availableSearch = ref('');
const selectedSearch = ref('');

// Selected items for each list
const selectedAvailableStaff = ref([]);
const selectedSelectedStaff = ref([]);

// Computed properties to filter the available and selected staff lists based on the search keywords
const filteredAvailableStaff = computed(() => {
  return availableStaff.value.filter(staff =>
    staff.name.toLowerCase().includes(availableSearch.value.toLowerCase()) ||
    staff.staffNo.toString().includes(availableSearch.value)
  );
});

const filteredSelectedStaff = computed(() => {
  return selectedStaff.value.filter(staff =>
    staff.name.toLowerCase().includes(selectedSearch.value.toLowerCase()) ||
    staff.staffNo.toString().includes(selectedSearch.value)
  );
});

// Add selected staff from available list to selected list
const addStaff = () => {
  selectedStaff.value.push(...selectedAvailableStaff.value);
  availableStaff.value = availableStaff.value.filter(staff => !selectedAvailableStaff.value.includes(staff));
  selectedAvailableStaff.value = [];
};

// Remove selected staff from selected list back to available list
const removeStaff = () => {
  availableStaff.value.push(...selectedSelectedStaff.value);
  selectedStaff.value = selectedStaff.value.filter(staff => !selectedSelectedStaff.value.includes(staff));
  selectedSelectedStaff.value = [];
};

// Update and go back button actions
const router = useRouter();
const update = () => {
  console.log("Updated staff list:", selectedStaff.value);
  // Logic for updating staff can be implemented here
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* Styles for select box */
select {
  padding: 8px;
  font-size: 14px;
}
</style>
