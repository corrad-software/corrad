<script setup>
definePageMeta({
  title: "Saved Prompts",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Saved Prompts",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const prompts = ref([]);

const fetchPrompts = async () => {
  const { data } = await useFetch("/api/ai/saved-prompt/list", {
    method: "GET",
  });

  if (data.value.statusCode === 200) {
    prompts.value = data.value.data;
  }
};

const deletePrompt = async (promptID) => {
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
          const { data } = await useFetch("/api/ai/saved-prompt/delete", {
            method: "POST",
            body: { promptID },
          });

          if (data.value.statusCode === 200) {
            $swal.fire({
              title: "Success",
              text: "Prompt deleted successfully",
              icon: "success",
            });
            fetchPrompts();
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
    console.error("Error deleting prompt:", error);
  }
};

onMounted(() => {
  fetchPrompts();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/saved-prompt/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Prompt
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-if="prompts.length > 0"
        v-for="prompt in prompts"
        :key="prompt.promptID"
        class="bg-white border border-[rgba(var(--border-color))] shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
      >
        <div>
          <h4 class="font-bold">{{ prompt.promptTitle }}</h4>
          <p class="text-sm text-[rgba(var(--text-muted))]">
            {{ prompt.promptDescription }}
          </p>
          <p class="text-sm">Tags: {{ prompt.promptTags }}</p>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink :to="`/ai/saved-prompt/edit/${prompt.promptID}`">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button
            variant="danger-outline"
            @click="deletePrompt(prompt.promptID)"
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
          <p class="text-center text-[rgba(var(--text-muted))]">No prompts found</p>
        </div>
      </div>
    </div>
  </div>
</template>
