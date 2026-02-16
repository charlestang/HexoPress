## ADDED Requirements

### Requirement: 编译时桥接切换

系统 MUST 支持通过 Vite 编译配置在 Electron IPC 模式和 Web HTTP 模式之间切换 `window.site` 的实现。渲染进程代码 MUST 通过统一的 `import { site } from '@/bridge'` 访问所有后端方法，不直接引用 `window.site`。

#### Scenario: Electron 模式编译
- **WHEN** 使用 `vite.config.renderer.ts` 编译渲染进程
- **THEN** `@/bridge` 解析为 `src/bridge/electron.ts`，`site` 对象通过 `window.site`（IPC）调用主进程

#### Scenario: Web 模式编译
- **WHEN** 使用 `vite.config.web.ts` 编译渲染进程
- **THEN** `@/bridge` 解析为 `src/bridge/web.ts`，`site` 对象通过 HTTP fetch 调用 Web Server API

### Requirement: Web Bridge 接口完整性

`src/bridge/web.ts` MUST 实现 `ISite` 接口定义的全部方法，与 `preload.ts` 暴露的方法一一对应。每个方法 MUST 将参数序列化为 HTTP 请求并将响应反序列化为与 IPC 模式相同的返回类型。

#### Scenario: 数据查询方法
- **WHEN** 渲染进程在 Web 模式下调用 `site.getPosts()`
- **THEN** Web Bridge 发送 `GET /api/site/posts` 请求，返回与 IPC 模式相同结构的 Post 数组

#### Scenario: 数据写入方法
- **WHEN** 渲染进程在 Web 模式下调用 `site.saveContent(path, content)`
- **THEN** Web Bridge 发送 `POST /api/post/save` 请求，body 包含 `{ path, content }`

#### Scenario: 文件上传方法
- **WHEN** 渲染进程在 Web 模式下调用 `site.saveImage(path, arrayBuffer)`
- **THEN** Web Bridge 将 ArrayBuffer 转为 multipart/form-data 或 base64 编码后发送 `POST /api/fs/saveImage`

### Requirement: Electron 特有 API 的 Web 替代

Web Bridge MUST 为 4 个 Electron 特有方法提供 Web 环境下的替代实现。

#### Scenario: 目录选择对话框
- **WHEN** 渲染进程在 Web 模式下调用 `site.openDirDialog()`
- **THEN** 返回空结果或抛出不支持异常（Web 模式下此功能由服务端配置替代）

#### Scenario: 打开外部 URL
- **WHEN** 渲染进程在 Web 模式下调用 `site.openUrl(url)`
- **THEN** 调用 `window.open(url, '_blank')` 在新标签页打开

#### Scenario: 获取系统语言
- **WHEN** 渲染进程在 Web 模式下调用 `site.getSystemLocale()`
- **THEN** 返回 `navigator.language` 的值

#### Scenario: 暗色模式控制
- **WHEN** 渲染进程在 Web 模式下调用 `site.getDarkMode()` 或 `site.setDarkMode(val)`
- **THEN** 通过 `matchMedia('(prefers-color-scheme: dark)')` 和 localStorage 管理暗色模式状态

### Requirement: 静态资源 URL 可配置

渲染进程中所有静态资源 URL MUST 通过环境变量 `VITE_ASSET_BASE_URL` 配置，不得硬编码 `http://127.0.0.1:2357/`。

#### Scenario: Electron 模式资源 URL
- **WHEN** 以 Electron 模式编译
- **THEN** `VITE_ASSET_BASE_URL` 值为 `http://127.0.0.1:2357/`

#### Scenario: Web 模式资源 URL
- **WHEN** 以 Web 模式编译
- **THEN** `VITE_ASSET_BASE_URL` 值为 `/assets/`

### Requirement: 应用模式环境变量

渲染进程 MUST 可通过 `import.meta.env.VITE_APP_MODE` 获取当前编译模式（`'electron'` 或 `'web'`），用于条件渲染 UI 元素。

#### Scenario: Web 模式下隐藏目录绑定
- **WHEN** 以 Web 模式编译且用户访问 Setup 页面
- **THEN** "绑定/解绑"目录选择功能不显示，其他配置项正常显示

#### Scenario: Electron 模式下显示目录绑定
- **WHEN** 以 Electron 模式编译且用户访问 Setup 页面
- **THEN** 所有配置项正常显示，包括"绑定/解绑"功能
