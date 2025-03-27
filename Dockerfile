# 使用 Node 官方镜像
FROM node:18-alpine

# 安装 pnpm
RUN npm install -g pnpm

# 创建工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 复制.env文件
COPY .env ./

# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 生成prisma客户端代码
RUN pnpm prisma generate

# 构建项目
RUN pnpm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pm2-runtime", "ecosystem.config.js"]