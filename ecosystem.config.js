// For running pm2 | ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "CBTM",
      port: "3000",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
    },
  ],
};
