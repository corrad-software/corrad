<script setup>
const isSidebarOpen = ref(false);
const isSidebarMinimized = ref(true);
const isMobile = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleSidebarMinimize = () => {
  isSidebarMinimized.value = !isSidebarMinimized.value;
  if (process.client) {
    localStorage.setItem("sidebarMinimized", isSidebarMinimized.value);
  }
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    isSidebarOpen.value = true;
  }
};

onMounted(() => {
  const savedMinimizeState = localStorage.getItem("sidebarMinimized");
  if (savedMinimizeState !== null) {
    isSidebarMinimized.value = savedMinimizeState === "true";
  } else {
    localStorage.setItem("sidebarMinimized", "true");
  }

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
      class="flex flex-col md:flex-row h-screen bg-[rgb(var(--bg-1))] text-[rgb(var(--text-color))]"
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

      <aiSideMenu
        :isOpen="isSidebarOpen"
        :isMinimized="isSidebarMinimized"
        @toggle-minimize="toggleSidebarMinimize"
      />

      <!-- Dark overlay -->
      <div
        v-if="isSidebarOpen && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-20"
        @click="toggleSidebar"
      ></div>

      <!-- Main content wrapper -->
      <div class="relative flex-1 flex justify-center">
        <main
          class="w-full max-w-7xl p-8 overflow-y-auto transition-all duration-300"
          :class="{
            '': isSidebarOpen,
            'lg:ml-20': isSidebarMinimized,
          }"
        >
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-theme {
  --color-primary: 24, 24, 27;
  --color-secondary: 244, 244, 245;
  --color-accent: 243, 244, 246;
  --color-success: 79, 192, 103;
  --color-info: 65, 133, 242;
  --color-warning: 246, 141, 32;
  --color-danger: 229, 83, 69;
  --color-hover: 219, 219, 220;
  --text-color: 9, 9, 11;
  --text-muted: 113, 113, 122;
  --border-color: 235, 235, 235;
  --bg-1: 255, 255, 255;
  --bg-2: 255, 255, 255;
  --scroll-color: 170, 170, 170;
  --scroll-hover-color: 155, 155, 155;
  --fk-border-color: 235, 235, 235;
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
  --padding-btn: 0.5rem 1rem;
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
  --text-muted: 113, 113, 122;
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
  .ai-theme main,
  .ai-theme-dark main {
    width: 100% !important;
    margin-left: 0 !important;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 640px) {
  .ai-theme main,
  .ai-theme-dark main {
    padding-top: 4rem;
  }
}
</style>
