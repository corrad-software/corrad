<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { $swal } = useNuxtApp();
const activeTab = ref("assistants");
const userStore = useUserStore();

const errormsg = useRoute().query.errormsg;

onMounted(() => {
  if (errormsg) {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errormsg,
    });
  }
});

const { data: dashboardData } = await useFetch("/api/ai/dashboard", {
  method: "GET",
});

const aiAssistants = computed(
  () => dashboardData.value?.data?.assistants || []
);
const guideChats = computed(() => dashboardData.value?.data?.guideChats || []);
const toolCategories = [
  {
    title: "Content Management",
    description: "Tools for managing and creating content",
    tools: [
      {
        name: "Markdown Editor",
        icon: "ph:markdown-logo",
        description: "View markdown code and export the result.",
        link: "/ai/markdown",
      },
      {
        name: "Document Template",
        icon: "ph:file-doc",
        description: "Create and edit document templates.",
        link: "/ai/document-template",
      },
    ],
  },
  {
    title: "Organization & Storage",
    description: "Tools for organizing and storing your content",
    tools: [
      {
        name: "Repository",
        icon: "ph:folder-duotone",
        description: "View and manage your repository.",
        link: "/ai/repository",
      },
      {
        name: "Saved Prompt",
        icon: "ph:bookmark",
        description: "Save and manage your favorite prompts.",
        link: "/ai/saved-prompt",
      },
    ],
  },
];

const hasPermission = () => {
  // Check if user has permission roles for Developer or Admin
  let roles = userStore.roles;

  if (roles.includes("Developer") || roles.includes("Admin")) {
    return true;
  } else {
    return false;
  }
};

const isLoading = ref(false);

