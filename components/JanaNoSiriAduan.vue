<script setup>
const props = defineProps({
  kodCawangan: {
    type: String,
    required: true,
  },
  tarikhAduan: {
    type: String,
    required: true,
  },
  masaAduan: {
    type: String,
    required: true,
  },
});

const noSiriAduan = computed(() => {
  const formattedDate = props.tarikhAduan.replace(/-/g, "");
  const formattedTime = props.masaAduan.replace(":", "");
  return `${props.kodCawangan}-${formattedDate}-${formattedTime}`;
});
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-2">
      UC-ENF-01.0.3: Jana No Siri Aduan
    </h3>
    <p class="mb-2"><strong>Kod Cawangan:</strong> {{ kodCawangan }}</p>
    <p class="mb-2"><strong>Tarikh Aduan:</strong> {{ tarikhAduan }}</p>
    <p class="mb-2"><strong>Masa Aduan:</strong> {{ masaAduan }}</p>
    <p class="text-xl font-bold mt-4">No Siri Aduan: {{ noSiriAduan }}</p>
  </div>
</template>
