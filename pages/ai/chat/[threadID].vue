<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";
import CryptoJS from "crypto-js";

definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { $swal, $io } = useNuxtApp();
const projectID = useCookie("currentProject");
const threadID = useRoute().params.threadID;
const assistantID = ref("");
const user = useCookie("user");

const CHUNK_SIZE = 1024 * 1024;

if (!threadID) {
  $swal.fire({
    icon: "error",
    title: "Error",
    text: "Thread ID not found",
  });

  setTimeout(() => {
    navigateTo("/ai");
  }, 3000);
}

const { data: verify } = await useFetch("/api/ai/chat/verify", {
  method: "GET",
  params: {
    threadID: threadID,
  },
});

if (verify.value.statusCode !== 200) {
  $swal.fire({
    icon: "error",
    title: "Error",
    text: verify.value.message,
  });

  // Timeout to allow the error message to be displayed before redirecting
  setTimeout(() => {
    navigateTo("/ai");
  }, 3000);
} else {
  assistantID.value = verify.value.data.assistantID;
}

const messages = ref([]);
const newMessage = ref("");
const copiedIndex = ref(null);
const isTyping = ref(false);
const currentStreamedMessage = ref("");

const fileAttachments = ref([]);

const { data: history } = await useFetch("/api/ai/chat/history", {
  method: "GET",
  params: {
    threadID: threadID,
    projectID: projectID.value,
  },
});

// console.log(history.value);
if (history.value.statusCode === 200) {
  messages.value = history.value.data;
}

// Socket.io setup
onMounted(() => {
  $io.emit("joinRoom", threadID);

  $io.on("messageStart", () => {
    isTyping.value = true;
    currentStreamedMessage.value = "";
    messages.value.push({ sender: "assistant", content: "" });
  });

  $io.on("messageChunk", (chunk) => {
    currentStreamedMessage.value += chunk;
    messages.value[messages.value.length - 1].content =
      currentStreamedMessage.value;
  });

  $io.on("messageEnd", () => {
    isTyping.value = false;
    currentStreamedMessage.value = "";
  });

  $io.on("messageError", (errorMessage) => {
    isTyping.value = false;
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });
  });

  $io.on("error", (errorMessage) => {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });
  });

  scrollToBottom();
});

const scrollToBottom = () => {
  nextTick(() => {
    const messageContainer = document.querySelector(".message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });
};

watch(
  () => messages.value,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

onUnmounted(() => {
  $io.emit("leaveRoom", threadID);
  $io.off("messageStart");
  $io.off("messageChunk");
  $io.off("messageEnd");
  $io.off("messageError");
  $io.off("error");
});
const sendMessage = async () => {
  if (newMessage.value.trim() || fileAttachments.value.length > 0) {
    let message = {
      sender: "user",
      content: newMessage.value,
      type: "text",
      files: [],
    };

    if (fileAttachments.value.length > 0) {
      for (const file of fileAttachments.value) {
        const timestamp = Date.now();
        const fileId = CryptoJS.SHA256(timestamp + file.name + Date.now())
          .toString()
          .substr(0, 16);
        const fileExtension = file.name.split(".").pop();
        const newFileName = `${timestamp}-${fileId}.${fileExtension}`;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunk = file.slice(start, end);
          const chunkBase64 = await fileToBase64(chunk);

          await new Promise((resolve) => {
            $io.emit(
              "fileChunk",
              {
                fileId,
                fileName: newFileName,
                chunkIndex: i,
                totalChunks,
                chunk: chunkBase64,
              },
              resolve
            );
          });
        }

        message.files.push({
          fileId,
          name: newFileName,
          originalName: file.name,
          type: file.type,
          url: `/uploads/${newFileName}`,
          openAIFileId: null,
        });
      }

      message.type = "file";
    }

    $io.emit("sendMessage", {
      threadID,
      assistantID: assistantID.value,
      projectID: projectID.value,
      user: user.value,
      message,
    });

    messages.value.push(message);
    newMessage.value = "";
    fileAttachments.value = [];
  }
};

const downloadFile = (fileUrl, fileName) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyToClipboard = (text, index) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copiedIndex.value = index;
      setTimeout(() => (copiedIndex.value = null), 2000);
    })
    .catch((err) => console.error("Failed to copy text: ", err));
};

