<script setup>
definePageMeta({
  title: "Error Page",
  layout: "empty",
});

const props = defineProps({
  error: Object,
});

// console.log("props", props);

const redirectClearError = () => {
  clearError({ redirect: "/" });
};
</script>

<template>
  <div>
    <div
      class="flex h-screen p-6 md:p-10"
      v-if="props.error.statusCode === 404"
    >
      <div class="m-auto">
        <div class="flex items-center flex-col md:flex-row gap-10">
          <img
            class="w-80 flex-shrink"
            src="@/assets/img/illustration/404-2.svg"
            alt=""
          />
          <div class="flex-1 text-center md:text-left items-center">
            <span class="block mb-2 font-bold text-2xl md:text-3xl">Oops!</span>
            <p class="text-lg md:text-xl font-base">
              The page you are looking for does not exist.
            </p>

            <button
              @click="redirectClearError"
              class="mt-5 w-fit rounded-lg flex justify-center items-center h-fit text-sm px-8 py-2.5 text-white bg-[#3E52A4] hover:bg-[#3E52A4]/90 disabled:bg-[#3E52A4]/30 disabled:text-[#3E52A4]/50 disabled:border-primary/5 disabled:cursor-default"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex h-screen p-6 md:p-10"
      v-else-if="props.error.statusCode === 500"
    >
      <div class="m-auto">
        <div class="flex items-center flex-col md:flex-row gap-10">
          <img
            class="w-80 flex-shrink"
            src="@/assets/img/illustration/500.svg"
            alt=""
          />
          <div class="flex-1 text-center md:text-left items-center">
            <span class="block mb-2 font-bold text-2xl md:text-3xl"
              >Oops, something went wrong.
            </span>
            <p class="text-lg md:text-xl font-base">
              Please try again later or contact us if the problem persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
