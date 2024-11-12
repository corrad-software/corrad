<script setup>
definePageMeta({
  title: "Settings",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { $swal } = useNuxtApp();

const form = reactive({
  openaiApiKey: "",
  openaiProjectId: "",
});

// const { data: configuration } = await useFetch("/api/ai/settings/config/get", {
//   method: "GET",
// });

// if (configuration.value.statusCode == 200) {
//   form.openaiApiKey = configuration.value.data.APIKey;
//   form.openaiProjectId = configuration.value.data.projectID;
// }

// const submit = async () => {
//   const { data } = await useFetch("/api/ai/settings/config/edit", {
//     method: "POST",
//     body: {
//       APIKey: form.openaiApiKey,
//       projectID: form.openaiProjectId,
//     },
//   });

//   if (data.value.statusCode == 200) {
//     $swal.fire({
//       title: "Success",
//       text: "Configuration updated successfully",
//       icon: "success",
//     });
//   } else {
//     $swal.fire({
//       title: "Error",
//       text: "Failed to update configuration",
//       icon: "error",
//     });
//   }
// };
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink to="/ai/settings/project">
        <div
          class="bg-white border border-[rgba(var(--border-color))] hover:bg-secondary shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
        >
          <div class="flex items-center gap-2">
            <Icon name="material-symbols-light:lab-profile" class="!w-8 !h-8" />
            <h4 class="font-normal">Project Settings</h4>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- <FormKit type="form" :actions="false" @submit="submit">
      <FormKit
        v-model="form.openaiApiKey"
        type="text"
        label="Openai API Key"
        placeholder=""
        validation="required"
      />

      <FormKit
        v-model="form.openaiProjectId"
        type="text"
        label="Openai Project ID"
        placeholder=""
        validation="required"
      />

      <div class="flex justify-end gap-4">
        <rs-button btn-type="submit">
          <Icon
            name="material-symbols:save-outline-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Save
        </rs-button>
      </div>
    </FormKit> -->
  </div>
</template>
