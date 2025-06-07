<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

**Hexo 博客的极致桌面编辑体验，开箱即用，极简高效！**

[![license][license-badge]][LICENSE]
[![last-commit][last-commit-badge]](last-commit)
![Electron.js][electron-badge]
![vue][vuejs-badge]
![NodeJS][nodejs-badge]
![npm][npm-badge]
![vite][vite-badge]
![Fastify][fastify-badge]
[![downloads][downloads-badge]][releases]

为基于 `Hexo` 的博客，提供友好易用的文章编辑界面和内容管理系统！

[English](./README.md) | 简体中文

</div>

---

> ⭐️ **如果你喜欢 HexoPress，请 [Star](https://github.com/charlestang/HexoPress) 支持我们，让更多人看到！**

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->
- [HexoPress](#hexopress)
  - [快速开始](#快速开始)
  - [一、简介](#一简介)
    - [技术栈](#技术栈)
  - [二、安装](#二安装)
    - [0. 兼容性](#0-兼容性)
    - [1. Mac](#1-mac)
    - [2. Windows](#2-windows)
  - [三、特性一览](#三特性一览)
  - [四、用户手册](#四用户手册)
  - [五、截图](#五截图)
    - [1. 仪表盘](#1-仪表盘)
    - [2. 文章列表](#2-文章列表)
    - [3. 文章编辑器](#3-文章编辑器)
    - [4. 分类管理](#4-分类管理)
    - [5. 标签管理](#5-标签管理)
  - [六、从源码开始](#六从源码开始)
    - [1. 克隆源代码](#1-克隆源代码)
    - [2. 运行环境](#2-运行环境)
    - [3. 安装依赖](#3-安装依赖)
    - [4. 运行](#4-运行)
    - [5. 打包](#5-打包)
  - [七、贡献](#七贡献)
    - [1. 发现问题](#1-发现问题)
    - [2. 贡献代码](#2-贡献代码)
  - [八、加入社区](#八加入社区)
  - [九、附录](#九附录)

## 快速开始

1. [下载适合你系统的版本](#二安装)
2. 解压并运行 HexoPress
3. 选择你的 Hexo 博客目录，立即体验极致写作！

---

## 一、简介

HexoPress 让 Hexo 博客创作像 WordPress 一样简单！无需手动编辑 Front Matter，所见即所得，支持多平台，助你专注内容创作。

- **痛点**：Hexo 原生内容管理分散、繁琐，元数据需手动编辑，门槛高。
- **解决方案**：HexoPress 实时读取 Hexo 缓存，树形展示分类/标签，元数据点选即设，自动组织 Front Matter。
- **核心价值**：极简操作，所见即所得，支持 Vim 模式，桌面级体验。

### 技术栈

- Vue 3、Element Plus、Vite 5、Electron、Fastify

---

## 二、安装

### 0. 兼容性

- 支持 Hexo 7.0.0 及以上版本（内置 Hexo 7.1.1 API）
- 建议使用前备份博客目录（已集成 git）

### 1. Mac

- [下载 苹果M1芯片版本: v1.2.0][download-for-apple]
- [下载 Intel芯片版本: v1.2.0][download-for-intel]

### 2. Windows

- [下载 Windows版本: v1.2.0][download-for-win]

---

## 三、特性一览

- 📝 文章列表页展示所有文章，支持"已发布"/"草稿"筛选
- 📅 按月份筛选文章
- 🗂️ 按分类筛选文章
- 🔍 关键词搜索
- 🌳 分类树形展示，含文章数统计
- 🏷️ 标签列表，含文章数统计
- 🖼️ 媒体资源管理
- ✍️ Markdown 编辑器，支持预览
- 📋 目录 Outline 面板
- ⌨️ Vim 键位支持
- 📊 分类/标签下拉选择
- 🔖 批量编辑分类/标签（开发中）
- ⚙️ 快捷编辑 FrontMatter

---

## 四、用户手册

- [如何使用 Hexo 建立一个博客？][docs-hexo-get-start]

---

## 五、截图

> 每张截图下方简要说明

### 1. 仪表盘
![Dashboard][screenshot-dashboard]
_总览你的博客数据_

### 2. 文章列表
![Posts List][screenshot-postlist]
_快速筛选、管理所有文章_

### 3. 文章编辑器
![Editor][screenshot-editor]
_所见即所得，支持 Vim 模式_

### 4. 分类管理
![Categories Management][screenshot-categories]
_树形结构，直观管理分类_

### 5. 标签管理
![Tags Management][screenshot-tags]
_标签一览，统计清晰_

---

## 六、从源码开始

### 1. 克隆源代码

```bash
git clone https://github.com/charlestang/HexoPress.git
```

### 2. 运行环境

- Node.js >= v20.8.1
- npm >= v10.5.5
- 端口：5173（前端）、2357（本地图片服务）

### 3. 安装依赖

```bash
npm install
```

### 4. 运行

```bash
npm run dev      # 启动开发环境
npm run lint     # 代码检查
npm run format   # 代码格式化
npm run test     # 运行测试
```

### 5. 打包

```bash
npm run package
npm run make
```

---

## 七、贡献

### 1. 发现问题

- [提交 Issue](https://github.com/charlestang/HexoPress/issues)

### 2. 贡献代码

1. Fork 本仓库
2. 创建分支：`git checkout -b <feature-name>`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin <feature-name>`
5. 提交合并请求

---

## 八、加入社区

- 微信/QQ群/Telegram（如有可补充）

---

## 九、附录

- [《我为什么构建了 HexoPress》][blog-why-hexopress]

---

> ⭐️ **如果你喜欢 HexoPress，请 Star 支持我们，让更多人看到！**

---

[blog-why-hexopress]: https://blog.charlestang.org/2023/how-to-use-hexo-and-github-actions-to-build-a-personal-blog/
[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/howto-build-a-blog-with-hexo-cn/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-darwin-arm64-1.2.0.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-darwin-x64-1.2.0.zip
[download-for-win]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-squirrel.windows-x64-1.2.0.zip
[downloads-badge]: https://img.shields.io/github/downloads/charlestang/HexoPress/total
[electron-badge]: https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white
[fastify-badge]: https://img.shields.io/badge/fastify-%23000000.svg?logo=fastify&logoColor=white
[last-commit-badge]: https://img.shields.io/github/last-commit/charlestang/HexoPress.svg
[license]: https://github.com/charlestang/HexoPress/blob/main/LICENSE
[license-badge]: https://img.shields.io/github/license/charlestang/HexoPress
[nodejs-badge]: https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white
[npm-badge]: https://img.shields.io/badge/NPM-%23CB3837.svg?logo=npm&logoColor=white
[releases]: https://github.com/charlestang/HexoPress/releases
[screenshot-categories]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/categories.png
[screenshot-dashboard]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/dashboard-cn.png
[screenshot-editor]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/editor.png
[screenshot-postlist]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist-cn.png
[screenshot-tags]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags-cn.png
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white
[vuejs-badge]: https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D
