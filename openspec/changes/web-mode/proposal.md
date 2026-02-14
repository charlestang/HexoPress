## Why

HexoPress 目前仅支持 Electron 桌面模式。但很多 Hexo 用户将博客部署在远程服务器上，而 Hexo 本身没有管理后台。如果 HexoPress 能以 Web 模式运行，就可以作为服务器上 Hexo 实例的管理后台，填补这一空白。

## What Changes

- 新增 Web Bridge 适配层：编译时通过 Vite alias 替换 `@/bridge` 的实现，将 IPC 调用切换为 HTTP fetch 调用
- 新增 Web Server：基于 Fastify 的 REST API 服务，复用现有 `HexoAgent`、`FsAgent` 模块
- 新增 Signed Cookie 鉴权：通过 `hexopress.config.json` 配置用户名密码，使用 `@fastify/cookie` 签名 cookie 实现 session
- 新增 Vite Web 构建配置：独立于 Electron 的编译模式，输出标准 SPA
- 新增 npm scripts：`web:dev`（开发模式）和 `web:build`（生产构建）
- 将硬编码的 `http://127.0.0.1:2357/` 静态资源 URL 改为 `import.meta.env.VITE_ASSET_BASE_URL`
- Setup 页面在 Web 模式下隐藏"绑定/解绑"目录选择功能（路径由服务端配置文件提供）
- 移除 `HexoAgent` 对 `electron` 模块的依赖（`app.getSystemLocale()` → `Intl.DateTimeFormat().resolvedOptions().locale`）
- 性能优化：用自定义加载流程替代 `hexo.load()`，跳过不必要的 `_generate()` 步骤（从 ~12s 降至 ~500ms）

## Capabilities

### New Capabilities

- `web-bridge`: 编译时可切换的适配层，在 Web 模式下用 HTTP fetch 实现全部 ISite 方法，替代 Electron preload 的 IPC 桥接；自动处理 401 响应跳转登录页
- `web-server`: 基于 Fastify + esbuild 的 REST API 服务端，将 IPC handler 映射为 HTTP 路由，复用 HexoAgent/FsAgent，serve SPA 静态文件和 Hexo public/ 目录；包含 CJS/ESM interop 修复（hexo-util 等包的 `__esModule` 兼容）
- `web-auth`: 单用户鉴权机制，基于 `@fastify/cookie` 签名 cookie，提供登录页面（LoginView.vue）和 session 管理，保护所有 `/api/*` 端点

### Modified Capabilities

- `HexoAgent` 初始化优化：移除 `electron` 依赖；用自定义加载流程（loadDatabase → source.process → theme.process）替代 `hexo.load()`，跳过 `_generate({cache: false})` 避免渲染全部文章的主题模板（NexT 模板渲染 467 篇文章耗时 11.5s，而编辑器不需要生成的 HTML）；同路径重复初始化时跳过重建

## Impact

- **主进程**：`HexoAgent` 移除了 `electron` 依赖，改用 `Intl` API 获取 locale；`FsAgent` 不需要修改，被 Web Server 直接复用
- **渲染进程**：所有 `window.site.*` 调用替换为 `import { site } from '@/bridge'`；5 处硬编码 URL 替换为环境变量
- **构建系统**：新增 `vite.config.web.ts`，不影响现有 Electron Forge 构建流程；Web Server 使用 esbuild 打包为 CJS
- **依赖**：新增 `@fastify/cookie` 用于签名 cookie 鉴权；Fastify 本身已是现有依赖
- **类型系统**：`ISite` 接口不变，Web Bridge 实现相同接口
- **性能**：Electron 和 Web 模式均受益于跳过 `_generate()` 的优化
