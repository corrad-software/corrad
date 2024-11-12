<script setup>
// Page Meta
definePageMeta({
  title: "Dashboard",
  description: "Dashboard",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

if (process.client) window.location.href = "/ai";
</script>

<template>
  <div></div>
</template>
