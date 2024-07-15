<script setup>
definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const messages = ref([
  { sender: "user", content: "Hi there! I have a question." },
  { sender: "ai", content: "Hello! How can I assist you today?" },
]);

const newMessage = ref("");
const copiedIndex = ref(null);

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ sender: "user", content: newMessage.value });
    newMessage.value = "";
  }
};

const copyToClipboard = (text, index) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copiedIndex.value = index;
      setTimeout(() => {
        copiedIndex.value = null;
      }, 2000); // Hide tooltip after 2 seconds
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

const handleEnter = (event) => {
  if (!event.shiftKey) {
    sendMessage();
  } else {
    newMessage.value += "\n";
  }
};
</script>

<template>
  <div class="flex flex-col h-[92vh] lg:h-[95vh] max-w-5xl mx-auto">
    <div class="absolute top-4 right-4 flex items-center justify-end">
      <rs-button variant="secondary" class="!text-primary mr-4">
        <Icon
          name="mdi:robot-excited-outline"
          class="!w-6 !h-6 cursor-pointer text-primary mr-2"
        />
        URS Generator AI
      </rs-button>
      <rs-button>
        <Icon
          name="material-symbols:ios-share-rounded"
          class="!w-5 !h-5 cursor-pointer"
        />
      </rs-button>
    </div>

    <!-- Scrollable conversation area -->
    <div class="flex-1 overflow-y-auto p-4 mt-12 space-y-6">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex flex-col"
      >
        <div
          class="flex items-center mb-1"
          :class="message.sender === 'user' ? 'justify-end' : ''"
        >
          <!-- <img
            :src="
              message.sender === 'ai' ? '/ai-avatar.png' : '/user-avatar.png'
            "
            :alt="message.sender === 'ai' ? 'AI' : 'User'"
            class="w-6 h-6 rounded-full mr-2"
          /> -->
          <span class="text-sm text-gray-400">
            {{ message.sender === "ai" ? "Claude" : "You" }}
          </span>
        </div>
        <div
          :class="[
            'max-w-[70%] rounded-2xl p-4',
            message.sender === 'user'
              ? 'bg-primary text-white ml-auto'
              : 'bg-secondary text-primary',
          ]"
        >
          {{ message.content }}
        </div>
        <div
          v-if="message.sender === 'ai'"
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
    </div>
    <!-- Fixed input area at the bottom -->
    <FormKit type="form" :actions="false" @submit="sendMessage">
      <div class="relative bg-secondary rounded-lg">
        <FormKit
          v-model="newMessage"
          type="textarea"
          placeholder="To start a new conversation, type here... (Shift + Enter for new line)"
          :classes="{
            outer: 'mb-0',
            inner: 'border-none',
            input:
              'w-full bg-transparent pl-4 pr-4 py-3 focus:outline-none resize-none',
          }"
          @keydown.enter.prevent="handleEnter"
          auto-height
        />
        <div class="absolute bottom-2 right-2 flex items-center space-x-2">
          <Icon name="mdi:plus-circle-outline" class="!w-6 !h-6 text-primary" />
          <rs-button btn-type="submit" class="!rounded-full">
            <Icon name="mdi:send" class="!w-3 !h-3" />
          </rs-button>
        </div>
      </div>
    </FormKit>
  </div>
</template>
