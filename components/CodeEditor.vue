<!-- CodeEditor.vue -->
<script setup>
  
const props = defineProps(['modelValue', 'error']);
const emit = defineEmits(['update:modelValue']);

const textarea = ref(null);
const highlightOverlay = ref(null);
const localCode = ref(props.modelValue);

const updateCode = () => {
  emit('update:modelValue', localCode.value);
};

const syncScroll = () => {
  if (highlightOverlay.value) {
    highlightOverlay.value.scrollTop = textarea.value.scrollTop;
  }
};

watch(() => props.modelValue, (newValue) => {
  localCode.value = newValue;
});

const errorHighlightStyle = computed(() => {
  if (!props.error || !props.error.location) return {};
  const { start, end } = props.error.location;
  return {
    position: 'absolute',
    left: '0',
    right: '0',
    top: `${(start.line - 1) * 1.5}em`,
    height: `${(end.line - start.line + 1) * 1.5}em`,
  };
});

const errorMessageStyle = computed(() => {
  if (!props.error || !props.error.location) return {};
  const { start } = props.error.location;
  return {
    top: `${start.line * 1.5}em`,
    left: '0',
  };
});
</script>
<template>
    <div class="code-editor relative font-mono text-sm">
      <textarea
        ref="textarea"
        v-model="localCode"
        @input="updateCode"
        @scroll="syncScroll"
        class="w-full h-full bg-primary text-white p-4 resize-none outline-none"
        spellcheck="false"
      ></textarea>
      <div
        ref="highlightOverlay"
        class="absolute top-0 left-0 w-full h-full pointer-events-none p-4 whitespace-pre-wrap overflow-hidden"
      >
        <template v-if="error">
          <div
            class="bg-red-500 opacity-30"
            :style="errorHighlightStyle"
          ></div>
          <div
            class="absolute text-red-500 bg-gray-800 p-1 bottom-3"
          >
            Error: {{ error.message }}
          </div>
        </template>
      </div>
    </div>
  </template>
  
  <style scoped>
  .code-editor {
    height: 90vh;
  }
  </style>