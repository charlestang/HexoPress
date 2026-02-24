# GEMINI.md

本文件为 Gemini 在本仓库中工作时提供指引。基于 `CLAUDE.md` 和 `AGENTS.md` 提炼。

## 1. 项目概述

HexoPress 是一款基于 Electron + Vue 3 + Vite + Fastify 的 Hexo 博客桌面编辑器。它通过读取 Hexo 本地缓存，提供文章、分类、标签和媒体资源的可视化管理界面。

**核心技术栈：**

- **Runtime:** Node ≥ 20.8.1, npm >= 10.5.5
- **Electron:** 主进程与渲染进程架构
- **Frontend:** Vue 3, Vite, Pinia, Vue Router, Element Plus, UnoCSS, vue-i18n
- **Backend (Main):** Hexo CLI 集成, Fastify (图片服务)

## 2. 项目结构 (Project Layout)

> 完整架构说明见 `docs/architecture-overview.md`，包含进程模型、Web mode、bridge 层、IPC 契约等详细内容。

- **`main/`**: Electron 主进程代码。
  - `main.ts`: 入口，注册所有 IPC 处理器。
  - `preload.ts`: IPC 桥接（`window.site.*`）。
  - `lib/`: 核心服务（`HexoAgent`、`FsAgent`、`HttpServer`）。
- **`web/`**: Web mode 服务端（Fastify、鉴权、REST 路由）。
- **`src/`**: 渲染进程（Vue 3）代码。
  - `renderer.ts`: 入口。
  - `bridge/`: 运行模式抽象层，`@/bridge` alias 在编译时切换 electron/web 实现。
  - `views/`: 页面（Dashboard、PostList、Editor 等）。
  - `stores/`: Pinia 状态管理。
  - `components/`: UI 组件。
- **`shared/`**: 主进程与渲染进程共享的无状态工具库。
- **`blog/`**: 内置 Hexo 博客示例（兼作操作手册）。
- **`docs/`**: 项目文档（架构概览、API 参考、ADR、编码规范等）。
- **`tsconfig/`**: 各环境的 TypeScript 配置（app、node、vitest、tools）。
- **`types/`**: 全局类型声明（`local.d.ts` 等）。

## 3. 常用命令与工作流

### 开发与运行

```bash
npm install          # 安装依赖
npm run dev          # 启动开发环境 (Electron + Vite)
npm run package      # 打包应用
npm run make         # 构建安装包
```

### 测试与质量检查 (MANDATORY)

**在提交代码前，必须执行并通过以下所有命令：**

1.  **格式化**: `npm run format` (Prettier)
2.  **Lint**: `npm run lint` (ESLint --fix)
3.  **类型检查**: `npm run check-all` (并行运行以下所有检查)
    - `npm run vue-check`: 检查 `.vue` 文件
    - `npm run node-check`: 检查主进程文件
    - `npm run vitest-check`: 检查测试文件
    - `npm run conf-check`: 检查配置文件
4.  **单元测试**: `npm run test` (Vitest + JSDOM)

_如果修改了 `docs/` 以外的 `.md` 文件，也必须运行 `npm run format`。_

## 4. 编码规范 (Style & Conventions)

- **语言**: 与开发者沟通使用**中文**；Commit Message 使用**英文**。
- **Commit 规范**: 遵循 Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:` 等)。
- **命名约定**:
  - 变量/属性: `camelCase`
  - 类/类型: `PascalCase`
- **样式**: 新页面优先使用 **UnoCSS** (`src/uno.config.ts`)。旧页面可能保留旧样式，同一页面内避免混用。
- **测试规范**:
  - 文件位置: 源码同级 `__tests__/` 目录。
  - 工具: `@vue/test-utils`。
  - 注意: Element Plus 组件 stub 需定义 props/emit 类型以通过 TS 检查。

## 5. Git 工作流

1.  **线性历史**: 保持主干线性提交。
2.  **Rebase**: 提交 PR 或合并前，务必 `rebase` 最新主干。
3.  **分支清理**: 合并后立即删除分支。
4.  **原子提交**: 每个 Commit 应是完整、可运行的单元。使用 `--amend` 完善提交。

## 6. 常见陷阱 (Pitfalls)

- **类型检查分离**: 根据修改文件类型运行对应的 check 命令 (`vue-check`, `node-check`, `vitest-check`)，或直接运行 `check-all`。
- **隐式 Any**: 模板内联箭头函数可能导致 TS7006，应提取为命名函数。
- **Element Plus Stubs**: 测试中需显式定义 stub 的 props/emit 类型，避免 `unknown` 推断错误。
- **Async Listeners**: `watch` 回调等异步更新可能需要多次 `await nextTick()` 才能在测试中被断言。
- **Array.prototype.at**: 注意不同 `tsconfig` lib 差异，兼容性不确定时推荐 `arr[arr.length - 1]`。
- **示例数据**: `blog/` 目录仅作演示，修改前需确认不影响文档。
