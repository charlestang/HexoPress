## ADDED Requirements

### Requirement: 编辑器使用 una-editor 的 renderHooks

EditorMain MUST 使用 una-editor 的 renderHooks 功能来转换图片 URL，以支持 live preview 中的图片显示。

#### Scenario: 配置 renderHooks.image 函数

- **WHEN** EditorMain 组件初始化 UnaEditor
- **THEN** 组件 SHALL 提供 `renderHooks.image` 函数
- **AND** 该函数 SHALL 接收图片的 src、alt 等上下文信息
- **AND** 该函数 SHALL 返回符合 una-editor 0.4.0-alpha.0 的 `Partial<ImageRenderResult>` 结果对象

#### Scenario: 转换绝对路径图片 URL

- **WHEN** renderHooks.image 接收到绝对路径图片（如 `/images/test.jpg`）
- **THEN** 函数 SHALL 将路径转换为本地预览资源 URL
- **AND** 转换逻辑 SHALL 基于 `VITE_ASSET_BASE_URL`
- **AND** 图片 SHALL 在 live preview 中正确显示

#### Scenario: 转换包含 root 的绝对路径图片 URL

- **WHEN** renderHooks.image 接收到带 Hexo root 的绝对路径图片（如 `/HexoPress/images/test.jpg`）
- **THEN** 函数 SHALL 在拼接 `VITE_ASSET_BASE_URL` 前剥离 `/HexoPress/` 前缀
- **AND** 转换后的 URL SHALL 指向本地预览服务可访问的真实资源路径

#### Scenario: 转换相对路径图片 URL（向后兼容）

- **WHEN** renderHooks.image 接收到相对路径图片（如 `../images/test.jpg`）
- **THEN** 函数 SHALL 使用 `resolveMarkdownImageUrl()` 计算绝对路径
- **AND** 计算时 SHALL 考虑当前文章的 permalink
- **AND** 转换后的 URL SHALL 指向正确的图片资源

#### Scenario: 保持 CDN 图片 URL 不变

- **WHEN** renderHooks.image 接收到完整的 HTTP/HTTPS URL
- **THEN** 函数 SHALL 返回包含原始 `src` 的结果对象
- **AND** 不进行任何路径转换