const handleCreateRoom = async (formData) => {
  try {
    isLoading.value = true;

    const { data } = await useFetch("/api/ai/chat/create-room", {
      method: "POST",
      body: formData,
    });

    if (data.value?.data?.threadID) {
      navigateTo(`/ai/chat/${data.value.data.threadID}`);
    } else {
      $swal.fire({
        icon: "error",
        title: "Error",
        text: data.value?.error || "Failed to create chat room",
      });
    }
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to create chat room",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <section>
      <h4
        class="text-[rgba(var(--text-muted))] text-sm font-bold uppercase tracking-wider my-8 text-center"
      >
        Welcome to the CORRAD AI
      </h4>
    </section>

    <!-- Modern Switch-like Tabs -->
    <div class="flex justify-center mb-8 px-4">
      <div
        class="bg-secondary p-1.5 rounded-full inline-flex flex-wrap md:flex-nowrap w-full md:w-auto gap-2"
      >
        <button
          @click="activeTab = 'assistants'"
          :class="[
            'flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium',
            activeTab === 'assistants'
              ? 'bg-primary text-white shadow'
              : 'text-[rgba(var(--text-muted))] hover:text-gray-700',
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="mdi:robot-excited" class="w-5 h-5" />
            <span>Assistants</span>
          </div>
        </button>
        <button
          @click="activeTab = 'guideChats'"
          :class="[
            'flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium',
            activeTab === 'guideChats'
              ? 'bg-primary text-white shadow'
              : 'text-[rgba(var(--text-muted))] hover:text-gray-700',
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="material-symbols:chat-rounded" class="w-5 h-5" />
            <span>Guide Chats</span>
          </div>
        </button>
        <button
          @click="activeTab = 'tools'"
          :class="[
            'flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium',
            activeTab === 'tools'
              ? 'bg-primary text-white shadow'
              : 'text-[rgba(var(--text-muted))] hover:text-gray-700',
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <Icon name="ph:hammer" class="w-5 h-5" />
            <span>Tools</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Content Header -->
    <div
      class="flex flex-col md:flex-row gap-4 md:gap-0 justify-start md:justify-between items-center mb-6"
    >
      <h2 class="text-2xl font-bold text-gray-900">
        {{
          activeTab === "assistants"
            ? "Assistant"
            : activeTab === "guideChats"
            ? "Guide Chats"
            : "Tools"
        }}
      </h2>
      <rs-button
        v-if="hasPermission() && activeTab !== 'tools'"
        class="flex items-center gap-2"
        @click="
          activeTab == 'assistants'
            ? navigateTo('/ai/assistant')
            : navigateTo('/ai/guide-chat')
        "
      >
        <Icon name="ph:gear" class="w-5 h-5" />
        <span>Settings</span>
      </rs-button>
    </div>

    <!-- Assistants Tab Content -->
    <div v-if="activeTab === 'assistants'" class="space-y-8">
      <div
        v-if="aiAssistants.length > 0"
        class="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        <FormKit
          v-for="assistant in aiAssistants"
          :key="assistant.assistantID"
          type="form"
          :actions="false"
          @submit="handleCreateRoom"
        >
          <FormKit
            type="hidden"
            name="assistantID"
            :value="assistant.assistantID"
          />
          <FormKit type="hidden" name="type" value="ASSISTANT" />
          <button
            type="submit"
            class="bg-white border border-[rgba(var(--border-color))] hover:bg-secondary shadow flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow relative overflow-hidden group"
            :disabled="isLoading"
          >
            <!-- Modern Loading Overlay -->
            <div
              v-if="isLoading"
              class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"
            >
              <div class="flex flex-col items-center">
                <div class="loading-dots flex space-x-2">
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"
                  ></div>
                </div>
                <span class="text-sm text-[rgba(var(--text-muted))] mt-2"
                  >Creating chat room...</span
                >
              </div>
            </div>

            <!-- Content -->
            <div
              class="p-3 rounded-full border border-[rgba(var(--border-color))] transition-transform duration-300"
              :style="
                assistant.assistantIconColour
                  ? `background-color: ${assistant.assistantIconColour}20; border-color: ${assistant.assistantIconColour}50`
                  : 'background-color: rgba(var(--border-color)); border-color: rgba(var(--text-muted))'
              "
            >
              <Icon
                :name="assistant.assistantIcon || 'mdi:robot-excited-outline'"
                class="w-6 h-6"
                :style="
                  assistant.assistantIconColour
                    ? `color: ${assistant.assistantIconColour}`
                    : 'color: rgba(var(--text-muted))'
                "
              />
            </div>
            <div class="flex flex-col flex-1">
              <h4
                class="text-left font-bold group-hover:text-primary transition-colors line-clamp-1"
              >
                {{ assistant.assistantName }}
              </h4>
              <p
                class="text-left text-sm text-[rgba(var(--text-muted))] line-clamp-1"
              >
                {{ assistant.assistantDescription }}
              </p>
            </div>
            <!-- Modern Arrow Icon -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon
                name="material-symbols:arrow-right-alt-rounded"
                class="w-6 h-6 text-primary"
              />
            </div>
          </button>
        </FormKit>
      </div>

      <div
        v-if="aiAssistants.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <Icon
          name="mdi:robot-excited-outline"
          class="w-16 h-16 text-[rgba(var(--text-muted))] mx-auto mb-3"
        />
        <p class="text-[rgba(var(--text-muted))]">No assistants available</p>
      </div>
    </div>

    <!-- Guide Chats Tab Content -->
    <div v-if="activeTab === 'guideChats'" class="space-y-4">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FormKit
          v-for="chat in guideChats"
          :key="chat.guideChatID"
          type="form"
          :actions="false"
          @submit="handleCreateRoom"
        >
          <FormKit type="hidden" name="guideChatID" :value="chat.guideChatID" />
          <FormKit type="hidden" name="type" value="GUIDE_CHAT" />
          <button
            type="submit"
            class="bg-white border border-[rgba(var(--border-color))] hover:bg-secondary shadow flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow relative overflow-hidden group"
            :disabled="isLoading"
          >
            <!-- Modern Loading Overlay -->
            <div
              v-if="isLoading"
              class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"
            >
              <div class="flex flex-col items-center">
                <div class="loading-dots flex space-x-2">
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"
                  ></div>
                </div>
                <span class="text-sm text-[rgba(var(--text-muted))] mt-2"
                  >Creating chat room...</span
                >
              </div>
            </div>

            <!-- Content -->
            <div
              class="bg-amber-100 p-3 rounded-full border border-amber-300 transition-transform duration-300"
            >
              <Icon
                name="mdi:chat-processing-outline"
                class="w-6 h-6 text-amber-500"
              />
            </div>
            <div class="flex flex-col flex-1">
              <h4
                class="text-left font-bold group-hover:text-primary transition-colors line-clamp-1"
              >
                {{ chat.guideChatName }}
              </h4>
              <p
                class="text-left text-sm text-[rgba(var(--text-muted))] line-clamp-1"
              >
                {{ chat.guideChatDescription }}
              </p>
              <rs-badge variant="info" class="mt-2 w-fit">
                {{ chat.guideChatModel }}
              </rs-badge>
            </div>
            <!-- Modern Arrow Icon -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon
                name="material-symbols:arrow-right-alt-rounded"
                class="w-6 h-6 text-primary"
              />
            </div>
          </button>
        </FormKit>
      </div>

      <div
        v-if="guideChats.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <Icon
          name="mdi:chat-processing-outline"
          class="w-16 h-16 text-[rgba(var(--text-muted))] mx-auto mb-3"
        />
        <p class="text-[rgba(var(--text-muted))]">No guide chats found</p>
      </div>
    </div>

    <div v-if="activeTab === 'tools'" class="space-y-8">
      <div v-for="category in toolCategories" :key="category.title">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          {{ category.title }}
        </h3>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <NuxtLink
            v-for="tool in category.tools"
            :key="tool.name"
            :to="tool.link"
            class="bg-white border border-[rgba(var(--border-color))] hover:bg-secondary shadow flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow"
          >
            <div class="bg-slate-100 p-3 rounded-full border border-slate-400">
              <Icon :name="tool.icon" class="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h4 class="text-left font-bold">{{ tool.name }}</h4>
              <p
                class="text-left text-sm text-[rgba(var(--text-muted))] line-clamp-2 min-h-[20px]"
              >
                {{ tool.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div
        v-if="toolCategories.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <Icon
          name="ph:hammer"
          class="w-16 h-16 text-[rgba(var(--text-muted))] mx-auto mb-3"
        />
        <p class="text-[rgba(var(--text-muted))]">No tools available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-dots div {
  animation-duration: 0.6s;
}

/* Optional: Add a subtle pulse animation to the button when loading */
button:disabled {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
