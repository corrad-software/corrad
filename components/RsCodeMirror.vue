<script setup>
import { useThemeStore } from "~/stores/theme";

import { vue } from "@codemirror/lang-vue";
import { javascript } from "@codemirror/lang-javascript";

import { oneDark } from "@codemirror/theme-one-dark";
import { amy, ayuLight, barf, clouds, cobalt, dracula } from "thememirror";

import { autocompletion } from "@codemirror/autocomplete";
import { indentUnit } from "@codemirror/language";
import { indentOnInput } from "@codemirror/language";
import { useDebounceFn } from "@vueuse/core";

// Dynamically import Prettier and its plugins
const prettier = ref(null);
const parserHTML = ref(null);
const parserBabel = ref(null);
const parserPostCSS = ref(null);
const pluginVue = ref(null);

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "vue",
  },
  height: {
    type: String,
    default: "70vh",
  },
  modelValue: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "oneDark",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: [String, Object, Array],
    default: "",
  },
});

const emits = defineEmits(["update:modelValue", "format-code"]);

const themeStore = useThemeStore();
const editorTheme = ref(themeStore.codeTheme);

// Component list panel state
const showComponentList = ref(false);
const activeTab = ref("rose");
const searchQuery = ref("");

// Computed properties for filtered components
const filteredRoseComponents = computed(() => {
  if (!searchQuery.value) return roseComponents;
  const query = searchQuery.value.toLowerCase();
  return roseComponents.filter(
    (component) =>
      component.name.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.props.some((prop) => prop.toLowerCase().includes(query))
  );
});

const filteredFormkitComponents = computed(() => {
  if (!searchQuery.value) return formkitComponents;
  const query = searchQuery.value.toLowerCase();
  return formkitComponents.filter(
    (component) =>
      component.name.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.props.some((prop) => prop.toLowerCase().includes(query))
  );
});

const filteredCodeSnippets = computed(() => {
  if (!searchQuery.value) return codeSnippets;
  const query = searchQuery.value.toLowerCase();
  return codeSnippets.filter(
    (snippet) =>
      snippet.name.toLowerCase().includes(query) ||
      snippet.description.toLowerCase().includes(query)
  );
});

// Available components
const roseComponents = [
  {
    name: "RsAlert",
    description: "Display alert messages with different variants",
    props: ["variant", "dismissible"],
  },
  {
    name: "RsBadge",
    description: "Display a badge with text",
    props: ["variant"],
  },
  {
    name: "RsButton",
    description: "Interactive button with various styles",
    props: ["variant", "size", "disabled"],
  },
  {
    name: "RsCard",
    description: "Container with header, body and footer slots",
    props: [],
  },
  {
    name: "RsCodeMirror",
    description: "Code editor component",
    props: ["mode", "theme"],
  },
  { name: "RsCollapse", description: "Collapsible container", props: [] },
  {
    name: "RsCollapseItem",
    description: "Individual collapse panel",
    props: ["title", "open"],
  },
  {
    name: "RsDropdown",
    description: "Dropdown menu component",
    props: ["label", "position"],
  },
  {
    name: "RsDropdownItem",
    description: "Item within dropdown menu",
    props: ["disabled"],
  },
  {
    name: "RsFieldset",
    description: "Group form elements with a title",
    props: ["legend"],
  },
  {
    name: "RsModal",
    description: "Modal dialog component",
    props: ["title", "size"],
  },
  {
    name: "RsProgressBar",
    description: "Display progress with a bar",
    props: ["value", "max", "variant"],
  },
  { name: "RsTab", description: "Tab container component", props: ["active"] },
  {
    name: "RsTabItem",
    description: "Individual tab panel",
    props: ["title", "active"],
  },
  {
    name: "RsTable",
    description: "Data table with sorting and pagination",
    props: ["data", "columns"],
  },
  {
    name: "RsWizard",
    description: "Multi-step wizard component",
    props: ["steps"],
  },
  { name: "RSCalendar", description: "Calendar component", props: ["events"] },
];

