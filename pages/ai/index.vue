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
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <section>
      <h4
        class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 text-center"
      >
        CORRAD AI
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
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700',
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
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700',
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
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-500 hover:text-gray-700',
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
            ? "AI Assistants"
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
        <Icon
          :name="
            activeTab === 'assistants'
              ? 'mdi:robot-excited'
              : 'material-symbols:chat-rounded'
          "
          class="w-5 h-5"
        />
        <span>
          {{
            activeTab === "assistants"
              ? "Assistant Settings"
              : "Guide Chat Settings"
          }}</span
        >
      </rs-button>
    </div>

    <!-- Assistants Tab Content -->
    <div v-if="activeTab === 'assistants'" class="space-y-8">
      <div
        v-if="aiAssistants.length > 0"
        v-for="(category, index) in aiAssistants"
        :key="index"
      >
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          {{ category.categoryName }}
        </h3>
        <div
          v-if="category.assistantList.length > 0"
          class="grid grid-cols-1 xl:grid-cols-2 gap-4"
        >
          <FormKit
            v-for="(assistant, index2) in category.assistantList"
            :key="index2"
            type="form"
            method="POST"
            action="/api/ai/chat/create-room"
            :actions="false"
          >
            <FormKit
              type="hidden"
              name="assistantID"
              :value="assistant.assistantID"
            />
            <FormKit type="hidden" name="type" value="ASSISTANT" />
            <button
              type="submit"
              class="bg-secondary hover:bg-[rgba(var(--color-hover))] flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow-sm"
            >
              <img
                :src="assistant.assistantImg || `/img/default-thumbnail.jpg`"
                alt="Bot"
                class="h-12 w-12 rounded-xl object-cover"
              />
              <div>
                <h4 class="text-left font-bold">
                  {{ assistant.assistantName }}
                </h4>
                <p
                  class="text-left text-sm text-gray-400 line-clamp-2 min-h-[40px]"
                >
                  {{ assistant.assistantDescription }}
                </p>
              </div>
            </button>
          </FormKit>
        </div>
        <div v-else class="text-center py-8 bg-gray-50 rounded-xl">
          <Icon
            name="mdi:robot-excited-outline"
            class="w-12 h-12 text-gray-400 mx-auto mb-2"
          />
          <p class="text-gray-400">No assistants found in this category</p>
        </div>
      </div>
      <div
        v-if="aiAssistants.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <Icon
          name="mdi:robot-excited-outline"
          class="w-16 h-16 text-gray-400 mx-auto mb-3"
        />
        <p class="text-gray-400">No assistants available</p>
      </div>
    </div>

    <!-- Guide Chats Tab Content -->
    <div v-if="activeTab === 'guideChats'" class="space-y-4">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FormKit
          v-for="chat in guideChats"
          :key="chat.guideChatID"
          type="form"
          method="POST"
          action="/api/ai/chat/create-room"
          :actions="false"
        >
          <FormKit type="hidden" name="guideChatID" :value="chat.guideChatID" />
          <FormKit type="hidden" name="type" value="GUIDE_CHAT" />
          <button
            type="submit"
            class="bg-secondary hover:bg-[rgba(var(--color-hover))] flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow-sm"
          >
            <div class="bg-primary/10 p-3 rounded-xl">
              <Icon
                name="material-symbols:chat-rounded"
                class="w-6 h-6 text-primary"
              />
            </div>
            <div class="text-left">
              <h4 class="font-bold">{{ chat.guideChatName }}</h4>
              <p class="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                {{ chat.guideChatDescription }}
              </p>
              <rs-badge variant="info" class="mt-2">
                {{ chat.guideChatModel }}
              </rs-badge>
            </div>
          </button>
        </FormKit>
      </div>

      <div
        v-if="guideChats.length === 0"
        class="text-center py-12 bg-gray-50 rounded-xl"
      >
        <Icon
          name="material-symbols:chat-outline"
          class="w-16 h-16 text-gray-400 mx-auto mb-3"
        />
        <p class="text-gray-400">No guide chats found</p>
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
            class="bg-secondary hover:bg-[rgba(var(--color-hover))] flex items-center p-4 rounded-xl gap-4 cursor-pointer w-full transition-all duration-300 hover:shadow-sm"
          >
            <Icon :name="tool.icon" class="w-8 h-8 text-primary" />
            <div>
              <h4 class="text-left font-bold">{{ tool.name }}</h4>
              <p
                class="text-left text-sm text-gray-400 line-clamp-2 min-h-[20px]"
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
        <Icon name="ph:hammer" class="w-16 h-16 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-400">No tools available</p>
      </div>
    </div>
  </div>
</template>
