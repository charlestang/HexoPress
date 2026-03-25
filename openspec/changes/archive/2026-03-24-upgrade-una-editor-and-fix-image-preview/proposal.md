## Why

当前 HexoPress 使用 una-editor@0.3.0 作为 Markdown 编辑器，但存在图片预览问题：live preview 模式下无法正确显示图片，尤其是在 Hexo 站点部署到子目录时更容易暴露路径歧义。Hexo 文章中保存的图片路径应该面向最终部署结果，例如站点部署在 `/HexoPress/` 时，Markdown 应保存 `![](/HexoPress/images/xxx.jpg)`。但编辑器和预览组件在本地运行时，静态资源实际上是通过 `VITE_ASSET_BASE_URL` 指向的本地预览服务来访问，不应直接复用发布态路径。una-editor 0.4.0-alpha.0 已提供表格编辑、代码高亮以及 `renderHooks` 能力，允许在渲染前转换图片 URL。现在是升级并统一“发布态路径”和“本地预览路径”策略的最佳时机。

## What Changes

- 升级 una-editor 从 0.3.0 到 0.4.0-alpha.0（获取最新功能和 `renderHooks` 接口）
- 扩展 HexoConfig 类型，添加 `root` 字段（Hexo 部署子目录配置），并规范化其格式
- 修改图片插入逻辑，使用面向最终部署的绝对路径（`/images/...` 或 `/HexoPress/images/...`）而非相对路径（`../images/...`）
- 实现 renderHooks.image 函数，在预览时将发布态绝对路径转换为本地预览 URL：必要时先剥离 `root`，再拼接 `VITE_ASSET_BASE_URL`
- 更新 HexoAgent.getHexoConfig() 方法，读取并返回 hexo.config.root
- 保留旧文章相对路径的兼容解析逻辑，仅移除“新插入图片依赖 permalink 深度计算”的策略

## Capabilities

### New Capabilities

- `image-path-management`: 图片路径管理策略，使用绝对路径（考虑 Hexo root）插入图片，并在各类本地预览中转换为预览 URL

### Modified Capabilities

- `editor-ux`: 编辑器需要使用 una-editor 的 renderHooks 功能来转换图片 URL，以支持 live preview 中的图片显示

## Impact

- **依赖变化**：una-editor 从 0.3.0 升级到 0.4.0-alpha.0
- **类型定义**：`types/local.d.ts` 中的 HexoConfig 类型需要添加 `root: string` 字段
- **主进程**：`main/lib/HexoAgent.ts` 的 `getHexoConfig()` 方法需要读取 `hexo.config.root`
- **渲染进程**：
  - `src/utils/path.ts` 的 `computeRelativeImagePath()` 函数需要改为 `computeImagePath()`，返回发布态绝对路径
  - `src/utils/markdownImage.ts` 需要支持“剥离 root 后拼接 `VITE_ASSET_BASE_URL`”的预览转换
  - `src/components/EditorMain.vue` 需要实现 renderHooks.image 函数，并返回符合 una-editor 0.4.0-alpha.0 的结果对象
  - `src/components/MediaPanel.vue` 需要统一使用新的绝对路径生成策略
  - `src/components/MdRenderer.vue` 需要继续通过共享路径解析逻辑保持与主编辑器一致
  - `src/stores/app.ts` 需要存储 hexoConfig.root
- **向后兼容**：保留对旧文章中相对路径图片的支持（renderHooks 中处理）
- **用户影响**：
  - 新插入的图片使用绝对路径，不受 permalink 深度影响
  - 修改 permalink 时无需调整图片路径
  - 如果 Hexo 部署在子目录（如 `/HexoPress/`），需要在 `_config.yml` 中配置正确的站点 URL/root
  - Electron mode 与 Web mode 的本地预览路径将统一通过 `VITE_ASSET_BASE_URL` 解析，而不是在工件中硬编码某个本地服务地址
