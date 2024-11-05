<script setup>
definePageMeta({
  title: "Add Guide Chat",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Guide Chat",
      path: "/ai/guide-chat",
    },
    {
      name: "Add",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const form = reactive({
  name: "",
  description: "",
  model: "",
  type: "",
  context: "",
  status: "ACTIVE",
});

const modelOptions = ref([]);

const { data: getLookupType } = await useFetch(
  "/api/ai/guide-chat/lookup-model",
  {
    method: "GET",
  }
);

if (getLookupType.value.statusCode === 200) {
  modelOptions.value = [
    { label: "Please Select Model", value: null },
    ...getLookupType.value.data.map((item) => ({
      label: item.name,
      value: item.id,
    })),
  ];
}

const submitForm = async () => {
  try {
    const { data } = await useFetch("/api/ai/guide-chat/add", {
      method: "POST",
      body: {
        guideChatName: form.name,
        guideChatDescription: form.description,
        guideChatModel: form.model,
        guideChatType: form.type,
        guideChatContext: form.context,
        guideChatStatus: form.status,
      },
    });

    if (data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Guide Chat added successfully",
        icon: "success",
      });
      navigateTo("/ai/guide-chat");
    } else {
      $swal.fire({
        title: "Error",
        text: data.value.message,
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
        validation="required"
      />
      <FormKit
        v-model="form.description"
        type="textarea"
        label="Description"
        auto-height
      />
      <FormKit
        v-model="form.model"
        type="select"
        label="Model"
        :options="modelOptions"
        validation="required"
        placeholder="Select a model"
      />
      <FormKit
        v-model="form.type"
        type="select"
        label="Type"
        :options="[
          {
            label: 'Please Select Type',
            value: null,
          },
          {
            label: 'Open',
            value: 'OPEN',
          },
        ]"
      />
      <FormKit
        v-model="form.context"
        type="textarea"
        label="Context"
        rows="10"
        auto-height
        :max-auto-height="500"
      />
      <FormKit
        v-model="form.status"
        type="select"
        label="Status"
        :options="[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ]"
      />

      <div class="flex justify-end">
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
