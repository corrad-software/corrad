<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";

// Page Meta
definePageMeta({
  title: "Release Notes",
  description: "Release Notes",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

// State
const documentation = ref(null);
const loading = ref(true);
const error = ref(null);

// Markdown renderer setup
const renderMarkdown = (content) => {
  const renderer = new marked.Renderer();
  const rawHtml = marked(content);
  return DOMPurify.sanitize(rawHtml);
};

// Fetch documentation
const fetchDocumentation = async () => {
  try {
    loading.value = true;
    const { data: response } = await useFetch("/api/ai/documentation/get", {
      query: {
        documentationID: 2,
      },
    });

    if (response.value?.statusCode === 200) {
      documentation.value = response.value.data;
    } else {
      error.value = response.value?.message || "Failed to fetch documentation";
    }
  } catch (err) {
    error.value = "An error occurred while fetching the documentation";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchDocumentation();
});
</script>

<template>
  <div class="flex flex-col h-[88dvh] md:h-[94dvh] max-w-7xl mx-auto">
    <LayoutsBreadcrumbV2 />

    <NuxtScrollbar style="max-height: 80dvh" class="pr-5">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>

      <!-- Documentation Content -->
      <div
        v-else-if="documentation"
        class="markdown-preview space-y-6"
        v-html="renderMarkdown(documentation.documentationContent)"
      ></div>

      <!-- No Content State -->
      <div v-else class="text-center py-8 text-gray-500">
        No documentation content available.
      </div>
    </NuxtScrollbar>
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