const formkitComponents = [
  {
    name: "FormKit",
    description: "Main FormKit component for forms",
    props: ["type", "name", "validation"],
  },
  {
    name: "FormKitSchema",
    description: "Schema-based form generation",
    props: ["schema"],
  },
  {
    name: "OneTimePassword",
    description: "Input for one-time passwords",
    props: ["length"],
  },
  { name: "TextMask", description: "Input with text masking", props: ["mask"] },
  {
    name: "DateTimePicker",
    description: "Date and time picker",
    props: ["format"],
  },
  {
    name: "FileDropzone",
    description: "File upload dropzone",
    props: ["accept", "multiple"],
  },
];

// Code snippets for common patterns
const codeSnippets = [
  {
    name: "Basic Component",
    description: "Simple Vue component with template and script setup",
    code: `<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
const title = ref('Hello World');
const message = ref('Welcome to the SFC Playground');
<\/script>`,
  },
  {
    name: "Form with FormKit",
    description: "Basic form using FormKit components",
    code: `<template>
  <rs-card>
    <template #header>Contact Form</template>
    <template #body>
      <FormKit type="form" @submit="handleSubmit">
        <FormKit type="text" name="name" label="Name" validation="required" />
        <FormKit type="email" name="email" label="Email" validation="required|email" />
        <FormKit type="textarea" name="message" label="Message" validation="required" />
        <FormKit type="submit" label="Submit" />
      </FormKit>
    </template>
  </rs-card>
</template>

<script setup>
const handleSubmit = (formData) => {
  console.log(formData);
  // Process form data
}
<\/script>`,
  },
  {
    name: "Data Table",
    description: "Table component with sample data",
    code: `<template>
  <rs-card>
    <template #header>Users Table</template>
    <template #body>
      <rs-table :data="users" :columns="columns" />
    </template>
  </rs-card>
</template>

<script setup>
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
];

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' }
]);
<\/script>`,
  },
  {
    name: "Tabs Example",
    description: "Component with tabbed interface",
    code: `<template>
  <rs-card>
    <template #header>Tabbed Interface</template>
    <template #body>
      <rs-tab>
        <rs-tab-item title="Profile">
          <h3>User Profile</h3>
          <p>Profile content goes here</p>
        </rs-tab-item>
        <rs-tab-item title="Settings">
          <h3>User Settings</h3>
          <p>Settings content goes here</p>
        </rs-tab-item>
        <rs-tab-item title="Notifications">
          <h3>Notifications</h3>
          <p>Notifications content goes here</p>
        </rs-tab-item>
      </rs-tab>
    </template>
  </rs-card>
</template>

<script setup>
// No additional script needed for this example
<\/script>`,
  },
];

// Function to insert component template into editor
const insertComponent = (component) => {
  if (!view.value) return;

  // Create the component template string
  let templateString = "";

  if (component.props.length > 0) {
    // Component with props
    templateString = `<${component.name} `;

    // Add each prop
    for (let i = 0; i < component.props.length; i++) {
      const prop = component.props[i];
      templateString += `${prop}=""`;

      // Add space between props
      if (i < component.props.length - 1) {
        templateString += " ";
      }
    }

    // Close the component tag
    templateString += `></${component.name}>`;
  } else {
    // Component without props
    templateString = `<${component.name}></${component.name}>`;
  }

  // Insert the template at cursor position
  const cursor = view.value.state.selection.main.head;
  const transaction = view.value.state.update({
    changes: {
      from: cursor,
      to: cursor,
      insert: templateString,
    },
  });

  view.value.dispatch(transaction);

  // Close the component list after insertion
  showComponentList.value = false;

  // Focus back on the editor
  setTimeout(() => {
    if (view.value) {
      view.value.focus();
    }
  }, 100);
};

