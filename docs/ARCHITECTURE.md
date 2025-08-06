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
    subgraph "后端服务 (Next.js API)"
        subgraph "认证服务"
            A1[JWT认证]
            A2[bcrypt加密]
            A3[用户会话管理]
        end

        subgraph "API层"
            API1[Next.js API Routes]
            API2[数据验证]
            API3[业务逻辑层]
        end

        subgraph "权限控制"
            RLS1[角色权限验证]
            RLS2[API权限中间件]
        end
    end

    %% 数据库层
    subgraph "数据库 (MySQL 5.7)"
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
            DB8[(password_reset_tokens)]
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
        H[Next.js API] --> I[MySQL 5.7]
        H --> J[JWT认证]
        H --> K[权限验证]
        H --> L[邮件服务]
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
    participant API as Next.js API
    participant AUTH as JWT认证
    participant DB as MySQL
    participant MAIL as 邮件服务

    Note over U,DB: 用户认证流程
    U->>F: 访问应用
    F->>API: 检查认证状态
    API->>AUTH: 验证JWT令牌
    AUTH->>F: 返回用户信息/未认证

    alt 未认证用户
        F->>U: 显示登录界面
        U->>F: 提交登录信息
        F->>API: 发送认证请求
        API->>DB: 验证用户凭据
        API->>AUTH: 生成JWT令牌
        AUTH->>F: 返回JWT令牌
        F->>U: 跳转到主页
    end

    Note over U,DB: 数据操作流程
    U->>F: 请求数据(网站列表)
    F->>API: 发送API请求(带JWT)
    API->>AUTH: 验证权限
    AUTH->>API: 权限验证结果
    API->>DB: 执行查询
    DB->>API: 返回数据
    API->>F: 返回JSON数据
    F->>U: 渲染界面

    Note over U,MAIL: 密码重置流程
    U->>F: 请求密码重置
    F->>API: 发送重置请求
    API->>DB: 生成重置令牌
    API->>MAIL: 发送重置邮件
    MAIL->>U: 接收重置邮件
    U->>F: 点击重置链接
    F->>API: 验证令牌并重置密码
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
- **MySQL**: 关系型数据库
- **Next.js API Routes**: 后端API接口
- **JWT + bcrypt**: 用户认证和密码加密
- **数据库连接池**: 高效的数据库连接管理

### 部署层
- **Vercel**: 前端应用部署
- **GitHub Actions**: CI/CD 流水线
- **CDN**: 静态资源分发

## 安全架构

### 认证与授权
1. **JWT 令牌认证**: 基于自定义 JWT 实现
2. **角色权限控制**: user/admin/super_admin
3. **API 权限验证**: 接口层面的权限控制

### 数据安全
1. **HTTPS 传输**: 所有数据传输加密
2. **环境变量**: 敏感信息环境隔离
3. **输入验证**: Zod 模式验证
4. **SQL 注入防护**: 参数化查询防护
5. **密码加密**: bcrypt 哈希加密

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
- MySQL 数据库集群和读写分离
- Vercel 自动扩展前端服务
- CDN 全球分发
- 数据库连接池优化

### 功能扩展
- 模块化组件设计
- 插件化架构预留
- API 版本控制
- 微服务架构准备
