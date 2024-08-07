<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Jana Laporan dan Statistik",
  layout: "default",
});

const form = ref({
  tarikhDari: "",
  tarikhHingga: "",
  kategoriAduan: "",
});

const kategoriOptions = ref([
  "Semua",
  "Kategori 1",
  "Kategori 2",
  "Kategori 3",
]);

const generateReport = () => {
  console.log("Generating report with parameters:", form.value);
  // Implement report generation logic here
};
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">
          UC-ENF-01.0.11: Jana Laporan dan Statistik
        </h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="generateReport" :value="form">
          <FormKit
            name="tarikhDari"
            type="date"
            label="Tarikh Dari"
            validation="required"
            :validation-messages="{
              required: 'ENF-E032: Sila masukkan tarikh mula.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Tarikh Dari<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="tarikhHingga"
            type="date"
            label="Tarikh Hingga"
            validation="required"
            :validation-messages="{
              required: 'ENF-E033: Sila masukkan tarikh tamat.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Tarikh Hingga<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="kategoriAduan"
            type="select"
            label="Kategori Aduan"
            :options="kategoriOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E034: Sila pilih kategori aduan.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Kategori Aduan<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>
        </FormKit>
      </template>
    </rs-card>

    <!-- Placeholder for report display -->
    <rs-card class="mt-4">
      <template #header>
        <h3 class="text-lg font-semibold">Laporan dan Statistik</h3>
      </template>
      <template #body>
        <div v-if="form.tarikhDari && form.tarikhHingga && form.kategoriAduan">
          <p>
            Laporan untuk periode: {{ form.tarikhDari }} hingga
            {{ form.tarikhHingga }}
          </p>
          <p>Kategori: {{ form.kategoriAduan }}</p>
          <!-- Add charts, tables, or other visualizations here -->
          <div class="mt-4">
            <h4 class="text-md font-semibold">Statistik Aduan</h4>
            <ul class="list-disc list-inside">
              <li>Jumlah Aduan: 100</li>
              <li>Aduan Selesai: 75</li>
              <li>Aduan Dalam Proses: 20</li>
              <li>Aduan Baru: 5</li>
            </ul>
          </div>
          <div class="mt-4">
            <h4 class="text-md font-semibold">Graf Aduan Mengikut Kategori</h4>
            <!-- Add a chart component here -->
            <p class="text-gray-500 italic">Graf akan dipaparkan di sini</p>
          </div>
        </div>
        <p v-else class="text-gray-500 italic">
          Laporan akan dipaparkan di sini selepas parameter dipilih dan laporan
          dijana.
        </p>
      </template>
    </rs-card>
  </div>
</template>
