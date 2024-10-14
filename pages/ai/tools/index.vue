<script setup>
definePageMeta({
  title: "Tools",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink to="/ai/markdown">
        <div
          class="bg-secondary hover:bg-primary hover:text-white transition-all flex flex-col justify-between h-full p-4 rounded gap-4"
        >
          <div class="flex flex-col gap-2">
            <Icon name="ph:markdown-logo" class="!w-8 !h-8" />
            <h4 class="font-semibold">Markdown Editor</h4>
            <p class="text-sm text-gray-500">
              View markdown code and export the result.
            </p>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink to="/ai/document-template">
        <div
          class="bg-secondary hover:bg-primary hover:text-white transition-all flex flex-col justify-between h-full p-4 rounded gap-4"
        >
          <div class="flex flex-col gap-2">
            <Icon name="ph:file-doc" class="!w-8 !h-8" />
            <h4 class="font-semibold">Document Template</h4>
            <p class="text-sm text-gray-500">
              Create and edit document templates.
            </p>
          </div>
        </div>
      </NuxtLink>
      <!-- <NuxtLink to="/ai/sfc">
        <div
          class="bg-secondary hover:bg-primary hover:text-white transition-all flex flex-col justify-between h-full p-4 rounded gap-4"
        >
          <div class="flex flex-col gap-2">
            <Icon name="ph:code" class="!w-8 !h-8" />
            <h4 class="font-semibold">Code Playground</h4>
            <p class="text-sm text-gray-500">
              Run and test your code in real-time.
            </p>
          </div>
        </div>
      </NuxtLink> -->
    </div>
  </div>
</template>
