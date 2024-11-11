<script setup>
definePageMeta({
  title: "Repository List",
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
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

const { data: repoList, refresh } = await useFetch("/api/ai/repository/list", {
  method: "GET",
});

const deleteRepository = async (repoID) => {
  $swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const { data } = await useFetch("/api/ai/repository/delete", {
          method: "POST",
          body: {
            repoID: repoID,
          },
        });

        if (data.value.statusCode === 200) {
          await refresh();
        }
      }
    });
};
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <LayoutsBreadcrumbV2 />

    <div class="flex mb-4">
      <nuxt-link to="/ai/repository/add">
        <rs-button>
          <Icon name="material-symbols:add" class="!w-5 !h-5 cursor-pointer" />
          Add Repository
        </rs-button>
      </nuxt-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-if="repoList.statusCode === 200 && repoList.data.length > 0"
        v-for="(repo, index) in repoList.data"
        :key="repoList.data"
        class="bg-white border border-[rgba(var(--border-color))] shadow rounded-xl transition-all flex justify-between items-center p-4 gap-4"
      >
        <div class="flex items-center gap-4">
          <div>
            <h4 class="font-bold">{{ repo.repositoryName }}</h4>
            <p class="text-sm text-[rgba(var(--text-muted))] line-clamp-1">
              {{ repo.repositoryDescription }}
            </p>
            <p class="text-sm text-info">v{{ repo.repositoryVersion }}</p>
          </div>
        </div>
        <div class="flex-1 flex justify-end gap-3">
          <NuxtLink :to="`/ai/repository/edit/${repo.repositoryID}`">
            <rs-button>
              <Icon
                name="material-symbols:edit-square-outline"
                class="!w-5 !h-5 cursor-pointer"
              />
            </rs-button>
          </NuxtLink>

          <rs-button
            variant="danger-outline"
            @click="deleteRepository(repo.repositoryID)"
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
          <p class="text-center text-[rgba(var(--text-muted))]">No repository found</p>
        </div>
      </div>
    </div>
  </div>
</template>
