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
      </div>
      <rs-button
        @click="formatCurrentCode"
        class="px-3 py-1 bg-blue-600 text-sm rounded"
      >
        <Icon name="vscode-icons:file-type-prettier" class="!w-5 !h-5 mr-2" />
        Format Code (Shift + Alt + F)
      </rs-button>
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

<style lang="scss" scoped></style>
