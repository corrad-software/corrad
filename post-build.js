const { execSync } = require("child_process");

// Revert changes using git
execSync("git checkout -- pages/devtool navigation/index.js", {
  stdio: "inherit",
});
console.log("Changes reverted");
