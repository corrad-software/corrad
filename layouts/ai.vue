<script setup>
const isSidebarOpen = ref(false);
const isMobile = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    isSidebarOpen.value = true;
  }
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
        :class="[
          'lg:hidden fixed z-30 transition-all duration-300',
          isSidebarOpen ? 'top-4 left-4 p-2 rounded-md' : 'top-4 left-4 p-2',
          'bg-[rgb(var(--color-primary))] text-white',
        ]"
      >
        <Icon
          :name="
            isSidebarOpen ? 'material-symbols:close' : 'material-symbols:menu'
          "
          class="w-6 h-6"
        />
      </rs-button>

      <aiSideMenu :isOpen="isSidebarOpen" />

      <!-- Dark overlay -->
      <div
        v-if="isSidebarOpen && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-20"
        @click="toggleSidebar"
      ></div>

      <!-- Main content -->
      <main
        class="flex-1 p-8 overflow-y-auto"
        :class="{ 'lg:ml-64': isSidebarOpen }"
      >
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
  --color-secondary: 51, 51, 51;
  --color-accent: 15, 23, 42;
  --color-success: 79, 192, 103;
  --color-info: 65, 133, 242;
  --color-warning: 246, 141, 32;
  --color-danger: 229, 83, 69;
  --color-hover: 30, 30, 30;
  --text-color: 199, 205, 207;
  --border-color: 30, 41, 59;
  --bg-1: 18, 20, 22;
  --bg-2: 33, 33, 33;
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
