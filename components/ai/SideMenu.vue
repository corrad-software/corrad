<script setup>
import { useUserStore } from "~/stores/user";
import logoLightSrc from "~/assets/img/logo/logo-word-black-ai.svg";
import logoOnlySrc from "~/assets/img/logo/logo.svg";
import logoDarkSrc from "~/assets/img/logo/logo-word-white-ai.svg";
// import defaultAvatar from "~/assets/img/avatar/bot.png";

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  isMinimized: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-minimize"]);

const { $swal } = useNuxtApp();
const userStore = useUserStore();
const showModalAddProject = ref(false);
const currentProject = useCookie("currentProject", null);
const form = reactive({
  name: "",
  description: "",
});

const projectList = ref([]);
const logoSrc = ref(logoLightSrc);
const urlThreadId = ref("");

const isDesktop = ref(true);

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024; // lg breakpoint

  // If on mobile, ensure sidebar is not minimized
  if (!isDesktop.value) {
    emit("toggle-minimize", false);
  }
};

const { data: getProjects, refresh: refreshProjectList } = await useFetch(
  "/api/ai/project/list",
  {
    method: "GET",
  }
);

if (getProjects.value.statusCode == 200) {
  projectList.value = getProjects.value.data.projectOptions;

  // Check if currentProject exists in projectOptions
  const projectExists = projectList.value.some(
    (project) => project.value === currentProject.value
  );

  if (!projectExists || !currentProject.value) {
    // If currentProject doesn't exist in projectOptions or is not set, use the default project
    currentProject.value = getProjects.value.data.defaultProject;
  }
}

const addNewProject = async () => {
  const { data: addProject } = await useFetch("/api/ai/project/add", {
    method: "POST",
    body: {
      projectName: form.name,
      projectDescription: form.description,
    },
  });

  if (addProject.value.statusCode == 200) {
    $swal.fire({
      title: "Success",
      text: "Project added successfully",
      icon: "success",
    });

    currentProject.value = addProject.value.data.projectID;
    refreshProjectList();
    form.name = "";
    form.description = "";
    showModalAddProject.value = false;
  } else {
    $swal.fire({
      title: "Error",
      text: addProject.message,
      icon: "error",
    });
  }
};

const { data: threadList, refresh: refreshChatList } = await useFetch(
  "/api/ai/chat/list",
  {
    method: "GET",
    params: {
      projectID: currentProject.value,
    },
  }
);

watch(currentProject, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // Refresh Page only when the project actually changes
    window.location.replace("/ai");
  }
});

const deleteThread = async (threadID) => {
  $swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const { data: deleteThread } = await useFetch("/api/ai/chat/delete", {
          method: "POST",
          body: {
            threadID: threadID,
          },
        });

        if (deleteThread.value.statusCode == 200) {
          // $swal.fire({
          //   title: "Success",
          //   text: "Thread deleted successfully",
          //   icon: "success",
          // });

          refreshChatList();
        } else {
          $swal.fire({
            title: "Error",
            text: deleteThread.message,
            icon: "error",
          });
        }
      }
    });
};

const hasPermission = () => {
  // Check if user has permission roles for Developer or Admin
  let roles = userStore.roles;

  if (roles.includes("Developer") || roles.includes("Admin")) {
    return true;
  } else {
    return false;
  }
};

const toggleTheme = () => {
  let theme = document.querySelector(".ai-theme");
  theme.classList.toggle("ai-theme-dark");

  const isDark = theme.classList.contains("ai-theme-dark");
  localStorage.setItem("corradai-theme", isDark ? "dark" : "light");

  logoSrc.value = isDark ? logoDarkSrc : logoLightSrc;
};

// Function to set initial theme
const setInitialTheme = () => {
  const savedTheme = localStorage.getItem("corradai-theme") || "light";
  const theme = document.querySelector(".ai-theme");

  if (savedTheme === "dark") {
    theme.classList.add("ai-theme-dark");
    logoSrc.value = logoDarkSrc;
  } else {
    theme.classList.remove("ai-theme-dark");
    logoSrc.value = logoLightSrc;
  }
};

const updateURLThreadId = (url) => {
  // console.log(url);

  if (url.includes("/ai/chat/")) {
    urlThreadId.value = url.split("/").pop();
  } else {
    urlThreadId.value = "";
  }
};

