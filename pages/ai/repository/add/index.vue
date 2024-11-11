<script setup>
definePageMeta({
  title: "Add Repository",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Repository",
      path: "/ai/repository",
    },
    {
      name: "Add",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();
const projectID = useCookie("currentProject");

const form = reactive({
  name: "",
  description: "",
  version: "",
  content: "",
  file: "",
});

const submitForm = async () => {
  try {
    const { data } = await useFetch("/api/ai/repository/add", {
      method: "POST",
      body: {
        repoName: form.name,
        repoDescription: form.description,
        repoVersion: form.version,
        repoContent: form.content,
        projectID: projectID.value,
      },
    });

    if (data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Repository has been added successfully",
        icon: "success",
      });

      navigateTo("/ai/repository");
    } else {
      $swal.fire({
        title: "Error",
        text: "Failed to add repository",
        icon: "error",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false" @submit="submitForm">
      <FormKit
        v-model="form.name"
        type="text"
        label="Name"
        placeholder="Repository A"
        validation="required"
      />
      <FormKit
        v-model="form.description"
        type="textarea"
        label="Description"
        placeholder=""
        auto-height
      />
      <FormKit
        v-model="form.version"
        type="text"
        label="Version"
        placeholder="1.0.0"
        :validation="[['required']]"
        help="Please provide a valid version number. The version number should be in the format of x.x.x"
      />
      <FormKit
        v-model="form.content"
        type="textarea"
        label="Content"
        placeholder="Content here..."
        validation="required"
        auto-height
      />
      <!-- <FormKit type="file" label="File" /> -->

      <div class="flex justify-end gap-4">
        <rs-button btn-type="submit">
          <Icon
            name="material-symbols:save-outline-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Submit
        </rs-button>
      </div>
    </FormKit>
  </div>
</template>
