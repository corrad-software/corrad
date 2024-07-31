<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Logout",
  layout: "empty",
});

const userStore = useUserStore();

await useFetch("/api/auth/logout", {
  method: "GET",
});

if (process.client) {
  userStore.setUsername("");
  userStore.setRoles([]);
  userStore.setIsAuthenticated(false);
  
  const currentProject = useCookie("currentProject");
  currentProject.value = null;

  navigateTo("/login");
}
</script>

<template>
  <div>
    <h1>Logout</h1>
  </div>
</template>
