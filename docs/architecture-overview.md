# HexoPress 架构概览

> 本文档是 HexoPress 架构的权威参考，供人类开发者和 AI 工具深度查阅。
> AI 工具的日常行为约束（命令、规范、陷阱）见各自的指引文件（CLAUDE.md / AGENTS.md / GEMINI.md）。

## 运行模式

HexoPress 支持两种运行模式，共用同一套渲染进程代码：

```
Electron mode（桌面应用）
  main/main.ts + main/preload.ts
  渲染进程 ←IPC→ 主进程服务

Web mode（服务器部署）
  web/server.ts + web/routes.ts
  渲染进程 ←HTTP→ Fastify API
```

两种模式的切换由 `src/bridge/` 抽象层在编译时处理，渲染进程代码无需感知底层协议。

## 进程与模块结构

### Electron 主进程（`main/`）

- **`main/main.ts`**：注册所有 `ipcMain.handle` 处理器，创建浏览器窗口。
- **`main/preload.ts`**：通过 `contextBridge.exposeInMainWorld('site', {...})` 将 IPC 方法以 `window.site.*` 暴露给渲染进程。
- **`main/lib/HexoAgent.ts`**：封装 Hexo CLI，负责初始化、缓存加载、文章/分类/标签/统计的增删改查。使用自定义加载流程（`loadDatabase` + `source.process` + `theme.process`）跳过 `_generate`，避免全量渲染耗时。
- **`main/lib/FsAgent.ts`**：`source/` 目录下的文件操作（readdir、mv、saveImage、getFileInfo、findAssetReferences）。所有路径操作限制在 `source/` 目录内，防止路径穿越。
- **`main/lib/HttpServer.ts`**：Fastify 静态服务器，监听 2357 端口，将 `public/` 目录暴露用于图片预览（仅 Electron mode）。

### Web 服务端（`web/`）

- **`web/server.ts`**：Web mode 入口，创建 Fastify 实例，注册鉴权、限流、静态文件、API 路由插件，启动 HTTP 服务。
- **`web/routes.ts`**：将所有 `HexoAgent` 和 `FsAgent` 能力映射为 REST API（`/api/*`），与 Electron IPC 接口一一对应。Electron 特有能力（`openDirDialog`、`setDarkMode` 等）提供 stub 实现。
- **`web/auth.ts`**：JWT 鉴权插件，保护所有 `/api/*` 路由。
- **`web/config.ts`**：从 `hexopress.config.json` 加载服务端配置（hexoDir、port、username、password）。

### Bridge 抽象层（`src/bridge/`）

渲染进程通过 `import { site } from '@/bridge'` 调用后端能力，编译时由 Vite alias 决定实现：

```
src/bridge/types.ts      → SiteBridge = ISite（类型真相）
src/bridge/electron.ts   → export const site = window.site
src/bridge/web.ts        → export const site: SiteBridge = { ...fetch 实现 }
src/bridge/index.ts      → IDE fallback（实际被 alias 覆盖）

vite.config.renderer.ts  → '@/bridge' → electron.ts
vite.config.web.ts       → '@/bridge' → web.ts
```

`web.ts` 实现 `SiteBridge` 接口，TypeScript 编译器强制覆盖所有方法，是四层契约中唯一有静态保障的一层。详见 `docs/adr-api-contract-maintenance.md`。

### 渲染进程（`src/`）

- **`src/renderer.ts`**：Vue 3 应用入口，依次安装 vue-i18n、Vue Router、Pinia，挂载到 DOM。
- **`src/router/index.ts`**：hash 模式路由。导航守卫：未选择博客目录时重定向到 `/setup`；已选择但 agent 未初始化时调用 `site.initializeAgent` 并等待完成。
- **`src/stores/`**：Pinia stores —— `app.ts`（全局偏好、agent 状态、hexo 配置）、`editorStore.ts`、`filter.ts`、`stats.ts`。
- **`src/views/`**：页面级组件（Dashboard、PostList、Categories、Tags、MediaLibrary、Preferences、Setup、FrameView 编辑器容器）。
- **`src/components/`**：可复用 UI 组件（EditorMain、CategoriesTree、NavMenu、SearchBar 等）。

