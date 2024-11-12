<script setup>
// Imports
import { marked } from "marked";
import DOMPurify from "dompurify";

// Page Meta
definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

// Composables and Refs
const ENV = useRuntimeConfig();
const { $swal, $io, $shiki } = useNuxtApp();
const projectID = useCookie("currentProject");
const threadID = useRoute().params.threadID;
const assistantID = ref("");
const user = useCookie("user");

// Initial Checks and Verifications
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

// Reactive Data
const messages = ref([]);
const newMessage = ref("");
const copiedIndex = ref(null);
const isTyping = ref(false);
const currentStreamedMessage = ref("");
const isStreaming = ref(false);
const fileAttachments = ref([]);
const isReconnecting = ref(false);
const isAutoScrolling = ref(true);
const lastScrollTop = ref(0);
const isUserScrolling = ref(false);
const isOCRProcessing = ref(false);
const ocrProgress = ref(0);
const showSavedPromptsModal = ref(false);
const savedPrompts = ref([]);
const searchQuery = ref("");
const selectedPrompt = ref(null);
const relevantDocuments = ref([]);
const showDocumentSidebar = ref(false);
const availableCollections = ref([]);
const currentCollectionName = ref("");
const isProcessing = ref(false);
const isUploadingDocument = ref(false);
const isSearchingDocuments = ref(false);
const showHelpPanel = ref(false);
const isUploadingImage = ref(false);
const isGettingImageContext = ref(false);
const uploadedImageWithContext = ref("");

// Add new refs for related questions
const relatedQuestions = ref([]);
const selectedCategory = ref("all");

// Add new ref for loading state
const isGeneratingQuestions = ref(false);

// Computed property for filtered questions
const filteredQuestions = computed(() => {
  if (selectedCategory.value === "all") {
    return relatedQuestions.value;
  }
  return relatedQuestions.value.filter(
    (q) => q.category === selectedCategory.value
  );
});

// Computed property for unique categories
const questionCategories = computed(() => {
  const categories = new Set(relatedQuestions.value.map((q) => q.category));
  return ["all", ...Array.from(categories)];
});

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
  currentCollectionName.value = verify.value.data.collectionName || "";
}

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

// Computed Properties
const filteredPrompts = computed(() => {
  return savedPrompts.value.filter(
    (prompt) =>
      prompt.promptTitle
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      prompt.promptTags.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const sidebarClasses = computed(() => {
  return showDocumentSidebar.value ? "w-1/4" : "w-0";
});

// Add new refs for animation
const showHeader = ref(false);

// Lifecycle Hooks
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
    isTyping.value = false;
  });

  $io.on("error", (errorMessage) => {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
    });
  });

  $io.on("generatingQuestions", () => {
    isGeneratingQuestions.value = true;
    scrollToBottom();
  });

  $io.on("relatedQuestions", (questions) => {
    isGeneratingQuestions.value = false;
    relatedQuestions.value = questions;
    selectedCategory.value = "all";

    scrollToBottom();
  });

  emitter.emit("updateURLThreadId", window.location.href);

  fetchSavedPrompts();
  fetchAvailableCollections();

  const messageContainer = document.querySelector(".message-container");
  if (messageContainer) {
    messageContainer.addEventListener("scroll", handleScroll);
    messageContainer.addEventListener("mousedown", handleScrollStart);
    messageContainer.addEventListener("touchstart", handleScrollStart);
    messageContainer.addEventListener("mouseup", handleScrollEnd);
    messageContainer.addEventListener("touchend", handleScrollEnd);
  }

  scrollToBottom();

  // Add animation timing
  setTimeout(() => {
    showHeader.value = true;
  }, 500); // Delay to allow initial loading animation to play

  $io.on("connectionError", (message) => {
    $swal.fire({
      icon: "warning",
      title: "Connection Error",
      text: message,
      showConfirmButton: false,
      timer: 2000,
    });
  });

  $io.on("reconnecting", (attemptNumber) => {
    // Show reconnecting status
    isReconnecting.value = true;
  });

  $io.on("reconnected", (message) => {
    isReconnecting.value = false;
    $swal.fire({
      icon: "success",
      title: "Reconnected",
      text: message,
      showConfirmButton: false,
      timer: 1500,
    });
  });

  $io.on("reconnectionFailed", (message) => {
    isReconnecting.value = false;
    $swal
      .fire({
        icon: "error",
        title: "Connection Failed",
        text: message,
        showConfirmButton: true,
        confirmButtonText: "Reload Page",
      })
      .then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
  });

  $io.on("roomJoined", (threadID) => {
    console.log(`Successfully joined room: ${threadID}`);
  });

  $io.on("roomJoinError", (message) => {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: message,
    });
  });
});

