<script setup>
definePageMeta({
  title: "Project Settings",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Settings",
      path: "/ai/settings",
    },
    {
      name: "Project",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const currentProject = useCookie("currentProject", null);

if (!currentProject) {
  navigateTo("/ai/settings");
}

const form = reactive({
  name: "",
  description: "",
  public: false,
  viewType: "1",
  userRoles: [],
  isDefault: false, // Add this line
});

const originalUserRoles = ref([]);
const originalRoleRoles = ref([]);

const allUsers = ref([]);
const allRoles = ref([]);

const { data } = await useFetch("/api/ai/settings/project/get", {
  method: "GET",
  query: {
    projectID: currentProject,
  },
});

if (data.value.statusCode == 200) {
  form.name = data.value.data.project?.projectName;
  form.description = data.value.data.project?.projectDescription;
  form.public = data.value.data.project?.projectPublic == 1 ? true : false;
  form.viewType =
    data.value.data.project?.projectViewType == "user" ? "1" : "2";
  form.userRoles = data.value.data.project?.projectUserRoles;
  form.isDefault = data.value.data.project?.projectDefault; // Add this line
  allUsers.value = data.value.data.users;
  allRoles.value = data.value.data.roles;

  // Store original values
  originalUserRoles.value = form.viewType === "1" ? [...form.userRoles] : [];
  originalRoleRoles.value = form.viewType === "2" ? [...form.userRoles] : [];
}

const submit = async () => {
  const { data } = await useFetch("/api/ai/settings/project/edit", {
    method: "POST",
    body: {
      projectID: currentProject.value,
      projectName: form.name,
      projectDescription: form.description,
      projectPublic: form.public ? true : false,
      viewType: form.viewType === "1" ? "user" : "role",
      userRoles: form.userRoles,
      projectDefault: form.isDefault, // Add this line
    },
  });

  if (data.value.statusCode === 200) {
    $swal.fire({
      title: "Success",
      text: "Project updated successfully",
      icon: "success",
    });
    // Optionally, you can refresh the project data here

    if (!form.public) {
      form.viewType = "1";
      form.userRoles = [];
    }
    // await refresh();
  } else {
    $swal.fire({
      title: "Error",
      text:
        data.value.message || "An error occurred while updating the project",
      icon: "error",
    });
  }
};

// Modify the watch function
watch(
  () => form.viewType,
  (newViewType, oldViewType) => {
    if (oldViewType === "1") {
      originalUserRoles.value = [...form.userRoles];
    } else {
      originalRoleRoles.value = [...form.userRoles];
    }

    if (newViewType === "1") {
      form.userRoles = [...originalUserRoles.value];
    } else {
      form.userRoles = [...originalRoleRoles.value];
    }
  }
);
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false" @submit="submit">
      <FormKit
        v-model="form.name"
        type="text"
        label="Name"
        validation="required"
      />
      <FormKit v-model="form.description" type="textarea" label="Description" />
      <FormKit
        v-model="form.isDefault"
        type="checkbox"
        label="Set as Default Project"
      />

      <h4 class="my-5">Share Project with Team Members</h4>

      <label class="inline-flex items-center mb-5 cursor-pointer">
        <input
          v-model="form.public"
          type="checkbox"
          value=""
          class="sr-only peer"
        />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-gray-900"> Public </span>
      </label>

      <div v-if="form.public">
        <FormKit
          v-model="form.viewType"
          type="radio"
          label="View Type"
          :classes="{
            fieldset: 'border-0 !p-0',
            legend: '!font-semibold !text-sm mb-0',
            options: '!flex !flex-row gap-4 mt-3',
          }"
          :options="[
            { label: 'User', value: '1' },
            { label: 'Role', value: '2' },
          ]"
        />

        <div class="formkit-wrapper formkit-wrapper-global">
          <label
            class="formkit-label formkit-label-global formkit-outer-text"
            for="input_10"
          >
            {{ form.viewType == "1" ? "Users" : "Roles" }}
          </label>

          <v-select
            v-model="form.userRoles"
            class="formkit-vselect"
            :options="form.viewType == '1' ? allUsers : allRoles"
            multiple
            :key="form.viewType"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <rs-button btn-type="submit">
          <Icon
            name="material-symbols:save-outline-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Save
        </rs-button>
      </div>
    </FormKit>
  </div>
</template>

<style>
.vs__deselect {
  fill: white !important;
}

.vs__dropdown-menu li:hover {
  background: rgb(var(--color-primary)) !important;
  color: white !important;
}
</style>
