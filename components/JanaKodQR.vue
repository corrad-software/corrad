<script setup>
import { ref, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  noSiriAduan: {
    type: String,
    required: true,
  },
  maklumatPengadu: {
    type: Object,
    required: true,
  },
});

const qrCodeDataUrl = ref("");

onMounted(async () => {
  const qrData = JSON.stringify({
    noSiriAduan: props.noSiriAduan,
    maklumatPengadu: props.maklumatPengadu,
  });

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(qrData);
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
});
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-2">UC-ENF-01.0.8: Jana Kod QR</h3>
    <p class="mb-2"><strong>No Siri Aduan:</strong> {{ noSiriAduan }}</p>
    <div v-if="qrCodeDataUrl" class="mt-4">
      <img :src="qrCodeDataUrl" alt="QR Code" />
    </div>
    <div v-else class="mt-4 text-red-500">Error generating QR code.</div>
  </div>
</template>