onUnmounted(() => {
  $io.emit("leaveRoom", threadID);
  $io.off("messageStart");
  $io.off("messageChunk");
  $io.off("messageEnd");
  $io.off("messageClear");
  $io.off("messageError");
  $io.off("error");
  $io.off("generatingQuestions");
  $io.off("relatedQuestions");
  emitter.emit("updateURLThreadId", "");

  const messageContainer = document.querySelector(".message-container");
  if (messageContainer) {
    messageContainer.removeEventListener("scroll", handleScroll);
    messageContainer.removeEventListener("mousedown", handleScrollStart);
    messageContainer.removeEventListener("touchstart", handleScrollStart);
    messageContainer.removeEventListener("mouseup", handleScrollEnd);
    messageContainer.removeEventListener("touchend", handleScrollEnd);
  }

  stopStreaming();

  // Clear memory
  messages.value = [];
  currentStreamedMessage.value = "";
  relevantDocuments.value = [];
});

// Watchers
watch(
  () => messages.value,
  () => {
    if (isAutoScrolling.value && !isUserScrolling.value) {
      scrollToBottom();
    }
  },
  { deep: true }
);

watch(
  () => currentCollectionName.value,
  async (newVal, oldVal) => {
    if (oldVal !== newVal) {
      await changeCollection(newVal);
    }
  }
);

// Methods
const fetchAvailableCollections = async () => {
  try {
    const { data } = await useFetch("/api/ai/chat/collection/list", {
      method: "GET",
    });

    if (data.value.statusCode === 200) {
      availableCollections.value = data.value.data;
    }
  } catch (error) {
    console.error("Error fetching available collections:", error);
  }
};

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

const processFile = async (file) => {
  const fileExtension = file.name.split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);

  if (isImage) {
    isUploadingImage.value = true;
    try {
      const base64Data = await fileToBase64(file);

      let url =
        ENV.public.server === "false"
          ? "https://app.corrad.ai/api/ai/image/upload"
          : "/api/ai/image/upload";

      const { data } = await useFetch(url, {
        method: "POST",
        body: {
          image: base64Data,
          filename: file.name,
        },
      });

      if (data.value.statusCode === 200) {
        isUploadingImage.value = false;
        isGettingImageContext.value = true;

        const { data: contextData } = await useFetch(
          "/api/ai/image/get-context",
          {
            method: "POST",
            body: {
              imagePath: data.value.path,
            },
          }
        );

        if (contextData.value.statusCode === 200) {
          isGettingImageContext.value = false;
          return {
            type: "image",
            context: contextData.value.context,
            path: data.value.path,
            filename: file.name,
          };
        } else {
          isUploadingImage.value = false;
          isGettingImageContext.value = false;
          throw new Error(
            contextData.value.message || "Failed to get image context"
          );
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      isUploadingImage.value = false;
      isGettingImageContext.value = false;
      $swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to upload image",
      });
      return null;
    }
  } else {
    // Handle non-image files (document upload and embedding)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectID", projectID.value);

    try {
      isUploadingDocument.value = true;
      const { data } = await useFetch("/api/ai/document/upload-and-embed", {
        method: "POST",
        body: formData,
      });

      if (data.value.statusCode === 200) {
        await fetchAvailableCollections();

        currentCollectionName.value = data.value.data.collectionName;

        return {
          type: "document",
          file: {
            fileId: data.value.data.itemID,
            name: data.value.data.itemName,
            originalName: file.name,
            type: file.name.split(".").pop().toLowerCase(),
          },
        };
      } else {
        $swal.fire({
          icon: "error",
          title: "Error",
          text: data.value.message,
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      $swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to upload and embed document",
      });
      return null;
    } finally {
      isUploadingDocument.value = false;
      isUploadingImage.value = false;
      isGettingImageContext.value = false;
    }
  }
};

