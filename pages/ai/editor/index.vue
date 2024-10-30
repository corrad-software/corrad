<script setup>
definePageMeta({
  title: "CORRAD Editor",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const editor = ref("");
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />
    <RsEditor v-model="editor" />
  </div>
</template>
