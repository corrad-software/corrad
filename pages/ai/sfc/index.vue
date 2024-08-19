<script setup>
import RsButton from "@/components/RsButton.vue";
import { parse } from "@vue/compiler-sfc";
import { watchDebounced } from "@vueuse/core";

definePageMeta({
  title: "AI SFC Playground",
  description: "AI SFC Playground page",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

const code = ref(
  `<template>
        <div class="p-4 bg-red-500 text-white rounded-lg"> 
            <p class="mt-2 text-lg">{{ msg }}</p>
            <RsButton>Button</RsButton>
        </div>
    </template>
    
    <script setup>
        const msg = 'Hello from SFC Playground';
    <\/script>`
);

const compiledCode = ref(null);
const componentKey = ref(0); // Key to force re-render
const compilationError = ref(null); // Store compilation error

const compileCode = (newCode) => {
  try {
    const { descriptor } = parse(newCode);
    if (descriptor.template && descriptor.scriptSetup) {
      const template = descriptor.template.content;
      const scriptSetup = descriptor.scriptSetup.content;

      const component = defineComponent({
        components: {
          RsButton,
        },
        template,
        setup() {
          try {
            const setupFunction = new Function(
              "ref",
              `
              ${scriptSetup}
              return { msg };
            `
            );
            return setupFunction(ref);
          } catch (error) {
            compilationError.value = `Runtime error in setup function: ${error.message}`;
            // console.error(compilationError.value);
            return {};
          }
        },
      });

      compiledCode.value = markRaw(component); // Mark the component as non-reactive
      componentKey.value++; // Increment key to force re-render
      compilationError.value = null; // Clear any previous errors
    } else {
      compiledCode.value = null;
      compilationError.value = "Invalid SFC format.";
    }
  } catch (error) {
    compiledCode.value = null;
    compilationError.value = `Compilation error: ${error.message}`;
    console.error(compilationError.value);
  }
};

// Watch the code and compile it whenever it changes, with debounce
watchDebounced(
  code,
  (newCode) => {
    compileCode(newCode);
  },
  { debounce: 300, immediate: true } // Debounce for 300ms
);

// Compile the code on mount to render it initially
onMounted(() => {
  compileCode(code.value);
});
</script>

<template>
  <div class="grid grid-cols-2 gap-5 p-5">
    <FormKit
      v-model="code"
      type="textarea"
      placeholder="Type your component code here"
      :classes="{
        outer: 'h-[90vh]',
        input: 'h-[90vh]',
      }"
      spellcheck="false"
    />
    <div class="rounded-lg border bg-white h-[90vh] p-5">
      <component
        :key="componentKey"
        v-if="compiledCode && !compilationError"
        :is="compiledCode"
      />
      <div v-else-if="compilationError" class="text-red-500">
        {{ compilationError }}
      </div>
      <div v-else class="text-red-500">Invalid SFC or error in compilation</div>
    </div>
  </div>
</template>
