# 构建阶段
FROM node:latest AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 复制 prisma 相关文件
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:latest AS production

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 复制 prisma 相关文件
COPY prisma ./prisma/

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物和生成的 Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma ./node_modules/.prisma

# 暴露端口
EXPOSE 3280

# 启动应用
CMD ["pnpm", "start:prod"]