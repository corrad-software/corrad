<script setup>
import {
  Document,
  Packer,
  Paragraph,
  Header,
  Footer,
  ImageRun,
  TextRun,
} from "docx";
import { renderAsync } from "docx-preview";

definePageMeta({
  title: "Add Document Template",
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
      path: "/ai/document-template",
    },
    {
      name: "Add",
      type: "current",
    },
  ],
});

const router = useRouter();
const {
  $swal,
  $ImageUploader,
  $ImageCompress,
  $BlotFormatter,
  $ImageDrop,
  $MagicUrl,
} = useNuxtApp();

const form = ref({
  templateName: "",
  templateDescription: "",
  templateType: "docx",
  headerContent: "",
  footerContent: "",
});

const previewContainer = ref(null);
const activeTab = ref("header");

const quillOptions = {
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link", "image"],
    ],
    imageCompressor: {
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
      imageType: "image/jpeg",
      debug: false,
    },
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      },
    },
    blotFormatter: {},
    imageDrop: true,
    magicUrl: true,
    imageResize: {
      displaySize: true,
      modules: ["Resize", "DisplaySize"],
      handleStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
    },
  },
};

const editorModules = [
  {
    name: "imageCompressor",
    module: $ImageCompress,
    options: quillOptions.modules.imageCompressor,
  },
  {
    name: "imageUploader",
    module: $ImageUploader,
    options: quillOptions.modules.imageUploader,
  },
  {
    name: "blotFormatter",
    module: $BlotFormatter,
  },
  {
    name: "imageDrop",
    module: $ImageDrop,
  },
  {
    name: "magicUrl",
    module: $MagicUrl,
  },
];

const parseContent = async (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const elements = [];

  for (const node of doc.body.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      elements.push(
        new Paragraph({ children: [new TextRun(node.textContent.trim())] })
      );
    } else if (node.nodeName === "P") {
      const paragraphChildren = [];

      for (const childNode of node.childNodes) {
        if (childNode.nodeName === "IMG") {
          try {
            let imageData;
            if (childNode.src.startsWith("data:image")) {
              const base64Data = childNode.src.split(",")[1];
              const binaryString = atob(base64Data);
              imageData = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                imageData[i] = binaryString.charCodeAt(i);
              }
            } else {
              console.log("Processing URL image");
              const response = await fetch(childNode.src);
              const blob = await response.blob();
              imageData = new Uint8Array(await blob.arrayBuffer());
            }

            // Get the dimensions from the img element
            const width =
              parseInt(childNode.style.width) || childNode.width || 200;
            const height =
              parseInt(childNode.style.height) || childNode.height || 200;

            paragraphChildren.push(
              new ImageRun({
                data: imageData,
                transformation: {
                  width,
                  height,
                },
              })
            );
          } catch (error) {
            console.error("Error processing image:", error);
          }
        } else if (childNode.nodeType === Node.TEXT_NODE) {
          if (childNode.textContent.trim()) {
            paragraphChildren.push(new TextRun(childNode.textContent.trim()));
          }
        } else if (
          childNode.nodeName === "SPAN" ||
          childNode.nodeName === "STRONG" ||
          childNode.nodeName === "EM"
        ) {
          // Handle formatted text
          paragraphChildren.push(
            new TextRun({
              text: childNode.textContent.trim(),
              bold: childNode.nodeName === "STRONG",
              italics: childNode.nodeName === "EM",
            })
          );
        }
      }

      if (paragraphChildren.length > 0) {
        elements.push(new Paragraph({ children: paragraphChildren }));
      }
    }
  }

  return elements;
};

const generatePreview = async () => {
  if (form.value.templateType === "docx") {
    try {
      const headerContent = await parseContent(form.value.headerContent);
      const footerContent = await parseContent(form.value.footerContent);

      const doc = new Document({
        sections: [
          {
            properties: {},
            headers: {
              default: new Header({
                children: headerContent,
              }),
            },
            footers: {
              default: new Footer({
                children: footerContent,
              }),
            },
            children: [new Paragraph("")],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const arrayBuffer = await blob.arrayBuffer();

      if (previewContainer.value) {
        await renderAsync(arrayBuffer, previewContainer.value);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  } else if (form.value.templateType === "pdf") {
    console.log("PDF preview not implemented yet");
  }
};

watch(
  () => [form.value.headerContent, form.value.footerContent],
  generatePreview,
  { deep: true }
);

const submitForm = async (formData) => {
  try {
    const { data } = await useFetch("/api/ai/document-template/add", {
      method: "POST",
      body: {
        templateName: formData.templateName,
        templateDescription: formData.templateDescription,
        templateType: formData.templateType,
        headerContent: formData.headerContent,
        footerContent: formData.footerContent,
        // Add these fields with empty strings as they're not in the form but expected by the API
        firstPageContent: "",
        lastPageContent: "",
        bodyContent: "",
      },
    });

    if (data.value && data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Template created successfully",
        icon: "success",
      });
      router.push("/ai/document-templates");
    } else {
      $swal.fire({
        title: "Error",
        text:
          data.value?.message || "An error occurred while saving the template",
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    $swal.fire({
      title: "Error",
      text: "An error occurred while saving the template",
      icon: "error",
    });
  }
};

onMounted(() => {
  generatePreview();
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" v-model="form" @submit="submitForm" :actions="false">
      <FormKit
        type="text"
        name="templateName"
        label="Template Name"
        validation="required"
      />
      <FormKit
        type="select"
        name="templateType"
        label="Template Type"
        :options="[
          { label: 'Please select a template type', value: '' },
          { label: 'Word Document', value: 'docx' },
        ]"
        validation="required"
      />
      <FormKit
        type="textarea"
        name="templateDescription"
        label="Template Description"
      />

      <div class="mb-4 border-b">
        <h5 class="text-sm font-bold mb-2 capitalize">
          Template {{ activeTab }} content
        </h5>
        <button
          type="button"
          v-for="tab in ['header', 'footer']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 mr-2"
          :class="{ 'bg-blue-500 text-white': activeTab === tab }"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>

      <div v-show="activeTab === 'header'" class="bg-white">
        <QuillEditor
          v-model:content="form.headerContent"
          contentType="html"
          theme="snow"
          :modules="editorModules"
          :toolbar="quillOptions.modules.toolbar"
          class="custom-quill-editor"
        />
      </div>
      <div v-show="activeTab === 'footer'" class="bg-white">
        <QuillEditor
          v-model:content="form.footerContent"
          contentType="html"
          theme="snow"
          :modules="editorModules"
          :toolbar="quillOptions.modules.toolbar"
          class="custom-quill-editor"
        />
      </div>

      <div class="mt-6">
        <h2 class="text-xl font-bold mb-2">Preview</h2>
        <div
          ref="previewContainer"
          class="border p-4 min-h-[500px] overflow-auto"
        ></div>
      </div>

      <FormKit
        type="submit"
        label="Create Template"
        input-class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      />
    </FormKit>
  </div>
</template>

<style scoped>
.ql-editor {
  min-height: 200px;
}

/* Add these new styles */
.custom-quill-editor :deep(.ql-editor img) {
  max-width: 300px;
  max-height: 300px;
  object-fit: contain;
}
</style>
