module.exports = {
  apps: [{
    name: 'nest-app',
    script: './dist/main.js',
    instances: '2',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
    }
  }]
};