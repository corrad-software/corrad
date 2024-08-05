<script setup>
definePageMeta({
  title: "Senarai Aduan",
  layout: "default",
});

// Dummy data for complaints listing
const complaints = ref([
  {
    id: "ADU100001",
    details: "Masalah dengan sistem pendingin hawa",
    date: "2024-08-05",
    status: "Baru",
  },
  {
    id: "ADU100002",
    details: "Kerosakan lampu di lobi",
    date: "2024-08-04",
    status: "Dalam Proses",
  },
  {
    id: "ADU100003",
    details: "Kebocoran paip di tandas",
    date: "2024-08-03",
    status: "Selesai",
  },
]);

const tableFields = ["ID Aduan", "Butiran", "Tarikh", "Status", "Tindakan"];

const navigateToUpdate = (id) => {
  navigateTo(`/aduan/kemaskini/${id}`);
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Senarai Aduan</h2>
          <rs-button @click="navigateTo('/aduan/hantar')">
            Hantar Aduan Baru
          </rs-button>
        </div>
      </template>
      <template #body>
        <rs-table :data="complaints" :field="tableFields" advanced>
          <template #Status="{ text }">
            <rs-badge
              :variant="
                text === 'Baru'
                  ? 'info'
                  : text === 'Dalam Proses'
                  ? 'warning'
                  : 'success'
              "
            >
              {{ text }}
            </rs-badge>
          </template>
          <template #Tindakan="{ value }">
            <rs-button
              variant="primary-outline"
              @click="navigateToUpdate(value.id)"
            >
              Kemas Kini
            </rs-button>
          </template>
        </rs-table>
      </template>
    </rs-card>
  </div>
</template>
