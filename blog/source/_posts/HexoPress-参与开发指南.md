---
title: '[HexoPress] 参与开发指南'
permalink: hexopress-contributing-guide/
categories:
  - - HexoPress 技术
tags:
  - hexopress
  - contributing
  - open-source
excerpt: 想为 HexoPress 贡献代码？这篇文章帮你快速了解项目结构、开发环境和贡献流程。
date: 2026-02-11 12:40:00
updated: 2026-02-11 12:40:00
---

HexoPress 是一个开源项目，欢迎任何形式的贡献——无论是修复一个 bug、改进一个功能，还是完善文档。这篇文章帮你快速上手。

## 技术栈

在开始之前，了解一下 HexoPress 使用的技术栈：

- **Electron**：桌面应用框架
- **Vue 3**：前端框架（Composition API + `<script setup>`）
- **TypeScript**：全项目使用 TypeScript
- **Vite**：构建工具
- **Pinia**：状态管理
- **Element Plus**：UI 组件库
- **UnoCSS**：原子化 CSS 框架
- **Vitest**：单元测试框架

如果你熟悉 Vue 3 和 TypeScript，上手会非常快。即使你没有 Electron 开发经验，渲染进程的开发体验和普通的 Vue 项目几乎一样。

### 对学习者友好的技术选型

HexoPress 的技术栈选择有一个重要的考量：平易近人。Vue 3 和 Element Plus 是前端领域最主流、文档最完善的技术方案之一，社区资源丰富，学习曲线平缓。如果你正在学习前端开发，HexoPress 是一个很好的实践项目——它涵盖了真实桌面应用开发中的大部分场景，同时代码规模适中，不会让人望而却步。

项目始终保持所有 npm 依赖为最新版本，遵循各个库的最佳实践。代码中处处体现了 Vue 3 Composition API 的惯用写法、TypeScript 的类型安全实践、以及 Pinia 的状态管理模式。你在这里学到的模式，可以直接应用到自己的项目中。

## 项目结构

项目的核心目录：

- `main/`：Electron 主进程代码，包括 Hexo 集成、文件操作和 HTTP 服务
- `src/`：渲染进程的 Vue 3 应用
  - `views/`：页面级组件
  - `components/`：可复用组件
  - `stores/`：Pinia 状态管理
  - `router/`：路由配置
- `shared/`：主进程和渲染进程共享的工具函数
- `types/`：全局类型定义

## 搭建开发环境

克隆仓库后，安装依赖并启动开发服务器：

```shell
npm install
npm run dev
```

开发模式下，前端运行在 5173 端口（支持热更新），图片服务运行在 2357 端口。Electron 窗口会自动打开。

## 开发工作流

在提交代码之前，请确保通过以下检查：

```shell
npm run format    # 代码格式化
npm run lint      # ESLint 检查
npm run check-all # 类型检查（Vue + Node + Vitest）
npm run test      # 单元测试
```

这四个命令全部通过后，你的代码就可以提交了。

## 提交规范

HexoPress 使用 Conventional Commits 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 代码重构
- `test:` 测试相关

Commit message 使用英文。每个 commit 应该是一个完整的、可运行的单元。

## 可以从哪里开始

如果你不确定从哪里开始，这里有一些建议：

**修复 bug 或改进现有功能**是最好的起点。浏览 GitHub Issues，找一个感兴趣的问题，理解上下文后提交 PR。

**添加新的编辑器面板**是一个有趣的方向。编辑器的模块化设计让添加新面板相对简单——你只需要创建一个 Vue 组件，从共享状态中读取编辑器上下文。

**改进国际化**也是一个低门槛的贡献方式。HexoPress 支持中英双语，如果你发现翻译不准确或缺失，可以直接修改语言文件。

**完善测试覆盖**总是受欢迎的。项目使用 Vitest 和 `@vue/test-utils`，测试文件放在源码同级的 `__tests__/` 目录下。

## 编码风格

几个需要注意的编码规范：

- 变量和字段使用 `camelCase`，类和类型使用 `PascalCase`
- 新页面优先使用 UnoCSS 编写样式
- Element Plus 组件在测试中需要正确定义 stub 的 props/emit 类型
- 保持线性的 Git 提交历史，PR 前先 rebase 主干

## 加入社区

如果你在开发过程中遇到问题，或者想讨论一个新功能的设计方案，欢迎在 GitHub Issues 中发起讨论。我们重视每一个贡献者的想法，也乐于帮助新人上手。

开源项目的魅力在于集体智慧。期待你的参与。