const handleEnter = (event) => {
  if (!event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const renderMarkdown = (content) => {
  const rawHtml = marked(content);
  return DOMPurify.sanitize(rawHtml);
};

/* FILE FUNCTIONS */

const chooseFile = () => {
  document.getElementById("attachments").click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    fileAttachments.value = [...fileAttachments.value, ...Array.from(files)];
  }
};

const removeFile = (index) => {
  fileAttachments.value.splice(index, 1);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};
</script>

<template>
  <div
    v-if="verify?.statusCode === 200"
    class="flex flex-col h-[92vh] lg:h-[94vh] max-w-7xl mx-auto"
  >
    <div class="absolute top-4 right-4 flex items-center justify-end">
      <rs-button variant="secondary" class="!text-primary mr-4">
        <Icon
          name="mdi:robot-excited-outline"
          class="!w-6 !h-6 cursor-pointer text-primary mr-2"
        />
        {{ verify.data.assistantName }}
      </rs-button>
      <rs-button>
        <Icon
          name="material-symbols:ios-share-rounded"
          class="!w-5 !h-5 cursor-pointer"
        />
      </rs-button>
    </div>

    <!-- Scrollable conversation area -->
    <div class="flex-1 p-4 mt-12 space-y-6">
      <NuxtScrollbar style="max-height: 80dvh" class="message-container">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex flex-col mb-4 md:mb-0"
        >
          <div
            class="flex items-center mb-1"
            :class="message.sender === 'user' ? 'justify-end' : ''"
          >
            <span class="text-sm text-gray-400">
              {{ message.sender === "assistant" ? "Assistant" : "You" }}
            </span>
          </div>
          <div
            :class="[
              'max-w-full md:max-w-[70%] rounded-2xl p-4',
              message.sender === 'user'
                ? 'bg-primary text-white ml-auto'
                : 'bg-secondary text-primary',
            ]"
          >
            <span
              v-if="
                message.sender === 'assistant' &&
                index === messages.length - 1 &&
                isTyping
              "
            >
              <div
                class="markdown-preview"
                v-html="renderMarkdown(message.content)"
              ></div>
              <span class="animate-pulse text-gray-400">▋</span>
            </span>
            <span
              class="markdown-preview"
              v-else-if="message.sender === 'assistant'"
            >
              <div v-html="renderMarkdown(message.content)"></div>
            </span>
            <span v-else>
              <div
                v-if="message.files && message.files.length > 0"
                class="rounded-md p-2 text-xs mb-2"
              >
                <div
                  v-for="(file, fileIndex) in message.files"
                  :key="fileIndex"
                  class="flex items-center justify-end"
                >
                  <Icon name="ph:file-light" class="mr-1 !w-4 !h-4"></Icon>
                  <span
                    class="text-sm cursor-pointer underline"
                    @click="downloadFile(file.url, file.originalName)"
                  >
                    {{ file.originalName }}
                  </span>
                </div>
              </div>
              <p v-if="message.content">
                {{ message.content }}
              </p>
            </span>
          </div>
          <div
            v-if="message.sender === 'assistant'"
            class="flex justify-start mt-2 relative"
          >
            <button
              @click="copyToClipboard(message.content, index)"
              class="text-sm text-gray-400 hover:text-gray-300 flex items-center"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4 mr-1" />
              Copy
            </button>
            <div
              v-if="copiedIndex === index"
              class="absolute left-0 bottom-full mb-2 bg-gray-700 text-white text-xs py-1 px-2 rounded"
            >
              Copied!
            </div>
          </div>
        </div>
      </NuxtScrollbar>
    </div>

    <div v-if="isTyping" class="flex items-end overflow-y-auto px-4 py-2">
      <div class="flex items-center">
        <span class="text-sm text-gray-400">Assistant is typing...</span>
        <div class="animate-bounce text-gray-400 mx-1">.</div>
        <div class="animate-bounce text-gray-400 mx-1 animation-delay-200">
          .
        </div>
        <div class="animate-bounce text-gray-400 mx-1 animation-delay-400">
          .
        </div>
      </div>
    </div>

    <div v-if="fileAttachments.length > 0" class="text-[#a6a39a] mb-2">
      <rs-badge
        v-for="(file, index) in fileAttachments"
        :key="index"
        class="mr-2 mb-2"
      >
        <Icon name="ph:file-light" class="mr-1 !w-4 !h-4"></Icon>
        {{ file.name }}
        <Icon
          @click="removeFile(index)"
          name="ph:x-light"
          class="ml-1 !w-4 !h-4 hover:bg-[#858f7d] rounded-full cursor-pointer"
        ></Icon>
      </rs-badge>
    </div>

    <!-- Fixed input area at the bottom -->
    <FormKit type="form" :actions="false" @submit="sendMessage">
      <div class="relative bg-secondary rounded-lg">
        <FormKit
          v-model="newMessage"
          type="textarea"
          placeholder="Type here... (Shift + Enter for new line)"
          :classes="{
            outer: 'mb-0',
            inner: 'border-none',
            input:
              'w-full bg-transparent pl-4 pr-4 py-3 focus:outline-none resize-none',
          }"
          @keydown.enter.prevent="handleEnter"
          auto-height
          :max-auto-height="250"
        />
        <div class="absolute bottom-2 right-2 flex items-center space-x-2">
          <Icon
            @click="chooseFile"
            name="mdi:plus-circle-outline"
            class="!w-6 !h-6 text-primary cursor-pointer"
          />
          <FormKit
            @change="handleFileChange"
            id="attachments"
            type="file"
            :classes="{
              outer: 'hidden',
            }"
            accept=".pdf,.doc,.docx,.xml,.md"
            multiple
          ></FormKit>
          <rs-button btn-type="submit" class="!rounded-full">
            <Icon name="mdi:send" class="!w-3 !h-3" />
          </rs-button>
        </div>
      </div>
    </FormKit>
  </div>
  <div v-else>
    <div class="max-w-7xl mx-auto mt-12">
      <section>
        <h4
          class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 text-center"
        >
          CORRAD AI
        </h4>
      </section>
      <div class="flex items-center justify-center h-[80vh]">
        <Icon name="mdi:robot" class="w-12 h-12 text-primary animate-spin" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Markdown styles */
/*  New styles for markdown content   */
.markdown-preview {
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
  background-color: rgb(var(--color-primary));
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
</style>
