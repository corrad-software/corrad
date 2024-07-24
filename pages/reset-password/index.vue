<script setup>
definePageMeta({
  title: "Reset Password",
  layout: "empty",
  middleware: ["dashboard"],
});
</script>

<template>
  <div
    class="flex-none md:flex justify-center text-center items-center h-screen"
  >
    <div class="w-full md:w-3/4 lg:w-1/2 xl:w-2/6 relative">
      <rs-card class="h-screen md:h-auto px-10 md:px-16 py-12 md:py-20 mb-0">
        <div
          class="absolute -bottom-3 left-3 img-container flex justify-start items-center mb-5"
        >
          <img
            src="@/assets/img/logo/logo-word-black.svg"
            class="max-w-[90px]"
          />
        </div>
        <h3 class="mb-4">Reset Password</h3>
        <p class="text-slate-500 mb-6">
          Please fill in the form to reset your password.
        </p>
        <div class="grid grid-cols-1">
          <FormKit label="Email" type="email" outer-class="text-left" />
          <FormKit label="Password" type="password" outer-class="text-left" />
          <FormKit
            label="Re-enter Password"
            type="password"
            outer-class="text-left"
          />
          <NuxtLink to="/login">
            <FormKit type="button" input-class="w-full">Reset Password</FormKit>
          </NuxtLink>
        </div>
      </rs-card>
    </div>
  </div>
</template>
