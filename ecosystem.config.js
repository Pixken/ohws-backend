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
        NODE_ENV: 'production',
        DATABASE_URL: 'mysql://zxdbf:20011113XSZxsz.@localhost:6480/ohws',
        JWT_SECRET: 'zxdbf666',
      },
    },
  ],
};