<script setup>
import { parse } from "@vue/compiler-sfc";
import { watchDebounced } from "@vueuse/core";

import RsAlert from "~/components/RsAlert.vue";
import RsBadge from "~/components/RsBadge.vue";
import RsButton from "~/components/RsButton.vue";
import RsCard from "~/components/RsCard.vue";
import RsCodeMirror from "~/components/RsCodeMirror.vue";
import RsCollapse from "~/components/RsCollapse.vue";
import RsCollapseItem from "~/components/RsCollapseItem.vue";
import RsDropdown from "~/components/RsDropdown.vue";
import RsDropdownItem from "~/components/RsDropdownItem.vue";
import RsFieldset from "~/components/RsFieldset.vue";
import RsModal from "~/components/RsModal.vue";
import RsProgressBar from "~/components/RsProgressBar.vue";
import RsTab from "~/components/RsTab.vue";
import RsTabItem from "~/components/RsTabItem.vue";
import RsTable from "~/components/RsTable.vue";
import RsWizard from "~/components/RsWizard.vue";

// Import pinia store
import { useThemeStore } from "~/stores/theme";

definePageMeta({
  title: "AI SFC Playground",
  description: "AI SFC Playground page",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

const CODE_STORAGE_KEY = "playground-code";

const defaultCode = `<template>
  <rs-card>
    <template #header>SFC Playground Demo</template>
    <template #body>
      <div class="space-y-4">
        <rs-alert variant="info">{{ msg }}</rs-alert>
        <rs-button @click="count++">Clicked {{ count }} times</rs-button>
        <rs-badge>{{ count > 5 ? 'High' : 'Low' }}</rs-badge>
      </div>
    </template>
  </rs-card>
</template>

<script setup>
const msg = 'Hello from SFC Playground';
const count = ref(0);
<\/script>`;

const code = ref(
  localStorage.getItem(CODE_STORAGE_KEY) || defaultCode
);

const compiledCode = ref(null);
const componentKey = ref(0);
const compilationError = ref(null);

const previewSizes = [
  { name: "Mobile", width: "320px", icon: "ph:device-mobile-camera" },
  { name: "Tablet", width: "768px", icon: "ph:device-tablet-camera" },
  { name: "Desktop", width: "1024px", icon: "ph:desktop" },
  { name: "Full", width: "100%", icon: "material-symbols:fullscreen" },
];

const currentPreviewSize = ref(previewSizes[3]); // Default to Full

// Theme-related code
const themeStore = useThemeStore();
const editorTheme = ref({
  label: themeStore.codeTheme,
  value: themeStore.codeTheme,
});
const dropdownThemes = ref([]);

// Get all themes
const themes = codemirrorThemes();

// map the themes to the dropdown
dropdownThemes.value = themes.map((theme) => {
  return {
    label: theme.name,
    value: theme.name,
  };
});

// watch for changes in the theme
watch(editorTheme, (theme) => {
  themeStore.setCodeTheme(theme.value);
});

const compileCode = async (newCode) => {
  try {
    const { descriptor, errors } = parse(newCode);
    if (errors && errors.length > 0) {
      compilationError.value = {
        message: errors[0].message,
        location: errors[0].loc,
      };
      return;
    }

    if (descriptor.template && descriptor.scriptSetup) {
      const template = descriptor.template.content;
      const scriptSetup = descriptor.scriptSetup.content;

      // Dynamically import FormKit components
      const {
        FormKit,
        FormKitSchema,
        FormKitSchemaNode,
        FormKitSchemaCondition,
        FormKitSchemaValidation,
      } = await import("@formkit/vue");

      const component = defineComponent({
        components: {
          RsAlert,
          RsBadge,
          RsButton,
          RsCard,
          RsCodeMirror,
          RsCollapse,
          RsCollapseItem,
          RsDropdown,
          RsDropdownItem,
          RsFieldset,
          RsModal,
          RsProgressBar,
          RsTab,
          RsTabItem,
          RsTable,
          RsWizard,
          FormKit,
          FormKitSchema,
          FormKitSchemaNode,
          FormKitSchemaCondition,
          FormKitSchemaValidation,
        },
        template,
        setup() {
          const setupContext = reactive({});

          try {
            // First, create all the refs so they exist in the context
            const refRegex = /const\s+(\w+)\s*=\s*ref\(([^)]*)\)/g;
            const refMatches = [...scriptSetup.matchAll(refRegex)];
            
            refMatches.forEach(match => {
              const [, varName, refValue] = match;
              let initialValue = null;
              
              try {
                // Try to evaluate the ref value
                if (refValue.trim() === '') {
                  initialValue = null;
                } else if (refValue.trim() === 'true') {
                  initialValue = true;
                } else if (refValue.trim() === 'false') {
                  initialValue = false;
                } else if (refValue.trim() === 'null') {
                  initialValue = null;
                } else if (refValue.trim() === 'undefined') {
                  initialValue = undefined;
                } else if (refValue.trim().startsWith("'") || refValue.trim().startsWith('"')) {
                  // String value
                  initialValue = refValue.trim().slice(1, -1);
                } else if (!isNaN(Number(refValue.trim()))) {
                  // Numeric value
                  initialValue = Number(refValue.trim());
                } else if (refValue.trim().startsWith('[')) {
                  // Array
                  initialValue = [];
                } else if (refValue.trim().startsWith('{')) {
                  // Object
                  initialValue = {};
                }
              } catch (e) {
                console.error('Error evaluating ref value:', e);
              }
              
              // Create the ref with the evaluated value
              setupContext[varName] = ref(initialValue);
            });
            
            // Extract other variable declarations (non-refs)
            const varRegex = /const\s+(\w+)\s*=\s*(?!ref\()([^;]+)/g;
            const varMatches = [...scriptSetup.matchAll(varRegex)];
            
            varMatches.forEach(match => {
              const [, varName, varValue] = match;
              
              // Skip if it's already defined as a ref
              if (setupContext[varName]) return;
              
              // Skip function declarations for now
              if (varValue.trim().startsWith('() =>') || varValue.trim().startsWith('function')) return;
              
              try {
                if (varValue.trim().startsWith("'") || varValue.trim().startsWith('"')) {
                  // String value
                  setupContext[varName] = varValue.trim().slice(1, -1);
                } else if (!isNaN(Number(varValue.trim()))) {
                  // Numeric value
                  setupContext[varName] = Number(varValue.trim());
                } else {
                  // Default to null for other values
                  setupContext[varName] = null;
                }
              } catch (e) {
                console.error('Error evaluating variable value:', e);
                setupContext[varName] = null;
              }
            });
            
            // Modify the script to make functions work with refs
            // Replace all instances of ref.value with direct ref access
            let modifiedScript = scriptSetup;
            
            // Find all function declarations
            const functionRegex = /const\s+(\w+)\s*=\s*(?:function\s*\([^)]*\)|(?:\([^)]*\))\s*=>)\s*{([\s\S]*?)}/g;
            let match;
            let functionNames = [];
            
            while ((match = functionRegex.exec(scriptSetup)) !== null) {
              const funcName = match[1];
              let funcBody = match[2];
              functionNames.push(funcName);
              
              // For each ref, replace ref.value with direct access in the function body
              refMatches.forEach(refMatch => {
                const refName = refMatch[1];
                const refRegExp = new RegExp(`${refName}\\.value`, 'g');
                funcBody = funcBody.replace(refRegExp, `__refs.${refName}.value`);
              });
              
              // Create a modified function that uses the __refs object
              const modifiedFunc = `const ${funcName} = function() {
                const __refs = {
                  ${refMatches.map(m => `${m[1]}: ctx.${m[1]}`).join(',\n')}
                };
                ${funcBody}
              }`;
              
              // Replace the original function with the modified one
              modifiedScript = modifiedScript.replace(match[0], modifiedFunc);
            }
            
            // Now run the modified script in the context
            const setupFunction = new Function(
              "ctx",
              "ref",
              "reactive",
              "computed",
              "watch",
              "onMounted",
              "onUnmounted",
              "useFetch",
              "fetch",
              "useAsyncData",
              "useNuxtApp",
              "useRuntimeConfig",
              "useRoute",
              "useRouter",
              "useState",
              "FormKit",
              "FormKitSchema",
              "FormKitSchemaNode",
              "FormKitSchemaCondition",
              "FormKitSchemaValidation",
              `
              try {
                with (ctx) {
                  ${modifiedScript}
                }
                return ctx;
              } catch (error) {
                console.error("Error executing script setup:", error);
                return { 
                  __error: error.message,
                  ...ctx 
                };
              }
              `
            );

            const result = setupFunction(
              setupContext,
              ref,
              reactive,
              computed,
              watch,
              onMounted,
              onUnmounted,
              useFetch,
              fetch,
              useAsyncData,
              useNuxtApp,
              useRuntimeConfig,
              useRoute,
              useRouter,
              useState,
              FormKit,
              FormKitSchema,
              FormKitSchemaNode,
              FormKitSchemaCondition,
              FormKitSchemaValidation
            );

            // Check if there was an error in the script execution
            if (result.__error) {
              throw new Error(result.__error);
            }

            // Merge the result back into setupContext
            Object.assign(setupContext, result);

            return setupContext;
          } catch (error) {
            console.error("Error in setup function:", error);
            compilationError.value = {
              message: `Error in setup function: ${error.message}`,
              location: { start: 0, end: 0 },
            };
            // Return an empty object to prevent breaking the component
            return {};
          }
        },
      });

      compiledCode.value = markRaw(component);
      componentKey.value++;
      compilationError.value = null;
    } else {
      compiledCode.value = null;
      compilationError.value = {
        message: "Invalid SFC format.",
        location: { start: 0, end: 0 },
      };
    }
  } catch (error) {
    console.error("Compilation error:", error);
    compiledCode.value = null;
    compilationError.value = {
      message: `Compilation error: ${error.message}`,
      location: { start: 0, end: 0 },
    };
  }
};

