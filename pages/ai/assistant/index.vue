<script setup>
definePageMeta({
  title: "Assistant List",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Assistant",
      type: "current",
    },
  ],
});
const assistantList = ref([
  {
    name: "URS Generator",
    type: "Document Assistant",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.",
  },
  {
    name: "DFD Generator",
    type: "Diagram Assistant",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.",
  },
]);
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/assistant/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Assistant
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="(assistant, index) in assistantList"
        class="bg-secondary transition-all flex justify-between items-center p-4 rounded gap-4"
      >
        <div class="flex items-center gap-4">
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">{{ assistant.name }}</h4>
            <p class="text-sm text-gray-400">{{ assistant.description }}</p>
          </div>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink to="/ai/assistant/edit/1">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button variant="danger-outline">
            <Icon
              name="material-symbols:delete-forever-outline"
              class="!w-5 !h-5 cursor-pointer"
            />
          </rs-button>
        </div>
      </div>
    </div>
  </div>
</template>
