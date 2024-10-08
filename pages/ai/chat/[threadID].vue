<script setup>
import { marked } from "marked";
import DOMPurify from "dompurify";
import CryptoJS from "crypto-js";
import Tesseract from "tesseract.js";

definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { $swal, $io, $shiki } = useNuxtApp();
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
    projectID: projectID.value,
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

const isStreaming = ref(false);

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

const isReconnecting = ref(false);

const isAutoScrolling = ref(true);
const lastScrollTop = ref(0);
const isUserScrolling = ref(false);

const scrollToBottom = () => {
  nextTick(() => {
    const messageContainer = document.querySelector(".message-container");
    if (messageContainer && isAutoScrolling.value) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });
};

const handleScroll = () => {
  const messageContainer = document.querySelector(".message-container");
  if (messageContainer) {
    const { scrollTop, scrollHeight, clientHeight } = messageContainer;
    const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;

    if (isScrolledToBottom) {
      isAutoScrolling.value = true;
      isUserScrolling.value = false;
    } else if (scrollTop < lastScrollTop.value) {
      isAutoScrolling.value = false;
      isUserScrolling.value = true;
    }

    lastScrollTop.value = scrollTop;
  }
};

const handleScrollStart = () => {
  isUserScrolling.value = true;
};

const handleScrollEnd = () => {
  isUserScrolling.value = false;
};

// Socket.io setup
onMounted(() => {
  $io.emit("joinRoom", threadID);

  $io.on("previousStreamStopped", () => {
    console.log("Previous stream was stopped due to page refresh");
    isReconnecting.value = true;
    // You might want to show a message to the user here
  });

  $io.on("messageStart", () => {
    isTyping.value = true;
    currentStreamedMessage.value = "";
    if (!isReconnecting.value) {
      messages.value.push({ sender: "assistant", content: "" });
    }
    isReconnecting.value = false;
  });

  $io.on("messageChunk", (chunk) => {
    currentStreamedMessage.value += chunk;
    messages.value[messages.value.length - 1].content =
      currentStreamedMessage.value;
  });

  $io.on("messageEnd", () => {
    isTyping.value = false;
    isStreaming.value = false;
    currentStreamedMessage.value = "";
  });

  $io.on("messageClear", () => {
    emitter.emit("refreshChatList");
  });

  $io.on("messageError", (errorMessage) => {
    isTyping.value = false;
    isStreaming.value = false;
    currentStreamedMessage.value = "";
    if (messages.value[messages.value.length - 1].sender === "assistant") {
      messages.value[messages.value.length - 1] = {
        sender: "assistant",
        content: "",
        error: errorMessage,
      };
    } else {
      messages.value.push({
        sender: "assistant",
        content: "",
        error: errorMessage,
      });
    }
  });

  $io.on("streamStopped", () => {
    isStreaming.value = false;
  });

  $io.on("error", (errorMessage) => {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });
  });

  const messageContainer = document.querySelector(".message-container");
  if (messageContainer) {
    messageContainer.addEventListener("scroll", handleScroll);
    messageContainer.addEventListener("mousedown", handleScrollStart);
    messageContainer.addEventListener("touchstart", handleScrollStart);
    messageContainer.addEventListener("mouseup", handleScrollEnd);
    messageContainer.addEventListener("touchend", handleScrollEnd);
  }

  scrollToBottom();
});

onUnmounted(() => {
  $io.emit("leaveRoom", threadID);
  $io.off("messageStart");
  $io.off("messageChunk");
  $io.off("messageEnd");
  $io.off("messageClear");
  $io.off("messageError");
  $io.off("error");

  const messageContainer = document.querySelector(".message-container");
  if (messageContainer) {
    messageContainer.removeEventListener("scroll", handleScroll);
    messageContainer.removeEventListener("mousedown", handleScrollStart);
    messageContainer.removeEventListener("touchstart", handleScrollStart);
    messageContainer.removeEventListener("mouseup", handleScrollEnd);
    messageContainer.removeEventListener("touchend", handleScrollEnd);
  }

  stopStreaming();
});

watch(
  () => messages.value,
  () => {
    if (isAutoScrolling.value && !isUserScrolling.value) {
      scrollToBottom();
    }
  },
  { deep: true }
);

const isOCRProcessing = ref(false);
const ocrProgress = ref(0);

