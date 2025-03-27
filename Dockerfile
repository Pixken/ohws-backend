# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
# 复制package.json和pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./
# 复制prisma文件
COPY prisma ./prisma/
# 安装pnpm
RUN npm install -g pnpm
# 安装依赖
RUN pnpm install
# 生成prisma客户端代码
RUN pnpm prisma generate
# 复制源代码
COPY . .
# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY ecosystem.config.js .

ENV NODE_ENV production
EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]