const fs = require("fs");
const path = require("path");

// Remove devtool folder
const devtoolPath = path.join(__dirname, "pages", "devtool");
if (fs.existsSync(devtoolPath)) {
  fs.rmSync(devtoolPath, { recursive: true, force: true });
  console.log("Devtool folder removed");
}

// Modify navigation.js
const navigationPath = path.join(__dirname, "navigation", "index.js");
let navigationContent = fs.readFileSync(navigationPath, "utf8");

// Remove any child items with path containing 'devtool'
const modifiedNavigation = navigationContent.replace(
  /\{[^}]*path:\s*['"]\/devtool[^}]*\},?/g,
  ""
);

// Remove empty child arrays
const cleanedNavigation = modifiedNavigation.replace(/child:\s*\[\s*\],?/g, "");

fs.writeFileSync(navigationPath, cleanedNavigation);
console.log("Navigation file updated");
