<script setup>
import { ref } from 'vue';

definePageMeta({
  title: "Kemas Kini Status Syor Tindakan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const form = ref({
  noSiriAduan: `ADU-${aduanId}`,
  statusSyorTindakan: '',
  catatan: '',
});

const statusSyorTindakanOptions = ref([
  'Belum Disyor',
  'Disyor untuk Tindakan',
  'Disyor untuk Tutup',
  'Dalam Siasatan Lanjut'
]);

const updateStatusSyorTindakan = () => {
  console.log('Status Syor Tindakan updated:', form.value);
  // Implement status update logic here
  navigateTo(`/aduan/${aduanId}`);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">UC-ENF-01.0.7: Kemas Kini Status Syor Tindakan</h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="updateStatusSyorTindakan" :value="form">
          <FormKit
            name="noSiriAduan"
            type="text"
            label="No Siri Aduan"
            disabled
          />
          <FormKit
            name="statusSyorTindakan"
            type="select"
            label="Status Syor Tindakan Baru"
            :options="statusSyorTindakanOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E023: Sila pilih status syor tindakan baru.'
            }"
          />
          <FormKit
            name="catatan"
            type="textarea"
            label="Catatan Kemas Kini"
            validation="max:300"
            :validation-messages="{
              max: 'ENF-E024: Catatan kemas kini melebihi had aksara.'
            }"
          />
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>