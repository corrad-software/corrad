<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Kemas Kini Arahan Tutup Fail",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const form = ref({
  noSiriAduan: `ADU-${aduanId}`,
  statusTutupFail: "",
  catatan: "",
});

const statusTutupFailOptions = ref([
  "Belum Ditutup",
  "Dalam Proses Penutupan",
  "Ditutup",
]);

const updateStatusTutupFail = () => {
  console.log("Status Tutup Fail updated:", form.value);
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
          UC-ENF-01.0.10: Kemas Kini Arahan Tutup Fail
        </h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="updateStatusTutupFail" :value="form">
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
            name="statusTutupFail"
            type="select"
            label="Status Tutup Fail"
            :options="statusTutupFailOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E030: Sila pilih status tutup fail.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Status Tutup Fail<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="catatan"
            type="textarea"
            label="Catatan Kemas Kini"
            validation="max:300"
            :validation-messages="{
              max: 'ENF-E031: Catatan kemas kini melebihi had aksara.',
            }"
          />
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>
