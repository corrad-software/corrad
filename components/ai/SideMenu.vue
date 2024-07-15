<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const { $swal } = useNuxtApp();

const showModalAddProject = ref(false);

const currentProject = useCookie("currentProject", null);
const form = reactive({
  name: "",
  description: "",
});

const projectList = ref([]);

const { data: getProjects, refresh: refreshProjectList } = await useFetch(
  "/api/ai/project/list",
  {
    method: "GET",
  }
);

if (getProjects.value.statusCode == 200) {
  if (!currentProject.value)
    currentProject.value = getProjects.value.data.defaultProject;

  projectList.value = getProjects.value.data.projectOptions;
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

watch(currentProject, (value) => {
  // Refresh Page
  window.location.reload();
});
</script>

<template>
  <aside
    v-show="isOpen"
    class="fixed inset-y-0 left-0 z-10 w-64 bg-[rgb(var(--bg-2))] p-4 border-r border-[rgb(var(--border-color))] flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <nuxt-link to="/ai">
      <h4
        class="text-gray-400 text-sm font-bold uppercase tracking-wider mt-2 mb-6 text-center"
      >
        CORRAD AI
      </h4>
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

    <section
      class="flex flex-col justify-between max-h-[86dvh] md:max-h-[93dvh]"
    >
      <ul class="flex flex-col gap-3">
        <li
          class="bg-secondary hover:scale-105 transition-all cursor-pointer p-3 rounded-lg"
        >
          <p class="w-full line-clamp-1 leading-loose">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
            diam lectus.
          </p>
          <span class="font-semibold text-xs"> - URS Bot </span>
        </li>
        <li
          class="bg-secondary hover:scale-105 transition-all cursor-pointer p-3 rounded-lg"
        >
          <p class="w-full line-clamp-1 leading-loose">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
            diam lectus.
          </p>
          <span class="font-semibold text-xs"> - DFD Generator </span>
        </li>
      </ul>
    </section>
    <section class="flex-auto flex flex-col justify-end">
      <div class="grid grid-cols-2 gap-3">
        <nuxt-link to="/ai">
          <rs-button
            variant="secondary"
            class="w-full !text-[rgb(var(--text-color))] flex-col !items-start !justify-start text-base"
          >
            <Icon name="material-symbols:globe-asia" class="!w-6 !h-6 mb-1" />
            Explore
          </rs-button>
        </nuxt-link>
        <nuxt-link to="/ai/repository">
          <rs-button
            variant="secondary"
            class="w-full !text-[rgb(var(--text-color))] flex-col !items-start !justify-start text-base"
          >
            <Icon
              name="material-symbols:folder-open-outline"
              class="!w-6 !h-6 mb-1"
            />
            Repository
          </rs-button>
        </nuxt-link>
        <nuxt-link to="/ai/assistant" class="col-span-2">
          <rs-button
            variant="secondary"
            class="w-full !justify-start !text-primary"
          >
            <Icon name="mdi:robot-excited-outline" class="!w-6 !h-6 mr-2" />
            Assistant
          </rs-button>
        </nuxt-link>
        <nuxt-link to="/ai/settings" class="col-span-2">
          <rs-button class="w-full !justify-start">
            <Icon
              name="material-symbols:settings-outline-rounded"
              class="!w-6 !h-6 mr-2"
            />
            Settings
          </rs-button>
        </nuxt-link>
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
