<script setup>
definePageMeta({
  title: "Hantar Aduan",
  layout: "default",
});

const aduanForm = ref({
  butiranAduan: "",
});

const nomorSiri = ref("");

const submitAduan = async () => {
  // This would typically be an API call, but we're using dummy data for now
  nomorSiri.value = "ADU" + Math.floor(100000 + Math.random() * 900000);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">Hantar Aduan</h2>
      </template>
      <template #body>
        <FormKit
          type="form"
          v-model="aduanForm"
          @submit="submitAduan"
          :actions="false"
        >
          <FormKit
            type="textarea"
            name="butiranAduan"
            label="Butiran Aduan"
            validation="required|length:10,500"
            :validation-messages="{
              required: 'Maklumat aduan diperlukan.',
              length: 'Butiran aduan mestilah antara 10 hingga 500 aksara.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Butiran Aduan
                <span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <div class="flex justify-end mt-4">
            <rs-button type="submit" :disabled="!aduanForm.butiranAduan">
              Hantar Aduan
            </rs-button>
          </div>
        </FormKit>

        <div v-if="nomorSiri" class="mt-6 p-4 bg-green-100 rounded-lg">
          <p class="text-green-800">
            Aduan anda telah berjaya dihantar. Nombor siri aduan anda ialah:
          </p>
          <p class="text-2xl font-bold text-green-700 mt-2">{{ nomorSiri }}</p>
        </div>
      </template>
    </rs-card>
  </div>
</template>
