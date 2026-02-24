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

> 完整架构说明见 `docs/architecture-overview.md`，包含进程模型、Web mode、bridge 层、IPC 契约、构建系统等详细内容。

以下是编码时需要内化的关键约束：

- 项目支持 **Electron mode** 和 **Web mode** 两种运行模式，共用同一套渲染进程代码
- 渲染进程通过 `import { site } from '@/bridge'` 调用后端，**不直接使用 `window.site`**；bridge 层在编译时由 Vite alias 切换实现
- **新增后端方法需同步修改六处**：`HexoAgent/FsAgent` 实现 → `types/local.d.ts` → `src/bridge/web.ts` → `web/routes.ts` → `main/main.ts` → `main/preload.ts`
- 渲染进程中的资源 URL 统一使用 `import.meta.env.VITE_ASSET_BASE_URL`，不硬编码本地服务地址
- 全局类型定义在 `types/local.d.ts`（Post、Category、Tag、ISite 等），无需 import
- `tsconfig/` 下有四套独立配置，对应不同编译目标（app、node、vitest、tools）

## 编码规范

- **沟通语言**：与开发者沟通使用中文；commit message 使用英文
- **提交规范**：Conventional Commits（`feat:`、`fix:`、`docs:`、`refactor:`）
- **命名**：变量/字段用 `camelCase`，类/类型用 `PascalCase`
- **样式**：新页面优先使用 UnoCSS（`src/uno.config.ts`）；旧页面可能仍用旧样式体系，同一页面内不要混用
- **多语言**：所有用户可见的界面文案必须使用 `vue-i18n`，禁止硬编码字符串。语言包位于 `src/locales/en.json` 和 `src/locales/zh-CN.json`，按功能模块分命名空间。组件中使用 `const { t } = useI18n()` 后通过 `t('namespace.key')` 引用。新增 key 需同时更新两个语言包
- **测试**：测试文件放在源码同级的 `__tests__/` 目录下，使用 `@vue/test-utils` + jsdom。Element Plus 组件的 stub 需要正确定义 props/emit 类型，否则会产生 TS 错误
- **Git 工作流**：默认在 `main` 分支开发；多 Agent/多人并行或高风险改动时使用独立分支。保持线性提交历史（优先 rebase）；使用分支时 PR 前 rebase 最新 `main`，合并后删除分支。每个 commit 应是完整可运行的单元
