import { defineNuxtPlugin } from "#app";
import { createHighlighter } from "shiki";

export default defineNuxtPlugin(async (nuxtApp) => {
  const highlighter = await createHighlighter({
    themes: [
      "github-dark",
      "github-light",
      "monokai",
      "solarized-dark",
      "solarized-light",
      "material-theme-darker",
      "dark-plus",
      "night-owl",
      "vitesse-black",
      "synthwave-84",
      "dracula",
    ],
    langs: [
      "javascript",
      "typescript",
      "vue",
      "html",
      "css",
      "json",
      "markdown",
      "php",
      "python",
      "ruby",
      "rust",
      "go",
      "java",
      "kotlin",
      "swift",
      "c",
      "c++",
      "sql",
      "bash",
      "yaml",
      "dockerfile",
      "graphql",
    ],
  });

  nuxtApp.provide("shiki", highlighter);
});
