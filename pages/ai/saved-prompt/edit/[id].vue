<script setup>
definePageMeta({
  title: "Edit Saved Prompt",
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
      path: "/ai/saved-prompt",
    },
    {
      name: "Edit",
      type: "current",
    },
  ],
});

const route = useRoute();
const router = useRouter();
const { $swal } = useNuxtApp();

const promptId = route.params.id;

const form = ref({
  promptTitle: "",
  promptContent: "",
  promptDescription: "",
  promptTags: "",
});

const aiSuggestion = ref("");

const isGeneratingSuggestion = ref(false);

const fetchPrompt = async () => {
  const { data } = await useFetch(`/api/ai/saved-prompt/${promptId}`, {
    method: "GET",
  });

  if (data.value && data.value.statusCode === 200) {
    form.value = data.value.data;
  } else {
    $swal.fire({
      title: "Error",
      text: "Failed to fetch prompt data",
      icon: "error",
    });
  }
};

const generateAISuggestion = async () => {
  isGeneratingSuggestion.value = true;
  try {
    const { data } = await useFetch("/api/ai/saved-prompt/suggest", {
      method: "POST",
      body: { promptContent: form.value.promptContent },
    });

    if (data.value.statusCode === 200) {
      aiSuggestion.value = data.value.data.suggestion;
    } else {
      $swal.fire({
        title: "Error",
        text: data.value.message || "Failed to generate AI suggestion",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    $swal.fire({
      title: "Error",
      text: "An error occurred while generating AI suggestion",
      icon: "error",
    });
  } finally {
    isGeneratingSuggestion.value = false;
  }
};

const applySuggestion = () => {
  form.value.promptContent = aiSuggestion.value;
  aiSuggestion.value = "";
};

const submitForm = async (formData) => {
  try {
    const { data } = await useFetch(`/api/ai/saved-prompt/${promptId}`, {
      method: "PUT",
      body: formData,
    });

    if (data.value && data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Prompt updated successfully",
        icon: "success",
      });
      router.push("/ai/saved-prompt");
    } else {
      $swal.fire({
        title: "Error",
        text:
          data.value?.message || "An error occurred while updating the prompt",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    $swal.fire({
      title: "Error",
      text: "An error occurred while updating the prompt",
      icon: "error",
    });
  }
};

onMounted(() => {
  fetchPrompt();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" v-model="form" @submit="submitForm" :actions="false">
      <FormKit
        type="text"
        name="promptTitle"
        label="Prompt Title"
        validation="required"
      />
      <div class="relative">
        <FormKit
          type="textarea"
          name="promptContent"
          label="Prompt Content"
          validation="required"
        />
        <button
          @click="generateAISuggestion"
          type="button"
          class="absolute top-6 right-0 p-2 rounded-full hover:bg-gray-200 transition-colors"
          :disabled="isGeneratingSuggestion"
        >
          <Icon
            v-if="!isGeneratingSuggestion"
            name="mdi:robot"
            class="w-5 h-5 text-gray-600"
          />
          <div
            v-else
            class="w-5 h-5 rounded-full animate-pulse bg-primary"
          ></div>
        </button>
      </div>
      <FormKit
        type="text"
        name="promptDescription"
        label="Prompt Description"
      />
      <FormKit
        type="text"
        name="promptTags"
        label="Prompt Tags (comma-separated)"
      />

      <div v-if="aiSuggestion" class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">AI Suggestion:</h3>
        <p>{{ aiSuggestion }}</p>
        <rs-button @click="applySuggestion" type="button" class="mt-2">
          Apply Suggestion
        </rs-button>
      </div>

      <FormKit
        type="submit"
        label="Update Prompt"
        input-class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      />
    </FormKit>
  </div>
</template>
