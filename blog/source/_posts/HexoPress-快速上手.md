---
title: '[HexoPress] 快速上手'
permalink: hexopress-getting-started/
categories:
  - - HexoPress 教程
tags:
  - hexopress
  - guide
excerpt: 下载并启动 HexoPress，连接到你的 Hexo 博客目录，开始可视化管理。
date: 2026-02-11 10:00:00
updated: 2026-04-04 13:20:00
---

HexoPress 现在既可以作为桌面应用运行，也可以作为自托管 Web 应用部署。无论你选择哪种模式，进入主界面后看到的都是同一套博客管理体验：仪表盘、文章列表、分类、标签、媒体库、设置，以及顶部的新建文章入口。

## 选择运行方式

### 桌面版（Electron）

这是上手最快的方式。从 GitHub Releases 下载对应系统的安装包即可：

- macOS：下载 `.dmg`
- Windows：下载 `.exe`
- Linux：下载 `.AppImage` 或 `.deb`

安装完成后直接启动 HexoPress。

### Web 版（Self-hosted）

如果你希望通过浏览器远程管理博客，可以部署 Web mode：

```bash
git clone https://github.com/charlestang/HexoPress.git
cd HexoPress
npm install
cp web/hexopress.config.example.json hexopress.config.json
```

然后在 `hexopress.config.json` 中配置博客目录、端口和登录账号，再执行：

```bash
npm run web:build
node dist/server.cjs
```

开发环境可直接运行：

```bash
npm run web:dev
```

## 首次进入

### 桌面版

首次启动后，你会看到 Setup 页面，需要选择一个本地 Hexo 博客根目录。

> 插图：请插入桌面版首次启动时的 Setup 页面截图，显示选择目录按钮和提示文案

选择的目录应包含 `_config.yml`、`source`、`themes` 等 Hexo 常见文件夹。确认后，HexoPress 会初始化博客数据，并读取文章、草稿、分类、标签和媒体资源。

### Web 版

Web mode 首先进入登录页。输入你在服务端配置文件中设置的用户名和密码后即可进入主界面。博客目录已经由服务端预先指定，不需要在浏览器里再次选择。

> 插图：请插入 Web mode 的登录页截图

## 进入主界面之后

数据加载完成后，你会进入仪表盘。这里会展示博客标题、副标题、关键词、文章统计、写作热力图、最近发布文章和草稿列表。

左侧导航栏提供这些入口：

- **仪表盘**：查看博客总体状态
- **文章**：筛选、搜索、预览和维护所有文章
- **分类**：查看分类树，并进入分类详情页批量整理文章
- **标签**：查看标签使用情况，并在标签对话框中快速清理标签
- **媒体库**：集中管理图片和其他资源文件
- **设置**：配置语言、编辑模式、外观和 AI 提供商

顶部栏还有一个 **新建** 按钮。点击后会直接打开空白编辑器，你可以选择先保存为草稿，或者直接发布为正式文章。

## 下一步建议

完成连接后，建议继续阅读这些文章：

- 《仪表盘一览》：先了解首页能看到哪些信息
- 《文章管理》：熟悉筛选、预览和元数据编辑
- 《编辑器功能详解》：掌握正文编辑、拖拽上传图片和侧边面板
- 《媒体库》：了解图片分组、详情页和引用追踪

到这里，你已经可以开始用 HexoPress 管理你的 Hexo 博客了。
