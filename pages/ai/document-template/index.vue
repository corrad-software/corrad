<script setup>
definePageMeta({
  title: "Document Templates",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Document Templates",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const templates = ref([]);

const fetchTemplates = async () => {
  const { data } = await useFetch("/api/ai/document-template/list", {
    method: "GET",
    params: { type: "all" },
  });

  if (data.value.statusCode === 200) {
    templates.value = data.value.data;
  }
};

const deleteTemplate = async (templateID) => {
  try {
    $swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { data } = await useFetch("/api/ai/document-template/delete", {
            method: "POST",
            body: { templateID },
          });

          if (data.value.statusCode === 200) {
            $swal.fire({
              title: "Success",
              text: "Template deleted successfully",
              icon: "success",
            });
            fetchTemplates();
          } else {
            $swal.fire({
              title: "Error",
              text: data.value.message,
              icon: "error",
            });
          }
        }
      });
  } catch (error) {
    console.error("Error deleting template:", error);
  }
};

onMounted(() => {
  fetchTemplates();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/document-template/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Template
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-if="templates.length > 0"
        v-for="template in templates"
        :key="template.templateID"
        class="bg-white border border-[rgba(var(--border-color))] shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
      >
        <div>
          <h4 class="font-bold">{{ template.templateName }}</h4>
          <p class="text-sm text-[rgba(var(--text-muted))]">
            {{ template.templateDescription }}
          </p>
          <p class="text-sm">Type: {{ template.templateType }}</p>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink :to="`/ai/document-template/edit/${template.templateID}`">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button
            variant="danger-outline"
            @click="deleteTemplate(template.templateID)"
          >
            <Icon
              name="material-symbols:delete-forever-outline"
              class="!w-5 !h-5 cursor-pointer"
            />
          </rs-button>
        </div>
      </div>
      <div v-else>
        <div class="bg-secondary p-4 rounded">
          <p class="text-center text-[rgba(var(--text-muted))]">
            No templates found
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