// Add the fileToBase64 helper function
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/xxx;base64, prefix
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const sendMessage = async () => {
  if (
    newMessage.value.trim() ||
    fileAttachments.value.length > 0 ||
    selectedPrompt.value
  ) {
    showDocumentSidebar.value = false;
    relatedQuestions.value = [];
    isProcessing.value = true; // Set the processing flag

    let message = {
      sender: "user",
      content: newMessage.value.trim(),
      type: "text",
      files: [],
      path: null,
    };

    if (fileAttachments.value.length > 0) {
      for (const file of fileAttachments.value) {
        const result = await processFile(file);
        if (result.type === "image") {
          message.content = message.content
            ? `${message.content}\n\nUploaded image: ${result.filename}`
            : `Uploaded image: ${result.filename}`;
          message.path = result.path;
          uploadedImageWithContext.value = result.context;
        } else if (result && result.type === "document") {
          message.files.push(result.file);
          message.content = message.content
            ? `${message.content}\n\nUploaded document: ${result.file.name}`
            : `Uploaded document: ${result.file.name}`;
        }
      }

      if (message.files.length > 0) {
        message.type = "file";
      }

      if (message.path) {
        message.type = "image";
      }
    }

    // Search for relevant documents
    if (currentCollectionName.value) {
      await searchDocuments(newMessage.value.trim());
    }

    // Prepare document context (not shown in chat)
    const documentContext = relevantDocuments.value
      .map(
        (doc) => `Document: ${doc.metadata.filename}\nContent: ${doc.content}`
      )
      .join("\n\n");

    isStreaming.value = true;
    $io.emit("sendMessage", {
      threadID,
      assistantID: assistantID.value,
      projectID: projectID.value,
      user: user.value,
      message,
      selectedPrompt: selectedPrompt.value
        ? {
            title: selectedPrompt.value.promptTitle,
            content: selectedPrompt.value.promptContent,
          }
        : null,
      documentContext, // Pass document context separately
      uploadedImageWithContext: uploadedImageWithContext.value,
    });

    // Add user's message to the conversation
    if (message.content) {
      messages.value.push(message);
    }

    // Add selected prompt to the conversation
    if (selectedPrompt.value) {
      messages.value.push({
        sender: "user",
        content: selectedPrompt.value.promptContent,
        type: "prompt",
      });
    }

    newMessage.value = "";
    fileAttachments.value = [];
    selectedPrompt.value = null; // Clear the selected prompt after sending
    isProcessing.value = false; // Reset the processing flag
  }
};

// const downloadFile = (fileUrl, fileName) => {
//   const link = document.createElement("a");
//   link.href = fileUrl;
//   link.download = fileName;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

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

const renderMarkdown = (content, isStreaming = false) => {
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
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["data-code-id", "class"], // Allow class attribute
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

// File Functions
const chooseFile = () => {
  document.getElementById("attachments").click();
};

// const handleFileChange = (event) => {
//   const files = event.target.files;
//   if (files.length > 0) {
//     fileAttachments.value = [...fileAttachments.value, ...Array.from(files)];
//   }
// };

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    // Only take the first file
    fileAttachments.value = [files[0]];
  }
};

const removeFile = (index) => {
  fileAttachments.value.splice(index, 1);
};

// const fileToBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result.split(",")[1]);
//     reader.onerror = (error) => reject(error);
//   });
// };

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
      assistantMessageId: assistantMessage.chatProviderMessageID,
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

// Saved Prompts Functions
const fetchSavedPrompts = async () => {
  const { data } = await useFetch("/api/ai/saved-prompt/list", {
    method: "GET",
  });

  if (data.value && data.value.statusCode === 200) {
    savedPrompts.value = data.value.data;
  }
};

const selectPrompt = (prompt) => {
  selectedPrompt.value = {
    promptTitle: prompt.promptTitle,
    promptContent: prompt.promptContent,
  };

  showSavedPromptsModal.value = false;
};

