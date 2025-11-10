# Project Context

## Purpose

本项目旨在构建一个客户端应用，为[Hexo](hexo.io)博客提供一个用户友好的管理界面，简化博客文章的创建，分类、标签的管理，图片的管理等博客写作相关的操作。客户端应用的管理界面灵感来自 WordPress 博客的管理后台界面，希望能像 WordPress 一样好用。

## Tech Stack

- 整个项目基于 [Electron](https://www.electronjs.org/) 构建，利用其跨平台桌面应用开发能力。
- 主进程使用 TypeScript 编写，负责窗口管理、IPC 通信以及与使用 [Fastify](https://www.fastify.io/) 搭建本地 HTTP 服务器等功能。
- 渲染进程使用 Vue 3 框架构建，结合 Pinia 进行状态管理，Vue Router 处理路由，使用 Element Plus 作为 UI框架。
- 项目使用 Vite 作为构建工具，提升开发和构建效率。
- 使用 eslint 和 prettier 进行代码质量和格式化管理，确保代码风格一致。

## Project Conventions

### Code Style

编码规范参考项目 `docs/` 目录下的 `CODING_STANDARD.md`。

### Architecture Patterns

整个项目，遵循 Electron 主进程与渲染进程分离的架构模式，主进程负责核心逻辑和系统资源管理，渲染进程负责用户界面和交互。两者通过 IPC 通信进行数据交换和命令传递。

主进程通过三个模块提供核心服务：

- HexoAgent：封装 Hexo CLI，负责初始化、缓存加载以及文章、分类、标签、统计等数据的读写。
- FsAgent：负责 Hexo source/ 目录下的文件枚举、移动与媒体写入。
- HttpServer：包装 Fastify，将 public/ 目录暴露在本地 2357 端口，用于预览生成后的静态资源。

渲染进程则是一个典型的 Vue 3 单页应用。

### Testing Strategy

- 每次在运行代码之前应该执行 `npm install` 确保依赖是最新的。
- 每次提交前运行 `npm run format` 尝试一遍自动修复编码风格的不一致。
- 每次提交前运行 `npm run lint --fix` 确保代码风格符合规范。
- 每次提交前运行 `npm run check-all`，确保编译检查通过，没有类型错误。
- 使用 `npm run test` 运行单元测试，确保代码功能正确。


### Git Workflow

- 一般在 `main` 分支上开发和提交代码
- 通过 `rebase` 等方式保持提交记录线性
- 每次提交前，应该运行测试，确保没有测试失败和 lint 错误
- 单次提交应保持完备，确保每个 commit 都是一个完整的、可运行的单元
- 提交完成后，应执行 `git status --porcelain` 确保工作区干净，无未跟踪或未提交的文件
- 执行 `push` 之前，应该现在执行 `git pull --rebase`，以确保本地分支是最新的

## Domain Context

应用面向 Hexo 博客作者，默认用户已经在本地拥有一个可运行的 Hexo 工程（含 `source/`、`public/`、`_config.yml` 等目录和配置）。

Hexo CLI 负责生成静态站点，HexoPress 通过封装的 HexoAgent 调用 CLI 完成文章生成、分类与标签维护、资源编译等任务。

界面交互遵循常见 CMS（如 WordPress）后台的操作范式：侧边栏导航、列表页管理、富文本编辑器、草稿与发布状态切换。

HexoPress 相当是给一个 Hexo 博客实例，增加了一个客户端编辑软件，本身不会干扰博客的运行，其编辑的博客文章内容，会写回到博客实例的工作目录 `source/` 下，上传的文件，会上传到 `source/images/` 目录下。通过 HexoPress 编辑过的文件，如果脱离了客户端，只使用 Hexo CLI 需要可以正常运行。

## Important Constraints

- 必须兼容 Node.js ≥ 20.8.1、npm ≥ 10.5.5；禁止依赖需要额外安装的全局 CLI。
- 所有文件写操作仅允许触达用户选定的 Hexo 工程目录，禁止写入系统临时目录之外的路径。

## External Dependencies

除了前端页面上一些功能脚本，或者样式表，使用了 CDN 提供的类库外，具体依赖的类库，可以参见 `index.html` 中声明的 CSP 政策允许的域名，比如 `https://unpkg.com`。本项目不依赖外部的云服务，跟博客数据有关的比如博客文章、分类、标签、图片等数据，全部存储在用户本地的 Hexo 工程目录下。而跟 HexoPress 运行的自身配置相关的数据，客户端基本配置参数等可能保存在 Electron 应用的 localStorage 里，视具体实现而定。
