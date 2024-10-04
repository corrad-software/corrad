<script setup>
const route = useRoute();

// Get breadcrumb from page meta
const breadcrumb = computed(() => {
  let breadcrumb = null;
  const matched = route.matched;

  if (matched[matched.length - 1].meta?.breadcrumb) {
    breadcrumb = matched[matched.length - 1].meta.breadcrumb;
  } else {
    // if no breadcrumb in page meta, get breadcrumb from route matched
    breadcrumb = matched.map((item) => {
      return {
        name: item.meta.title,
        path: item.path,
      };
    });

    return breadcrumb;
  }

  // if type current overwrite path to its own path
  if (breadcrumb) {
    breadcrumb.forEach((item) => {
      if (item.type == "current") {
        item.path = route.path;
      } else if (item.type == "parent") {
        item.path = route.path.split("/").slice(0, -item.parentNo).join("/");
      }
    });
  }
  return breadcrumb;
});

// Get title from page meta
const title = computed(() => {
  const matched = route.matched;
  const title = matched[matched.length - 1].meta.title;
  return title;
});

async function navigateMenu(path) {
  try {
    await navigateTo(path);
  } catch (e) {
    return;
  }
}
</script>

<template>
  <div v-if="breadcrumb" class="mb-6">
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="flex items-center text-sm">
        <li class="flex items-center">
          <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">
            <Icon name="mdi:home" size="16" />
          </NuxtLink>
        </li>
        <li
          v-for="(item, index) in breadcrumb"
          :key="index"
          class="flex items-center"
        >
          <Icon
            name="mdi:chevron-right"
            size="16"
            class="mx-2 text-gray-400"
            aria-hidden="true"
          />
          <a
            class="cursor-pointer"
            @click="navigateMenu(item.path)"
            :class="{
              'text-gray-500 hover:text-gray-700':
                index !== breadcrumb.length - 1,
              'text-primary font-medium': index === breadcrumb.length - 1,
            }"
            :aria-current="index === breadcrumb.length - 1 ? 'page' : undefined"
          >
            {{ item.name }}
          </a>
        </li>
      </ol>
    </nav>
  </div>
</template>
