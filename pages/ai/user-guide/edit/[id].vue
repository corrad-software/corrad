<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";

definePageMeta({
  title: "Edit Documentation",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "User Guide",
      path: "/ai/user-guide",
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

const documentationId = route.params.id;

const form = ref({
  documentationContent: "",
});

const preview = ref(false);

// Markdown renderer setup
const renderMarkdown = (content) => {
  const renderer = new marked.Renderer();
  const rawHtml = marked(content);
  return DOMPurify.sanitize(rawHtml);
};

const fetchDocumentation = async () => {
  const { data } = await useFetch(`/api/ai/documentation/${documentationId}`, {
    method: "GET",
  });

  if (data.value && data.value.statusCode === 200) {
    form.value = data.value.data;
  } else {
    $swal.fire({
      title: "Error",
      text: "Failed to fetch documentation data",
      icon: "error",
    });
  }
};

const submitForm = async (formData) => {
  try {
    const { data } = await useFetch(
      `/api/ai/documentation/${documentationId}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (data.value && data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Documentation updated successfully",
        icon: "success",
      });
      router.push("/ai/user-guide");
    } else {
      $swal.fire({
        title: "Error",
        text:
          data.value?.message ||
          "An error occurred while updating the documentation",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    $swal.fire({
      title: "Error",
      text: "An error occurred while updating the documentation",
      icon: "error",
    });
  }
};

onMounted(() => {
  fetchDocumentation();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="mb-4 flex justify-start">
      <rs-button @click="preview = !preview" type="button">
        {{ preview ? "Edit Mode" : "Preview Mode" }}
      </rs-button>
    </div>

    <div v-if="!preview">
      <FormKit type="form" v-model="form" @submit="submitForm" :actions="false">
        <FormKit
          type="textarea"
          name="documentationContent"
          label="Documentation Content (Markdown)"
          validation="required"
          :rows="20"
        />

        <FormKit
          type="submit"
          label="Update Documentation"
          input-class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        />
      </FormKit>
    </div>

    <div v-else>
      <div class="markdown-preview space-y-4 border rounded-lg p-4">
        <div v-html="renderMarkdown(form.documentationContent)"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Updated Markdown styles with adjusted padding and spacing */
.markdown-preview {
  line-height: 1.6;
  max-width: 100%;
  overflow-x: hidden;
  word-wrap: break-word;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-preview :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.25em;
}

.markdown-preview :deep(p) {
  margin-bottom: 1rem;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 1.5rem; /* Reduced from 2em */
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}

.markdown-preview :deep(ul) {
  list-style-type: disc;
}

.markdown-preview :deep(ol) {
  list-style-type: decimal;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25rem;
  padding-left: 0.5rem; /* Added padding for list items */
}

.markdown-preview :deep(li > ul),
.markdown-preview :deep(li > ol) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.markdown-preview :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #f6f8fa;
}

.markdown-preview :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
}

.markdown-preview :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 3px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 1rem;
  margin: 1rem 0;
}

.markdown-preview :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-preview :deep(table th),
.markdown-preview :deep(table td) {
  border: 1px solid #dfe2e5;
  padding: 0.5rem 0.75rem;
}

.markdown-preview :deep(table th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-preview :deep(table tr:nth-child(2n)) {
  background-color: #f8f8f8;
}

.markdown-preview :deep(hr) {
  height: 1px;
  background-color: #dfe2e5;
  border: none;
  margin: 1.5rem 0;
}

/* Add responsive padding for different screen sizes */
/* @media (min-width: 768px) {
  .markdown-preview {
    padding: 0 1rem;
  }
}

@media (min-width: 1024px) {
  .markdown-preview {
    padding: 0 2rem;
  }
} */
</style>
