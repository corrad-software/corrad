<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useDebounceFn } from "@vueuse/core";
import mermaid from "mermaid";

definePageMeta({
  title: "Markdown Editor",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Markdown",
      path: "current",
    },
  ],
});

const toolbar = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

const markdownContent = ref(
  "# Welcome to the Markdown Editor\n\nStart typing your markdown here..."
);
const previewActive = ref(true);

const isFullscreen = ref(false);

const showModalRepo = ref(false);
const repoList = ref([]);

const openModal = async () => {
  try {
    const { data } = await useFetch("/api/ai/repository/list", {
      method: "GET",
    });

    if (data.value.statusCode == 200) {
      repoList.value = data.value.data;
    }

    showModalRepo.value = true;
  } catch (error) {
    console.log(error);
  }
};

// Modify the toggleFullscreen function
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  previewActive.value = true;
  nextTick(() => {
    renderMermaidDiagrams();
  });
};

// Initialize mermaid
mermaid.initialize({ startOnLoad: true });

const compiledMarkdown = computed(() => {
  const rawHtml = marked(markdownContent.value);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  // Process mermaid diagrams
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitizedHtml;

  const mermaidDiagrams = tempDiv.getElementsByClassName("language-mermaid");
  for (let i = 0; i < mermaidDiagrams.length; i++) {
    const diagramText = mermaidDiagrams[i].textContent;
    const diagramId = `mermaid-diagram-${i}`;
    mermaidDiagrams[
      i
    ].innerHTML = `<div class="mermaid" id="${diagramId}">${diagramText}</div>`;
  }

  return tempDiv.innerHTML;
});

const autosave = useDebounceFn(() => {
  localStorage.setItem("markdownContent", markdownContent.value);
}, 1000);

const updateMarkdown = (content) => {
  markdownContent.value = content;
  autosave();
};

const exportMarkdown = () => {
  const blob = new Blob([markdownContent.value], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "markdown_export.md";
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportMarkdownToWord = async () => {
  try {
    const response = await fetch("/api/ai/markdown/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markdownContent: markdownContent.value }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate Word document");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "markdown_export.docx";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Word:", error);
    // Show an error message to the user
  }
};

const renderMermaidDiagrams = () => {
  nextTick(() => {
    document.querySelectorAll(".mermaid").forEach((element) => {
      element.removeAttribute("data-processed");
    });
    mermaid.init(undefined, document.querySelectorAll(".mermaid"));
  });
};

const overwriteMarkdown = (content) => {
  markdownContent.value = content;
  autosave();
  showModalRepo.value = false;
};

// Call renderMermaidDiagrams when the preview is updated
watch(compiledMarkdown, () => {
  if (previewActive.value) {
    nextTick(() => {
      renderMermaidDiagrams();
    });
  }
});

watch(previewActive, (newValue) => {
  if (newValue) {
    nextTick(() => {
      renderMermaidDiagrams();
    });
  }
});

onMounted(() => {
  const savedContent = localStorage.getItem("markdownContent");
  if (savedContent) {
    markdownContent.value = savedContent;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="bg-secondary rounded-t-md border border-b-0">
      <div class="flex items-center justify-between p-2 px-3">
        <div>
          <Icon
            name="material-symbols:fullscreen-rounded"
            class="!w-5 !h-5 cursor-pointer hover:text-[#1d3e5d]"
            @click="toggleFullscreen"
          />
        </div>
        <div class="flex gap-5 items-center">
          <Icon
            name="material-symbols:markdown-outline"
            class="!w-6 !h-6 cursor-pointer hover:text-[#1d3e5d]"
            @click="exportMarkdown"
          />
          <Icon
            name="bi:filetype-docx"
            class="!w-5 !h-5 cursor-pointer hover:text-[#1d3e5d]"
            @click="exportMarkdownToWord"
          />

          <rs-button @click="openModal"> Import Repository </rs-button>
        </div>
      </div>
    </div>
    <div v-if="!isFullscreen" class="flex w-full h-[70dvh]">
      <div class="flex-1 border-0 bg-white">
        <client-only>
          <QuillEditor
            v-model:content="markdownContent"
            contentType="text"
            :toolbar="toolbar"
            theme="snow"
            @update:content="updateMarkdown"
          />
        </client-only>
      </div>
      <div class="flex-1 border border-l-0 bg-[#F3F3F3] p-2 overflow-auto">
        <div
          v-if="previewActive"
          :key="isFullscreen"
          class="markdown-preview"
          v-html="compiledMarkdown"
        ></div>
        <div v-else class="text-gray-400 italic">Preview disabled</div>
      </div>
    </div>
    <div v-else class="fixed inset-0 bg-white z-50 overflow-auto p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-end mb-4">
          <Icon
            name="mdi:close"
            class="w-6 h-6 cursor-pointer hover:text-gray-700"
            @click="toggleFullscreen"
          />
        </div>
        <div
          :key="isFullscreen"
          class="markdown-preview"
          v-html="compiledMarkdown"
        ></div>
      </div>
    </div>

    <rs-modal
      position="center"
      size="lg"
      v-model="showModalRepo"
      title="Import Repository"
    >
      <template #body>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            class="bg-[#F4F4F5] p-3 cursor-pointer rounded hover:bg-[#E5E7EB]"
            v-for="repo in repoList"
            @click="overwriteMarkdown(repo.repositoryContent)"
          >
            <div class="text-lg font-semibold">{{ repo.repositoryName }}</div>
            <div class="text-sm text-gray-500">
              {{ repo.repositoryDescription }}
            </div>
            <p class="text-sm text-info">v{{ repo.repositoryVersion }}</p>
          </div>
        </div>
      </template>
      <template #footer> </template>
    </rs-modal>
  </div>
</template>

<style scoped>
:deep(.ql-container) {
  height: 94.5% !important;
}

.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/*  New styles for markdown content   */
.markdown-preview {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
  overflow-x: auto;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
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
  margin-bottom: 16px;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-preview :deep(thead) {
  background-color: #f6f8fa;
}

.markdown-preview :deep(tr:nth-child(2n)) {
  background-color: #f8f8f8;
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
  padding: 16px;
}

.markdown-preview :deep(pre code) {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  max-width: auto;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

.markdown-preview :deep(.mermaid) {
  margin: 1em 0;
  text-align: center;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  margin: 0 0 16px;
  padding: 0 1em;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-preview :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}
</style>
