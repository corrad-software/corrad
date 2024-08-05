<script setup>
definePageMeta({
  title: "Jana Nombor Siri Aduan",
  layout: "default",
});

const generatedNumber = ref("");
const prefix = ref("ADU");
const lastUsedNumber = ref(100000); // This should ideally come from a database

const generateSerialNumber = () => {
  lastUsedNumber.value++;
  generatedNumber.value = `${prefix.value}${lastUsedNumber.value}`;
};

const saveSerialNumber = () => {
  // In a real application, this would save the generated number to a database
  // and potentially associate it with a new complaint
  alert(`Nombor siri ${generatedNumber.value} telah disimpan.`);
  generatedNumber.value = "";
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">Jana Nombor Siri Aduan</h2>
      </template>
      <template #body>
        <div class="mb-4">
          <FormKit
            type="text"
            name="prefix"
            label="Awalan Nombor Siri"
            v-model="prefix"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm"
              >
                Awalan Nombor Siri
              </label>
            </template>
          </FormKit>
        </div>

        <rs-button @click="generateSerialNumber" class="mb-4">
          Jana Nombor Siri
        </rs-button>

        <div v-if="generatedNumber" class="mb-4">
          <p class="text-lg font-semibold">Nombor Siri yang Dijana:</p>
          <p class="text-2xl font-bold text-primary">{{ generatedNumber }}</p>
        </div>

        <rs-button
          v-if="generatedNumber"
          @click="saveSerialNumber"
          variant="success"
        >
          Simpan Nombor Siri
        </rs-button>
      </template>
    </rs-card>
  </div>
</template>
