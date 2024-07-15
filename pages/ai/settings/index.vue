<script setup>
definePageMeta({
  title: "Settings",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink to="/ai/settings/project">
        <div
          class="bg-secondary hover:bg-primary hover:text-white transition-all flex items-center p-4 rounded gap-4"
        >
          <div class="flex items-center gap-2">
            <Icon name="material-symbols-light:lab-profile" class="!w-8 !h-8" />
            <h4 class="font-normal">Project Settings</h4>
          </div>
        </div>
      </NuxtLink>
    </div>

    <FormKit type="form" :actions="false">
      <FormKit
        type="text"
        label="OpenAI API Key"
        placeholder=""
        validation="required"
      />

      <div class="flex justify-end gap-4">
        <rs-button btn-type="submit">
          <Icon
            name="material-symbols:save-outline-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Save
        </rs-button>
      </div>
    </FormKit>
  </div>
</template>
