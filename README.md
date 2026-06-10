# TalkyOne - 多品类私教约课平台

[![CI](https://github.com/your-org/talkyone/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/talkyone/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

TalkyOne 是一个连接优质教师与学习需求者的在线教育平台，提供英语、法语、对外汉语、法律咨询等多领域的1对1私教课程预约与交易服务。

## 🌟 核心功能

- ✅ **教师注册与审核** - 教师提交资料，平台审核通过后获得授课资格
- ✅ **教师信息展示** - 展示教师个人主页、资质、课时包、可约时间、学员评价
- ✅ **课时包发布** - 教师设置课程类型、价格、服务时长并发布
- ✅ **在线约课系统** - 学生浏览教师空闲时间，选择合适时段预约课程
- ✅ **在线即时聊天** - 师生之间进行课前沟通、课后反馈
- ✅ **在线支付** - 支持微信、支付宝、PayPal 等支付方式
- ✅ **管理后台** - 教师审批、订单管理、数据统计

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14+ (React 18, App Router)
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **图标**: Lucide React

### 后端
- **框架**: Next.js API Routes
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **实时通信**: Socket.io

### 部署
- **服务器**: 阿里云 ECS
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **监控**: Sentry + 阿里云监控

## 📦 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Docker (可选，用于本地数据库)
- PostgreSQL (或 Docker)

### 安装依赖

```bash
# 安装 pnpm (推荐)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 环境配置

```bash
# 复制环境变量文件
cp docker/.env.example .env

# 编辑 .env 文件，配置数据库等信息
vim .env
```

### 数据库设置

```bash
# 使用 Docker 启动数据库
docker-compose -f docker/docker-compose.yml up -d db

# 生成 Prisma Client
pnpm db:generate

# 推送 Schema 到数据库
pnpm db:push

# （可选）填充测试数据
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📝 开发规范

### Git 工作流

我们使用 **GitFlow + Trunk-Based** 混合模式：

- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `release/*`: 预发布分支
- `hotfix/*`: 紧急修复分支

### 提交信息规范

使用 **Conventional Commits** 规范：

```bash
feat: 添加教师注册功能
fix: 修复支付回调问题
docs: 更新 API 文档
style: 格式化代码
refactor: 重构用户服务模块
test: 添加单元测试
chore: 更新依赖包
```

提交时会自动检查格式（通过 Husky + Commitlint）。

### 代码规范

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

提交时会自动运行 lint-staged。

## 🚀 部署

### 使用 Docker 部署

```bash
# 构建 Docker 镜像
docker build -t talkyone:latest -f docker/Dockerfile .

# 使用 Docker Compose 启动所有服务
docker-compose -f docker/docker-compose.yml up -d
```

### 手动部署

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

### CI/CD

推送代码到不同分支会自动触发部署：

- `develop` → 测试环境
- `release/*` → 预发布环境
- `main` → 生产环境

## 📁 项目结构

```
talkyone/
├── .github/              # GitHub 配置
│   ├── workflows/        # CI/CD 流水线
│   └── PULL_REQUEST_TEMPLATE/ # PR 模板
├── docker/               # Docker 配置
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React 组件
│   │   └── ui/         # 基础 UI 组件
│   ├── lib/             # 工具库
│   ├── prisma/          # Prisma Schema
│   └── types/           # TypeScript 类型
├── tests/               # 测试文件
├── public/              # 静态资源
└── scripts/             # 部署脚本
```

## 🧪 测试

```bash
# 运行单元测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- 官网: [https://talkyone.com](https://talkyone.com)
- 邮箱: support@talkyone.com

---

**Built with ❤️ by TalkyOne Team**
