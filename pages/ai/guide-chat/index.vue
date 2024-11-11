<script setup>
definePageMeta({
  title: "Guide Chat List",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
  breadcrumb: [
    {
      name: "Home",
      path: "/ai",
    },
    {
      name: "Guide Chat",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const { data: guideChatList, refresh } = await useFetch(
  "/api/ai/guide-chat/list",
  {
    method: "GET",
  }
);

const deleteGuideChat = async (guideChatID) => {
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
          const { data } = await useFetch("/api/ai/guide-chat/delete", {
            method: "POST",
            body: {
              guideChatID,
            },
          });

          if (data.value.statusCode === 200) {
            $swal.fire({
              title: "Success",
              text: "Guide Chat deleted successfully",
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
      <nuxt-link to="/ai/guide-chat/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Guide Chat
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-if="guideChatList.statusCode === 200 && guideChatList.data.length > 0"
        v-for="guideChat in guideChatList.data"
        :key="guideChat.guideChatID"
        class="bg-white border border-[rgba(var(--border-color))] shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
      >
        <div>
          <h4 class="font-bold flex items-center gap-2">
            {{ guideChat.guideChatName }}
            <span
              class="w-2 h-2 rounded-full animate-pulse"
              :class="{
                'bg-green-500': guideChat.guideChatStatus === 'ACTIVE',
                'bg-red-500': guideChat.guideChatStatus === 'INACTIVE',
              }"
            ></span>
          </h4>
          <p class="text-sm text-[rgba(var(--text-muted))]">
            {{ guideChat.guideChatDescription }}
          </p>
          <rs-badge variant="info" class="mt-2">
            Model: {{ guideChat.lookup?.lookupTitle }}
          </rs-badge>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink :to="`/ai/guide-chat/edit/${guideChat.guideChatID}`">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button
            variant="danger-outline"
            @click="deleteGuideChat(guideChat.guideChatID)"
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
            No guide chat found
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
