## Context

当前 HexoPress 使用 una-editor@0.3.0 作为 Markdown 编辑器。编辑器的 live preview 模式无法正确显示图片，因为：

1. **Hexo 图片路径机制**：Hexo 文章中的图片使用相对路径（如 `../images/2024/01/photo.jpg`），这个路径是相对于编译后的 `public/` 目录中文章的位置
2. **Permalink 深度问题**：文章的 permalink 决定了编译后的目录深度，例如：
   - `permalink: "a/"` → `public/a/index.html` → 需要 `../images/...`
   - `permalink: "2026/a/"` → `public/2026/a/index.html` → 需要 `../../images/...`
3. **预览时的路径解析**：编辑时文章还未编译，图片实际通过本地预览服务访问。Electron mode 使用本地静态服务，Web mode 使用 `/assets/` 代理，两者都通过 `VITE_ASSET_BASE_URL` 暴露资源
4. **una-editor 限制**：当前版本的 una-editor 不提供图片 URL 转换机制，直接使用 Markdown 中的相对路径，导致 404

**现有实现**：
- `src/utils/path.ts` 中的 `computeRelativeImagePath()` 函数根据 permalink 计算需要几层 `../`
- 插入图片时使用相对路径
- 预览对话框（`MdRenderer.vue`）通过 `resolveMarkdownImageUrl()` 转换路径，可以正确显示
- 主编辑器的 live preview 无法转换路径
- 媒体库（`MediaPanel.vue`）插入图片时仍沿用相对路径生成逻辑

**una-editor 新功能**：
- 0.4.0-alpha.0 版本包含表格编辑、代码高亮等新功能
- 0.4.0-alpha.0 已提供 `renderHooks` 功能，允许在渲染前转换图片 URL

## Goals / Non-Goals

**Goals:**
- 升级 una-editor 到 0.4.0-alpha.0，获取最新功能和 `renderHooks`
- 解决 live preview 中的图片显示问题
- 简化图片路径管理：使用绝对路径，不受 permalink 深度影响
- 支持 Hexo 部署在子目录的场景（通过 `root` 配置）
- 明确区分“Markdown 中保存的发布态路径”和“本地预览时访问的资源 URL”
- 让 Electron mode 和 Web mode 共享同一套预览路径转换规则
- 保持向后兼容：旧文章中的相对路径图片仍能正确预览

**Non-Goals:**
- 不修改 Hexo 的图片路径机制（保持与 Hexo CLI 兼容）
- 不自动转换旧文章中的相对路径为绝对路径（用户可以手动修改）
- 不在本次变更中实现图片路径批量转换工具
- 不改变现有本地静态资源服务的挂载结构或基础配置

## Decisions

### Decision 1: 使用绝对路径而非相对路径

**选择**：新插入的图片使用绝对路径（`/images/...` 或 `/HexoPress/images/...`），而非相对路径（`../images/...`）

**理由**：
- Hexo 原生支持绝对路径（已通过测试验证）
- 不受 permalink 深度影响，无需计算 `../` 层数
- 修改 permalink 时无需调整图片路径
- 简化代码逻辑，移除“新插入图片依赖 permalink 深度计算”的复杂逻辑

**替代方案**：
- 继续使用相对路径 + 监听 permalink 变化 + 扫描替换
  - 优点：保持现有机制
  - 缺点：复杂，容易出错，用户体验差（修改 permalink 会改变文章内容）

### Decision 2: 读取 Hexo 的 root 配置

**选择**：扩展 `HexoConfig` 类型，添加 `root` 字段，并在 `getHexoConfig()` 中读取 `hexo.config.root`

**理由**：
- Hexo 的 `root` 配置指定站点部署的子目录（如 `/HexoPress/`）
- 图片路径需要考虑 `root`：
  - `root: "/"` → `/images/test.jpg`
  - `root: "/HexoPress/"` → `/HexoPress/images/test.jpg`
- 这是 Hexo 的标准配置，用户已经在 `_config.yml` 中配置
- 需要在客户端统一规范化 root 格式，保证 `""`、`"HexoPress"`、`"/HexoPress"` 等输入最终都收敛为 `"/HexoPress/"`

**替代方案**：
- 让用户在 HexoPress 中单独配置
  - 优点：解耦
  - 缺点：重复配置，容易不一致

### Decision 3: 使用 una-editor 的 renderHooks 功能

