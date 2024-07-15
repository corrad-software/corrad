<script setup>
definePageMeta({
  title: "Add Assistant",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Assistant",
      path: "/ai/assistant",
    },
    {
      name: "Add",
      type: "current",
    },
  ],
});
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false">
      <FormKit
        type="text"
        label="Name"
        placeholder="Assistant A"
        validation="required"
      />
      <FormKit
        type="textarea"
        label="Description"
        placeholder=""
        validation="required"
      />
      <FormKit
        type="text"
        label="OpenAI Assistant ID"
        placeholder=""
        validation="required"
      />

      <div class="flex justify-end gap-4">
        <rs-button variant="success">
          <Icon
            name="material-symbols-light:refresh-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Verify Assistant
        </rs-button>
        <rs-button btn-type="submit">
          <Icon
            name="material-symbols:save-outline-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Submit
        </rs-button>
      </div>
    </FormKit>
  </div>
</template>
