<script setup>
definePageMeta({
  title: "Register",
  layout: "empty",
  middleware: ["dashboard"],
});

const togglePasswordVisibility = ref(false);
const togglePasswordVisibility2 = ref(false);
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
        <h3 class="mb-4">Sign Up</h3>
        <p class="text-slate-500 mb-6 col-sp">
          Please fill in the form to create an account.
        </p>
        <FormKit label="Username" type="text" label-class="text-left" />
        <FormKit label="Email" type="email" label-class="text-left" />
        <FormKit
          :type="togglePasswordVisibility ? 'text' : 'password'"
          label="Password"
          type="password"
          label-class="text-left"
        >
          <template #suffix>
            <div
              class="bg-gray-100 hover:bg-slate-200 dark:bg-slate-700 hover:dark:bg-slate-900 h-full rounded-r-md p-3 flex justify-center items-center cursor-pointer"
              @click="togglePasswordVisibility = !togglePasswordVisibility"
            >
              <Icon
                v-if="!togglePasswordVisibility"
                name="ion:eye-outline"
                size="19"
              ></Icon>
              <Icon v-else name="ion:eye-off-outline" size="19"></Icon>
            </div>
          </template>
        </FormKit>
        <FormKit
          :type="togglePasswordVisibility2 ? 'text' : 'password'"
          label="Re-enter Password"
          type="password"
          label-class="text-left"
        >
          <template #suffix>
            <div
              class="bg-gray-100 hover:bg-slate-200 dark:bg-slate-700 hover:dark:bg-slate-900 h-full rounded-r-md p-3 flex justify-center items-center cursor-pointer"
              @click="togglePasswordVisibility2 = !togglePasswordVisibility2"
            >
              <Icon
                v-if="!togglePasswordVisibility2"
                name="ion:eye-outline"
                size="19"
              ></Icon>
              <Icon v-else name="ion:eye-off-outline" size="19"></Icon>
            </div>
          </template>
        </FormKit>
        <FormKit
          type="checkbox"
          label="agreement"
          outer-class="col-span-1 md:col-span-2"
        >
          <template #label
            >I agree to the
            <a class="text-primary hover:underline ml-1">Term and Services</a>
          </template>
        </FormKit>

        <NuxtLink to="/" class="col-span-1 md:col-span-2">
          <FormKit type="button" input-class="w-full">Sign up</FormKit>
        </NuxtLink>

        <p class="mt-3 text-center text-slate-500">
          Already have an account?
          <NuxtLink to="/login" class="text-primary hover:underline"
            >Login</NuxtLink
          >
        </p>
      </rs-card>
    </div>
  </div>
</template>
