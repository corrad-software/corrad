<script setup>
const route = useRoute();

definePageMeta({
  title: "Kemas Kini Aduan",
  layout: "default",
});

// Dummy data for a single complaint
const complaint = ref({
  id: route.params.id,
  details: "Masalah dengan sistem pendingin hawa",
  date: "2024-08-05",
  status: "Baru",
  updateDate: "",
});

const statusOptions = [
  { label: "Baru", value: "Baru" },
  { label: "Dalam Proses", value: "Dalam Proses" },
  { label: "Selesai", value: "Selesai" },
];

const updateComplaint = () => {
  // This would typically be an API call to update the complaint
  complaint.value.updateDate = new Date().toISOString().split("T")[0];
  // Show success message or handle errors
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">
          Kemas Kini Aduan: {{ complaint.id }}
        </h2>
      </template>
      <template #body>
        <FormKit
          type="form"
          v-model="complaint"
          @submit="updateComplaint"
          :actions="false"
        >
          <FormKit
            type="textarea"
            name="details"
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

          <FormKit
            type="select"
            name="status"
            label="Status Aduan"
            :options="statusOptions"
            validation="required"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Status Aduan
                <span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            type="date"
            name="updateDate"
            label="Tarikh Kemas Kini"
            validation="required|date_format:yyyy-MM-dd"
            :validation-messages="{
              required: 'Tarikh kemas kini diperlukan.',
              date_format: 'Format tarikh tidak sah.',
            }"
          >
            <template #label>
              <label
                class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
              >
                Tarikh Kemas Kini
                <span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <div class="flex justify-end mt-4">
            <rs-button type="submit"> Simpan Perubahan </rs-button>
          </div>
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>
