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

const navigateToAction = (id, action) => {
  navigateTo(`/aduan/${id}/${action}`);
};
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
            <div class="flex space-x-2">
              <rs-button
                @click="$router.push(`/aduan/${value.id}`)"
                variant="primary-outline"
                size="sm"
              >
                <Icon name="mdi:eye" />
              </rs-button>
              <rs-button
                @click="navigateToAction(value.id, 'status')"
                variant="info-outline"
                size="sm"
                title="Kemas Kini Status"
              >
                <Icon name="mdi:pencil" />
              </rs-button>
              <rs-button
                @click="navigateToAction(value.id, 'syor-tindakan')"
                variant="success-outline"
                size="sm"
                title="Kemas Kini Syor Tindakan"
              >
                <Icon name="mdi:lightbulb-on" />
              </rs-button>
              <rs-button
                @click="navigateToAction(value.id, 'status-tindakan')"
                variant="warning-outline"
                size="sm"
                title="Kemas Kini Status Tindakan"
              >
                <Icon name="mdi:clipboard-check" />
              </rs-button>
              <rs-button
                @click="navigateToAction(value.id, 'tutup-fail')"
                variant="danger-outline"
                size="sm"
                title="Kemas Kini Arahan Tutup Fail"
              >
                <Icon name="mdi:folder-lock" />
              </rs-button>
            </div>
          </template>
        </rs-table>
      </template>
    </rs-card>
  </div>
</template>
