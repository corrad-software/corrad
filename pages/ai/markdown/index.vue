<script setup>
import { useWindowSize } from "vue-window-size";
import { marked } from "marked";
import { useDebounceFn } from "@vueuse/core";
import mermaid from "mermaid";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

definePageMeta({
  title: "Markdown Editor",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Markdown",
      path: "current",
    },
  ],
});

const { $shiki } = useNuxtApp();

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
const showExportModal = ref(false);
const exportType = ref("markdown");
const selectedTemplate = ref(null);
const templates = ref([]);
const repoList = ref([]);

// Initialize mermaid
mermaid.initialize({ startOnLoad: true });

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

const compiledMarkdown = computed(() => {
  const renderer = new marked.Renderer();

  renderer.code = (code, language) => {
    const codeContent = typeof code === "object" ? code.text : String(code);
    const uniqueId = "code-" + Math.random().toString(36).substr(2, 9);

    if (code.lang === "mermaid") {
      return `<div class="mermaid" id="${uniqueId}">${codeContent}</div>`;
    }

    try {
      const highlightedCode = $shiki.codeToHtml(codeContent, {
        lang: code.lang,
        theme: "material-theme-darker",
      });

      if (code.lang === "html") {
        // Create a blob with the HTML content
        const blob = new Blob([codeContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        return `
        <div class="html-preview">
          <div class="html-render">
             <div class="aspect-ratio-container">
                <iframe src="${url}" style="width: 100%; height: 500px; border: none;"></iframe>
              </div>
          </div>
        </div>`;
      }

      return `
      <div class="code-block-wrapper">
        <button class="copy-button" data-code-id="${uniqueId}">
          Copy
        </button>
        <div id="${uniqueId}">${highlightedCode}</div>
      </div>
    `;
    } catch (error) {
      console.error("Shiki highlighting error:", error);
      const escapedCode = escapeHtml(codeContent);
      return `
      <div class="code-block-wrapper">
        <button class="copy-button" data-code-id="${uniqueId}">
          Copy
        </button>
        <pre><code id="${uniqueId}" class="language-${code.lang}">${escapedCode}</code></pre>
      </div>
    `;
    }
  };

  const rawHtml = marked(markdownContent.value, { renderer });
  return rawHtml;
});

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const copyCode = (codeElement) => {
  let code;
  if (codeElement.querySelector("code")) {
    code = codeElement.querySelector("code").textContent;
  } else {
    code = codeElement.textContent;
  }
  navigator.clipboard
    .writeText(code)
    .then(() => {
      // Maybe show a "Copied!" message
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

const handleCopyClick = (event) => {
  const button = event.target.closest(".copy-button");
  if (button) {
    const codeId = button.getAttribute("data-code-id");
    const codeElement = document.getElementById(codeId);
    if (codeElement) {
      copyCode(codeElement);
    }
  }
};

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

const fetchTemplates = async () => {
  try {
    const { data } = await useFetch("/api/ai/document-template/list", {
      method: "GET",
      params: { type: exportType.value },
    });
    if (data.value.statusCode === 200) {
      templates.value = data.value.data;
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
};

const openExportModal = (type) => {
  exportType.value = type;
  showExportModal.value = true;
  fetchTemplates();
};

const exportDocument = async () => {
  if (exportType.value === "markdown") {
    exportMarkdown();
  } else if (exportType.value === "docx") {
    await exportMarkdownToWord();
  } else if (exportType.value === "pdf") {
    await exportMarkdownToPDF();
  }
  showExportModal.value = false;
};

const exportMarkdownToWord = async () => {
  try {
    await mermaid.init(undefined, document.querySelectorAll(".mermaid"));

    const mermaidDiagrams = {};
    const mermaidElements = document.querySelectorAll(".mermaid");
    let diagramCount = 0;

    for (const element of mermaidElements) {
      const svg = element.querySelector("svg");
      if (svg) {
        const scale = 4; // High resolution scale factor
        let svgWidth, svgHeight;

        // Try to get dimensions from viewBox first
        const viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
          svgWidth = vbWidth;
          svgHeight = vbHeight;
        } else {
          // Fallback to getBoundingClientRect
          const rect = svg.getBoundingClientRect();
          svgWidth = rect.width;
          svgHeight = rect.height;
        }

        const canvas = document.createElement("canvas");
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            mermaidDiagrams[diagramCount] = {
              data: canvas.toDataURL("image/png"),
              width: svgWidth,
              height: svgHeight,
              aspectRatio: svgWidth / svgHeight,
            };
            resolve();
          };
          img.onerror = reject;
          img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
        });
        diagramCount++;
      }
    }

    // New code to process HTML previews
    const htmlPreviews = {};
    const htmlElements = document.querySelectorAll(".html-preview iframe");
    let htmlCount = 0;

    for (const iframe of htmlElements) {
      const canvas = await html2canvas(iframe.contentDocument.body);
      htmlPreviews[htmlCount] = {
        data: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
        aspectRatio: canvas.width / canvas.height,
      };
      htmlCount++;
    }

    // Reset htmlCount for consistency
    htmlCount = 0;

    // Preprocess markdown to add placeholders for HTML previews
    let processedMarkdown = markdownContent.value.replace(
      /```html([\s\S]*?)```/g,
      (match, htmlCode) => {
        return `\n\n[HTML_PREVIEW_${htmlCount++}]\n\n`;
      }
    );

    // Reset diagramCount for consistency
    diagramCount = 0;

    // Preprocess markdown to add line breaks around Mermaid diagrams
    processedMarkdown = markdownContent.value.replace(
      /```mermaid([\s\S]*?)```/g,
      (match, diagramCode) => {
        return `\n\n[MERMAID_DIAGRAM_${diagramCount++}]\n\n`;
      }
    );

    // Ensure there are no consecutive blank lines (which might be interpreted as paragraph breaks)
    processedMarkdown = processedMarkdown.replace(/\n{3,}/g, "\n\n");

    const response = await fetch("/api/ai/markdown/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdownContent: processedMarkdown,
        mermaidDiagrams: mermaidDiagrams,
        htmlPreviews: htmlPreviews,
        templateId: selectedTemplate.value,
      }),
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

const exportMarkdownToPDF = async () => {
  try {
    await mermaid.init(undefined, document.querySelectorAll(".mermaid"));

    const mermaidDiagrams = {};
    const mermaidElements = document.querySelectorAll(".mermaid");
    let diagramCount = 0;

    for (const element of mermaidElements) {
      const svg = element.querySelector("svg");
      if (svg) {
        const scale = 4; // High resolution scale factor
        let svgWidth, svgHeight;

        // Try to get dimensions from viewBox first
        const viewBox = svg.getAttribute("viewBox");
        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
          svgWidth = vbWidth;
          svgHeight = vbHeight;
        } else {
          // Fallback to getBoundingClientRect
          const rect = svg.getBoundingClientRect();
          svgWidth = rect.width;
          svgHeight = rect.height;
        }

        const canvas = document.createElement("canvas");
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            mermaidDiagrams[diagramCount] = {
              data: canvas.toDataURL("image/png"),
              width: svgWidth,
              height: svgHeight,
              aspectRatio: svgWidth / svgHeight,
            };
            resolve();
          };
          img.onerror = reject;
          img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
        });
        diagramCount++;
      }
    }

    // Reset diagramCount for consistency
    diagramCount = 0;

    // Preprocess markdown to add line breaks around Mermaid diagrams
    let processedMarkdown = markdownContent.value.replace(
      /```mermaid([\s\S]*?)```/g,
      (match, diagramCode) => {
        return `\n\n[MERMAID_DIAGRAM_${diagramCount++}]\n\n`;
      }
    );

    // Ensure there are no consecutive blank lines (which might be interpreted as paragraph breaks)
    processedMarkdown = processedMarkdown.replace(/\n{3,}/g, "\n\n");

    const response = await fetch("/api/ai/markdown/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdownContent: processedMarkdown,
        mermaidDiagrams: mermaidDiagrams,
        templateId: selectedTemplate.value,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF document");
    }

    const blob = await response.blob();
    saveAs(blob, "markdown_export.pdf");
  } catch (error) {
    console.error("Error exporting to PDF:", error);
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

// Add this function to clean up the created URLs
const cleanUpBlobUrls = () => {
  document.querySelectorAll(".html-preview iframe").forEach((iframe) => {
    URL.revokeObjectURL(iframe.src);
  });
};

watch(compiledMarkdown, () => {
  if (previewActive.value) {
    nextTick(() => {
      renderMermaidDiagrams();
      // cleanUpBlobUrls(); // Clean up old URLs
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

// Don't forget to clean up when the component is destroyed
onBeforeUnmount(() => {
  cleanUpBlobUrls();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
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
          <rs-button @click="openModal"> Import from Repository </rs-button>

          <VDropdown placement="bottom-end" distance="13" name="language">
            <rs-button
              variant="secondary"
              class="!text-[rgb(var(--text-color))]"
            >
              <Icon
                name="ph:dots-three-outline-vertical-fill"
                class="!w-5 !h-5"
              />
            </rs-button>
            <template #popper>
              <ul class="header-dropdown w-full">
                <li
                  @click="exportMarkdown"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as Markdown
                </li>
                <li
                  @click="openExportModal('docx')"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as Word
                </li>
                <!-- <li
                  @click="openExportModal('pdf')"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as PDF
                </li> -->
              </ul>
            </template>
          </VDropdown>
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
          @click="handleCopyClick"
        ></div>
        <div v-else class="text-[rgba(var(--text-muted))] italic">Preview disabled</div>
      </div>
    </div>
    <div v-else class="fixed inset-0 bg-white z-50 overflow-auto p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between mb-4">
          <VDropdown placement="bottom-end" distance="13" name="language">
            <rs-button
              variant="secondary"
              class="!text-[rgb(var(--text-color))]"
            >
              <Icon
                name="ph:dots-three-outline-vertical-fill"
                class="!w-5 !h-5"
              />
            </rs-button>
            <template #popper>
              <ul class="header-dropdown w-full">
                <li
                  @click="exportMarkdown"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as Markdown
                </li>
                <li
                  @click="openExportModal('docx')"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as Word
                </li>
                <!-- <li
                  @click="openExportModal('pdf')"
                  class="flex items-center hover:bg-[rgb(var(--bg-1))] cursor-pointer py-2 px-3"
                >
                  Export as PDF
                </li> -->
              </ul>
            </template>
          </VDropdown>
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
          @click="handleCopyClick"
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

    <rs-modal
      position="center"
      size="md"
      v-model="showExportModal"
      :title="`Export as ${exportType.toUpperCase()}`"
    >
      <template #body>
        <div class="mb-4">
          <label class="block mb-2">Select Template (Optional)</label>
          <select v-model="selectedTemplate" class="w-full p-2 border rounded">
            <option :value="null">No Template</option>
            <option
              v-for="template in templates"
              :key="template.templateID"
              :value="template.templateID"
            >
              {{ template.templateName }}
            </option>
          </select>
        </div>
      </template>
      <template #footer>
        <rs-button @click="showExportModal = false" variant="secondary"
          >Cancel</rs-button
        >
        <rs-button @click="exportDocument">Export</rs-button>
      </template>
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

.markdown-preview :deep(p:not(:last-child)) {
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
  background-color: #212121;
  border-radius: 3px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
  margin-bottom: 16px;
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

.markdown-preview :deep(hr) {
  border: 0;
  border-top: 1px solid #dfe2e5;
  margin: 24px 0;
}

.markdown-preview :deep(.code-block-wrapper) {
  position: relative;
}

.markdown-preview :deep(.copy-button) {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.markdown-preview :deep(.copy-button:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

.markdown-preview :deep(pre) {
  margin: 0;
  padding: 0;
}

.markdown-preview :deep(pre code) {
  display: block;
  overflow-x: auto;
  padding: 1em;
}

.markdown-preview :deep(.html-preview) {
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 16px;
  overflow: hidden;
}

.markdown-preview :deep(.html-render) {
  padding: 16px;
}

.markdown-preview :deep(.aspect-ratio-container) {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.markdown-preview :deep(.aspect-ratio-container iframe) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
