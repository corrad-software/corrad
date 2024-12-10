import { generateClasses } from "@formkit/themes";
import defaultTheme from "@/assets/js/formkit-theme.js";
import customInput from "@/assets/js/formkit-custom.js";

// ----------------- Addons --------------------------- //

// https://formkit.com/plugins/auto-animate
import { createAutoAnimatePlugin } from "@formkit/addons";

// https://formkit.com/plugins/floating-labels
import { createFloatingLabelsPlugin } from "@formkit/addons";
import "@formkit/addons/css/floatingLabels";

// https://formkit.com/plugins/multi-step
import { createMultiStepPlugin } from "@formkit/addons";
import "@formkit/addons/css/multistep";

// https://formkit.com/plugins/auto-height-textarea
import { createAutoHeightTextareaPlugin } from "@formkit/addons";

// https://formkit.com/plugins/local-storage
import { createLocalStoragePlugin } from "@formkit/addons";

const legends = ["checkbox_multi", "radio_multi", "repeater", "transferlist"];

function addAsteriskPlugin(node) {
  if (
    ["button", "submit", "hidden", "group", "list", "meta"].includes(
      node.props.type
    )
  )
    return;

  const isRequired =
    node.props?.validation === "required" ||
    (Array.isArray(node.props?.validation) &&
      node.props.validation.some(
        (rule) => Array.isArray(rule) && rule.includes("required")
      ));

  if (isRequired) {
    node.on("created", () => {
      // Determine if we should use legend or label
      const legendOrLabel = legends.includes(
        `${node.props.type}${node.props.options ? "_multi" : ""}`
      )
        ? "legend"
        : "label";

      // Update schema memo key with proper suffix
      if (node.props.definition.schemaMemoKey) {
        node.props.definition.schemaMemoKey += `${
          node.props.options ? "_multi" : ""
        }_add_asterisk`;
      }

      const originalSchemaFn = node.props.definition.schema;
      node.props.definition.schema = (sectionsSchema = {}) => {
        // Initialize the proper section (legend or label)
        if (!sectionsSchema[legendOrLabel]) {
          sectionsSchema[legendOrLabel] = {};
        }
        if (!sectionsSchema[legendOrLabel].attrs) {
          sectionsSchema[legendOrLabel].attrs = {};
        }
        sectionsSchema[legendOrLabel].attrs["data-required"] = true;

        // Add children array for the proper section
        sectionsSchema[legendOrLabel].children = [
          "$label",
          {
            $el: "span",
            attrs: {
              class: "formkit-asterisk",
              title: node.props?.requiredText || "diperlukan",
            },
            children: ["*"],
          },
        ];

        const schema = originalSchemaFn(sectionsSchema);

        if (!schema.attrs) schema.attrs = {};
        schema.attrs["data-required"] = true;

        return schema;
      };
    });
  }
}

export default {
  plugins: [
    addAsteriskPlugin,
    createFloatingLabelsPlugin({
      useAsDefault: false, // defaults to false
    }),
    createAutoAnimatePlugin({
      // optional config
    }),
    createMultiStepPlugin(),
    createAutoHeightTextareaPlugin(),
    createLocalStoragePlugin({
      // plugin defaults:
      prefix: "formkit",
      key: undefined,
      control: undefined,
      maxAge: 3600000, // 1 hour
      debounce: 200,
      beforeSave: undefined,
      beforeLoad: undefined,
    }),
  ],
  config: {
    classes: generateClasses(defaultTheme),
  },
  inputs: customInput,
};
