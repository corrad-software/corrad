<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Papar Maklumat Aduan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const aduan = ref({
  noSiri: `ADU-${aduanId}`,
  namaPengadu: "John Doe",
  telefonPengadu: "+60123456789",
  emelPengadu: "john@example.com",
  tajukAduan: "Aduan Contoh",
  kategoriAduan: "Kategori 1",
  jenisAduan: "Jenis 1",
  tarikhKejadian: "2023-08-01",
  masaKejadian: "14:30",
  lokasiKejadian: "Jalan Contoh, Bandar Contoh",
  status: "Dalam Proses",
  catatan: "Ini adalah catatan untuk aduan.",
});

const searchAduan = () => {
  // Implement search functionality
};

const fetchAduanData = async () => {
  // ... existing fetch logic
};

onMounted(fetchAduanData);

const editAduan = () => {
  navigateTo(`/aduan/${aduanId}/edit`);
};

const janaMaklumat = () => {
  navigateTo(`/aduan/${aduanId}/jana`);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />

    <rs-card>
      <template #header>
        <div class="flex justify-between items-start">
          <h2 class="text-xl font-semibold">
            UC-ENF-01.0.4: Papar Maklumat Aduan
          </h2>
          <div class="flex gap-2">
            <FormKit
              type="text"
              name="searchNoSiri"
              placeholder="Masukkan No Siri Aduan"
              validation="required"
              :validation-messages="{
                required: 'ENF-E016: Sila masukkan No Siri Aduan.',
              }"
              @input="searchAduan"
            />
            <rs-button @click="searchAduan" class="ml-2">Cari</rs-button>
            <rs-button @click="janaMaklumat" variant="secondary"
              >Jana Maklumat</rs-button
            >
          </div>
        </div>
      </template>
      <template #body>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p><strong>No Siri:</strong> {{ aduan.noSiri }}</p>
            <p><strong>Nama Pengadu:</strong> {{ aduan.namaPengadu }}</p>
            <p><strong>Telefon:</strong> {{ aduan.telefonPengadu }}</p>
            <p><strong>E-mel:</strong> {{ aduan.emelPengadu }}</p>
            <p><strong>Tajuk Aduan:</strong> {{ aduan.tajukAduan }}</p>
            <p><strong>Kategori:</strong> {{ aduan.kategoriAduan }}</p>
          </div>
          <div>
            <p><strong>Jenis:</strong> {{ aduan.jenisAduan }}</p>
            <p><strong>Tarikh Kejadian:</strong> {{ aduan.tarikhKejadian }}</p>
            <p><strong>Masa Kejadian:</strong> {{ aduan.masaKejadian }}</p>
            <p><strong>Lokasi:</strong> {{ aduan.lokasiKejadian }}</p>
            <p><strong>Status:</strong> {{ aduan.status }}</p>
            <p><strong>Catatan:</strong> {{ aduan.catatan }}</p>
          </div>
        </div>
        <div class="mt-4">
          <rs-button @click="editAduan">Kemas Kini Maklumat</rs-button>
        </div>
      </template>
    </rs-card>
  </div>
</template>
