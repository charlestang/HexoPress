# HexoPress 架构与数据流指南

## 总览
HexoPress 以 Electron 作为容器，主进程负责窗口管理与 Hexo 数据服务，渲染进程使用 Vue 3 + Pinia + Vue Router 构建界面。主进程在启动时注册所有 IPC 管道并创建浏览器窗口，随后渲染进程加载 Vue 应用，按需请求 Hexo 数据并渲染各个功能页面。【F:main/main.ts†L14-L78】【F:src/renderer.ts†L1-L27】

整个系统围绕三个核心服务展开：

- **HexoAgent**：封装 Hexo CLI，负责初始化、缓存加载以及文章、分类、标签、统计等数据的读写。
- **FsAgent**：负责 Hexo `source/` 目录下的文件枚举、移动与媒体写入。
- **HttpServer**：包装 Fastify，将 `public/` 目录暴露在本地 2357 端口，用于预览生成后的静态资源。

下列步骤描述了典型的启动与数据流转顺序：

1. 渲染层选择博客根目录，并通过 `window.site.initializeAgent` 通知主进程绑定 Hexo 工作目录。
2. 主进程初始化 HexoAgent、FsAgent、HttpServer，完成 Hexo 缓存加载与静态资源服务准备。
3. 渲染层通过 `window.site` 调用 IPC 接口获取文章列表、分类树、站点信息等数据，更新 Pinia Store 后驱动界面渲染。

## 启动流程与生命周期

### Electron 主进程
- `app.whenReady()` 时注册所有与站点、文件系统、主题等相关的 `ipcMain.handle` 处理器，并在所有处理器准备完毕后创建主窗口。【F:main/main.ts†L36-L76】
- 主窗口加载 Vite 构建的渲染进程入口，如果处于开发模式会自动打开 DevTools，方便调试。【F:main/main.ts†L31-L35】
- 应用退出与激活流程遵循 Electron 约定：非 macOS 平台在最后一个窗口关闭后退出；macOS 在 Dock 重新激活时复用窗口。【F:main/main.ts†L80-L95】

### HexoAgent 生命周期
- 每次调用 `init` 都会根据传入路径创建新的 Hexo 实例；如果之前已经初始化过，则先调用 `hexo.exit()` 释放旧实例，再启动新的实例，确保切换博客目录时不会复用旧缓存。【F:main/lib/HexoAgent.ts†L9-L37】
- 初始化过程会先执行 `hexo.init()`，紧接着 `hexo.load()`，并注册一个 Markdown 渲染器以保持数据库缓存同步。整个过程以 `initPromise` 与 `exitPromise` 记录，在后续接口访问前统一等待，避免读取未完成的缓存。【F:main/lib/HexoAgent.ts†L28-L44】【F:main/lib/HexoAgent.ts†L47-L52】
- 文章列表、热力图、月份归档等读取方法都会在访问前 `await` 初始化承诺，确保拿到最新的 Hexo 本地缓存。过滤与排序逻辑复用 Hexo 内置的 `locals` 数据结构，并根据查询条件筛选出结果列表。【F:main/lib/HexoAgent.ts†L54-L136】

### FsAgent 与静态资源服务
- FsAgent 在主进程完成博客根目录绑定时初始化，后续所有相对路径都指向 `source/` 目录。它会过滤隐藏文件，并以简化后的 `relativePath` 与类型返回目录项，供媒体管理器使用。【F:main/lib/FsAgent.ts†L9-L31】
- 在执行 `mv` 或 `saveImage` 时，会先通过 `assureDir` 保证目标目录存在，再执行重命名或写入操作，避免因为目录缺失导致的失败。【F:main/lib/FsAgent.ts†L33-L58】
- HttpServer 每次 `init` 时都会重新注册 Fastify 静态插件并监听 2357 端口，如果已有实例则先关闭旧服务，以便在切换博客目录时正确指向新的 `public/` 输出。【F:main/lib/HttpServer.ts†L6-L39】

## 渲染进程结构
- 渲染入口 `renderer.ts` 创建 Vue 应用并依次安装国际化、路由与 Pinia，然后挂载到 DOM。【F:src/renderer.ts†L1-L27】
- 路由定义位于 `src/router/index.ts`，在全局导航守卫中根据是否已选择博客目录与代理初始化状态决定跳转或尝试初始化。守卫通过 `window.site.initializeAgent` 调用主进程，并在成功后标记 `appStore.isAgentInitialized`，驱动后续数据拉取。【F:src/router/index.ts†L1-L74】
- 全局状态由 `appStore` 管理，负责语言、暗色模式、Hexo 根目录等偏好持久化，并在代理初始化完成后自动请求 Hexo 配置与站点信息缓存到 Store。【F:src/stores/app.ts†L1-L89】

## 数据读取与写入路径
- 渲染层通过 `window.site` 暴露的接口发起请求，例如文章列表 (`site:posts`)、分类 (`site:categories`) 和媒体目录 (`fs:readdir`) 等，这些接口与主进程中的 `ipcMain.handle` 一一对应，形成单向调用链。【F:main/preload.ts†L1-L33】【F:main/main.ts†L36-L76】
- 写入流程（如保存文章、移动文件、上传图片）同样通过 IPC 调用 HexoAgent 或 FsAgent，写入完成后可以调用 `site:refresh` 或直接重新查询以获取最新数据。【F:main/preload.ts†L15-L33】【F:main/main.ts†L45-L63】

通过以上分层，HexoPress 将 Hexo CLI 的复杂度隔离在主进程服务中，渲染层只需关心 `window.site` 提供的契约，即可实现富客户端的内容管理体验。