// Call setInitialTheme on component mount
onMounted(() => {
  setInitialTheme();
  handleResize(); // Call on mount to set initial state
  window.addEventListener("resize", handleResize);

  let getURL = window.location.href;
  if (getURL.includes("/ai/chat/")) {
    urlThreadId.value = getURL.split("/").pop();
  }

  emitter.on("refreshChatList", refreshChatList);
  emitter.on("updateURLThreadId", updateURLThreadId);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  emitter.off("refreshChatList", refreshChatList);
  emitter.off("updateURLThreadId", updateURLThreadId);
});
</script>

<template>
  <aside
    v-show="isOpen"
    class="fixed inset-y-0 left-0 z-30 bg-[rgb(var(--bg-2))] p-4 border-r border-[rgb(var(--border-color))] flex flex-col lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out"
    :class="[
      { '-translate-x-full': !isOpen },
      isMinimized && isDesktop ? 'w-20' : 'w-64 md:w-72',
    ]"
  >
    <button
      @click="emit('toggle-minimize')"
      class="absolute -right-4 top-6 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--bg-2))] border border-[rgb(var(--border-color))] cursor-pointer hover:bg-[rgb(var(--color-hover))] shadow transition-all duration-200"
    >
      <Icon
        :name="
          isMinimized && isDesktop
            ? 'material-symbols:keyboard-double-arrow-right-rounded'
            : 'material-symbols:keyboard-double-arrow-left-rounded'
        "
        class="w-5 h-5 text-[rgb(var(--text-color))]"
      />
    </button>

    <nuxt-link to="/ai" class="flex justify-center items-center mb-4">
      <img
        id="logo"
        class="h-10 block"
        :class="{ 'w-8 h-8 object-contain': isMinimized && isDesktop }"
        :src="isMinimized && isDesktop ? logoOnlySrc : logoSrc"
        alt="Logo"
      />
    </nuxt-link>

    <div
      v-if="!(isMinimized && isDesktop)"
      class="transition-opacity duration-300 ease-in-out"
    >
      <div class="flex gap-2">
        <FormKit
          v-if="projectList.length > 0"
          v-model="currentProject"
          type="select"
          :options="projectList"
          :classes="{
            outer: 'flex-1',
            input: 'bg-primary text-white',
          }"
          :key="projectList"
        />

        <rs-button
          class="!p-2"
          @click="showModalAddProject = !showModalAddProject"
        >
          <Icon name="material-symbols:add" />
        </rs-button>
      </div>
    </div>

    <NuxtScrollbar
      class="flex flex-col justify-between max-h-[86dvh] md:max-h-[93dvh] overflow-y-auto pb-4"
    >
      <ul class="flex flex-col gap-4">
        <li
          v-for="(thread, index) in threadList.data"
          :key="index"
          class="bg-white rounded-lg hover:bg-primary/5 border border-[rgba(var(--border-color))] shadow"
          :class="{
            '!bg-primary text-white': urlThreadId == thread.threadID,
          }"
        >
          <div class="flex items-center">
            <div
              class="flex-1 flex items-center pr-2 overflow-hidden cursor-pointer p-2 pl-3 gap-2"
              @click="navigateTo('/ai/chat/' + thread.threadID)"
            >
              <div
                class="flex items-center justify-center p-1 rounded-full border border-[rgba(var(--border-color))]"
                :class="{
                  '!border-white !bg-white/10': urlThreadId == thread.threadID,
                }"
                :style="
                  thread.assistantIconColour
                    ? `background-color: ${thread.assistantIconColour}20; border-color: ${thread.assistantIconColour}50`
                    : 'background-color: rgba(var(--border-color)); border-color: rgba(var(--text-muted))'
                "
              >
                <Icon
                  :name="thread.assistantIcon || 'mdi:chat-processing-outline'"
                  class="!w-4 !h-4 transition-all duration-300"
                  :class="{
                    '!text-white': urlThreadId == thread.threadID,
                  }"
                  :style="
                    thread.assistantIconColour
                      ? `color: ${thread.assistantIconColour}`
                      : 'color: rgba(var(--text-muted))'
                  "
                />
              </div>
              <p
                v-if="!(isMinimized && isDesktop)"
                class="w-full line-clamp-1 leading-loose whitespace-nowrap transition-all duration-300 ease-in-out"
                :class="{
                  'text-white': urlThreadId == thread.threadID,
                  'text-primary': urlThreadId != thread.threadID,
                }"
              >
                {{ thread.threadTitle }}
              </p>
            </div>
            <Icon
              v-if="!(isMinimized && isDesktop)"
              @click="deleteThread(thread.threadID)"
              name="ph:x-circle"
              class="!w-5 !h-5 hover:text-red-500 mr-3 cursor-pointer transition-opacity duration-300"
            />
          </div>
        </li>
      </ul>
    </NuxtScrollbar>

    <section class="flex-auto flex flex-col justify-end">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <template v-if="!(isMinimized && isDesktop)">
          <nuxt-link to="/ai/release-notes" class="md:col-span-4">
            <button
              class="px-3 py-2 w-full shadow rounded-lg !bg-white hover:!bg-secondary !justify-start border border-[rgba(var(--border-color))] !text-[rgb(var(--text-color))] transition-all duration-300 overflow-hidden"
            >
              <div class="flex items-center min-w-0">
                <Icon
                  name="ph:book"
                  class="!w-5 !h-5 mr-2 flex-shrink-0 transition-all duration-300"
                />
                <div class="transition-opacity duration-300 whitespace-nowrap">
                  Release Notes
                </div>
              </div>
            </button>
          </nuxt-link>
          <nuxt-link to="/ai/user-guide" class="md:col-span-4">
            <button
              class="px-3 py-2 w-full shadow rounded-lg !bg-white hover:!bg-secondary !justify-start border border-[rgba(var(--border-color))] !text-[rgb(var(--text-color))] transition-all duration-300 overflow-hidden"
            >
              <div class="flex items-center min-w-0">
                <Icon
                  name="ph:question-mark"
                  class="!w-5 !h-5 mr-2 flex-shrink-0 transition-all duration-300"
                />
                <span
                  class="transition-opacity duration-300 truncate whitespace-nowrap"
                  >User Guide</span
                >
              </div>
            </button>
          </nuxt-link>
          <nuxt-link
            class="md:col-span-4"
            :to="hasPermission() ? '/ai/settings' : '/ai/settings/project'"
          >
            <button
              class="px-3 py-2 w-full shadow rounded-lg !text-white !bg-primary hover:!bg-primary/80 !justify-start border border-[rgba(var(--border-color))] transition-all duration-300 overflow-hidden"
            >
              <div class="flex items-center min-w-0">
                <Icon
                  name="material-symbols:settings-outline-rounded"
                  class="!w-5 !h-5 mr-2 flex-shrink-0 transition-all duration-300"
                />
                <span
                  class="transition-opacity duration-300 truncate whitespace-nowrap"
                  >Settings</span
                >
              </div>
            </button>
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link to="/ai/release-notes" class="col-span-4">
            <button
              class="px-3 py-2 w-full shadow rounded-lg !text-white !bg-white hover:!bg-secondary !justify-start border border-[rgba(var(--border-color))] transition-all duration-300 overflow-hidden"
            >
              <Icon
                name="ph:book"
                class="!w-5 !h-5 !text-[rgb(var(--text-color))] transition-all duration-300"
              />
            </button>
          </nuxt-link>
          <nuxt-link to="/ai/user-guide" class="col-span-4">
            <button
              class="px-3 py-2 w-full shadow rounded-lg !text-white !bg-white hover:!bg-secondary !justify-start border border-[rgba(var(--border-color))] transition-all duration-300 overflow-hidden"
            >
              <Icon
                name="ph:question-mark"
                class="!w-5 !h-5 !text-[rgb(var(--text-color))] transition-all duration-300"
              />
            </button>
          </nuxt-link>
          <nuxt-link
            class="col-span-4"
            :to="hasPermission() ? '/ai/settings' : '/ai/settings/project'"
          >
            <button
              class="px-3 py-2 w-full shadow rounded-lg !text-white !bg-primary hover:!bg-primary/80 !justify-start border border-[rgba(var(--border-color))] transition-all duration-300 overflow-hidden"
            >
              <Icon
                name="material-symbols:settings-outline-rounded"
                class="!w-5 !h-5 transition-all duration-300"
              />
            </button>
          </nuxt-link>
        </template>
      </div>
    </section>

    <rs-modal
      v-model="showModalAddProject"
      title="Add Project"
      position="center"
    >
      <template #body>
        <FormKit type="form" :actions="false" @submit="addNewProject">
          <FormKit
            v-model="form.name"
            type="text"
            label="Name"
            validation="required"
          />
          <FormKit
            v-model="form.description"
            type="textarea"
            label="Description"
          />

          <div class="flex justify-end">
            <rs-button btn-type="submit" class="!bg-[#0D1B2A] text-white">
              <Icon
                name="material-symbols:save-outline-rounded"
                class="!w-5 !h-5 cursor-pointer mr-1"
              />
              Add Project
            </rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>
  </aside>
</template>
