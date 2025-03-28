module.exports = {
  apps: [
    {
      name: 'ohws',
      script: 'dist/main.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
    },
  ],
};