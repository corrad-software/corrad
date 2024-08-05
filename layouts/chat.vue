<script setup>
const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleResize = () => {
  isSidebarOpen.value = window.innerWidth >= 1024;
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="ai-theme">
    <div
      class="flex h-screen bg-[rgb(var(--bg-1))] text-[rgb(var(--text-color))]"
    >
      <rs-button
        @click="toggleSidebar"
        class="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-[rgb(var(--bg-2))]"
      >
        <Icon
          :name="
            isSidebarOpen ? 'material-symbols:close' : 'material-symbols:menu'
          "
          class="w-6 h-6"
        />
      </rs-button>

      <aiSideMenu :isOpen="isSidebarOpen" />

      <!-- Main content -->
      <main class="flex-1 px-8 py-6 overflow-y-scroll">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
.ai-theme {
  --color-primary: 13, 27, 42;
  --color-secondary: 244, 244, 245;
  --color-accent: 243, 244, 246;
  --color-success: 79, 192, 103;
  --color-info: 65, 133, 242;
  --color-warning: 246, 141, 32;
  --color-danger: 229, 83, 69;
  --color-hover: 219, 219, 220;
  --text-color: 9, 9, 11;
  --border-color: 228, 228, 231;
  --bg-1: 251, 251, 251;
  --bg-2: 255, 255, 255;
  --scroll-color: 170, 170, 170;
  --scroll-hover-color: 155, 155, 155;
  --fk-border-color: 228, 228, 231;
  --fk-placeholder-color: 146, 146, 153;
  --box-shadow: rgba(36, 35, 71, 0.05) 0px 1px 1px,
    rgba(36, 35, 71, 0.05) 0px 0px 1px 1px;
  --cp-bg: 255, 255, 255;
  --rounded-box: 0.2rem;
  --rounded-btn: 0.2rem;
  --rounded-badge: 1.9rem;
  --animation-btn: 0.25s;
  --animation-input: 0.2s;
  --btn-text-case: uppercase;
  --btn-focus-scale: 0.95;
  --padding-btn: 0.5rem;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: 0.5rem;
  --tw-shadow: #e5eaf2;
}

.ai-theme-dark {
  --color-primary: 97, 176, 183;
  --color-secondary: 13, 27, 42;
  --color-accent: 15, 23, 42;
  --color-success: 79, 192, 103;
  --color-info: 65, 133, 242;
  --color-warning: 246, 141, 32;
  --color-danger: 229, 83, 69;
  --color-hover: 16, 16, 17;
  --text-color: 209, 213, 219;
  --border-color: 30, 41, 59;
  --bg-1: 15, 23, 42;
  --bg-2: 30, 41, 59;
  --scroll-color: 170, 170, 170;
  --scroll-hover-color: 155, 155, 155;
  --fk-border-color: 71, 85, 105;
  --fk-placeholder-color: 71, 85, 105;
  --box-shadow: rgba(36, 35, 71, 0.05) 0px 1px 1px,
    rgba(36, 35, 71, 0.05) 0px 0px 1px 1px;
  --cp-bg: 255, 255, 255;
  --rounded-box: 0.2rem;
  --rounded-btn: 0.2rem;
  --rounded-badge: 1.9rem;
  --animation-btn: 0.25s;
  --animation-input: 0.2s;
  --btn-text-case: uppercase;
  --btn-focus-scale: 0.95;
  --padding-btn: 0.5rem;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: 0.5rem;
  --tw-shadow: #e5eaf2;
}

@media (max-width: 1023px) {
  .ai-theme main {
    margin-left: 0 !important;
  }

  .ai-theme-dark main {
    margin-left: 0 !important;
  }
}

@media (max-width: 640px) {
  .ai-theme main {
    padding-top: 4rem; /* To account for the fixed hamburger menu */
  }

  .ai-theme-dark main {
    padding-top: 4rem; /* To account for the fixed hamburger menu */
  }
}
</style>