const clearSelectedPrompt = () => {
  selectedPrompt.value = null;
  newMessage.value = "";
};

const openSavedPromptsModal = () => {
  showSavedPromptsModal.value = true;
};

const closeSavedPromptsModal = () => {
  showSavedPromptsModal.value = false;
};

// New method to search documents
const searchDocuments = async (query) => {
  try {
    isSearchingDocuments.value = true;
    const { data } = await useFetch("/api/ai/document/search", {
      method: "POST",
      body: {
        query,
        collectionName: currentCollectionName.value,
      },
    });

    if (data.value.statusCode === 200) {
      relevantDocuments.value = data.value.data;
    } else {
      console.error("Error searching documents:", data.value.message);
    }
  } catch (error) {
    console.error("Error searching documents:", error);
  } finally {
    isSearchingDocuments.value = false;
  }
};

const changeCollection = async (newCollectionName) => {
  try {
    const { data } = await useFetch("/api/ai/chat/collection/update", {
      method: "POST",
      body: {
        threadID: threadID,
        collectionName: newCollectionName,
      },
    });

    if (data.value.statusCode === 200) {
      currentCollectionName.value = newCollectionName;
      // $swal.fire({
      //   icon: "success",
      //   title: "Collection Changed",
      //   text: `Successfully changed to collection: ${newCollectionName}`,
      // });
    } else {
      throw new Error(data.value.message);
    }
  } catch (error) {
    console.error("Error changing collection:", error);
    $swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to change collection",
    });
  }
};

// Method to handle question selection
const selectRelatedQuestion = (questionObj) => {
  newMessage.value = questionObj.question;
  sendMessage();
};
</script>

