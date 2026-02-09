# 水果批发平台

一个基于 Next.js 14 开发的专业水果批发交易平台，连接批发商和商户。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js
- **支付**: 支付宝/微信支付 API

## 功能特性

### 批发商功能
- 商品管理（发布、编辑、删除商品）
- 订单管理（查看、确认、发货订单）
- 库存管理
- 销售数据统计

### 商户功能
- 市场选购（浏览商品、搜索、筛选）
- 购物车管理
- 订单管理（下单、查看订单状态）
- 收货地址管理

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
TURSO_AUTH_TOKEN="your-turso-auth-token"
TURSO_DATABASE_URL="libsql://your-database-url"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 测试账号

### 批发商账号
- 邮箱: wholesaler@example.com
- 密码: 123456

### 商户账号
- 邮箱: merchant@example.com
- 密码: 123456

## 项目结构

```
fruit_front/
├── app/
│   ├── api/              # API 路由
│   │   ├── auth/         # 认证相关 API
│   │   ├── products/     # 商品 API
│   │   ├── orders/       # 订单 API
│   │   ├── categories/   # 分类 API
│   │   └── payments/     # 支付 API
│   ├── auth/             # 认证页面
│   │   ├── signin/       # 登录
│   │   └── signup/       # 注册
│   └── dashboard/        # 仪表板
│       ├── products/     # 商品管理
│       ├── orders/       # 订单管理
│       ├── market/       # 市场选购
│       └── my-orders/    # 我的订单
├── components/          # React 组件
│   ├── navbar.tsx        # 导航栏
│   └── providers.tsx     # Session Provider
├── lib/                  # 工具库
│   ├── auth.ts           # NextAuth 配置
│   └── prisma.ts         # Prisma 客户端
├── prisma/               # 数据库相关
│   ├── schema.prisma     # 数据库模型
│   └── seed.js           # 数据库种子
└── types/                # TypeScript 类型定义
```

## 数据库模型

- **User**: 用户表（批发商/商户）
- **Category**: 商品分类
- **Product**: 商品信息
- **Order**: 订单
- **OrderItem**: 订单明细

## 支付集成

项目已预留支付宝和微信支付的接口，需要配置以下环境变量：

```env
ALIPAY_APP_ID="your-alipay-app-id"
ALIPAY_PRIVATE_KEY="your-alipay-private-key"
ALIPAY_PUBLIC_KEY="your-alipay-public-key"
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_MCH_ID="your-wechat-mch-id"
WECHAT_API_KEY="your-wechat-api-key"
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### Docker 部署

```bash
docker build -t fruit-platform .
docker run -p 3000:3000 fruit-platform
```

## 开发说明

### 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npx prisma db push` 更新数据库
3. 创建 API 路由在 `app/api/` 目录
4. 创建页面组件在 `app/` 目录

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Tailwind CSS 进行样式设计

## 许可证

MIT
