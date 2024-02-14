<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

[![license][license-badge]][LICENSE]
[![downloads][downloads-badge]][releases]
![NodeJS][nodejs-badge]
![npm][npm-badge]
![vue][vuejs-badge]
![vite][vite-badge]
![Fastify][fastify-badge]
![Electron.js][electron-badge]

支持Hexo的文章编辑和内容管理客户端软件！

[English](./README.md) | 简体中文

</div>

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [一、特性](#一-特性)
- [二、安装](#二-安装)
  - [0. 兼容性](#0-兼容性)
  - [1. Mac](#1-mac)
  - [2. Windows](#2-windows)
- [三、用户手册](#三-用户手册)
- [四、截图](#四-截图)
  - [1. 仪表盘](#1-仪表盘)
  - [2. 文章列表](#2-文章列表)
  - [3. 文章编辑器](#3-文章编辑器)
  - [4. 分类管理](#4-分类管理)
  - [5. 标签管理](#5-标签管理)
- [五、从源码开始](#五-从源码开始)
  - [1. 克隆源代码](#1-克隆源代码)
  - [2. 运行环境](#2-运行环境)
  - [3. 安装依赖](#3-安装依赖)
  - [4. 运行](#4-运行)
  - [5. 打包](#5-打包)
- [六、贡献](#六-贡献)
  - [1. 发现问题](#1-发现问题)
  - [2. 贡献代码](#2-贡献代码)
- [七、附录](#七-附录)

<!-- /code_chunk_output -->


## 一、特性
-----

- [x] 📝 已发布文章和草稿的列表显示；
- [x] 🔍 文章分类筛选及按时间筛选、排序；
- [x] 🌳 分类以树状形式展示和管理，包括文章数量统计；
- [x] 🏷️ 标签列表显示，包括文章数量统计；
- [ ] 🖼️ 图片等媒体资源列表展示；
- [x] ✍️ 文章编辑器，支持Markdown预览；
- [x] 🗂️ 编辑器支持目录 Outline 面板；
- [x] ⌨️ 编辑器支持 Vim 的 key bindings；
- [x] 📊 编辑器支持分类的下拉选择和标签检索；
- [x] ⚙️ 支持不打开文章快捷编辑元信息（FrontMatter）。

:star: 在 GitHub 上给我们点个免费的小星星 —— 这对我们来说是很大的鼓励！

## 二、安装

### 0. 兼容性

客户端内部使用了 Hexo 7.1.1 版本的 API，v7.0.0 以上的 Hexo 博客版本是可以使用的，其他版本未经测试。使用前，确认博客的目录已经在 `git` 备份。

### 1. Mac

[下载 苹果M1芯片版本: v1.0.0-alpha.2][download-for-apple]

[下载 Intel芯片版本: v1.0.0-alpha.2][download-for-intel]

### 2. Windows

[下载 Windows版本: v1.0.0-alpha.2][download-for-win]

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

- Node.js >= v21.1.0
- npm >= v10.3.0
- tcp port:5173 内部网页使用的端口号
- tcp port:2357 HTTP 服务用来伺服本地图片

### 3. 安装依赖

```bash
npm install
```

### 4. 运行

```bash
npm run electron:run
```

### 5. 打包

```bash
npm run build
npm run forge:make 
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

* [《我为什么构建了 HexoPress》][blog-why-hexopress]

[blog-why-hexopress]: https://blog.charlestang.org/2023/how-to-use-hexo-and-github-actions-to-build-a-personal-blog/
[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/2024/02/07/HowTo-%E7%94%A8-Hexo-%E5%BB%BA%E7%AB%8B%E4%B8%80%E4%B8%AA%E5%8D%9A%E5%AE%A2/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-darwin-arm64-1.0.0-alpha.2.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-darwin-x64-1.0.0-alpha.2.zip
[download-for-win]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-win-x64-1.0.0-alpha.2.zip
[downloads-badge]: https://img.shields.io/github/downloads/charlestang/HexoPress/total
[electron-badge]: https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white
[fastify-badge]: https://img.shields.io/badge/fastify-%23000000.svg?logo=fastify&logoColor=white
[license]: https://github.com/charlestang/HexoPress/blob/main/LICENSE
[license-badge]: https://img.shields.io/github/license/charlestang/HexoPress
[nodejs-badge]: https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white
[npm-badge]: https://img.shields.io/badge/NPM-%23CB3837.svg?logo=npm&logoColor=white
[releases]: https://github.com/charlestang/HexoPress/releases
[screenshot-categories]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/categories.png
[screenshot-dashboard]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/dashboard.png
[screenshot-editor]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/editor.png
[screenshot-postlist]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist.png
[screenshot-tags]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags.png
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white
[vuejs-badge]: https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D