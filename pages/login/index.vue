<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Login",
  layout: "empty",
  middleware: ["dashboard"],
});

const { $swal } = useNuxtApp();
const username = ref("");
const password = ref("");
const userStore = useUserStore();

const togglePasswordVisibility = ref(false);

const login = async () => {
  try {
    const res = await useFetch("/api/auth/login", {
      method: "POST",
      initialCache: false,
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = res.data.value;

    if (data.statusCode === 200) {
      // Save token to pinia store
      userStore.setUsername(data.data.username);
      userStore.setRoles(data.data.roles);
      userStore.setIsAuthenticated(true);

      $swal.fire({
        position: "center",
        title: "Success",
        text: "Login Success",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      window.location.href = "/ai";
    } else {
      $swal.fire({
        title: "Error!",
        text: data.message,
        icon: "error",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
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
        <h3 class="mb-4">Login</h3>
        <p class="text-slate-500 mb-6">
          Welcome to Corrad. Please login to continue.
        </p>
        <div class="grid grid-cols-2">
          <FormKit
            type="text"
            label="Username"
            v-model="username"
            validation="required"
            :classes="{
              outer: 'col-span-2',
              label: 'text-left',
              messages: 'text-left',
            }"
          />
          <FormKit
            :type="togglePasswordVisibility ? 'text' : 'password'"
            label="Password"
            v-model="password"
            validation="required"
            :classes="{
              outer: 'col-span-2',
              label: 'text-left',
              messages: 'text-left',
            }"
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
          <FormKit type="checkbox" label="Remember Me" />
          <NuxtLink
            class="flex items-center justify-end h-5 mt-1 text-primary hover:underline"
            to="forgot-password"
            >Forgot Password?</NuxtLink
          >
          <!-- <NuxtLink to="/" class="col-span-2">
          </NuxtLink> -->
          <FormKit
            type="button"
            input-class="w-full"
            outer-class="col-span-2"
            @click="login"
          >
            Sign In
          </FormKit>
        </div>
        <p class="mt-3 text-center text-slate-500">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary hover:underline"
            >Sign Up</NuxtLink
          >
        </p>
      </rs-card>
    </div>
  </div>
</template>
