module.exports = {
  apps: [
    {
      name: 'nestjs-app',
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