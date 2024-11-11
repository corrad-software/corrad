<script setup>
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import { Editor, EditorContent, BubbleMenu } from "@tiptap/vue-3";
import Mention from "@tiptap/extension-mention";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

// create a lowlight instance
const lowlight = createLowlight(all);

// Register languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Type something...",
  },
});

const emit = defineEmits(["update:modelValue"]);
const editor = ref(null);
const plusButtonPosition = ref({ top: 0 });
const showButton = ref(false);

// Add ref for dropdown
const dropdownRef = ref(null);

const menuItems = [
  {
    icon: "material-symbols:title",
    title: "Heading 1",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Heading 1" }],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:title",
    title: "Heading 2",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Heading 2" }],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:title",
    title: "Heading 3",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Heading 3" }],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:format-list-bulleted",
    title: "Bullet List",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "List item" }],
                },
              ],
            },
          ],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:format-list-numbered",
    title: "Numbered List",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "List item" }],
                },
              ],
            },
          ],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:check-box-outline",
    title: "Task List",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Task item" }],
                },
              ],
            },
          ],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:code-blocks",
    title: "Code Block",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertContent({
          type: "codeBlock",
          content: [{ type: "text", text: "Enter code here" }],
        })
        .enter()
        .run();
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:image",
    title: "Image",
    command: () => {
      const url = window.prompt("URL");
      if (url) {
        editor.value.chain().focus().setImage({ src: url }).run();
      }
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:table",
    title: "Table",
    command: () => {
      editor.value
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
      dropdownRef.value?.hide();
    },
  },
];

const sortItems = [
  {
    icon: "material-symbols:sort",
    title: "Sort A → Z",
    command: () => {
      sortContent("asc");
      dropdownRef.value?.hide();
    },
  },
  {
    icon: "material-symbols:sort",
    title: "Sort Z → A",
    command: () => {
      sortContent("desc");
      dropdownRef.value?.hide();
    },
  },
];

const sortContent = (type) => {
  if (!editor.value) return;

  const node = editor.value.state.selection.$anchor.node();
  if (!node) return;

  editor.value.commands.command(({ tr, state }) => {
    const lines = node.textContent.split("\n");
    const sortedLines = type === "asc" ? lines.sort() : lines.sort().reverse();
    tr.replaceSelectionWith(state.schema.text(sortedLines.join("\n")));
    return true;
  });
};

const updatePlusButtonPosition = () => {
  if (!editor.value) return;

  const { from, to } = editor.value.state.selection;
  showButton.value = editor.value.state.selection.anchor !== null;

  try {
    // Get coordinates for both start and end of selection
    const startPos = editor.value.view.coordsAtPos(from);
    const endPos = editor.value.view.coordsAtPos(to);
    const editorRect = editor.value.view.dom.getBoundingClientRect();

    // Calculate the middle point between start and end positions
    const middleY = (startPos.top + startPos.bottom) / 2;

    // Set the position relative to the editor container
    plusButtonPosition.value.top = middleY - editorRect.top - 16; // 16px offset for button height/2

    // Ensure the button stays within the editor bounds
    const minTop = 0;
    const maxTop = editorRect.height - 32; // 32px is button height
    plusButtonPosition.value.top = Math.max(
      minTop,
      Math.min(maxTop, plusButtonPosition.value.top)
    );
  } catch (e) {
    showButton.value = false;
  }
};

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value.getHTML() === value;
    if (isSame) return;
    editor.value.commands.setContent(value, false);
  }
);

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Typography,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg shadow-lg",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg bg-gray-800 p-4 font-mono text-sm text-gray-200",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: (query) => {
            return [
              "John Doe",
              "Jane Smith",
              // ... your users list
            ]
              .filter((item) =>
                item.toLowerCase().startsWith(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            // Your suggestion popup rendering logic
          },
        },
      }),
      CharacterCount.configure({
        limit: 1000,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TextStyle,
      Color,
    ],
    content: props.modelValue,
    onUpdate: () => {
      emit("update:modelValue", editor.value.getHTML());
    },
    onSelectionUpdate: () => {
      updatePlusButtonPosition();
    },
    onBlur: () => {
      // Remove this line or modify the logic to keep the button visible
      // showButton.value = false;
    },
    onFocus: () => {
      updatePlusButtonPosition();
    },
  });
});

onBeforeUnmount(() => {
  editor.value.destroy();
});