watchDebounced(
  code,
  async (newCode) => {
    await compileCode(newCode);
  },
  { debounce: 300, immediate: true }
);

const handleFormatCode = () => {
  // Recompile the code after formatting
  setTimeout(() => compileCode(code.value), 100);
};

onMounted(async () => {
  await compileCode(code.value);
});

const resetCode = () => {
  code.value = defaultCode;
  localStorage.setItem(CODE_STORAGE_KEY, defaultCode);
  compileCode(code.value);
};

// Add a watch effect to save code changes to localStorage
watch(
  code,
  (newCode) => {
    localStorage.setItem(CODE_STORAGE_KEY, newCode);
  },
  { deep: true }
);
</script>
<template>
  <div class="flex flex-col h-screen bg-gray-900">
    <!-- Header -->
    <header
      class="bg-gray-800 p-2 flex flex-wrap items-center justify-between text-white"
    >
      <div class="flex items-center mb-2 sm:mb-0 gap-4">
        <Icon
          @click="
            navigateTo('/', {
              external: true,
            })
          "
          name="ph:arrow-circle-left-duotone"
          class="cursor-pointer"
        />
        <img
          src="@/assets/img/logo/logo-word-white.svg"
          alt="Vue Logo"
          class="h-8 block mr-2"
        />
      </div>
      <div class="flex flex-wrap items-center space-x-2">
        <rs-button @click="resetCode" class="mr-2">
          <Icon name="material-symbols:refresh" class="mr-2" />
          Reset Code
        </rs-button>
        <h1 class="text-lg font-semibold">Code Playground</h1>
      </div>
    </header>

    <!-- Main content -->
    <div class="flex flex-col sm:flex-row flex-1 overflow-hidden">
      <!-- Editor section -->
      <div
        class="w-full sm:w-1/2 flex flex-col border-b sm:border-b-0 sm:border-r border-gray-900"
      >
        <!-- <div class="bg-gray-800 p-2 text-white text-sm">
          <div class="flex items-center">
            <Icon name="ph:info-fill" class="mr-2 text-blue-400" />
            <span>
              <strong>Tip:</strong> For modifying refs, use inline functions in the template (e.g., <code>@click="myRef.value += 1"</code>) 
              instead of separate function declarations.
            </span>
          </div>
        </div> -->
        <div class="flex-grow overflow-hidden">
          <rs-code-mirror
            v-model="code"
            mode="javascript"
            class="h-full"
            @format-code="handleFormatCode"
          />
        </div>
      </div>

      <!-- Preview section -->
      <div class="w-full sm:w-1/2 bg-white overflow-auto flex flex-col">
        <div
          class="bg-gray-800 p-2 flex justify-between items-center text-white"
        >
          <h2 class="text-sm font-semibold">Preview</h2>
          <div class="flex space-x-2">
            <rs-button
              v-for="size in previewSizes"
              :key="size.name"
              @click="currentPreviewSize = size"
              :class="{
                'bg-blue-600': currentPreviewSize === size,
                'bg-gray-600': currentPreviewSize !== size,
              }"
              class="px-2 py-1 text-xs rounded"
            >
              <Icon v-if="size.icon" :name="size.icon" class="!w-5 !h-5 mr-2" />
              {{ size.name }}
            </rs-button>
          </div>
        </div>
        <div class="flex-grow overflow-auto p-4 flex justify-center">
          <div
            :style="{
              width: currentPreviewSize.width,
              height: '100%',
              overflow: 'auto',
            }"
            class="border border-gray-300 transition-all duration-300 ease-in-out"
          >
            <component
              :key="componentKey"
              v-if="compiledCode && !compilationError"
              :is="compiledCode"
            />
            <div v-else-if="compilationError?.message">
              <div class="flex justify-center items-center p-5">
                <div class="text-center">
                  <Icon name="ph:warning" class="text-6xl" />
                  <p class="text-lg font-semibold mt-4">
                    Something went wrong. Please refer the error in the editor.
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500">Waiting for code changes...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-frame {
  background-color: #f0f0f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .device-frame {
    padding: 8px;
    border-radius: 8px;
  }
}

:deep(.cm-editor) {
  height: 100%;
}
</style>