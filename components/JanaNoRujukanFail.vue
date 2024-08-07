<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  noSiriAduan: {
    type: String,
    required: true,
  },
  kodCawangan: {
    type: String,
    required: true,
  },
  tarikhAduan: {
    type: String,
    required: true,
  },
});

const noRujukanFail = computed(() => {
  const formattedDate = props.tarikhAduan.replace(/-/g, "");
  return `${props.kodCawangan}/${formattedDate}/${props.noSiriAduan}`;
});
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-2">
      UC-ENF-01.0.6: Jana No Rujukan Fail
    </h3>
    <p class="mb-2"><strong>No Siri Aduan:</strong> {{ noSiriAduan }}</p>
    <p class="mb-2"><strong>Kod Cawangan:</strong> {{ kodCawangan }}</p>
    <p class="mb-2"><strong>Tarikh Aduan:</strong> {{ tarikhAduan }}</p>
    <p class="text-xl font-bold mt-4">No Rujukan Fail: {{ noRujukanFail }}</p>
  </div>
</template>
