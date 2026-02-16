## 1. Bridge 适配层

- [x] 1.1 创建 `src/bridge/types.ts`，导出 `SiteBridge` 类型（基于 `ISite` 接口）
- [x] 1.2 创建 `src/bridge/electron.ts`，封装 `window.site` 为 `SiteBridge` 实现
- [x] 1.3 创建 `src/bridge/web.ts`，用 fetch 调用 REST API 实现 `SiteBridge` 全部 49 个方法
- [x] 1.4 创建 `src/bridge/index.ts`，作为统一导出入口
- [x] 1.5 将 22 个文件中的 52 处 `window.site.*` 调用替换为 `import { site } from '@/bridge'` 后使用 `site.*`
- [x] 1.6 处理 4 个 Electron 特有 API 的 Web 替代实现（openDirDialog、openUrl、getSystemLocale、darkMode）
- [x] 1.7 将 5 处硬编码 `http://127.0.0.1:2357/` 替换为 `import.meta.env.VITE_ASSET_BASE_URL`

## 2. Web Server

- [x] 2.1 创建 `web/config.ts`，读取 `hexopress.config.json` 配置文件
- [x] 2.2 创建 `web/routes.ts`，将 49 个 IPC handler 映射为 Fastify REST 路由（`/api/*`）
- [x] 2.3 创建 `web/server.ts`，Web 模式入口：初始化 Fastify、注册路由、serve 静态文件、启动服务
- [x] 2.4 处理 `saveImage` 的文件上传（multipart/form-data 或 base64）
- [x] 2.5 配置 `/assets/*` 路由 serve Hexo public/ 目录
- [x] 2.6 生产模式下 serve SPA 静态文件（`dist/web/`），支持 `--dev` 参数跳过

## 3. 鉴权

- [x] 3.1 创建 `web/auth.ts`，实现 Fastify 鉴权中间件（signed cookie session）
- [x] 3.2 实现 `POST /api/auth/login` 和 `POST /api/auth/logout` 端点
- [x] 3.3 实现 `GET /api/auth/check` 认证状态检查端点
- [x] 3.4 创建 `src/views/LoginView.vue` 登录页面
- [x] 3.5 在 Vue Router 中添加 `/login` 路由和 Web 模式下的导航守卫（未登录重定向）
- [x] 3.6 在 Web Bridge 中处理 401 响应（自动跳转登录页）

## 4. 构建配置

- [x] 4.1 创建 `vite.config.web.ts`，配置 Web 模式编译（alias、环境变量、proxy、输出目录）
- [x] 4.2 在 `package.json` 中添加 `web:dev` 和 `web:build` scripts
- [x] 4.3 创建示例配置文件 `web/hexopress.config.example.json`
- [x] 4.4 为 `web/` 目录添加对应的 tsconfig 配置

## 5. Setup 页面适配

- [x] 5.1 在 Setup 页面中根据 `import.meta.env.VITE_APP_MODE` 条件隐藏"绑定/解绑"功能
- [x] 5.2 Web 模式下 router 导航守卫跳过目录检查（路径由服务端配置提供）

## 6. 验证与测试

- [x] 6.1 确保 `npm run dev`（Electron 模式）功能不受影响
- [x] 6.2 验证 `npm run web:dev` 可正常启动并通过 `http://localhost:8081` 访问
- [x] 6.3 验证登录鉴权流程（登录、登出、未认证拦截）
- [x] 6.4 验证性能优化（使用单例，避免重复初始化）
- [x] 6.5 验证 `npm run web:build` 输出完整的 SPA 到 `dist/web/`
- [x] 6.6 验证文章 CRUD、分类、标签、媒体库等核心功能在 Web 模式下正常工作
