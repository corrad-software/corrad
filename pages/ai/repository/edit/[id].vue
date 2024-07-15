<script setup>
definePageMeta({
  title: "Edit Repository",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Repository",
      path: "/ai/repository",
    },
    {
      name: "Edit",
      type: "current",
    },
  ],
});

const id = useRoute().params.id;

console.log(id);
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false">
      <FormKit
        type="text"
        label="Name"
        placeholder="Repository A"
        validation="required"
      />
      <FormKit type="textarea" label="Description" placeholder="" />
      <FormKit
        type="text"
        label="Version"
        placeholder="1.0.0"
        validation="required"
      />
      <FormKit
        type="textarea"
        label="Content"
        placeholder="Content here..."
        validation="required"
      />
      <FormKit type="file" label="File" />

      <div class="flex justify-end gap-4">
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
