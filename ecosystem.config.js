module.exports = {
  apps: [
    {
      name: "my-nestjs-backend",  // 服务名称
      script: "dist/main.js",     // 后端启动文件
      args: "",                   // 启动参数
      instances: "max",           // 启动实例数量
      exec_mode: "cluster",       // 集群模式
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "mysql://zxdbf:20011113XSZxsz.@localhost:6480/ohws"
      }
    }
  ]
};