// Function to insert a code snippet
const insertSnippet = (snippet) => {
  if (!view.value) return;

  // Replace the entire editor content with the snippet
  const transaction = view.value.state.update({
    changes: {
      from: 0,
      to: view.value.state.doc.length,
      insert: snippet.code,
    },
  });

  view.value.dispatch(transaction);

  // Format the code after insertion
  setTimeout(() => formatCurrentCode(), 100);
};

const dropdownThemes = ref([
  {
    label: "default",
    value: "clouds",
  },
  {
    label: "oneDark",
    value: "oneDark",
  },
  {
    label: "amy",
    value: "amy",
  },
  {
    label: "ayu",
    value: "ayuLight",
  },
  {
    label: "barf",
    value: "barf",
  },
  {
    label: "cobalt",
    value: "cobalt",
  },
  {
    label: "dracula",
    value: "dracula",
  },
]);

const value = ref(props.modelValue);
const extensions = ref([]);
if (props.mode == "vue") {
  extensions.value = [
    vue(),
    oneDark,
    autocompletion(),
    indentUnit.of(" "),
    indentOnInput(),
  ];
} else {
  extensions.value = [
    javascript(),
    oneDark,
    autocompletion(),
    indentUnit.of(" "),
    indentOnInput(),
  ];
}

const totalLines = ref(0);
const totalLength = ref(0);

// Codemirror EditorView instance ref
const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
  totalLines.value = view.value.state.doc.lines;
  totalLength.value = view.value.state.doc.length;
};

watch(
  () => editorTheme.value,
  (themeVal) => {
    const themeExtension =
      themeVal === "oneDark"
        ? oneDark
        : themeVal === "amy"
          ? amy
          : themeVal === "ayuLight"
            ? ayuLight
            : themeVal === "barf"
              ? barf
              : themeVal === "cobalt"
                ? cobalt
                : themeVal === "dracula"
                  ? dracula
                  : clouds;

    if (props.mode == "vue") {
      extensions.value = [
        vue(),
        themeExtension,
        autocompletion(),
        indentUnit.of(" "),
        indentOnInput(),
      ];
    } else {
      extensions.value = [
        javascript(),
        themeExtension,
        autocompletion(),
        indentUnit.of(" "),
        indentOnInput(),
      ];
    }
  }
);

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state;
  const ranges = state.selection.ranges;
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
  const cursor = ranges[0].anchor;
  const length = state.doc.length;
  const lines = state.doc.lines;

  console.log("state", view.value.state);
};

const onChange = (value) => {
  // console.log("onChange", value);
  emits("update:modelValue", value);
  totalLines.value = view.value.state.doc.lines;
  totalLength.value = view.value.state.doc.length;
};

const onFocus = (value) => {
  // console.log("onFocus", value);
};

const onBlur = (value) => {
  // console.log("onBlur", value);
};

const onUpdate = (value) => {
  // console.log("onUpdate", value);
};

function numberComma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to load Prettier and its plugins
const loadPrettier = async () => {
  if (!prettier.value) {
    prettier.value = await import("prettier/standalone");
    parserHTML.value = await import("prettier/parser-html");
    parserBabel.value = await import("prettier/parser-babel");
    parserPostCSS.value = await import("prettier/parser-postcss");
    pluginVue.value = await import("prettier-plugin-vue");
  }
};

// Function Format Code
const formatCode = async (code) => {
  await loadPrettier();
  try {
    const formattedCode = await prettier.value.format(code, {
      parser: "vue",
      plugins: [
        parserHTML.value,
        parserBabel.value,
        parserPostCSS.value,
        pluginVue.value,
      ],
      semi: false,
      singleQuote: true,
      trailingComma: "es5",
    });
    return formattedCode;
  } catch (error) {
    console.error("Formatting error:", error);
    return code; // Return original code if formatting fails
  }
};

