<script setup>
import { ref } from 'vue';

definePageMeta({
  title: "Kemas Kini Maklumat Aduan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const form = ref({
  namaPengadu: 'John Doe',
  telefonPengadu: '+60123456789',
  emelPengadu: 'john@example.com',
  tajukAduan: 'Aduan Contoh',
  kategoriAduan: 'Kategori 1',
  jenisAduan: 'Jenis 1',
  tarikhKejadian: '2023-08-01',
  masaKejadian: '14:30',
  lokasiKejadian: 'Jalan Contoh, Bandar Contoh',
  catatan: 'Catatan asal',
});

const kategoriOptions = ref(['Kategori 1', 'Kategori 2', 'Kategori 3']);
const jenisOptions = ref(['Jenis 1', 'Jenis 2', 'Jenis 3']);

const updateAduan = () => {
  console.log('Aduan updated:', form.value);
  navigateTo(`/aduan/${aduanId}`);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">UC-ENF-01.0.2: Kemas Kini Maklumat Aduan</h2>
      </template>
      <template #body>
        <FormKit type="form" @submit="updateAduan" :value="form">
          <FormKit
            name="namaPengadu"
            type="text"
            label="Nama Pengadu"
            validation="required|length:3,100"
            :validation-messages="{
              required: 'ENF-E001: Nama Pengadu tidak boleh kosong.',
              length: 'Nama Pengadu mestilah antara 3 hingga 100 aksara.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Nama Pengadu<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="telefonPengadu"
            type="tel"
            label="Telefon Pengadu"
            validation="required"
            :validation-messages="{
              required: 'ENF-E002: Nombor telefon tidak boleh kosong.',
              matches: 'ENF-E002: Format nombor telefon tidak sah.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Telefon Pengadu<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="emelPengadu"
            type="email"
            label="E-mel Pengadu"
            validation="required|email"
            :validation-messages="{
              required: 'ENF-E003: E-mel tidak boleh kosong.',
              email: 'ENF-E003: Format e-mel tidak sah.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                E-mel Pengadu<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="tajukAduan"
            type="text"
            label="Tajuk Aduan"
            validation="required|length:3,150"
            :validation-messages="{
              required: 'ENF-E004: Tajuk Aduan tidak boleh kosong.',
              length: 'Tajuk Aduan mestilah antara 3 hingga 150 aksara.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Tajuk Aduan<span class="text-danger">*</span>
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
              required: 'ENF-E005: Sila pilih kategori aduan.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Kategori Aduan<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="jenisAduan"
            type="select"
            label="Jenis Aduan"
            :options="jenisOptions"
            validation="required"
            :validation-messages="{
              required: 'ENF-E006: Sila pilih jenis aduan.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Jenis Aduan<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="tarikhKejadian"
            type="date"
            label="Tarikh Kejadian"
            validation="required"
            :validation-messages="{
              required: 'ENF-E007: Sila masukkan tarikh kejadian.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Tarikh Kejadian<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="masaKejadian"
            type="time"
            label="Masa Kejadian"
            validation="required"
            :validation-messages="{
              required: 'ENF-E008: Sila masukkan masa kejadian.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Masa Kejadian<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="lokasiKejadian"
            type="textarea"
            label="Lokasi/Alamat Kejadian"
            validation="required|length:3,200"
            :validation-messages="{
              required: 'ENF-E009: Lokasi kejadian tidak boleh kosong.',
              length: 'Lokasi kejadian mestilah antara 3 hingga 200 aksara.'
            }"
          >
            <template #label>
              <label class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500">
                Lokasi/Alamat Kejadian<span class="text-danger">*</span>
              </label>
            </template>
          </FormKit>

          <FormKit
            name="catatan"
            type="textarea"
            label="Catatan"
            validation="length:3,500"
            :validation-messages="{
              length: 'ENF-E011: Catatan melebihi had aksara.'
            }"
          />
        </FormKit>
      </template>
    </rs-card>
  </div>
</template>