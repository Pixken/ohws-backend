# OHWS-Backend 记账助手后端系统

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## 项目简介

OHWS-Backend 是一个基于 NestJS 框架开发的记账助手系统后端，提供完整的个人记账功能和AI智能助手服务。系统支持用户管理、账户管理、消费记录、收入记录和AI智能交互等功能，旨在帮助用户更好地管理个人财务。

## 主要功能

- **用户系统**: 注册、登录、JWT身份认证
- **账户管理**: 创建多个资金账户，管理余额
- **消费分类**: 自定义消费类别，包含图标与颜色
- **记账功能**: 记录收入和支出，按照日期、账户和类别统计
- **AI助手**: 
  - 基于大语言模型的智能记账助手
  - 自然语言交互式记账（如"今天吃饭花了50元"）
  - 智能图标推荐
  - 消费数据分析和建议
- **工具调用**: AI系统支持工具调用功能，可直接通过对话执行账务操作

## 技术栈

- **后端框架**: NestJS
- **数据库**: MySQL
- **ORM**: Prisma
- **身份认证**: JWT, Passport
- **AI接口**: DeepSeek AI API
- **部署**: PM2, Nginx

## 安装与运行

### 环境要求

- Node.js >= 16.x
- MySQL >= 5.7
- pnpm >= 8.x

### 安装依赖

```bash
$ pnpm install
```

### 配置数据库

1. 创建一个MySQL数据库
2. 复制`.env.example`为`.env.local`并设置数据库连接信息
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   JWT_SECRET="your-secret-key"
   ```

### 数据库迁移

```bash
# 生成Prisma客户端
$ pnpm pp

# 数据库迁移
$ pnpm prisma:migrate
```

### 运行项目

```bash
# 开发模式
$ pnpm dev

# 生产模式
$ pnpm build
$ pnpm start:prod
```

## API接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户相关

- `GET /api/user/:id` - 获取用户信息
- `GET /api/user` - 获取所有用户

### 账户相关

- `POST /api/account` - 创建账户
- `POST /api/account/:id` - 添加账户
- `GET /api/account/:userId` - 获取用户的所有账户

### 消费类别

- `POST /api/cash-category` - 创建消费类别
- `GET /api/cash-category` - 获取所有消费类别
- `GET /api/cash-category/:id` - 获取单个消费类别

### 消费记录

- `POST /api/cash` - 创建消费记录
- `GET /api/cash/:userId` - 获取用户所有消费记录
- `GET /api/cash/time/:userId` - 获取指定时间范围的消费记录

### AI助手接口

- `POST /api/ai/chat` - 与AI助手对话 (流式响应)
- `POST /api/ai/chat-v2` - 使用工具调用的增强版AI助手 (流式响应)
- `POST /api/ai/generateCash` - 生成消费记录
- `POST /api/ai/getIcon` - 获取图标推荐

## 部署说明

项目使用PM2进行部署管理，Nginx进行反向代理。

```bash
# 部署项目
$ pnpm deploy
```

Nginx配置示例见项目根目录的`nginx.conf`文件。

## 许可证

本项目使用 [MIT 许可证](LICENSE)