const processFile = async (file) => {
  const timestamp = Date.now();
  const fileId = CryptoJS.SHA256(timestamp + file.name + Date.now())
    .toString()
    .substr(0, 16);
  const fileExtension = file.name.split(".").pop().toLowerCase();
  const newFileName = `${timestamp}-${fileId}.${fileExtension}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // Check if the file is an image
  const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);

  if (isImage) {
    // Perform OCR on the image
    isOCRProcessing.value = true;
    ocrProgress.value = 0;

    const {
      data: { text },
    } = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          ocrProgress.value = parseInt(m.progress * 100);
        }
      },
    });

    isOCRProcessing.value = false;
    ocrProgress.value = 0;

    return { type: "image", text };
  } else {
    // Handle non-image files
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

    return {
      type: "file",
      file: {
        fileId,
        name: newFileName,
        originalName: file.name,
        type: file.type,
        url: `/uploads/${newFileName}`,
        openAIFileId: null,
      },
    };
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() || fileAttachments.value.length > 0) {
    let message = {
      sender: "user",
      content: newMessage.value.trim(),
      type: "text",
      files: [],
    };

    if (fileAttachments.value.length > 0) {
      for (const file of fileAttachments.value) {
        const result = await processFile(file);
        if (result.type === "image") {
          message.content += `\n\nImage content (OCR result): ${result.text}\n\nPlease note that this text was extracted from an image using OCR technology. The accuracy may vary depending on the image quality and complexity. Consider this context when interpreting the content.`;
        } else {
          message.files.push(result.file);
        }
      }

      if (message.files.length > 0) {
        message.type = "file";
      }
    }

    isStreaming.value = true;
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

  // If pressing Shift + Enter, add a new line
  if (event.shiftKey && event.key === "Enter") {
    newMessage.value += "\n";
  }
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
      $swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Code has been copied to clipboard",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
      $swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to copy code",
      });
    });
};

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const renderMarkdown = (content) => {
  const renderer = new marked.Renderer();

  renderer.code = (code, language) => {
    const codeContent = typeof code === "object" ? code.text : String(code);
    const uniqueId = "code-" + Math.random().toString(36).substr(2, 9);
    try {
      const highlightedCode = $shiki.codeToHtml(codeContent, {
        lang: code.lang,
        theme: "material-theme-darker",
      });

      return `
      <div class="code-block-wrapper">
        <button class="copy-button" data-code-id="${uniqueId}">
          Copy
        </button>
        <div id="${uniqueId}">${highlightedCode}</div>
      </div>
    `;
    } catch (error) {
      const highlightedCode = escapeHtml(codeContent);
      return `
      <div class="code-block-wrapper">
        <button class="copy-button" data-code-id="${uniqueId}">
          Copy
        </button>
        <pre><code id="${uniqueId}" class="language-${code.lang}">${highlightedCode}</code></pre>
      </div>
    `;
    }
  };

  const rawHtml = marked(content, { renderer });
  return DOMPurify.sanitize(rawHtml, { ADD_ATTR: ["data-code-id"] });
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

const markdownToEditor = (content) => {
  $swal
    .fire({
      title: "Send to Editor",
      text: "Do you want to send this content to the editor? This will replace the current content in the editor.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    })
    .then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem("markdownContent", content);
        navigateTo("/ai/markdown");
      }
    });
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

const regenerateResponse = async (index) => {
  try {
    const userMessage = messages.value[index - 1]; // Assuming the user message is always before the assistant's
    const assistantMessage = messages.value[index];

    // Remove the assistant's message from the UI
    messages.value.splice(index, 1);

    // Emit event to regenerate response
    $io.emit("regenerateResponse", {
      threadID,
      assistantID: assistantID.value,
      projectID: projectID.value,
      user: user.value,
      message: userMessage,
      assistantMessageId: assistantMessage.chatOAIMessageID,
    });

    // Start streaming new response
    isStreaming.value = true;
  } catch (error) {
    console.error("Error regenerating response:", error);
    messages.value.push({
      sender: "assistant",
      content: "",
      error: "Failed to regenerate response. Please try again.",
    });
  }
};

const stopStreaming = () => {
  $io.emit("stopStream", threadID);
};
</script>

<template>
  <div
    v-if="verify?.statusCode === 200"
    class="flex flex-col h-[88dvh] md:h-[94dvh] max-w-7xl mx-auto"
  >
    <div class="absolute top-4 right-4 flex items-center justify-end">
      <rs-button
        variant="secondary"
        class="!text-[rgb(var(--text-color))] mr-4 cursor-default"
      >
        <Icon
          name="mdi:robot-excited-outline"
          class="!w-6 !h-6 cursor-pointer text-primary mr-2"
        />
        {{ verify.data.assistantName }}
      </rs-button>
      <!-- <rs-button>
        <Icon
          name="material-symbols:ios-share-rounded"
          class="!w-5 !h-5 cursor-pointer"
        />
      </rs-button> -->
    </div>

    <!-- Scrollable conversation area -->
    <div class="flex-1 p-4 mt-12 space-y-6 relative">
      <NuxtScrollbar style="max-height: 80dvh" class="message-container pr-5">
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
              'max-w-full rounded-2xl p-4 break-words',
              message.sender === 'user'
                ? 'bg-primary text-white ml-auto'
                : 'bg-secondary !text-[rgb(var(--text-color))]',
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
                @click="handleCopyClick"
              ></div>
              <span class="animate-pulse text-gray-400">▋</span>
            </span>
            <span v-else-if="message.sender === 'assistant'">
              <div
                class="markdown-preview"
                v-html="renderMarkdown(message.content)"
                @click="handleCopyClick"
              ></div>
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
              <p v-if="message.content" class="whitespace-pre-wrap">
                {{ message.content }}
              </p>
            </span>
          </div>
          <div
            v-if="message.error"
            class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mt-4"
          >
            <p class="font-bold">Error</p>
            <p>{{ message.error }}</p>
            <button
              @click="regenerateResponse(index)"
              class="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <Icon name="mdi:refresh" class="w-4 h-4 mr-1" />
              Try again
            </button>
          </div>
          <div
            v-if="!message.error"
            :class="[
              'flex justify-start mt-2 relative gap-4',
              message.sender === 'user' ? 'justify-end' : '',
            ]"
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
              :class="[
                'absolute bottom-full mb-2 bg-gray-700 text-white text-xs py-1 px-2 rounded',
                message.sender === 'user' ? 'right-0' : 'left-0',
              ]"
            >
              Copied!
            </div>
            <button
              v-if="message.sender === 'assistant'"
              @click="markdownToEditor(message.content)"
              class="text-sm text-gray-400 hover:text-gray-300 flex items-center"
            >
              <Icon
                name="material-symbols:markdown-paste-rounded"
                class="w-4 h-4 mr-1"
              />
              Send to editor
            </button>
            <button
              v-if="
                message.sender === 'assistant' &&
                index === messages.length - 1 &&
                !isStreaming
              "
              @click="regenerateResponse(index)"
              class="text-sm text-gray-400 hover:text-gray-300 flex items-center"
            >
              <Icon name="mdi:refresh" class="w-4 h-4 mr-1" />
              Regenerate
            </button>
          </div>
        </div>
      </NuxtScrollbar>

      <button
        v-if="!isAutoScrolling"
        @click="
          isAutoScrolling = true;
          isUserScrolling = false;
          scrollToBottom();
        "
        class="fixed bottom-24 right-8 bg-primary text-white rounded-full p-2 shadow-lg"
      >
        <Icon name="mdi:arrow-down" class="w-6 h-6" />
      </button>
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
      <div class="relative bg-secondary rounded-lg pr-">
        <FormKit
          v-model="newMessage"
          type="textarea"
          placeholder="Type here... (Shift + Enter for new line)"
          :classes="{
            outer: 'mb-0',
            inner: 'border-none',
            input:
              'w-full bg-transparent pl-4 py-3 focus:outline-none resize-none pr-14 md:pr-20',
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
            accept="image/*"
            multiple
          ></FormKit>
          <rs-button
            v-if="isStreaming"
            @click="stopStreaming"
            variant="danger"
            class="!rounded-full"
          >
            <Icon name="ph:stop-fill" class="!w-3 !h-3" />
          </rs-button>
          <rs-button v-else btn-type="submit" class="!rounded-full">
            <Icon name="mdi:send" class="!w-3 !h-3" />
          </rs-button>
        </div>
      </div>
    </FormKit>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOCRProcessing"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-64 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >Processing image</span
          >
          <span class="text-sm font-medium text-blue-600 dark:text-blue-400"
            >{{ ocrProgress }}%</span
          >
        </div>
        <div
          class="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
            :style="{ width: `${ocrProgress}%` }"
          ></div>
        </div>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Extracting text from image...
        </p>
      </div>
    </Transition>

    <div v-if="isReconnecting" class="text-yellow-500 mb-2">
      Reconnected. Previous response was interrupted.
    </div>
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

.ocr-processing {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
}

.ocr-processing progress {
  width: 100%;
  height: 20px;
}

.message-container {
  scroll-behavior: smooth;
}
</style>
