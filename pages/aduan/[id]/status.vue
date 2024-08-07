<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Kemas Kini Status Aduan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const form = ref({
  noSiriAduan: `ADU-${aduanId}`,
  statusBaru: "",
  catatan: "",
});

const statusOptions = ref([
  "Baru",
  "Dalam Proses",
  "Siasatan",
  "Selesai",
  "Ditutup",
]);

const updateStatus = () => {
  console.log("Status updated:", form.value);
  // Implement status update logic here
  navigateTo(`/aduan/${aduanId}`);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">
          UC-ENF-01.0.5: Kemas Kini Status Aduan
        </h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="updateStatus" :value="form">
          <FormKit
            name="noSiriAduan"
            type="text"
            label="No Siri Aduan"
            disabled
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm"
              >
                No Siri Aduan
              </label>
            </template>
          </FormKit>

          <FormKit
            name="statusBaru"
            type="select"
            label="Status Baru"
            :options="statusOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E017: Sila pilih status baru.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Status Baru<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="catatan"
            type="textarea"
            label="Catatan Kemas Kini"
            validation="max:300"
            :validation-messages="{
              max: 'ENF-E018: Catatan kemas kini melebihi had aksara.',
            }"
          />
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>
