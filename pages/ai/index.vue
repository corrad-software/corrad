<script setup>
definePageMeta({
  title: "AI",
  description: "AI page",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});
</script>

<template>
  <div class="max-w-5xl mx-auto mt-12">
    <section>
      <h4
        class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 text-center"
      >
        CORRAD AI
      </h4>
    </section>

    <h2 class="text-xl font-bold mt-12 mb-4">Document Assistants</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <NuxtLink to="/ai/chat/1">
        <div
          class="bg-secondary hover:scale-105 transition-all flex items-center p-4 rounded gap-4"
        >
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">URS Generator</h4>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
              diam lectus.
            </p>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink to="/ai/chat/1">
        <div
          class="bg-secondary hover:scale-105 transition-all flex items-center p-4 rounded gap-4"
        >
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">URS Generator</h4>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
              diam lectus.
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <h2 class="text-xl font-bold mt-12 mb-4">Diagram Assistants</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <NuxtLink to="/ai/chat/1">
        <div
          class="bg-secondary hover:scale-105 transition-all flex items-center p-4 rounded gap-4"
        >
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">DFD Generator</h4>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
              diam lectus.
            </p>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink to="/ai/chat/1">
        <div
          class="bg-secondary hover:scale-105 transition-all flex items-center p-4 rounded gap-4"
        >
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">DFD Generator</h4>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
              diam lectus.
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <h2 class="text-xl font-bold mt-12 mb-4">Code Assistants</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <NuxtLink to="/ai/chat/1">
        <div
          class="bg-secondary hover:scale-105 transition-all flex items-center p-4 rounded gap-4"
        >
          <img
            src="https://picsum.photos/200"
            alt="Bot"
            class="h-12 w-12 rounded-lg"
          />
          <div>
            <h4 class="font-bold">Corrad UI Assistant</h4>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
              diam lectus.
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
