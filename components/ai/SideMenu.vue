<script setup>
import { useUserStore } from "~/stores/user";
import logoLightSrc from "~/assets/img/logo/logo-word-black-ai.svg";
import logoDarkSrc from "~/assets/img/logo/logo-word-white-ai.svg";

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

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
          $swal.fire({
            title: "Success",
            text: "Thread deleted successfully",
            icon: "success",
          });

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

// Call setInitialTheme on component mount
onMounted(() => {
  setInitialTheme();
  emitter.on("refreshChatList", refreshChatList);
});

onUnmounted(() => {
  emitter.off("refreshChatList", refreshChatList);
});
</script>

<template>
  <aside
    v-show="isOpen"
    class="fixed inset-y-0 left-0 z-30 w-60 md:w-64 bg-[rgb(var(--bg-2))] p-4 border-r border-[rgb(var(--border-color))] flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <nuxt-link to="/ai" class="flex justify-center items-center mb-4">
      <img id="logo" class="h-10 block" :src="logoSrc" alt="Logo" />
    </nuxt-link>
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

      <rs-button @click="showModalAddProject = !showModalAddProject">
        <Icon name="material-symbols:add" />
      </rs-button>
    </div>

    <NuxtScrollbar
      class="flex flex-col justify-between max-h-[86dvh] md:max-h-[93dvh] overflow-y-auto mb-4"
    >
      <ul class="flex flex-col gap-3">
        <li
          v-if="threadList.statusCode == 200 && threadList.data.length > 0"
          v-for="(thread, index) in threadList.data"
          :key="index"
          class="bg-secondary rounded-lg"
        >
          <div class="flex items-center">
            <div
              class="flex-1 pr-2 overflow-hidden cursor-pointer p-3"
              @click="navigateTo('/ai/chat/' + thread.threadID)"
            >
              <p class="w-full line-clamp-1 leading-loose">
                {{ thread.threadTitle }}
              </p>
              <span class="font-semibold text-xs">
                - {{ thread.assistantName }}
              </span>
            </div>
            <Icon
              @click="deleteThread(thread.threadID)"
              name="ph:x-circle-duotone"
              class="!w-5 !h-5 hover:text-red-500 mr-3 cursor-pointer"
            />
          </div>
        </li>
      </ul>
    </NuxtScrollbar>
    <section class="flex-auto flex flex-col justify-end">
      <div class="grid grid-cols-4 gap-3">
        <nuxt-link class="col-span-2" to="/ai">
          <rs-button
            variant="secondary"
            class="w-full !text-[rgb(var(--text-color))] flex-col !items-start !justify-start text-base"
          >
            <Icon
              name="material-symbols:globe-asia"
              class="!w-5 !h-5 md:!w-6 md:!h-6 mb-1"
            />
            Explore
          </rs-button>
        </nuxt-link>
        <nuxt-link class="col-span-2" to="/ai/tools">
          <rs-button
            variant="secondary"
            class="w-full !text-[rgb(var(--text-color))] flex-col !items-start !justify-start text-base"
          >
            <Icon name="ph:hammer" class="!w-5 !h-5 md:!w-6 md:!h-6 mb-1" />
            Tools
          </rs-button>
        </nuxt-link>
        <nuxt-link v-if="hasPermission()" to="/ai/assistant" class="col-span-4">
          <rs-button
            variant="secondary"
            class="w-full !justify-start !text-[rgb(var(--text-color))]"
          >
            <Icon
              name="mdi:robot-excited-outline"
              class="!w-5 !h-5 md:!w-6 md:!h-6 mr-2"
            />
            Assistant
          </rs-button>
        </nuxt-link>
        <nuxt-link v-if="hasPermission()" to="/ai/guide-chat" class="col-span-4">
          <rs-button
            variant="secondary"
            class="w-full !justify-start !text-[rgb(var(--text-color))]"
          >
            <Icon
              name="material-symbols:chat-outline"
              class="!w-5 !h-5 md:!w-6 md:!h-6 mr-2"
            />
            Guided AI
          </rs-button>
        </nuxt-link>
        <nuxt-link
          class="md:col-span-2"
          :to="hasPermission() ? '/ai/settings' : '/ai/settings/project'"
        >
          <rs-button class="w-full !justify-start pr-3">
            <Icon
              name="material-symbols:settings-outline-rounded"
              class="!w-5 !h-5 md:!w-6 md:!h-6 mr-2"
            />
            {{ hasPermission() ? "Settings" : "Settings" }}
          </rs-button>
        </nuxt-link>
        <nuxt-link to="/ai/release-notes">
          <rs-button variant="secondary" class="w-full !text-primary">
            <Icon name="ph:book-duotone" class="!w-5 !h-5 md:!w-6 md:!h-6" />
          </rs-button>
        </nuxt-link>
        <nuxt-link to="/ai/user-guide">
          <rs-button variant="secondary" class="w-full !text-primary">
            <Icon name="ph:question-mark" class="!w-5 !h-5 md:!w-6 md:!h-6" />
          </rs-button>
        </nuxt-link>

        <!-- <div class="grid grid-cols-1">
          <rs-button
            @click="toggleTheme"
            variant="secondary"
            class="!text-[rgb(var(--text-color))]"
          >
            <Icon name="ph:sun-duotone" class="!w-5 !h-5 md:!w-6 md:!h-6" />
          </rs-button>
        </div> -->
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