**选择**：使用 una-editor 0.4.0-alpha.0 已提供的 `renderHooks.image` 功能，在 HexoPress 中实现预览转换逻辑

**理由**：
- una-editor 0.4.0-alpha.0 已暴露 `renderHooks`、`ImageRenderContext`、`ImageRenderResult` 等类型
- 这是正确的架构分层：una-editor 提供扩展点，HexoPress 实现业务逻辑
- 转换逻辑应基于 `VITE_ASSET_BASE_URL`，而不是在工件中硬编码某个本地服务地址
- `renderHooks.image` 的返回值应符合真实 API：返回 `Partial<ImageRenderResult>`，而不是裸字符串

**renderHooks API**：
```typescript
interface RenderHooks {
  image?: (context: ImageRenderContext) => Partial<ImageRenderResult> | void
}

interface ImageRenderContext {
  src: string
  alt: string
  title?: string
  raw: string
  position: { from: number, to: number }
}

interface ImageRenderResult {
  src: string
  className?: string
  dataset?: Record<string, string>
  style?: Record<string, string>
}
```

### Decision 4: 区分发布态路径和本地预览路径

**选择**：Markdown 中保存的图片路径保留 Hexo `root`，本地预览时再剥离 `root` 并拼接 `VITE_ASSET_BASE_URL`

**理由**：
- Markdown 内容应该面向最终部署结果，确保生成后的站点路径正确
- 当前本地静态资源服务直接挂载 `public/`，没有必要为了预览再改写服务端路由结构
- 将 `root` 的知识限制在渲染层路径转换逻辑里，可以避免服务端和双运行模式同时引入额外复杂度

**实现**：
```typescript
function resolveImageForPreview(
  src: string,
  assetBaseUrl: string,
  root: string,
  permalink: string,
): Partial<ImageRenderResult> | void {
  if (isExternalUrl(src)) {
    return { src }
  }

  if (src.startsWith('/')) {
    const normalizedRoot = normalizeHexoRoot(root)
    const previewPath = stripHexoRootPrefix(src, normalizedRoot)
    return { src: joinPreviewUrl(assetBaseUrl, previewPath) }
  }

  return { src: resolveMarkdownImageUrl(src, assetBaseUrl, permalink) }
}
```

### Decision 5: 保持向后兼容

**选择**：在 `renderHooks.image` 中同时处理绝对路径和相对路径

**理由**：
- 旧文章可能使用相对路径
- 用户可能从其他地方复制粘贴包含相对路径的 Markdown
- 兼容性好，不会破坏现有内容

**实现**：
```typescript
function resolveImageUrl(src: string): Partial<ImageRenderResult> {
  // 1. 绝对 URL（CDN）：直接返回
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { src }
  }

  // 2. 绝对路径（新方案）：剥离 root 后转换为预览 URL
  if (src.startsWith('/')) {
    return { src: joinPreviewUrl(VITE_ASSET_BASE_URL, stripHexoRootPrefix(src, root)) }
  }

  // 3. 相对路径（旧方案）：使用现有逻辑
  return { src: resolveMarkdownImageUrl(src, VITE_ASSET_BASE_URL, permalink) }
}
```

## Risks / Trade-offs

### [Risk] una-editor alpha API 可能继续变化

**缓解措施**：
- 与 una-editor 开发者保持沟通，确认 alpha 到正式版的 API 收敛方向
- 当前先基于已发布的 0.4.0-alpha.0 类型定义接入，避免继续依赖假设接口
- 如果后续 API 变化，调整 HexoPress 的适配层即可（影响范围小）

### [Risk] 用户的 Hexo 配置中没有 root 字段

**缓解措施**：
- Hexo 的 `root` 默认值是 `/`
- 在 `getHexoConfig()` 中提供默认值：`root: hexo.config.root || '/'`
- 大多数用户部署在根目录，不需要配置 `root`

### [Risk] root 格式不规范导致预览剥离失败

**缓解措施**：
- 在客户端统一规范化 `root`
- 对 `/`、空字符串、缺少前后斜杠的输入增加测试覆盖
- 所有预览转换共享同一套工具函数，避免 EditorMain、MdRenderer、MediaPanel 各自实现一套规则

### [Risk] 旧文章中的相对路径图片可能显示不正确

