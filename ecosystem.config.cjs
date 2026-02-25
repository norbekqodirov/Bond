module.exports = {
  apps: [
    {
      name: "bond",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      }
    }
  ]
};