### 共享模块（`shared/`）

主进程和渲染进程共用的无状态工具函数（日期、数组、值处理），无任何 Electron 或浏览器依赖。

## IPC 契约

完整接口定义在 `types/local.d.ts` 的 `ISite`。渲染进程通过 `site.*` 调用（经 bridge 层），映射到主进程 IPC 处理器或 Web API 路由。

| 分类 | 代表方法 | IPC channel / HTTP 路由 |
|---|---|---|
| 站点数据 | `getPosts`、`getCategories`、`getTags` | `site:posts` / `GET /api/site/posts` |
| 内容读写 | `getContent`、`saveContent`、`savePostDocument` | `post:content` / `GET /api/post/content` |
| 文件系统 | `getReadDir`、`mv`、`saveImage` | `fs:readdir` / `GET /api/fs/readdir` |
| 生命周期 | `initializeAgent`、`refreshSite` | `agent:init` / `POST /api/agent/init` |
| Electron 特有 | `openDirDialog`、`openUrl`、`getDarkMode` | 仅 IPC；Web mode 提供 stub |

完整方法列表见 `docs/ipc-api-reference.md`。

**新增方法需同步修改六处**（无静态约束，需人工核对）：
1. `HexoAgent.ts` 或 `FsAgent.ts` — 实现
2. `types/local.d.ts` — `ISite` 签名
3. `src/bridge/web.ts` — fetch 实现（编译器强制）
4. `web/routes.ts` — Fastify 路由
5. `main/main.ts` — `ipcMain.handle`
6. `main/preload.ts` — `ipcRenderer.invoke`（channel 名必须与第 5 步一致）

## 类型系统

- **`types/local.d.ts`**：全局类型（Post、Category、Tag、ISite 等），无需 import，所有 tsconfig 均包含。
- **`tsconfig/`**：四套独立配置 —— `tsconfig.app.json`（Vue 渲染进程）、`tsconfig.node.json`（主进程）、`tsconfig.vitest.json`（测试）、`tsconfig.tools.json`（构建工具）。
- 自动生成：`types/auto-imports.d.ts`、`types/components.d.ts`（由 unplugin-auto-import / unplugin-vue-components 生成）。

## 构建系统

- **Electron mode**：Electron Forge + Vite 插件（`forge.config.ts`）。三套 Vite 配置：`vite.config.main.ts`、`vite.config.preload.ts`、`vite.config.renderer.ts`。
- **Web mode**：`vite.config.web.ts` 构建 SPA 到 `dist/web/`，`web/server.ts` 以 esbuild 编译为独立 Node 服务。
- **公共配置**：`vite.config.base.ts`（external 列表、Forge 插件辅助函数）。
- **路径别名**：`@` → `src/`，`@shared` → `shared/`，`@/bridge` → 按模式切换。
- **静态资源 URL**：渲染进程统一使用 `import.meta.env.VITE_ASSET_BASE_URL`，不硬编码本地服务地址。

## 关键依赖

| 层 | 依赖 |
|---|---|
| 主进程运行时 | Hexo、hexo-front-matter、hexo-fs、Fastify |
| 渲染进程 | Vue 3、Pinia、Vue Router、Element Plus、vue-i18n、UnoCSS、md-editor-v3、CodeMirror Vim |
| 构建 | Electron Forge、Vite、TypeScript、vue-tsc、esbuild |

## 相关文档

- `docs/ipc-api-reference.md` — 完整 IPC/API 方法参考
- `docs/adr-api-contract-maintenance.md` — API 契约多层维护的架构决策记录
- `docs/CODING_STANDARD.md` — 编码规范详细说明
- `openspec/specs/` — 各功能模块的需求规格
