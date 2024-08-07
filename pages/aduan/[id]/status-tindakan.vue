<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Kemas Kini Status Tindakan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const form = ref({
  noSiriAduan: `ADU-${aduanId}`,
  statusTindakan: "",
  catatan: "",
});

const statusTindakanOptions = ref([
  "Belum Diambil Tindakan",
  "Dalam Tindakan Risikan",
  "Dalam Tindakan Operasi",
  "Dalam Tindakan Bahagian",
  "Dalam Tindakan Negeri",
  "Dalam Tindakan Agensi Luar",
  "Selesai",
]);

const updateStatusTindakan = () => {
  console.log("Status Tindakan updated:", form.value);
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
          UC-ENF-01.0.9: Kemas Kini Status Tindakan
        </h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="updateStatusTindakan" :value="form">
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
            name="statusTindakan"
            type="select"
            label="Status Tindakan Baru"
            :options="statusTindakanOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E027: Sila pilih status tindakan baru.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Status Tindakan Baru<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="catatan"
            type="textarea"
            label="Catatan Kemas Kini"
            validation="max:300"
            :validation-messages="{
              max: 'ENF-E028: Catatan kemas kini melebihi had aksara.',
            }"
          />
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>
