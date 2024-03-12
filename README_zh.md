<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

[![license][license-badge]][LICENSE]
[![last-commit][last-commit-badge]](last-commit)
![Electron.js][electron-badge]
![vue][vuejs-badge]
![NodeJS][nodejs-badge]
![npm][npm-badge]
![vite][vite-badge]
![Fastify][fastify-badge]
[![downloads][downloads-badge]][releases]

为基于`Hexo`的博客，提供友好易用的文章编辑界面和内容管理系统！

[English](./README.md) | 简体中文

</div>

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [HexoPress](#hexopress)
  - [一、简介](#一简介)
    - [特性清单](#特性清单)
    - [鸣谢](#鸣谢)
  - [二、安装](#二安装)
    - [0. 兼容性](#0-兼容性)
    - [1. Mac](#1-mac)
    - [2. Windows](#2-windows)
  - [三、用户手册](#三用户手册)
  - [四、截图](#四截图)
    - [1. 仪表盘](#1-仪表盘)
    - [2. 文章列表](#2-文章列表)
    - [3. 文章编辑器](#3-文章编辑器)
    - [4. 分类管理](#4-分类管理)
    - [5. 标签管理](#5-标签管理)
  - [五、从源码开始](#五从源码开始)
    - [1. 克隆源代码](#1-克隆源代码)
    - [2. 运行环境](#2-运行环境)
    - [3. 安装依赖](#3-安装依赖)
    - [4. 运行](#4-运行)
    - [5. 打包](#5-打包)
  - [六、贡献](#六贡献)
    - [1. 发现问题](#1-发现问题)
    - [2. 贡献代码](#2-贡献代码)
  - [七、附录](#七附录)

<!-- /code_chunk_output -->

## 一、简介

Hexo 是一款快速、简洁且高效的博客框架。它通过在服务器上对文章进行编译、渲染，生成静态页面后再发布到互联网，从而提供了丝滑的读者阅读体验。然而，Hexo 基于配置和文本文件的内容管理方式，并不尽友好。例如，用于组织博客内容的元数据，如文章分类、标签等，是分散在每篇文章的开头部分的，因此不能提供一个实时且全局的管理界面。编辑单篇文章时，元数据（如分类、标签、更新时间、发布状态等）都需要手动编辑，且使用与 Markdown 语法不同的 Yaml 或 JSON 格式，这对不熟悉 Yaml/JSON 语法和 Front Matter 组织形式的作者来说，造成了相当的心智负担，即便是专业的程序员也不例外。

为解决这些问题，我设计了 **HexoPress**。它的核心原理是利用 Hexo 自身的生成器产生的缓存文件，将分类、标签等元数据信息以树形目录的形式实时展示在编辑界面上。这样，作者可以通过简单的点选完成分类和标签的设定，在文章编辑过程中，无需分心处理 Front Matter 数据，因为在保存时系统会自动按照语法进行内容组织。此外，**HexoPress** 还提供了一个友好易用的 Markdown 编辑器，支持包括许多程序员喜爱的 Vim 编辑模式在内的功能，使创作过程更加愉悦。

我采用了流行的 Web 开发技术，如 Vue 3、Element Plus 和 Vite 5，并利用 Electron 将其打包成桌面应用，使其能够在 Windows、MacOS、Linux 等多个平台上运行。我希望这款开源软件能为您带来愉悦的博客创作体验。如果您喜欢此项目，请将其推荐给朋友，并在 GitHub 上给我们点一个小星星。您的支持对我们来说是极大的鼓励，谢谢您的❤️！

### 特性清单

---

- [x] 📝 文章列表页展示所有文章，可以按照“已发布”/“草稿”状态筛选；
- [x] 📅 按照月份筛选文章列表；
- [x] 🗂️ 按照分类筛选文章列表；
- [x] 🔍 按照关键词筛选文章列表；
- [x] 🌳 树形显示的分类列表，包括文章数量统计；
- [x] 🏷️ 标签列表显示，包括文章数量统计；
- [x] 🖼️ 图片等媒体资源列表展示；
- [x] ✍️ 文章编辑器，支持Markdown预览；
- [x] 📋 编辑器支持目录 Outline 面板；
- [x] ⌨️ 编辑器支持 Vim 的 key bindings；
- [x] 📊 编辑器支持分类的下拉选择；
- [ ] 🔖 批量编辑文章的分类和标签信息；
- [x] ⚙️ 支持不打开文章快捷编辑元信息（FrontMatter）。

:star: 在 GitHub 上给我们点个免费的小星星 —— 这对我们来说是很大的鼓励！

### 鸣谢

感谢 WordPress，HexoPress 的管理和编辑界面的设计灵感来自 WordPress，世界上最好的博客平台/软件，也是我个人使用多年的博客软件。

## 二、安装

### 0. 兼容性

客户端内部使用了 Hexo 7.1.1 版本的 API，v7.0.0 以上的 Hexo 博客版本是可以使用的，其他版本未经测试。使用前，确认博客的目录已经在 `git` 备份。

### 1. Mac

[下载 苹果M1芯片版本: v1.1.0][download-for-apple]

[下载 Intel芯片版本: v1.1.0][download-for-intel]

### 2. Windows

[下载 Windows版本: v1.1.0][download-for-win]

## 三、用户手册

1. [如何使用 Hexo 建立一个博客？][docs-hexo-get-start]

## 四、截图

### 1. 仪表盘

![Dashboard][screenshot-dashboard]

### 2. 文章列表

![Posts List][screenshot-postlist]

### 3. 文章编辑器

![Editor][screenshot-editor]

### 4. 分类管理

![Categories Management][screenshot-categories]

### 5. 标签管理

![Tags Management][screenshot-tags]

## 五、从源码开始

### 1. 克隆源代码

```bash
git clone https://github.com/charlestang/HexoPress.git
```

### 2. 运行环境

- Node.js >= v20.8.1
- npm >= v10.5.5
- tcp port:5173 内部网页使用的端口号
- tcp port:2357 HTTP 服务用来伺服本地图片

### 3. 安装依赖

```bash
npm install
```

### 4. 运行

启动本地开发环境：

```bash
npm run dev
```

运行 ESLint：

```bash
npm run lint
```

运行代码格式化：

```bash
npm run format
```

运行测试：

```bash
npm run test
```

### 5. 打包

```bash
npm run package
npm run make
```

## 六、贡献

### 1. 发现问题

访问 https://github.com/charlestang/HexoPress/issues 提交问题。

### 2. 贡献代码

1. Fork 本仓库
2. 创建分支：`git checkout -b <feature-name>`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin <feature-name>`
5. 提交合并请求

## 七、附录

- [《我为什么构建了 HexoPress》][blog-why-hexopress]

[blog-why-hexopress]: https://blog.charlestang.org/2023/how-to-use-hexo-and-github-actions-to-build-a-personal-blog/
[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/2024/02/07/HowTo-%E7%94%A8-Hexo-%E5%BB%BA%E7%AB%8B%E4%B8%80%E4%B8%AA%E5%8D%9A%E5%AE%A2/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.1.0/HexoPress-darwin-arm64-1.0.0.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.1.0/HexoPress-darwin-x64-1.1.0.zip
[download-for-win]: https://github.com/charlestang/HexoPress/releases/download/v1.1.0/HexoPress-squirrel.windows-x64-1.1.0.zip
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
[screenshot-postlist]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist.png
[screenshot-tags]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags.png
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white
[vuejs-badge]: https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D
