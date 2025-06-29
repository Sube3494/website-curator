# Website Curator 系统架构文档

## 系统架构概览

Website Curator 是一个基于现代 Web 技术栈构建的网站收藏和管理平台。

### 整体架构

```mermaid
graph TB
    %% 用户层
    subgraph "用户层"
        U1[普通用户]
        U2[管理员]
        U3[超级管理员]
    end

    %% 前端层
    subgraph "前端应用 (Next.js 15)"
        subgraph "页面路由"
            P1[主页 /]
            P2[浏览页面 /browse]
            P3[收藏页面 /favorites]
            P4[管理后台 /admin]
        end
        
        subgraph "组件层"
            C1[UI组件 shadcn/ui]
            C2[认证组件]
            C3[管理组件]
            C4[布局组件]
        end
        
        subgraph "状态管理"
            S1[React Query]
            S2[React Hook Form]
            S3[Zod验证]
        end
    end

    %% 后端服务层
    subgraph "后端服务 (Supabase)"
        subgraph "认证服务"
            A1[Supabase Auth]
            A2[JWT令牌]
            A3[用户会话]
        end
        
        subgraph "API层"
            API1[REST API]
            API2[实时订阅]
            API3[RPC函数]
        end
        
        subgraph "权限控制"
            RLS1[行级安全策略]
            RLS2[角色权限]
        end
    end

    %% 数据库层
    subgraph "数据库 (PostgreSQL)"
        subgraph "核心表"
            DB1[(users)]
            DB2[(websites)]
            DB3[(categories)]
            DB4[(tags)]
        end
        
        subgraph "关联表"
            DB5[(favorites)]
            DB6[(website_tags)]
            DB7[(system_settings)]
        end
    end

    %% 外部服务
    subgraph "外部服务"
        EXT1[Vercel部署]
        EXT2[CDN静态资源]
        EXT3[第三方认证]
    end

    %% 连接关系
    U1 --> P1
    U1 --> P2
    U1 --> P3
    U2 --> P4
    U3 --> P4

    P1 --> C1
    P2 --> C1
    P3 --> C1
    P4 --> C3

    C1 --> S1
    C2 --> A1
    C3 --> S1

    S1 --> API1
    S1 --> API2
    API1 --> RLS1
    API2 --> RLS1
    API3 --> RLS1

    A1 --> A2
    A2 --> A3
    RLS1 --> RLS2

    API1 --> DB1
    API1 --> DB2
    API1 --> DB3
    API1 --> DB4
    API1 --> DB5
    API1 --> DB6
    API1 --> DB7

    EXT1 --> P1
    EXT2 --> C1
    EXT3 --> A1

    %% 样式
    classDef userClass fill:#e1f5fe
    classDef frontendClass fill:#f3e5f5
    classDef backendClass fill:#e8f5e8
    classDef dbClass fill:#fff3e0
    classDef extClass fill:#fce4ec

    class U1,U2,U3 userClass
    class P1,P2,P3,P4,C1,C2,C3,C4,S1,S2,S3 frontendClass
    class A1,A2,A3,API1,API2,API3,RLS1,RLS2 backendClass
    class DB1,DB2,DB3,DB4,DB5,DB6,DB7 dbClass
    class EXT1,EXT2,EXT3 extClass
```

### 技术栈架构

```mermaid
graph LR
    %% 前端技术栈
    subgraph "前端技术栈"
        A[React 19] --> B[Next.js 15]
        B --> C[Tailwind CSS]
        B --> D[shadcn/ui]
        B --> E[React Query]
        B --> F[React Hook Form]
        F --> G[Zod]
    end

    %% 后端服务
    subgraph "后端服务"
        H[Supabase] --> I[PostgreSQL]
        H --> J[Supabase Auth]
        H --> K[Row Level Security]
        H --> L[Real-time API]
    end

    %% 开发工具
    subgraph "开发工具"
        M[TypeScript]
        N[Playwright]
        O[pnpm]
        P[ESLint]
    end

    %% 部署平台
    subgraph "部署平台"
        Q[Vercel]
        R[GitHub Actions]
    end

    %% 连接关系
    B --> H
    E --> L
    J --> K
    M --> A
    N --> B
    O --> B
    Q --> B
    R --> Q

    %% 样式
    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    classDef backend fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#000
    classDef tools fill:#f7df1e,stroke:#333,stroke-width:2px,color:#000
    classDef deploy fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff

    class A,B,C,D,E,F,G frontend
    class H,I,J,K,L backend
    class M,N,O,P tools
    class Q,R deploy
```

### 数据流架构

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端应用
    participant A as Supabase Auth
    participant API as Supabase API
    participant DB as PostgreSQL
    participant RLS as RLS策略

    Note over U,DB: 用户认证流程
    U->>F: 访问应用
    F->>A: 检查认证状态
    A->>F: 返回用户信息/未认证
    
    alt 未认证用户
        F->>U: 显示登录界面
        U->>F: 提交登录信息
        F->>A: 发送认证请求
        A->>F: 返回JWT令牌
        F->>U: 跳转到主页
    end

    Note over U,DB: 数据操作流程
    U->>F: 请求数据(网站列表)
    F->>API: 发送API请求(带JWT)
    API->>RLS: 验证权限
    RLS->>DB: 执行查询
    DB->>RLS: 返回数据
    RLS->>API: 过滤后的数据
    API->>F: 返回JSON数据
    F->>U: 渲染界面

    Note over U,DB: 实时更新流程
    U->>F: 订阅实时更新
    F->>API: 建立WebSocket连接
    
    loop 数据变化时
        DB->>API: 触发变更事件
        API->>F: 推送更新数据
        F->>U: 更新界面
    end
```

## 核心组件说明

### 前端层
- **Next.js 15**: 提供 SSR/SSG 和路由功能
- **React 19**: 用户界面构建
- **Tailwind CSS**: 样式框架
- **shadcn/ui**: UI 组件库
- **React Query**: 数据获取和缓存
- **React Hook Form + Zod**: 表单处理和验证

### 后端层
- **Supabase**: 提供数据库、认证、实时API
- **PostgreSQL**: 关系型数据库
- **Row Level Security**: 数据安全策略
- **JWT**: 用户认证令牌

### 部署层
- **Vercel**: 前端应用部署
- **GitHub Actions**: CI/CD 流水线
- **CDN**: 静态资源分发

## 安全架构

### 认证与授权
1. **JWT 令牌认证**: 基于 Supabase Auth
2. **角色权限控制**: user/admin/super_admin
3. **行级安全策略**: 数据库层面的权限控制

### 数据安全
1. **HTTPS 传输**: 所有数据传输加密
2. **环境变量**: 敏感信息环境隔离
3. **输入验证**: Zod 模式验证
4. **SQL 注入防护**: Supabase 内置防护

## 性能优化

### 前端优化
1. **代码分割**: Next.js 自动代码分割
2. **图片优化**: Next.js Image 组件
3. **缓存策略**: React Query 智能缓存
4. **懒加载**: 组件和路由懒加载

### 后端优化
1. **数据库索引**: 关键字段索引优化
2. **查询优化**: 减少 N+1 查询
3. **实时订阅**: 减少轮询请求
4. **CDN 缓存**: 静态资源缓存

## 扩展性设计

### 水平扩展
- Supabase 自动扩展数据库
- Vercel 自动扩展前端服务
- CDN 全球分发

### 功能扩展
- 模块化组件设计
- 插件化架构预留
- API 版本控制
- 微服务架构准备
