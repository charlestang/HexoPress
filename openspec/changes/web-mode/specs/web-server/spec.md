## ADDED Requirements

### Requirement: REST API 路由映射

Web Server MUST 提供 REST API 端点，与 `main.ts` 中注册的全部 IPC handler 一一对应。所有 API 路由 MUST 使用 `/api/` 前缀。读操作使用 GET 方法，写操作使用 POST 方法。

#### Scenario: 查询文章列表
- **WHEN** 客户端发送 `GET /api/site/posts`
- **THEN** 服务端调用 `agent.getPosts()` 并返回 JSON 格式的文章数组

#### Scenario: 保存文章内容
- **WHEN** 客户端发送 `POST /api/post/save` 且 body 包含 `{ path, content }`
- **THEN** 服务端调用 `agent.saveContent(path, content)` 并返回操作结果

#### Scenario: 上传图片
- **WHEN** 客户端发送 `POST /api/fs/saveImage` 且 body 包含文件数据
- **THEN** 服务端调用 `fsAgent.saveImage(path, content)` 并触发 `agent.generate()`

### Requirement: 复用现有服务模块

Web Server MUST 直接 import 并使用 `main/lib/HexoAgent.ts`、`main/lib/FsAgent.ts`、`main/lib/HttpServer.ts`，不对这些模块做任何修改。

#### Scenario: 服务初始化
- **WHEN** Web Server 启动
- **THEN** 从配置文件读取 `hexoDir`，调用 `agent.init(hexoDir)`、`fsAgent.init(hexoDir)`、`httpServer.init(hexoDir)` 初始化所有服务

#### Scenario: 模块无修改
- **WHEN** Web Server 引用 HexoAgent/FsAgent/HttpServer
- **THEN** 使用的是与 Electron 主进程完全相同的模块代码，无 fork 或 patch

### Requirement: 静态文件服务

Web Server MUST 在生产模式下同时 serve SPA 静态文件和 Hexo public/ 目录的资源文件。

#### Scenario: SPA 静态文件
- **WHEN** 客户端请求 `/`（或任何非 `/api/`、非 `/assets/` 路径）
- **THEN** 返回 `dist/web/index.html`（SPA 入口），由前端路由处理

#### Scenario: Hexo 资源文件
- **WHEN** 客户端请求 `/assets/images/photo.jpg`
- **THEN** 从 Hexo 项目的 `public/` 目录返回对应文件

### Requirement: 配置文件

Web Server MUST 从配置文件读取运行参数。配置文件路径 MUST 支持通过命令行参数或环境变量指定。

#### Scenario: 默认配置文件
- **WHEN** 未指定配置文件路径
- **THEN** 从工作目录下的 `hexopress.config.json` 读取配置

#### Scenario: 配置项
- **WHEN** 读取配置文件
- **THEN** 配置 MUST 包含 `hexoDir`（Hexo 项目路径）、`port`（监听端口）、`username`（用户名）、`password`（密码）

### Requirement: 开发模式支持

Web Server MUST 支持 `--dev` 参数启动开发模式，此模式下不 serve SPA 静态文件（由 Vite dev server 处理），仅提供 API 和资源文件服务。

#### Scenario: 开发模式启动
- **WHEN** 执行 `tsx web/server.ts --dev`
- **THEN** 服务端仅注册 `/api/*` 和 `/assets/*` 路由，不 serve SPA 静态文件
