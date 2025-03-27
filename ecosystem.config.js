module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'mysql://root:password@db:3306/nestjsdb',
        JWT_SECRET: 'zxdbf666',
      },
    },
  ],
};