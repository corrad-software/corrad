<script setup>
definePageMeta({
  title: "Project Settings",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Settings",
      path: "/ai/settings",
    },
    {
      name: "Project",
      type: "current",
    },
  ],
});
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false">
      <FormKit type="text" label="Name" validation="required" />
      <FormKit type="textarea" label="Description" />

      <h4 class="my-5">Share Project with Team Members</h4>

      <label class="inline-flex items-center mb-5 cursor-pointer">
        <input type="checkbox" value="" class="sr-only peer" />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-gray-900"> Public </span>
      </label>

      <FormKit
        type="radio"
        label="View Type"
        :classes="{
          fieldset: 'border-0 !p-0',
          legend: '!font-semibold !text-sm mb-0',
          options: '!flex !flex-row gap-4 mt-3',
        }"
        :options="[
          { label: 'All Users', value: '1' },
          { label: 'Role', value: '2' },
          { label: 'User', value: '3' },
        ]"
      />

      <div class="formkit-wrapper formkit-wrapper-global">
        <label
          class="formkit-label formkit-label-global formkit-outer-text"
          for="input_10"
          >Select Users</label
        >

        <v-select
          class="formkit-vselect"
          :options="[
            { label: 'John Doe', value: 'john-doe' },
            { label: 'Jane Doe', value: 'jane-doe' },
            { label: 'John Smith', value: 'john-smith' },
          ]"
          multiple
        />
      </div>

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

<style>
.vs__deselect {
  fill: white !important;
}

.vs__dropdown-menu li:hover {
  background: rgb(var(--color-primary)) !important;
  color: white !important;
}
</style>