**缓解措施**：
- 在 `renderHooks.image` 中保留对相对路径的支持
- 使用现有的 `resolveMarkdownImageUrl()` 函数处理相对路径
- 用户可以选择手动将旧文章的相对路径改为绝对路径（可选）

### [Trade-off] 绝对路径依赖 Hexo 的 root 配置

**接受理由**：
- 这是 Hexo 的标准配置，用户已经熟悉
- 如果用户修改 `root`，只需要重启 HexoPress 即可（重新读取配置）
- 相比相对路径方案，这个依赖是可接受的

### [Trade-off] 新旧文章混用绝对路径和相对路径

**接受理由**：
- 两种路径都能正确预览和生成
- 用户可以逐步迁移旧文章（可选）
- 不影响功能，只是路径风格不统一

### [Trade-off] 本地预览 URL 与 Markdown 中保存的 URL 不再完全一致

**接受理由**：
- 这是有意的分层：一个面向部署结果，一个面向本地预览
- 只要转换规则稳定且可测试，这种差异不会暴露给最终站点
- 该方案比改造服务端静态路由更容易控制影响范围

## Migration Plan

### 阶段 1: 升级依赖和扩展类型

1. 升级 una-editor：`npm install una-editor@^0.4.0-alpha.0`
2. 扩展 `types/local.d.ts` 中的 `HexoConfig` 类型，添加 `root: string` 字段
3. 运行类型检查：`npm run check-all`

### 阶段 2: 修改后端（主进程）

1. 修改 `main/lib/HexoAgent.ts` 的 `getHexoConfig()` 方法：
   - 读取 `this.hexo.config.root`
   - 提供默认值 `/`
   - 返回包含 `root` 字段的配置对象
2. 运行类型检查：`npm run node-check`
3. 手动测试：启动应用，验证 `hexoConfig.root` 正确读取

### 阶段 3: 修改前端（渲染进程）

1. 修改 `src/utils/path.ts`：
   - 重命名 `computeRelativeImagePath()` 为 `computeImagePath()`
   - 修改实现：返回面向部署的绝对路径（考虑 `root`）
2. 修改共享预览路径转换工具：
   - 在 `src/utils/markdownImage.ts` 中增加 `root` 规范化和剥离逻辑
   - 保留 `resolveMarkdownImageUrl()` 用于向后兼容相对路径
2. 修改 `src/components/EditorMain.vue`：
   - 实现 `resolveImageUrl()` 函数
   - 添加 `renderHooks` prop 到 `<UnaEditor>`
   - 修改图片插入逻辑，使用新的 `computeImagePath()`
3. 修改 `src/components/MediaPanel.vue`：
   - 统一使用新的 `computeImagePath()` 生成插入 Markdown
4. 修改 `src/components/MdRenderer.vue`：
   - 继续复用共享预览路径转换逻辑，确保与主编辑器策略一致
5. 运行类型检查：`npm run vue-check`
6. 运行测试：`npm run test`

### 阶段 4: 测试和验证

1. 手动测试：
   - 插入新图片，验证使用绝对路径
   - 验证 live preview 中图片正确显示
   - 验证预览时会剥离 `root` 后再请求本地资源
   - 验证 Web mode 下通过 `/assets/` 预览图片
   - 修改 permalink，验证图片路径不变
   - 打开旧文章，验证相对路径图片仍能预览
2. 运行完整检查：`npm run check-all && npm run test`
3. 运行格式化和 lint：`npm run format && npm run lint`

### 回滚策略

如果遇到严重问题：
1. 回退 una-editor 版本：`npm install una-editor@^0.3.0`
2. 恢复 `computeRelativeImagePath()` 函数
3. 移除 `renderHooks` 相关代码
4. 恢复 `HexoConfig` 类型定义

## Open Questions

1. **una-editor 0.4.0-alpha.0 的 renderHooks API 在后续 beta/正式版是否会变化？**
   - 需要持续关注 una-editor 后续发布说明
   - 如果 API 有变化，需要相应调整 HexoPress 的实现

2. **预览转换逻辑是否需要额外暴露为更明确的共享 helper，以避免 EditorMain 与 MdRenderer 分叉？**
   - 当前倾向：需要，且应作为本次 change 的实现边界之一

3. **是否需要提供工具批量转换旧文章的相对路径为绝对路径？**
   - 当前方案：不提供，用户可以手动修改
   - 如果用户反馈强烈，可以在后续版本添加