const formatCurrentCode = async () => {
  try {
    const formattedCode = await formatCode(value.value);
    value.value = formattedCode;
    emits("update:modelValue", formattedCode);
    emits("format-code");
  } catch (error) {
    console.log("Error formatting code:", error);
  }
};

const debouncedFormatCode = useDebounceFn(formatCurrentCode, 300);

const handleKeyDown = (e) => {
  // Press Shift + Alt + F to format code
  if (e.shiftKey && e.altKey && e.key === "F") {
    e.preventDefault();
    debouncedFormatCode();
  }

  // Press Ctrl + Space to toggle component list
  if (e.ctrlKey && e.key === " ") {
    e.preventDefault();
    showComponentList.value = !showComponentList.value;

    // Focus on search input when opening
    if (showComponentList.value) {
      setTimeout(() => {
        const searchInput = document.getElementById("component-search");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  // Press Escape to close component list
  if (e.key === "Escape" && showComponentList.value) {
    e.preventDefault();
    showComponentList.value = false;

    // Focus back on the editor
    if (view.value) {
      view.value.focus();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  loadPrettier(); // Preload Prettier when the component mounts
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// Add this watch effect after the value ref declaration
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== value.value) {
      value.value = newValue;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div :class="props.class">
    <div
      class="flex justify-between items-center gap-2 p-2 bg-[#282C34] text-[#abb2bf]"
    >
      <div class="flex items-center gap-2">
        Theme:
        <FormKit
          v-model="editorTheme"
          type="select"
          placeholder="Select Themes"
          :options="dropdownThemes"
          :classes="{
            input:
              '!bg-[#282C34] !text-[#abb2bf] !border-[#abb2bf] hover:cursor-pointer h-6 w-[100px]',
            inner: ' !rounded-none !mb-0',
            outer: '!mb-0',
          }"
        />
        <rs-button
          @click="showComponentList = !showComponentList"
          class="ml-2 px-3 py-1 bg-gray-700 text-sm rounded"
        >
          <Icon
            :name="showComponentList ? 'ph:code-block-fill' : 'ph:code-block'"
            class="!w-5 !h-5 mr-2"
          />
          {{
            showComponentList ? "Hide Components" : "Show Components"
          }}
          (Ctrl+Space)
        </rs-button>
      </div>
      <rs-button
        @click="formatCurrentCode"
        class="px-3 py-1 bg-blue-600 text-sm rounded"
      >
        <Icon name="vscode-icons:file-type-prettier" class="!w-5 !h-5 mr-2" />
        Format Code (Shift+Alt+F)
      </rs-button>
    </div>

    <!-- Component List Panel -->
    <div
      v-if="showComponentList"
      class="bg-[#21252b] text-[#abb2bf] p-2 border-b border-gray-700"
    >
      <div class="flex border-b border-gray-700 mb-2">
        <button
          @click="activeTab = 'rose'"
          class="px-3 py-1 text-sm"
          :class="
            activeTab === 'rose'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : ''
          "
        >
          Rose UI Components
        </button>
        <button
          @click="activeTab = 'formkit'"
          class="px-3 py-1 text-sm"
          :class="
            activeTab === 'formkit'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : ''
          "
        >
          FormKit Components
        </button>
        <button
          @click="activeTab = 'snippets'"
          class="px-3 py-1 text-sm"
          :class="
            activeTab === 'snippets'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : ''
          "
        >
          Code Snippets
        </button>
        <button
          @click="showComponentList = false"
          class="ml-auto px-3 py-1 text-sm text-gray-400 hover:text-white"
        >
          <Icon name="ph:x" class="!w-4 !h-4" />
        </button>
      </div>

      <!-- Search input -->
      <div class="mb-2">
        <input
          id="component-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search components... (Esc to close)"
          class="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
          @keydown.escape="showComponentList = false"
        />
      </div>

      <div class="max-h-60 overflow-y-auto">
        <div v-if="activeTab === 'rose'">
          <div
            v-if="filteredRoseComponents.length === 0"
            class="text-center py-4 text-gray-400"
          >
            No components match your search
          </div>
          <div
            v-for="component in filteredRoseComponents"
            :key="component.name"
            class="mb-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
            @click="insertComponent(component)"
          >
            <div class="flex justify-between">
              <span class="font-medium text-blue-400">{{
                component.name
              }}</span>
              <button class="text-xs bg-blue-600 px-2 py-0.5 rounded">
                Insert
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {{ component.description }}
            </p>
            <div
              v-if="component.props.length > 0"
              class="mt-1 flex flex-wrap gap-1"
            >
              <span
                v-for="prop in component.props"
                :key="prop"
                class="text-xs bg-gray-700 px-1.5 py-0.5 rounded"
                >{{ prop }}</span
              >
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'formkit'">
          <div
            v-if="filteredFormkitComponents.length === 0"
            class="text-center py-4 text-gray-400"
          >
            No components match your search
          </div>
          <div
            v-for="component in filteredFormkitComponents"
            :key="component.name"
            class="mb-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
            @click="insertComponent(component)"
          >
            <div class="flex justify-between">
              <span class="font-medium text-green-400">{{
                component.name
              }}</span>
              <button class="text-xs bg-green-600 px-2 py-0.5 rounded">
                Insert
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {{ component.description }}
            </p>
            <div
              v-if="component.props.length > 0"
              class="mt-1 flex flex-wrap gap-1"
            >
              <span
                v-for="prop in component.props"
                :key="prop"
                class="text-xs bg-gray-700 px-1.5 py-0.5 rounded"
                >{{ prop }}</span
              >
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'snippets'">
          <div
            v-if="filteredCodeSnippets.length === 0"
            class="text-center py-4 text-gray-400"
          >
            No snippets match your search
          </div>
          <div
            v-for="snippet in filteredCodeSnippets"
            :key="snippet.name"
            class="mb-2 p-2 hover:bg-gray-800 rounded"
          >
            <div class="flex justify-between">
              <span class="font-medium text-purple-400">{{
                snippet.name
              }}</span>
              <button
                @click="insertSnippet(snippet)"
                class="text-xs bg-purple-600 px-2 py-0.5 rounded"
              >
                Use Template
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ snippet.description }}</p>
          </div>
          <div class="text-xs text-yellow-500 mt-2 p-2 bg-gray-800 rounded">
            <Icon name="ph:warning-circle" class="inline mr-1" />
            Using a template will replace all current code in the editor.
          </div>
        </div>
      </div>

      <!-- Keyboard shortcuts help -->
      <div class="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
        <div class="flex justify-between">
          <span
            ><kbd class="px-1 py-0.5 bg-gray-700 rounded">Ctrl+Space</kbd>
            Toggle component list</span
          >
          <span
            ><kbd class="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> Close
            panel</span
          >
          <span
            ><kbd class="px-1 py-0.5 bg-gray-700 rounded">Shift+Alt+F</kbd>
            Format code</span
          >
        </div>
      </div>
    </div>

    <client-only>
      <CodeMirror
        v-model="value"
        placeholder="Code goes here..."
        :style="{ height: height }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        :disabled="disabled"
        @ready="handleReady"
        @change="onChange($event)"
        @focus="onFocus($event)"
        @blur="onBlur($event)"
        @update="onUpdate($event)"
      />
    </client-only>
    <div
      class="footer flex justify-end items-center gap-2 p-2 bg-[#282C34] text-[#abb2bf]"
    >
      <span class="">Lines: {{ numberComma(totalLines) }}</span>
      <span class="">Length: {{ numberComma(totalLength) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Add smooth transition for component list panel */
.max-h-60 {
  transition: max-height 0.3s ease-in-out;
}

/* Style for keyboard shortcut elements */
kbd {
  font-family: monospace;
  display: inline-block;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
</style>
