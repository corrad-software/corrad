<script setup>
definePageMeta({
  title: "Repository List",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Repository",
      type: "current",
    },
  ],
});

const repoList = ref([
  {
    name: "SRS Version 1",
    version: "1.0.0",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.",
  },
  {
    name: "DFD Latest - 20/10/2024",
    version: "1.0.0",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus.",
  },
]);
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/repository/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Repository
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="(repo, index) in repoList"
        class="bg-secondary transition-all flex justify-between items-center p-4 rounded gap-4"
      >
        <div class="flex items-center gap-4">
          <div>
            <h4 class="font-bold">{{ repo.name }}</h4>
            <p class="text-sm text-gray-400">{{ repo.description }}</p>
            <p class="text-sm text-info">v{{ repo.version }}</p>
          </div>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink to="/ai/repository/edit/1">
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
