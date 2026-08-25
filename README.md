# 沐光童心 · 多端协同系统

> 以法为光，照亮童心 · 测评—诊断—干预—追踪闭环 + 家校社协同治理数据中台
> 基于北滘镇真实风险数据的本地化内容

## 项目简介

本项目将"沐光童心"三下乡社会实践静态网站升级为**分身份端的多端协同系统**，构建"测评—诊断—干预—追踪"闭环，基于北滘镇真实风险数据实现本地化内容，打造家校社协同治理的数据中台。

### 四类身份端

| 端 | 功能 | 端口 |
|------|------|------|
| **儿童端** | 分龄测评、AI 情景模拟游戏、积分激励 | 5174 |
| **家长端** | 风险预警报告、远程监护建议推送、亲子任务 | 5175 |
| **教师端** | 班级知识薄弱点诊断、精准教学建议生成 | 5176 |
| **社区后台** | 数据看板、治理报告输出 | 5177 |
| **统一门户** | 角色选择 + 登录 | 5173 |

### 创新点

1. **测评—诊断—干预—追踪闭环**：不是"知识库"，而是完整的数据驱动持续改进闭环
2. **北滘镇本地化内容**：基于真实风险数据生成本地化测评、游戏与建议
3. **家校社协同治理数据中台**：三方数据互通，协同干预任务流转

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Ant Design 5 + Zustand + React Router v6 |
| 后端 | NestJS + TypeScript + Prisma + PostgreSQL 16 + Redis 7 |
| 实时 | Socket.IO（WebSocket 推送） |
| AI | OpenAI API / 本地大模型代理 |
| 部署 | Docker Compose → K8s |

## 项目结构

```
muguangtongxin/
├── frontend/
│   ├── packages/
│   │   └── shared/              # 共享类型、常量、工具函数
│   └── apps/
│       ├── portal/              # 统一门户入口
│       ├── child/               # 儿童端
│       ├── parent/              # 家长端
│       ├── teacher/             # 教师端
│       └── admin/               # 社区后台
├── backend/
│   ├── src/
│   │   ├── auth/                # 认证与授权
│   │   ├── assessment/          # 测评领域
│   │   ├── game/                # AI 情景游戏
│   │   ├── points/              # 积分激励
│   │   ├── diagnosis/           # 诊断
│   │   ├── intervention/        # 干预
│   │   ├── tracking/            # 追踪
│   │   ├── midplane/            # 数据中台
│   │   ├── ai/                  # AI 服务
│   │   ├── notification/        # 消息通知
│   │   ├── report/              # 治理报告
│   │   ├── dashboard/           # 数据看板
│   │   └── ...                  # 其他模块
│   └── prisma/
│       ├── schema.prisma        # 数据模型
│       └── seed.ts              # 种子数据
├── docker-compose.yml           # 开发环境
├── pnpm-workspace.yaml          # Monorepo 配置
└── .codeartsdoer/specs/         # SDD 规格文档
```

## 快速开始

### 1. 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### 2. 启动基础设施

```bash
docker compose up -d
```

将启动：
- PostgreSQL 16（端口 5432）
- Redis 7（端口 6379）
- MinIO（端口 9000/9001）

### 3. 配置环境变量

```bash
cp backend/.env.example backend/.env
```

### 4. 安装依赖

```bash
pnpm install
```

### 5. 数据库迁移与种子数据

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. 启动开发服务

```bash
# 启动全部（前后端）
pnpm dev

# 或分别启动
pnpm dev:backend    # 后端 http://localhost:3000
pnpm dev:frontend   # 前端各端
```

### 7. 访问系统

- 统一门户：http://localhost:5173
- API 文档：http://localhost:3000/api/docs

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 系统管理员 | 13800000001 | 123456 |
| 社区管理员 | 13800000002 | 123456 |
| 教师 | 13800000003 | 123456 |
| 家长 | 13800000004 | 123456 |
| 儿童 | 13800000005 | 123456 |

## 核心业务流程

### 测评—诊断—干预—追踪闭环

```
① 测评（儿童端）→ ② 诊断（教师/社区）→ ③ 干预（家长/教师）→ ④ 追踪（全端）
      ↑                                                              │
      └────────────────── 复评迭代 ──────────────────────────────────┘
```

1. **测评**：儿童完成分龄测评与 AI 情景游戏，系统采集数据
2. **诊断**：系统自动诊断个体与群体薄弱点，生成诊断报告
3. **干预**：向家长推送预警与监护建议，向教师推送教学建议
4. **追踪**：持续追踪干预效果，若仍高风险则升级干预，形成闭环

## SDD 规格文档

项目采用 Spec-Driven Development 范式，规格文档位于 `.codeartsdoer/specs/multi-portal-system/`：

- `spec.md`：需求规格说明书（68 条 EARS 格式需求）
- `design.md`：技术设计文档
- `tasks.md`：编码任务规划（13 主任务、44 子任务）

## License

© 2026 沐光童心三下乡社会实践团 · 暨南大学
