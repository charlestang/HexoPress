# 开发者上手手册

本文面向希望参与 HexoPress 开发的同学，介绍本地环境准备、项目结构与常见工作流，帮助在阅读源码前建立整体认知。【F:README.md†L93-L142】

## 开发环境准备
- **Node.js / npm**：遵循 README 的要求，使用 Node.js ≥ 20.8.1、npm ≥ 10.5.5，以保证 Electron Forge、Vite 与 Vue 构建链一致。【F:README.md†L109-L123】
- **端口占用**：开发模式默认占用 5173（渲染进程 Vite）与 2357（Fastify 静态资源服务器），启动前请确认无冲突。【F:README.md†L109-L123】【F:main/lib/HttpServer.ts†L6-L33】
- **依赖安装**：执行 `npm install` 安装主进程、渲染进程与工具链依赖；首次进入仓库建议同时运行 `npm run check-all` 验证环境是否完整。【F:README.md†L115-L135】【F:package.json†L12-L33】

## 项目目录速览
- `main/`：Electron 主进程代码。`main.ts` 负责窗口创建与注册 IPC，`lib/` 目录下包含 HexoAgent、FsAgent、HttpServer 等服务，实现 Hexo 数据读取与文件系统操作。【F:main/main.ts†L14-L95】【F:main/lib/HexoAgent.ts†L9-L136】【F:main/lib/FsAgent.ts†L9-L58】【F:main/lib/HttpServer.ts†L6-L39】
- `src/`：Vue 3 渲染进程。入口 `renderer.ts` 安装国际化、路由、Pinia；`router/index.ts` 定义主界面与初始化守卫；`stores/app.ts` 管理全局设置与 Hexo 配置缓存。【F:src/renderer.ts†L1-L27】【F:src/router/index.ts†L1-L74】【F:src/stores/app.ts†L1-L89】
- `types/local.d.ts`：集中声明 `window.site` 接口以及文章、标签、站点配置等类型，是前后端约定的来源。【F:types/local.d.ts†L4-L104】
- `blog/`：内置的示例 Hexo 项目，可用于演示或复现问题，目录下包含 Hexo 的标准结构（`_config.yml`、`source/`、`themes/` 等）。【cb041d†L1-L1】

## 本地运行与调试流程
1. **启动开发环境**：运行 `npm run dev`，Electron Forge 会同时启动主进程与渲染进程，并在开发模式下打开 DevTools。【F:package.json†L12-L33】【F:main/main.ts†L31-L35】
2. **代码质量检查**：常用命令包括 `npm run lint`（ESLint）、`npm run format`（Prettier）、`npm run test`（Vitest），也可使用 `npm run check-all` 并行执行类型检查、单测与 Vue 类型校验。【F:package.json†L12-L33】
3. **选择示例博客**：应用首次启动时会要求选择 Hexo 根目录，可直接选择仓库自带的 `blog/` 目录验证功能；若需要切换，可通过设置页或重新运行初始化流程。【F:src/router/index.ts†L44-L74】【cb041d†L1-L1】
4. **调试数据流**：推荐开启开发者工具的 Console 面板，观察主进程与渲染进程输出的日志，例如路由守卫的初始化状态、HexoAgent 的加载日志等。【F:main/lib/HexoAgent.ts†L15-L37】【F:src/router/index.ts†L44-L74】

## 常见开发任务指引
- **新增 IPC 能力**：在 `main/preload.ts` 暴露渲染层 API，再在 `main/main.ts` 注册对应的 `ipcMain.handle` 并调用服务层。别忘了在 `types/local.d.ts` 中更新类型声明，保持渲染层类型提示准确。【F:main/preload.ts†L1-L33】【F:main/main.ts†L36-L78】【F:types/local.d.ts†L42-L104】
- **扩展 Hexo 数据处理**：优先在 `HexoAgent` 中封装 Hexo CLI 交互，再通过 IPC 暴露给前端，利用现有的 `initPromise` / `exitPromise` 避免在 Hexo 尚未完成加载时读取缓存。【F:main/lib/HexoAgent.ts†L9-L136】【F:main/preload.ts†L1-L33】
- **前端页面改动**：熟悉 `MainWindow` 布局与子路由结构，利用 Pinia Store 同步设置与站点信息；需要持久化的偏好可以通过 `useCache` Hook 写入本地存储。【F:src/router/index.ts†L13-L52】【F:src/stores/app.ts†L1-L89】
- **媒体/附件处理**：使用 `FsAgent` 提供的 `readdir`、`mv`、`saveImage` 方法，确保在写入前调用 `assureDir` 创建目标目录，避免因路径不存在导致失败。【F:main/lib/FsAgent.ts†L9-L58】【F:main/main.ts†L57-L63】

## 深入阅读建议
1. **配合《架构与数据流指南》**：先理解 Electron 主进程与渲染进程的分层职责，再进入具体业务模块，能更快定位问题或扩展点。【F:docs/architecture-overview.md†L1-L60】
2. **对照《IPC API 参考》**：在编写组件或 Store 时查阅对应的 IPC 契约，避免遗漏参数或误用返回值结构。【F:docs/ipc-api-reference.md†L1-L80】
3. **阅读现有单元测试**：从 `main/lib/FsAgent.test.ts` 等文件了解仓库的测试风格，编写新的测试覆盖 HexoAgent 或路由守卫逻辑，有助于防止回归。【F:main/lib/FsAgent.ts†L9-L58】

借助以上资料，新人可以逐步熟悉 HexoPress 的运行机制，在保持代码质量的同时高效交付新功能。
