---
title: '[HexoPress] 架构概览'
permalink: hexopress-architecture-overview/
categories:
  - - HexoPress 技术
tags:
  - hexopress
  - architecture
  - electron
  - web
excerpt: 从宏观视角了解 HexoPress 的技术架构：双运行模式、共享渲染层，以及背后的 Hexo 服务层设计。
date: 2026-02-11 12:00:00
updated: 2026-04-04 13:35:00
---

HexoPress 已经不再只是一个 Electron 桌面应用。现在它支持两种运行模式：基于 Electron 的桌面版，以及基于 Fastify 的自托管 Web 版。两种模式共享同一套渲染层应用，也共享同一套面向 Hexo 的核心服务逻辑。

## 两种运行模式

### Electron mode

桌面版仍然采用典型的 Electron 分层：

- **主进程**：负责应用生命周期、Hexo 集成、文件系统操作和本地服务
- **预加载脚本**：通过 `window.site.*` 暴露安全桥接接口
- **渲染进程**：负责界面本身

这种模式适合直接在本机选择博客目录并进行本地编辑。

### Web mode

自托管 Web 版把 Electron 的 IPC 边界替换成了 HTTP 边界：

- **Fastify 服务端**：负责鉴权、API 路由和站点初始化
- **浏览器中的渲染层 SPA**
- **同一套 Hexo / 文件系统服务**：真正执行博客读写

这种模式适合需要远程访问，但又不想把博客管理交给第三方 SaaS 的场景。

## 共享服务层

无论在哪种运行模式下，HexoPress 的后端职责都基本一致：

- **HexoAgent**：加载 Hexo 数据、查询文章/分类/标签、读写内容
- **FsAgent**：受控地访问 `source/` 目录
- **资源预览与元数据能力**：用于图片预览、文件信息读取和引用追踪

架构上的关键点在于：业务能力不是按运行模式各写一套，而是由 Electron IPC 和 Fastify 路由共同映射到同一层服务。

## Bridge 与统一契约

渲染层通过统一的 `site` 接口访问后端。

- 在 Electron mode 下，这个接口背后是 preload 暴露出来的 IPC 调用
- 在 Web mode 下，这个接口背后是对 `/api/*` 的 `fetch` 请求

这套统一契约让渲染层代码基本不需要关心当前到底跑在 IPC 还是 HTTP 上。

## 渲染层结构

渲染层是一个 Vue 3 单页应用，核心依赖包括：

- **Vue Router**：负责页面导航
- **Pinia**：负责状态管理
- **Element Plus** 与 **UnoCSS**：负责 UI 组织

主导航包含仪表盘、文章、分类、标签、媒体库和设置，而编辑器使用一套独立的全屏工作区布局。

## 以编辑器为中心的共享状态

HexoPress 的一个重要设计是：编辑器不会把所有有价值的状态都关在自己内部。正文内容、选区、标题结构和 Front Matter 会被提升到共享状态层，供其他面板协同使用。

因此这些能力才能在不强耦合的前提下成立：

- TOC 与正文标题同步
- AI 面板理解全文和选区
- 媒体插入理解当前文章上下文

## Hexo 作为库，而不是 CLI

HexoPress 不是每次操作都 shell 一次 `hexo` 命令，而是把 Hexo 作为 Node.js 库直接嵌入运行时。

这带来的好处包括：

- 直接访问 Hexo 的内存数据模型
- 更快的查询和统计
- 通过同一套 Front Matter 解析逻辑保证读写一致性

结果就是更少的进程开销，以及更稳定的编辑体验。

## 构建与交付

项目针对两种运行模式采用不同的构建路径：

- **Electron mode**：Electron Forge + Vite
- **Web mode**：Vite 构建前端，配合 esbuild 打包 Fastify 服务端

虽然交付方式不同，但整体架构目标是一致的：一套渲染体验，一套服务模型，两种部署选择。
