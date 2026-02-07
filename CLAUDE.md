# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概述

HexoPress 是一款基于 Electron + Vue 3 + Vite + Fastify 的 Hexo 博客桌面编辑器。通过读取 Hexo 本地缓存，提供文章、分类、标签和媒体资源的可视化管理界面。

## 常用命令

```bash
npm run dev          # 启动 Electron 开发环境（前端 :5173，图片服务 :2357）
npm run test         # 运行单元测试（vitest，jsdom 环境）
npm run lint         # ESLint 检查并自动修复
npm run format       # Prettier 格式化
npm run check-all    # 并行运行所有类型检查（vue-check + vitest-check + node-check + conf-check）
npm run vue-check    # 类型检查 .vue 文件（tsconfig/tsconfig.app.json）
npm run node-check   # 类型检查主进程代码（tsconfig/tsconfig.node.json）
npm run vitest-check # 类型检查测试文件（tsconfig/tsconfig.vitest.json）
npm run package      # 打包 Electron 应用
npm run make         # 构建可分发安装包
```

**提交前必须执行**：`npm run format`、`npm run lint`、`npm run check-all`、`npm run test`，全部通过后方可提交。

## 架构

### 进程模型（Electron）

- **主进程** (`main/main.ts`)：注册所有 `ipcMain.handle` 处理器，创建浏览器窗口。包含三个核心服务：
  - `HexoAgent` (`main/lib/HexoAgent.ts`)：封装 Hexo CLI —— 初始化、缓存加载、文章/分类/标签/统计的增删改查
  - `FsAgent` (`main/lib/FsAgent.ts`)：`source/` 目录下的文件操作（readdir、mv、saveImage）
  - `HttpServer` (`main/lib/HttpServer.ts`)：Fastify 静态服务器，监听 2357 端口，提供 `public/` 目录的图片预览
- **Preload** (`main/preload.ts`)：通过 `contextBridge.exposeInMainWorld('site', {...})` 桥接主进程与渲染进程，所有 IPC 方法以 `window.site.*` 暴露
- **渲染进程** (`src/renderer.ts`)：Vue 3 应用，集成 Pinia、Vue Router（hash 模式）、vue-i18n、Element Plus

### 渲染进程结构

- **路由** (`src/router/index.ts`)：基于 hash 的路由。导航守卫在未选择博客目录时重定向到 `/setup`；首次导航时自动初始化 agent
- **状态管理** (`src/stores/`)：Pinia stores —— `app.ts`（全局偏好、agent 状态、hexo 配置）、`editorStore.ts`、`filter.ts`、`stats.ts`
- **页面** (`src/views/`)：页面级组件（Dashboard、PostList、Categories、Tags、MediaLibrary、Preferences、Setup、通过 FrameView 承载的编辑器）
- **组件** (`src/components/`)：可复用 UI 组件（EditorMain、CategoriesTree、NavMenu、SearchBar 等）
- **共享模块** (`shared/`)：主进程和渲染进程共用的无状态工具函数（日期、数组、值处理）

### IPC 通信契约

渲染进程通过 `window.site.<method>(...)` 调用，映射到 `main/main.ts` 中的 IPC 通道处理器。完整的 `ISite` 接口定义在 `types/local.d.ts`。主要通道：
- 读取操作：`site:posts`、`site:categories`、`site:tags`、`site:stats`、`site:heatMap`
- 写入操作：`post:save`、`post:create`、`post:move`、`post:delete`
- 文件系统：`fs:readdir`、`fs:mv`、`fs:saveImage`
- 生命周期：`agent:init`、`site:refresh`

### 类型系统

- 全局类型定义在 `types/local.d.ts`（Post、Category、Tag、ISite 等），无需 import
- `tsconfig/` 下有四套独立的 tsconfig 文件，对应不同编译目标（app、node、vitest、tools）
- 自动生成的类型文件：`types/auto-imports.d.ts`、`types/components.d.ts`

### 构建系统

- Electron Forge + Vite 插件（`forge.config.ts`）
- 三套 Vite 配置：`vite.config.main.ts`（主进程）、`vite.config.preload.ts`、`vite.config.renderer.ts`
- 路径别名：`@` → `src/`，`@shared` → `shared/`

## 编码规范

- **沟通语言**：与开发者沟通使用中文；commit message 使用英文
- **提交规范**：Conventional Commits（`feat:`、`fix:`、`docs:`、`refactor:`）
- **命名**：变量/字段用 `camelCase`，类/类型用 `PascalCase`
- **样式**：新页面优先使用 UnoCSS（`src/uno.config.ts`）；旧页面可能仍用旧样式体系，同一页面内不要混用
- **测试**：测试文件放在源码同级的 `__tests__/` 目录下，使用 `@vue/test-utils` + jsdom。Element Plus 组件的 stub 需要正确定义 props/emit 类型，否则会产生 TS 错误
- **Git 工作流**：保持线性提交历史，PR 前先 rebase 主干，合并后删除分支，每个 commit 应是完整可运行的单元