const handleDropdownShown = (shown) => {
  if (shown) {
    showButton.value = true;
  }
};

const bubbleMenuItems = [
  {
    icon: "material-symbols:format-bold",
    title: "Bold",
    action: () => editor.value.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
  },
  {
    icon: "material-symbols:format-italic",
    title: "Italic",
    action: () => editor.value.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
  },
  {
    icon: "material-symbols:format-strikethrough",
    title: "Strike",
    action: () => editor.value.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive("strike"),
  },
  {
    icon: "material-symbols:highlight",
    title: "Highlight",
    action: () => editor.value.chain().focus().toggleHighlight().run(),
    isActive: () => editor.value?.isActive("highlight"),
  },
  {
    icon: "material-symbols:link",
    title: "Link",
    action: () => {
      if (editor.value?.isActive("link")) {
        editingLink.value = true;
        linkUrl.value = editor.value.getAttributes("link").href;
      }
      showLinkModal.value = true;
    },
    isActive: () => editor.value?.isActive("link"),
  },
  {
    icon: "material-symbols:format-color-text",
    title: "Text Color",
    action: () => {
      if (editor.value?.isActive("textStyle")) {
        selectedColor.value = editor.value.getAttributes("textStyle").color;
      }
      showColorModal.value = true;
    },
    isActive: () => editor.value?.isActive("textStyle"),
  },
];

const alignmentItems = [
  {
    icon: "material-symbols:format-align-left",
    title: "Align Left",
    action: () => editor.value.chain().focus().setTextAlign("left").run(),
    isActive: () => editor.value?.isActive({ textAlign: "left" }),
  },
  {
    icon: "material-symbols:format-align-center",
    title: "Align Center",
    action: () => editor.value.chain().focus().setTextAlign("center").run(),
    isActive: () => editor.value?.isActive({ textAlign: "center" }),
  },
  // ... right and justify
];

const showLinkModal = ref(false);
const showColorModal = ref(false);
const linkUrl = ref("");
const selectedColor = ref("");
const editingLink = ref(false);

const handleLinkSubmit = () => {
  if (linkUrl.value) {
    editor.value.chain().focus().setLink({ href: linkUrl.value }).run();
  }
  resetLinkModal();
};

const handleLinkRemove = () => {
  editor.value.chain().focus().unsetLink().run();
  resetLinkModal();
};

const resetLinkModal = () => {
  linkUrl.value = "";
  editingLink.value = false;
  showLinkModal.value = false;
};

const handleColorSubmit = () => {
  if (selectedColor.value) {
    editor.value.chain().focus().setColor(selectedColor.value).run();
  }
  resetColorModal();
};

const handleColorReset = () => {
  editor.value.chain().focus().unsetColor().run();
  resetColorModal();
};

const resetColorModal = () => {
  selectedColor.value = "";
  showColorModal.value = false;
};

// Close modals when editor loses focus
watch(
  () => editor.value?.isFocused,
  (focused) => {
    if (!focused) {
      resetLinkModal();
      resetColorModal();
    }
  }
);
</script>

