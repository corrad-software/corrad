<script setup>
definePageMeta({
  title: "Tools",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const toolCategories = [
  {
    title: "Content Management",
    description: "Tools for managing and creating content",
    tools: [
      {
        name: "Markdown Editor",
        icon: "ph:markdown-logo",
        description: "View markdown code and export the result.",
        link: "/ai/markdown",
      },
      {
        name: "Document Template",
        icon: "ph:file-doc",
        description: "Create and edit document templates.",
        link: "/ai/document-template",
      },
    ],
  },
  {
    title: "Organization & Storage",
    description: "Tools for organizing and storing your content",
    tools: [
      {
        name: "Repository",
        icon: "ph:folder-duotone",
        description: "View and manage your repository.",
        link: "/ai/repository",
      },
      {
        name: "Saved Prompt",
        icon: "ph:bookmark",
        description: "Save and manage your favorite prompts.",
        link: "/ai/saved-prompt",
      },
    ],
  },
];
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div v-for="category in toolCategories" :key="category.title" class="mb-8">
      <h3 class="text-xl font-semibold mb-4">{{ category.title }}</h3>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-4"
      >
        <NuxtLink
          v-for="tool in category.tools"
          :key="tool.name"
          :to="tool.link"
        >
          <div
            class="bg-secondary hover:bg-primary hover:text-white transition-all flex flex-col justify-between h-full p-4 rounded gap-4"
          >
            <div class="flex flex-col gap-2">
              <Icon :name="tool.icon" class="!w-8 !h-8" />
              <h4 class="font-semibold">{{ tool.name }}</h4>
              <p class="text-sm text-gray-500">
                {{ tool.description }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