<template>
  <div
    v-if="verify?.statusCode === 200"
    class="flex flex-col h-[88dvh] md:h-[94dvh] max-w-7xl mx-auto"
  >
    <!-- Modify the header section with transitions -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="showHeader"
        class="absolute top-2 left-16 right-4 md:left-8 flex items-center justify-between z-10 bg-[rgb(var(--bg-1))] py-2"
      >
        <div class="flex items-center">
          <button
            class="!bg-white hover:!bg-white shadow border border-[rgb(var(--border-color))] !text-primary cursor-default py-2 px-3 rounded-lg flex items-center"
          >
            <Icon
              :name="verify.data.assistantIcon || 'mdi:chat-processing-outline'"
              class="!w-5 !h-5 cursor-pointer mr-2"
            />
            {{ verify.data.assistantName }}
          </button>
        </div>
        <Icon
          @click="showHelpPanel = true"
          name="mdi:help-circle-outline"
          class="!w-6 !h-6 cursor-pointer text-primary"
        />
      </div>
    </Transition>

    <!-- Scrollable conversation area -->
    <div class="flex-1 p-4 mt-12 space-y-6 relative">
      <!-- Empty state placeholder -->
      <div
        v-if="messages.length === 0"
        class="absolute top-0 left-0 w-full flex flex-col items-center justify-center text-center min-h-[50dvh] md:min-h-[80dvh]"
      >
        <div class="flex flex-col items-center space-y-4 px-4 md:px-0">
          <Icon
            name="fluent:brain-circuit-20-regular"
            class="w-12 h-12 md:w-16 md:h-16 text-primary/50"
          />
          <div class="text-center">
            <h3 class="text-lg md:text-xl font-medium text-gray-500 mb-2">
              Chat with {{ verify.data.assistantName }}
            </h3>
            <p class="text-xs md:text-sm text-[rgba(var(--text-muted))]">
              Start a conversation by typing a message below
            </p>
          </div>
        </div>
      </div>

      <NuxtScrollbar style="max-height: 80dvh" class="message-container pr-5">
        <!-- Modified empty state placeholder -->
        <div
          v-for="(message, index) in messages"
          class="flex flex-col mb-4 md:mb-0"
        >
          <div
            class="flex items-center mb-1 mt-2"
            :class="message.sender === 'user' ? 'justify-end' : ''"
          >
            <span class="text-sm text-[rgba(var(--text-muted))]">
              {{ message.sender === "assistant" ? "Assistant" : "You" }}
            </span>
          </div>
          <div
            :class="[
              'max-w-full rounded-2xl p-4 break-words transition-all duration-200 ease-in-out',
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
                v-html="
                  renderMarkdown(
                    message.content,
                    message.sender === 'assistant' &&
                      index === messages.length - 1 &&
                      isTyping
                  )
                "
                @click="handleCopyClick"
              ></div>
              <span class="animate-pulse text-[rgba(var(--text-muted))]"
                >▋</span
              >
            </span>
            <span v-else-if="message.sender === 'assistant'">
              <div
                class="markdown-preview"
                v-html="renderMarkdown(message.content, false)"
                @click="handleCopyClick"
              ></div>
            </span>
            <span v-else>
              <p v-if="message.type === 'prompt'" class="text-sm italic mt-1">
                (Prompt: {{ message.content }})
              </p>
              <p
                v-if="message.content && message.type !== 'prompt'"
                class="whitespace-pre-wrap"
              >
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
              'flex justify-start mt-2 relative gap-2 md:gap-4',
              message.sender === 'user' ? 'justify-end' : '',
            ]"
          >
            <button
              @click="copyToClipboard(message.content, index)"
              class="text-sm text-[rgba(var(--text-muted))] hover:text-primary flex items-center"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4 mr-1" />
              <span class="hidden md:block"> Copy </span>
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
              class="text-sm text-[rgba(var(--text-muted))] hover:text-primary flex items-center"
            >
              <Icon
                name="material-symbols:markdown-paste-rounded"
                class="w-4 h-4 mr-1"
              />
              <span class="hidden md:block"> Send to editor </span>
            </button>
            <button
              v-if="
                message.sender === 'assistant' &&
                index === messages.length - 1 &&
                !isStreaming
              "
              @click="regenerateResponse(index)"
              class="text-sm text-[rgba(var(--text-muted))] hover:text-primary flex items-center"
            >
              <Icon name="mdi:refresh" class="w-4 h-4 mr-1" />
              <span class="hidden md:block"> Regenerate </span>
            </button>
          </div>
          <div
            v-if="message.type === 'info'"
            class="bg-gray-100 text-gray-600 p-2 rounded text-sm italic"
          >
            {{ message.content }}
          </div>

          <!-- Add related questions after assistant messages -->
          <div
            v-if="
              message.sender === 'assistant' &&
              index === messages.length - 1 &&
              (relatedQuestions.length > 0 || isGeneratingQuestions) &&
              !isTyping
            "
            class="related-questions-container px-4 mb-4 mt-4"
          >
            <!-- Loading state -->

            <div
              v-if="isGeneratingQuestions && relatedQuestions.length === 0"
              class="flex items-center space-x-2"
            >
              <span class="text-sm text-[rgba(var(--text-muted))]"
                >Generating related questions</span
              >
              <div class="flex space-x-1">
                <div class="animate-bounce text-[rgba(var(--text-muted))] mx-1">
                  .
                </div>
                <div
                  class="animate-bounce text-[rgba(var(--text-muted))] mx-1 animation-delay-200"
                >
                  .
                </div>
                <div
                  class="animate-bounce text-[rgba(var(--text-muted))] mx-1 animation-delay-400"
                >
                  .
                </div>
              </div>
            </div>

            <!-- Questions display (when loaded) -->
            <div v-else-if="relatedQuestions.length > 0">
              <div class="w-full mb-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-500"
                    >Related Questions:</span
                  >
                  <div class="flex gap-2">
                    <button
                      v-for="category in questionCategories"
                      :key="category"
                      @click="selectedCategory = category"
                      class="text-xs px-2 py-1 rounded-full transition-colors duration-200"
                      :class="[
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-secondary hover:bg-primary/20',
                      ]"
                    >
                      {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(question, index) in filteredQuestions"
                  :key="index"
                  @click="selectRelatedQuestion(question)"
                  class="related-question-button group relative"
                >
                  <div
                    class="flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-secondary hover:bg-primary hover:text-white transition-colors duration-200 text-left"
                  >
                    <span>{{ question.question }}</span>
                    <span
                      class="relevance-indicator"
                      :class="{
                        'bg-green-500': question.relevance === 'high',
                        'bg-yellow-500': question.relevance === 'medium',
                        'bg-gray-500': question.relevance === 'low',
                      }"
                    ></span>
                  </div>
                </button>
              </div>
            </div>
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

    <div
      v-show="
        isUploadingDocument ||
        isSearchingDocuments ||
        isUploadingImage ||
        isGettingImageContext ||
        isTyping
      "
      class="flex-1 min-h-[30px] flex items-end overflow-y-auto px-4 py-2"
    >
      <div class="flex items-center">
        <span class="text-sm text-[rgba(var(--text-muted))]">
          <template v-if="isUploadingDocument">Uploading document</template>
          <template v-else-if="isSearchingDocuments"
            >Analysing document</template
          >
          <template v-else-if="isUploadingImage">Uploading image</template>
          <template v-else-if="isGettingImageContext"
            >Getting image context</template
          >
          <template v-else-if="isTyping">Assistant is typing</template>
        </span>
        <template
          v-if="
            isUploadingDocument ||
            isSearchingDocuments ||
            isUploadingImage ||
            isGettingImageContext ||
            isTyping
          "
        >
          <div class="animate-bounce text-[rgba(var(--text-muted))] mx-1">
            .
          </div>
          <div
            class="animate-bounce text-[rgba(var(--text-muted))] mx-1 animation-delay-200"
          >
            .
          </div>
          <div
            class="animate-bounce text-[rgba(var(--text-muted))] mx-1 animation-delay-400"
          >
            .
          </div>
        </template>
        <template v-else>...</template>
      </div>
    </div>

    <!-- RsModal for Saved Prompts -->
    <RsModal
      v-model="showSavedPromptsModal"
      title="Saved Prompts"
      size="lg"
      position="center"
      :hide-footer="true"
    >
      <template #body>
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search prompts..."
            class="w-full p-2 border rounded"
          />
        </div>
        <NuxtScrollbar style="max-height: 60vh">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="prompt in filteredPrompts"
              :key="prompt.promptID"
              @click="
                selectPrompt(prompt);
                closeSavedPromptsModal();
              "
              class="p-2 border rounded cursor-pointer hover:bg-gray-100"
              :class="{
                'bg-blue-100':
                  selectedPrompt && selectedPrompt.promptID === prompt.promptID,
              }"
            >
              <h5 class="font-bold">{{ prompt.promptTitle }}</h5>
              <p class="text-xs text-gray-600">{{ prompt.promptTags }}</p>
            </div>
          </div>
        </NuxtScrollbar>
      </template>
    </RsModal>
    <!-- Fixed input area at the bottom -->
    <FormKit
      type="form"
      @submit="sendMessage"
      :actions="false"
      #default="{ value }"
    >
      <div class="flex relative mb-4 md:mb-0 gap-4">
        <div
          class="border border-[rgba(var(--border-color))] shadow rounded-lg w-full"
        >
          <FormKit
            v-model="newMessage"
            type="textarea"
            placeholder="Start typing..."
            :classes="{
              outer: `mb-0 rounded-lg border-l-0 duration-150 ${
                isProcessing ? 'border-l-4 border-primary animate-pulse' : ''
              }`,
              inner: 'border-none',
              input:
                'w-full bg-transparent pl-4 py-3 focus:outline-none resize-none !text-primary',
            }"
            @keydown.enter.prevent="handleEnter"
            auto-height
            :max-auto-height="250"
          />
        </div>
        <div class="flex justify-between items-center space-x-2">
          <div class="relative">
            <span
              class="absolute top-[-4px] right-[-4px] text-xs text-white bg-info rounded-full px-1"
            >
              {{ relevantDocuments.length }}
            </span>
            <Icon
              @click="showDocumentSidebar = !showDocumentSidebar"
              name="mdi:file-document-outline"
              class="!w-6 !h-6 text-primary cursor-pointer hover:text-primary/60 transition-colors"
            />
          </div>

          <Icon
            @click="openSavedPromptsModal"
            name="mdi:bookmark-outline"
            class="!w-6 !h-6 text-primary cursor-pointer hover:text-primary/60 transition-colors"
          />
          <Icon
            @click="chooseFile"
            name="mdi:plus-circle-outline"
            class="!w-6 !h-6 text-primary cursor-pointer hover:text-primary/60 transition-colors"
          />
          <FormKit
            @change="handleFileChange"
            id="attachments"
            type="file"
            :classes="{
              outer: 'hidden',
            }"
            accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, application/vnd.oasis.opendocument.text, application/rtf, application/pdf, text/html, text/plain, application/epub+zip, text/markdown, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/*"
          ></FormKit>
          <rs-button
            v-if="isStreaming"
            @click="stopStreaming"
            variant="danger"
            class="!rounded-full !p-2"
          >
            <Icon name="ph:stop-fill" class="!w-3 !h-3" />
          </rs-button>
          <rs-button
            v-else
            btn-type="submit"
            class="!rounded-full hover:bg-primary/60 transition-colors !p-2"
          >
            <Icon name="mdi:send" class="!w-3 !h-3" />
          </rs-button>
        </div>
      </div>
    </FormKit>

    <!-- Display file attachments -->
    <div
      v-if="fileAttachments.length > 0"
      class="flex flex-wrap gap-2 mt-3 p-3 bg-secondary/50 backdrop-blur-sm rounded-xl border border-secondary/20 transition-all duration-300 ease-in-out"
    >
      <div class="flex items-center gap-2 w-full">
        <Icon
          name="material-symbols:attach-file"
          class="text-primary w-4 h-4"
        />
        <span class="text-sm font-medium text-primary">Attached Files</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <rs-badge
          v-for="(file, index) in fileAttachments"
          :key="index"
          class="group flex items-center gap-2 px-3 py-1.5 cursor-default"
        >
          <Icon name="ph:file-light" class="w-4 h-4" />
          <span class="text-sm truncate max-w-[200px]">{{ file.name }}</span>
          <button @click="removeFile(index)" class="hover:text-red-500">
            <Icon name="ph:x-light" class="w-4 h-4" />
          </button>
        </rs-badge>
      </div>
    </div>

    <!-- Display selected prompt -->
    <div
      v-if="selectedPrompt"
      class="flex flex-wrap gap-2 mt-3 p-3 bg-secondary/50 backdrop-blur-sm rounded-xl border border-secondary/20 transition-all duration-300 ease-in-out"
    >
      <div class="flex items-center gap-2 w-full">
        <Icon name="material-symbols:bookmark" class="text-primary w-4 h-4" />
        <span class="text-sm font-medium text-primary">Selected Prompt</span>
      </div>

      <rs-badge
        variant="info"
        class="group flex items-center gap-2 px-3 py-1.5 cursor-default"
      >
        <span class="text-sm">{{ selectedPrompt.promptTitle }}</span>
        <button @click="clearSelectedPrompt" class="hover:text-red-500">
          <Icon name="ph:x-light" class="w-4 h-4" />
        </button>
      </rs-badge>
    </div>

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
        <p
          class="mt-2 text-xs text-gray-500 dark:text-[rgba(var(--text-muted))]"
        >
          Extracting text from image...
        </p>
      </div>
    </Transition>

    <div v-if="isReconnecting" class="text-yellow-500 mb-2">
      Reconnected. Previous response was interrupted.
    </div>

    <!-- Document sidebar -->
    <div
      class="fixed top-0 right-0 h-full z-20"
      :class="[
        '!bg-secondary transition-all duration-300 overflow-hidden',
        sidebarClasses,
      ]"
    >
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Relevant Documents Collection</h3>
          <button
            @click="showDocumentSidebar = !showDocumentSidebar"
            class="text-primary"
          >
            <Icon
              :name="
                showDocumentSidebar ? 'mdi:chevron-right' : 'mdi:chevron-left'
              "
              class="w-6 h-6"
            />
          </button>
        </div>
        <div class="mb-4">
          <FormKit
            type="select"
            label="Collection"
            v-model="currentCollectionName"
            :options="availableCollections"
          />
        </div>
        <div v-if="relevantDocuments.length > 0">
          <div
            v-for="doc in relevantDocuments"
            :key="doc.documentID"
            class="mb-4 p-2 bg-gray-100 rounded border border-gray-200 bg-primary/10"
          >
            <h4 class="font-semibold">{{ doc.metadata.filename }}</h4>
            <p class="text-sm text-gray-600">
              {{ doc.content.substring(0, 50) }}...
            </p>
            <!-- <button class="text-sm mt-2">View Full Document</button> -->
          </div>
        </div>
        <div v-else class="text-gray-500">No document references found.</div>
      </div>
    </div>
    <!-- Add this near the end of your template -->
    <RsModal
      v-model="showHelpPanel"
      title="Chat Features Help"
      size="lg"
      position="center"
    >
      <template #body>
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Basic Chat Functions</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <Icon name="mdi:send" class="mr-2 text-primary w-6 h-6" />
                <div>
                  <span class="font-medium">Send message:</span>
                  <p class="text-sm text-gray-600">
                    Type your message and click the send button or press Enter
                    to send. Use Shift + Enter for a new line.
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <Icon name="ph:stop-fill" class="mr-2 text-danger w-6 h-6" />
                <div>
                  <span class="font-medium">Stop streaming:</span>
                  <p class="text-sm text-gray-600">
                    Click this button to immediately halt the AI's current
                    response if it's too long or not relevant.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">Enhanced Features</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <Icon
                  name="mdi:file-document-outline"
                  class="mr-2 text-primary w-6 h-6"
                />
                <div>
                  <span class="font-medium">View relevant documents:</span>
                  <p class="text-sm text-gray-600">
                    Access context-related files that the AI uses to provide
                    more accurate and relevant responses. Click the document
                    icon to open the sidebar.
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <Icon
                  name="mdi:bookmark-outline"
                  class="mr-2 text-primary w-6 h-6"
                />
                <div>
                  <span class="font-medium">Use saved prompts:</span>
                  <p class="text-sm text-gray-600">
                    Quick access to pre-defined messages or questions. Click the
                    bookmark icon to view and select from your saved prompts.
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <Icon
                  name="mdi:plus-circle-outline"
                  class="mr-2 text-primary w-6 h-6"
                />
                <div>
                  <span class="font-medium">Attach files:</span>
                  <p class="text-sm text-gray-600">
                    Upload images or documents for processing. The AI can
                    analyze images using OCR or reference uploaded documents in
                    its responses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">Tips and Tricks</h3>
            <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Use clear, specific language for better AI understanding.</li>
              <li>
                Experiment with different prompts to get varied responses.
              </li>
              <li>
                Utilize the document sidebar to see what context the AI is
                using.
              </li>
              <li>
                Save frequently used prompts for quick access in future
                conversations.
              </li>
              <li>
                When uploading images, ensure they are clear for better OCR
                results.
              </li>
            </ul>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-2 text-blue-700">
              Need More Help?
            </h3>
            <p class="text-sm text-blue-600">
              If you have any questions or need further assistance, don't
              hesitate to contact our support team or refer to the comprehensive
              user guide.
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <rs-button @click="showHelpPanel = false">Close</rs-button>
      </template>
    </RsModal>
  </div>
  <div v-else>
    <div class="max-w-7xl mx-auto mt-5 md:mt-12">
      <section>
        <h4
          class="text-[rgba(var(--text-muted))] text-sm font-bold uppercase tracking-wider mb-4 text-center"
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

.markdown-preview :deep(ul) {
  list-style-type: disc;
}

.markdown-preview :deep(ol) {
  list-style-type: decimal;
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

.help-panel {
  position: fixed;
  right: 20px;
  top: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.help-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
}

/* Add to existing styles */
.related-questions-container {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(var(--bg-secondary), 0.5);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  border: 1px solid rgba(var(--bg-secondary), 0.2);
  transition: all 0.3s ease-in-out;
}

.relevance-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.related-question-button:hover .relevance-indicator {
  background-color: white !important;
}

/* Add smooth scrolling */
.message-container {
  scroll-behavior: smooth;
}


/* Update tooltip styles */
.related-question-button .tooltip {
  width: max-content;
  max-width: 250px;
  z-index: 50;
}

/* Add these styles for smoother fixed positioning */
.fixed {
  backdrop-filter: blur(8px);
  background-color: rgba(var(--bg-1), 0.8);
}
</style>
