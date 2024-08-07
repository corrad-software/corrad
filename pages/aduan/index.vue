<script setup>
import { ref } from "vue";

definePageMeta({
  title: "Senarai Aduan",
  layout: "default",
});

const aduanList = ref([
  { id: 1, noSiri: "ADU001", tajuk: "Aduan 1", status: "Baru" },
  { id: 2, noSiri: "ADU002", tajuk: "Aduan 2", status: "Dalam Proses" },
  // Add more dummy data as needed
]);
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Senarai Aduan</h2>
          <rs-button @click="$router.push('/aduan/hantar')"
            >Hantar Aduan Baru</rs-button
          >
        </div>
      </template>
      <template #body>
        <rs-table
          :data="aduanList"
          :field="['No Siri', 'Tajuk', 'Status', 'Tindakan']"
          advanced
        >
          <template #Tindakan="{ value }">
            <rs-button
              @click="$router.push(`/aduan/${value.id}`)"
              variant="primary-outline"
              size="sm"
            >
              Lihat
            </rs-button>
          </template>
        </rs-table>
      </template>
    </rs-card>
  </div>
</template>
