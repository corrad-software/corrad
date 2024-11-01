<script setup>
definePageMeta({
  title: "Add Assistant",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Assistant",
      path: "/ai/assistant",
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
  openaiAssistantID: "",
  type: "",
  status: "ACTIVE",
  verified: false,
});

const assistantOptions = ref([]);

const { data: getLookupType } = await useFetch("/api/ai/lookup/get", {
  method: "GET",
  params: {
    code: 8,
    type: "SELECT",
  },
});

if (getLookupType.value.statusCode === 200) {
  assistantOptions.value = getLookupType.value.data;
}
const verifyAssistant = async () => {
  try {
    const { data } = await useFetch("/api/ai/assistant/verify", {
      method: "GET",
      params: {
        openaiAssistantID: form.openaiAssistantID,
      },
    });

    if (data.value.statusCode === 200) {
      form.verified = true;
      $swal.fire({
        title: "Success",
        text: "Assistant verified successfully",
        icon: "success",
      });
    } else {
      form.verified = false;
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

const submitForm = async () => {
  try {
    const { data } = await useFetch("/api/ai/assistant/add", {
      method: "POST",
      body: {
        assistantImg: undefined,
        assistantName: form.name,
        assistantDescription: form.description,
        assistantType: form.type,
        assistantProviderID: form.openaiAssistantID,
        assistantStatus: form.status,
        assistantVerified: form.verified,
      },
    });

    if (data.value.statusCode === 200) {
      $swal.fire({
        title: "Success",
        text: "Assistant added successfully",
        icon: "success",
      });

      navigateTo("/ai/assistant");
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

// If openAIAssistant change then set verified to false
watch(
  () => form.openaiAssistantID,
  () => {
    form.verified = false;
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <FormKit type="form" :actions="false" @submit="submitForm">
      <FormKit
        v-model="form.name"
        type="text"
        label="Name"
        placeholder="Assistant A"
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
        v-model="form.type"
        type="select"
        label="Type"
        :options="assistantOptions"
        validation="required"
      />
      <FormKit
        v-model="form.openaiAssistantID"
        type="text"
        label="OpenAI Assistant ID"
        placeholder=""
        validation="required"
      />

      <FormKit
        v-model="form.status"
        type="select"
        label="Status"
        :options="[
          {
            value: 'ACTIVE',
            label: 'Active',
          },
          {
            value: 'INACTIVE',
            label: 'Inactive',
          },
        ]"
      />

      <label
        class="formkit-label formkit-label-global formkit-outer-text"
        for="input_15"
      >
        Verified (by OpenAI)
      </label>
      <Icon
        v-if="form.verified"
        name="material-symbols:check-box-rounded"
        class="!w-5 !h-5 cursor-pointer text-success"
      />
      <Icon
        v-else
        name="material-symbols:cancel-rounded"
        class="!w-5 !h-5 cursor-pointer text-danger"
      />

      <div class="flex justify-end gap-4">
        <rs-button
          variant="success"
          @click="verifyAssistant"
          :disabled="!form.openaiAssistantID"
        >
          <Icon
            name="material-symbols-light:refresh-rounded"
            class="!w-5 !h-5 cursor-pointer mr-1"
          />
          Verify Assistant
        </rs-button>
        <rs-button btn-type="submit" :disabled="!form.verified">
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
