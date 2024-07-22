<script setup>
definePageMeta({
  title: "Chat Page",
  layout: "ai",
});

const { $io } = useNuxtApp();

const msg = ref("");
const messages = ref([]);

onMounted(() => {
  if (!$io) return;

  $io.emit("joinRoom", "chat");

  $io.on("message", (newMessage) => {
    messages.value.push(newMessage);
  });
});

const submitChat = () => {
  if (msg.value.trim() === "") return;

  $io.emit("message", "chat", msg.value);
  msg.value = "";
};
</script>

<template>
  <div class="chat-container">
    <div class="messages-container">
      <div v-for="(message, index) in messages" :key="index" class="message">
        {{ message }}
      </div>
    </div>
    <FormKit type="form" :actions="false" @submit="submitChat">
      <FormKit type="text" label="Chat" v-model="msg" validation="required">
        <template #label>
          <label
            class="formkit-label text-gray-700 dark:text-gray-200 block mb-2 font-semibold text-sm formkit-invalid:text-red-500"
          >
            Chat<span class="text-danger">*</span>
          </label>
        </template>
      </FormKit>
      <rs-button btn-type="submit">
        <span>Send</span>
      </rs-button>
    </FormKit>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
}

.message {
  margin-bottom: 0.5rem;
}
</style>
