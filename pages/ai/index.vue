<script setup>
definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});

const { $swal } = useNuxtApp();

const errormsg = useRoute().query.errormsg;

onMounted(() => {
  if (errormsg) {
    $swal.fire({
      icon: "error",
      title: "Error",
      text: errormsg,
    });
  }
});

const { data: assistants } = await useFetch("/api/ai/dashboard/assistants", {
  method: "GET",
});
</script>

<template>
  <div class="max-w-7xl mx-auto mt-5 md:mt-12">
    <section>
      <h4
        class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 text-center"
      >
        CORRAD AI
      </h4>
    </section>

    <div
      v-if="assistants.data.length > 0"
      v-for="(type, index) in assistants.data"
    >
      <h2 class="text-xl font-bold mt-12 mb-4">
        {{ type.assistantType }}
      </h2>
      <div
        v-if="type.assistantList.length > 0"
        class="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        <FormKit
          v-for="(assistant, index2) in type.assistantList"
          type="form"
          method="POST"
          action="/api/ai/chat/create-room"
          :actions="false"
        >
          <FormKit
            type="hidden"
            name="assistantID"
            :value="assistant.assistantID"
          />
          <button
            type="submit"
            class="bg-secondary hover:bg-[rgba(var(--color-hover))] flex items-center p-4 rounded gap-4 cursor-pointer w-full"
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
              <h4 class="text-left font-bold">{{ assistant.assistantName }}</h4>
              <p
                class="text-left text-sm text-gray-400 line-clamp-2 min-h-[40px]"
              >
                {{ assistant.assistantDescription }}
              </p>
            </div>
          </button>
        </FormKit>
      </div>
      <div v-else>
        <p class="text-center text-gray-400">No assistant found</p>
      </div>
    </div>
  </div>
</template>