<template>
  <div class="relative max-w-[900px] mx-auto">
    <div
      v-if="editor && showButton"
      class="absolute -left-10 transform transition-all duration-200 ease-out"
      :style="{ top: `${plusButtonPosition.top}px` }"
    >
      <VDropdown
        ref="dropdownRef"
        placement="bottom-start"
        distance="13"
        @show="handleDropdownShown"
      >
        <button
          class="icon-btn h-8 w-8 rounded-full"
          @mousedown.prevent
          @click.stop
        >
          <Icon name="material-symbols:add" />
        </button>

        <template #popper>
          <ul class="header-dropdown w-full md:w-52">
            <!-- Basic Blocks -->
            <li v-for="item in menuItems" :key="item.title">
              <a
                @click="item.command()"
                class="flex items-center gap-2 cursor-pointer py-2 px-4 hover:bg-[rgb(var(--bg-1))]"
              >
                <Icon :name="item.icon" />
                <span>{{ item.title }}</span>
              </a>
            </li>

            <li class="border-t border-[rgb(var(--bg-1))]"></li>

            <!-- Sort Options -->
            <li v-for="item in sortItems" :key="item.title">
              <a
                @click="item.command()"
                class="flex items-center gap-2 cursor-pointer py-2 px-4 hover:bg-[rgb(var(--bg-1))]"
              >
                <Icon :name="item.icon" />
                <span>{{ item.title }}</span>
              </a>
            </li>
          </ul>
        </template>
      </VDropdown>
    </div>

    <!-- Editor Content -->
    <div class="group">
      <editor-content :editor="editor" />
    </div>

    <!-- Bubble Menu -->
    <bubble-menu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      class="flex items-center gap-0.5 bg-slate-800 shadow-lg rounded-lg border border-gray-600 p-1"
    >
      <button
        v-for="item in bubbleMenuItems"
        :key="item.title"
        class="p-1.5 rounded hover:bg-gray-700 transition-colors"
        :class="{ 'bg-gray-700': item.isActive() }"
        @click="item.action"
        :title="item.title"
      >
        <Icon :name="item.icon" class="w-4 h-4 text-gray-200" />
      </button>
    </bubble-menu>

    <div class="absolute bottom-0 right-0 text-sm text-gray-500 mt-2">
      {{ editor?.storage.characterCount.characters() }}/1000 characters
      {{ editor?.storage.characterCount.words() }} words
    </div>

    <!-- Link Modal -->
    <rs-modal
      v-model="showLinkModal"
      :title="editingLink ? 'Edit Link' : 'Insert Link'"
      ok-title="Apply"
      :ok-callback="handleLinkSubmit"
    >
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleLinkSubmit">
          <FormKit
            type="url"
            v-model="linkUrl"
            label="URL"
            validation="required|url"
            placeholder="https://example.com"
          />
          <div class="flex justify-between w-full">
            <rs-button
              v-if="editingLink"
              @click="handleLinkRemove"
              variant="danger-text"
            >
              Remove Link
            </rs-button>
            <div class="flex gap-2">
              <rs-button @click="resetLinkModal" variant="primary-text">
                Cancel
              </rs-button>
              <rs-button btn-type="submit">
                {{ editingLink ? "Update" : "Insert" }}
              </rs-button>
            </div>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>

    <!-- Color Modal -->
    <rs-modal
      v-model="showColorModal"
      title="Text Color"
      ok-title="Apply"
      :ok-callback="handleColorSubmit"
    >
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleColorSubmit">
          <FormKit
            type="color"
            v-model="selectedColor"
            label="Text Color"
            validation="required"
            help="Choose a color or reset to default"
          />
          <div class="flex justify-between w-full">
            <rs-button @click="handleColorReset" variant="primary-text">
              Reset to Default
            </rs-button>
            <div class="flex gap-2">
              <rs-button @click="resetColorModal" variant="primary-text">
                Cancel
              </rs-button>
              <rs-button btn-type="submit"> Apply </rs-button>
            </div>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>
  </div>
</template>

<style>
.ProseMirror-focused {
  outline: none !important;
}

.tiptap {
  min-height: 100px;
  padding: 0.5rem;
}

.tiptap p.is-editor-empty:first-child::before {
  @apply text-[rgba(var(--text-muted))];
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Task list styles */
ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5em;
}

ul[data-type="taskList"] li label {
  margin-right: 0.5em;
  user-select: none;
}

ul[data-type="taskList"] li > div {
  flex: 1;
}

/* Add styles for smooth transition */
.icon-btn {
  transition: all 0.2s ease-in-out;
  opacity: 1;
}

.icon-btn:hover {
  background-color: rgb(var(--bg-3));
}

.bubble-menu {
  display: flex;
  align-items: center;
}

.bubble-menu button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble-menu button:hover {
  background-color: rgb(var(--bg-1));
}

.bubble-menu button.is-active {
  background-color: rgb(var(--bg-2));
}

/* Add these styles to ensure smooth transitions */
.transform {
  will-change: transform;
}

.duration-200 {
  transition-duration: 200ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}


/* Table styles */
.tiptap table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.tiptap table td,
.tiptap table th {
  border: 2px solid #6B7280;
  box-sizing: border-box;
  min-width: 1em;
  padding: 0.5rem;
  position: relative;
  vertical-align: top;
}

.tiptap table th {
  background-color: rgb(var(--bg-1));
  font-weight: bold;
}

.tiptap table .selectedCell:after {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}


/* Text alignment styles */
.tiptap .text-left {
  text-align: left;
}

.tiptap .text-center {
  text-align: center;
}

.tiptap .text-right {
  text-align: right;
}

.tiptap .text-justify {
  text-align: justify;
}
</style>
