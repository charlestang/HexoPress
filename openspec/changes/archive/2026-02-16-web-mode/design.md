## Context

HexoPress 当前是纯 Electron 桌面应用。渲染进程通过 `window.site.*`（49 个方法）与主进程通信，所有调用经过 `preload.ts` 的 `ipcRenderer.invoke` 桥接。主进程包含三个核心服务：HexoAgent（Hexo 操作）、FsAgent（文件操作）、HttpServer（静态资源服务 :2357）。

渲染进程本身是标准的 Vue 3 SPA，没有直接的 Electron import。这意味着只要替换 `window.site` 的实现层，渲染进程可以不做修改地运行在浏览器中。

## Goals / Non-Goals

**Goals:**
- 支持 Web 编译模式：`npm run web:dev` 启动开发环境，`npm run web:build` 输出可部署的 SPA
- 最大化代码共享：渲染进程代码在两种模式下完全复用，仅通过编译时切换适配层
- 提供简单的单用户鉴权，保护 Web 版的所有 API 端点
- Web Server 复用现有 HexoAgent、FsAgent、HttpServer 模块，不修改它们

**Non-Goals:**
- 不支持多用户 / 多租户
- 不支持远程服务器连接（Web 版仅访问本地文件系统）
- 不修改现有 Electron 模式的任何行为
- 不做 SSR（服务端渲染），Web 版是纯 SPA

## Decisions

### Decision 1: 编译时适配器切换（Vite alias）

通过 Vite 的 `resolve.alias` 在编译时切换 `window.site` 的实现。

**方案**：创建 `src/bridge/` 目录，包含：
- `src/bridge/types.ts` — 导出 `SiteBridge` 类型（即现有 `ISite` 接口）
- `src/bridge/electron.ts` — 直接返回 `window.site`（Electron 模式，由 preload 注入）
- `src/bridge/web.ts` — 用 fetch 调用 REST API 实现同一接口

在渲染进程入口处统一导入：
```ts
import { site } from '@/bridge'
```

Vite 配置中通过 alias 决定 `@/bridge` 指向哪个实现：
- `vite.config.renderer.ts`（Electron）：`@/bridge` → `src/bridge/electron.ts`
- `vite.config.web.ts`（Web）：`@/bridge` → `src/bridge/web.ts`

**替代方案**：运行时检测 `window.site` 是否存在来切换 → 放弃，因为会引入运行时开销和类型不确定性。

**影响**：现有 22 个文件中的 52 处 `window.site.*` 调用需要改为 `import { site } from '@/bridge'` 后使用 `site.*`。这是一次性的机械替换。

### Decision 2: Web Server 架构

**方案**：创建 `web/server.ts` 作为 Web 模式的服务端入口，基于 Fastify：

```
web/
├── server.ts       # 入口：初始化 Fastify、注册路由、启动服务
├── routes.ts       # API 路由：将 49 个 IPC handler 映射为 REST 端点
├── auth.ts         # 鉴权中间件 + 登录路由
└── config.ts       # 读取配置文件
```

路由设计：
- 所有 API 统一前缀 `/api/`
- 读操作用 GET，写操作用 POST
- 参数通过 query string（GET）或 JSON body（POST）传递
- 静态资源（Hexo public/ 目录）通过 `/assets/` 前缀 serve
- SPA 静态文件通过 `/` serve（生产模式）

Web Server 直接 import 并复用 `main/lib/HexoAgent.ts`、`main/lib/FsAgent.ts`、`main/lib/HttpServer.ts`，不做任何修改。

**替代方案**：用 Express 替代 Fastify → 放弃，Fastify 已是项目依赖，且主进程已在使用。

### Decision 3: 鉴权方案

**方案**：基于 cookie 的 session 鉴权。

- 配置文件 `web/hexopress.config.json`：
  ```json
  {
    "hexoDir": "/path/to/hexo/blog",
    "port": 8081,
    "username": "admin",
    "password": "your-password"
  }
  ```
- 登录端点 `POST /api/auth/login`：验证用户名密码，设置 signed cookie
- 登出端点 `POST /api/auth/logout`：清除 cookie
- 鉴权中间件：所有 `/api/*` 路由（除 login）检查 cookie 有效性
- 前端新增 `/login` 路由页面，未登录时重定向到此页面

**替代方案**：JWT token → 放弃，单用户场景下 cookie session 更简单，不需要 token 刷新逻辑。

### Decision 4: 静态资源 URL 可配置化

将 5 处硬编码的 `http://127.0.0.1:2357/` 替换为环境变量：

- Electron 模式：`VITE_ASSET_BASE_URL = 'http://127.0.0.1:2357/'`
- Web 模式：`VITE_ASSET_BASE_URL = '/assets/'`（由 Web Server 的 Fastify 静态文件插件 serve）

### Decision 5: Setup 页面适配

Web 模式下，Setup 页面的"绑定/解绑"功能（`openDirDialog`）隐藏，因为 Hexo 目录路径由服务端配置文件提供。其他配置项（语言、暗色模式、编辑器偏好等）保持不变。

通过编译时环境变量 `import.meta.env.VITE_APP_MODE` 判断当前模式（`'electron'` 或 `'web'`），在 Setup 页面条件渲染。

### Decision 6: 构建配置

新增 `vite.config.web.ts`，基于现有 `vite.config.renderer.ts` 修改：
- 移除 Electron Forge 相关的 `pluginExposeRenderer` 插件
- 添加 `@/bridge` alias 指向 `src/bridge/web.ts`
- 设置 `VITE_APP_MODE = 'web'` 和 `VITE_ASSET_BASE_URL = '/assets/'`
- 输出目录改为 `dist/web/`
- dev server 端口设为 8081，配置 proxy 将 `/api/*` 和 `/assets/*` 转发到后端

npm scripts：
- `web:dev`：`concurrently "vite --config vite.config.web.ts" "tsx web/server.ts --dev"`
- `web:build`：`vite build --config vite.config.web.ts`

## Risks / Trade-offs

**[网络延迟]** → Web 模式下所有操作经过 HTTP，比 IPC 慢。自动保存等高频操作可能需要 debounce 优化。作为实验性功能，暂时可接受。

**[文件上传大小]** → `saveImage` 在 IPC 模式下传递 ArrayBuffer，HTTP 模式需要改为 multipart/form-data 或 base64。需要在 webBridge 中特殊处理。

**[Session 安全]** → Cookie-based session 在 HTTP 下不安全。生产部署 SHOULD 使用 HTTPS 反向代理。文档中需要说明。

**[代码分支维护]** → 在独立分支上开发，合并回 main 后需要确保 Electron 模式不受影响。CI 中应同时测试两种构建模式。
