<script setup>
definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { data: assistants } = await useFetch("/api/ai/dashboard/assistants", {
  method: "GET",
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-12">
    <section>
      <h4
        class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 text-center"
      >
        CORRAD AI
      </h4>
    </section>

    <div v-if="assistants.data.length > 0" v-for="type in assistants.data">
      <h2 class="text-xl font-bold mt-12 mb-4">
        {{ type.assistantType }}
      </h2>
      <div
        v-if="type.assistantList.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <NuxtLink v-for="assistant in type.assistantList" to="/ai/chat/1">
          <div
            class="bg-secondary hover:bg-[#DBDBDC] flex items-center p-4 rounded gap-4"
          >
            <img
              :src="
                assistant.assistantImg
                  ? assistant.assistantImg
                  : `/img/default-thumbnail.jpg`
              "
              alt="Bot"
              class="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <h4 class="font-bold">{{ assistant.assistantName }}</h4>
              <p class="text-sm text-gray-400">
                {{ assistant.assistantDescription }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div v-else>
        <p class="text-center text-gray-400">No assistant found</p>
      </div>
    </div>
  </div>
</template>
