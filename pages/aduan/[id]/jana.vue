<script setup>
definePageMeta({
  title: "Jana Maklumat Aduan",
  layout: "default",
});

const route = useRoute();
const aduanId = route.params.id;

const aduan = ref({
  noSiriAduan: "",
  kodCawangan: "",
  tarikhAduan: "",
  masaAduan: "",
  maklumatPengadu: {
    nama: "",
    noKP: "",
    alamat: "",
  },
});

// Simulated API call to fetch aduan data
const fetchAduanData = async () => {
  // In a real application, replace this with an actual API call
  // For example: const response = await fetch(`/api/aduan/${aduanId}`);
  // const data = await response.json();

  // Simulated data
  aduan.value = {
    noSiriAduan: `ADU-${aduanId}`,
    kodCawangan: "KL",
    tarikhAduan: "2023-08-15",
    masaAduan: "14:30",
    maklumatPengadu: {
      nama: "John Doe",
      noKP: "900101-01-1234",
      alamat: "Jalan Contoh, 12345 Bandar Contoh",
    },
  };
};

onMounted(fetchAduanData);
</script>

<template>
  <div>
    <LayoutsBreadcrumbV2 />
    <rs-card>
      <template #header>
        <h2 class="text-xl font-semibold">Jana Maklumat Aduan</h2>
      </template>
      <template #body>
        <div class="space-y-8">
          <div>
            <JanaNoSiriAduan
              :kodCawangan="aduan.kodCawangan"
              :tarikhAduan="aduan.tarikhAduan"
              :masaAduan="aduan.masaAduan"
            />
          </div>

          <div>
            <JanaNoRujukanFail
              :noSiriAduan="aduan.noSiriAduan"
              :kodCawangan="aduan.kodCawangan"
              :tarikhAduan="aduan.tarikhAduan"
            />
          </div>

          <div>
            <JanaKodQR
              :noSiriAduan="aduan.noSiriAduan"
              :maklumatPengadu="aduan.maklumatPengadu"
            />
          </div>
        </div>
      </template>
    </rs-card>
  </div>
</template>
