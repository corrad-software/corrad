<script setup>
definePageMeta({
  title: "Assistant List",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Assistant",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const { data: assistantList, refresh } = await useFetch(
  "/api/ai/assistant/list",
  {
    method: "GET",
  }
);

const deleteAssistant = async (assistantID) => {
  try {
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
          const { data } = await useFetch("/api/ai/assistant/delete", {
            method: "POST",
            body: {
              assistantID,
            },
          });

          if (data.value.statusCode === 200) {
            $swal.fire({
              title: "Success",
              text: "Assistant deleted successfully",
              icon: "success",
            });
            refresh();
          } else {
            $swal.fire({
              title: "Error",
              text: data.value.message,
              icon: "error",
            });
          }
        }
      });
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/assistant/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Assistant
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-if="assistantList.statusCode === 200 && assistantList.data.length > 0"
        v-for="(assistant, index) in assistantList.data"
        :key="assistantList.data"
        class="bg-white border border-[rgba(var(--border-color))] shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
      >
        <div class="flex-1 flex items-center gap-4">
          <img
            :src="
              assistant.assistantImg
                ? assistant.assistantImg
                : `/img/default-thumbnail.jpg`
            "
            alt="Bot"
            class="h-12 w-12 rounded-lg object-cover"
          />
          <div class="flex-1">
            <h4 class="flex items-center gap-2 font-bold">
              {{ assistant.assistantName }}
              <span
                class="w-2 h-2 rounded-full animate-pulse"
                :class="{
                  'bg-green-500': assistant.assistantStatus === 'ACTIVE',
                  'bg-red-500': assistant.assistantStatus === 'INACTIVE',
                }"
              ></span>
            </h4>
            <p class="text-sm text-[rgba(var(--text-muted))]">
              {{ assistant.assistantDescription }}
            </p>
            <p class="flex items-center">
              <span
                class="mr-1"
                :class="{
                  'text-green-500': assistant.assistantVerified,
                  'text-red-500': !assistant.assistantVerified,
                }"
              >
                {{ assistant.assistantVerified ? "Verified" : "Not Verified" }}
              </span>
              <Icon
                v-if="assistant.assistantVerified"
                name="material-symbols:check-box-rounded"
                class="!w-5 !h-5 cursor-pointer text-success"
              />
              <Icon
                v-else
                name="material-symbols:cancel-rounded"
                class="!w-5 !h-5 cursor-pointer text-danger"
              />
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <NuxtLink :to="`/ai/assistant/edit/${assistant.assistantID}`">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button
            variant="danger-outline"
            @click="deleteAssistant(assistant.assistantID)"
          >
            <Icon
              name="material-symbols:delete-forever-outline"
              class="!w-5 !h-5 cursor-pointer"
            />
          </rs-button>
        </div>
      </div>
      <div v-else>
        <div class="bg-secondary p-4 rounded">
          <p class="text-center text-[rgba(var(--text-muted))]">
            No assistant found
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
