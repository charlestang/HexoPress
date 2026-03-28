# editor-ux Specification

## Purpose
定义 HexoPress 编辑器在交互体验、状态同步、日志约束与本地预览渲染方面的行为要求，确保主编辑器能力在不同运行模式下保持一致。
## Requirements
### Requirement: Editor Log Hygiene

编辑器在生产运行环境下 **MUST** 不输出调试日志，且功能对应的日志信息 **SHALL** 准确。

#### Scenario: Correct log message for font size increase

- **WHEN** 用户点击“增大字号”按钮
- **THEN** 系统执行 `onFontBig` 函数
- **AND** **SHALL** 不输出错误的 `onFontSmall` 信息

#### Scenario: Clean console during normal operation

- **WHEN** 用户进行编辑、上传图片、保存文章等操作
- **THEN** 控制台 **SHALL** 不输出 `filterImage`、`upsertDraft` 等调试性质的 `console.log` 信息

### Requirement: 编辑器状态共享至 editorStore

EditorMain **MUST** 将全文内容、front-matter 和选中文本状态同步到 `editorStore`，供 AiPanel 等兄弟组件消费。

#### Scenario: 全文内容同步

- **WHEN** 编辑器中的文本内容发生变化
- **THEN** `editorStore.text` **SHALL** 同步更新

#### Scenario: 选区文本同步

- **WHEN** 用户在编辑器中选中一段文本
- **THEN** `editorStore.selectedText` **SHALL** 更新为选中的文本内容
- **AND** `editorStore` **SHALL NOT** 再存储 `{ from, to }` 形式的 `selectionRange`

#### Scenario: 取消选区

- **WHEN** 用户取消选区（点击空白处或光标移动）
- **THEN** `editorStore.selectedText` **SHALL** 设为空字符串

#### Scenario: front-matter 同步

- **WHEN** 编辑器加载文章或 front-matter 发生变化
- **THEN** `editorStore.frontMatter` **SHALL** 同步更新，包含标题、分类、标签等元数据

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

### Requirement: 编辑器主题跟随全局 Theme 偏好

编辑页面中的 `UnaEditor` **MUST** 使用全局 Theme 偏好作为唯一的明暗来源，且 **SHALL NOT** 暴露独立的 editor light/dark 设置。

#### Scenario: 全局 Theme 为 Light

- **WHEN** 用户将全局 Theme 设置为 `Light`
- **THEN** 编辑页面中的 `UnaEditor` **SHALL** 使用 light 主题

#### Scenario: 全局 Theme 为 Dark

- **WHEN** 用户将全局 Theme 设置为 `Dark`
- **THEN** 编辑页面中的 `UnaEditor` **SHALL** 使用 dark 主题

#### Scenario: 全局 Theme 为 System

- **WHEN** 用户将全局 Theme 设置为 `System`
- **THEN** 编辑页面中的 `UnaEditor` **SHALL** 根据当前系统/应用解析结果选择 `light` 或 `dark`
- **AND** 编辑器 **SHALL NOT** 再要求用户提供额外的 editor 明暗选择

### Requirement: 编辑器应用外观偏好

编辑页面中的 `UnaEditor` **MUST** 应用用户在 Appearance 中配置的自动换行、字号和字体族设置。

#### Scenario: Line wrap 设置生效

- **WHEN** 用户在 Appearance 中切换 `Line wrap`
- **THEN** 编辑页面中的正文内容 **SHALL** 根据该设置启用或禁用自动换行

#### Scenario: Font size 设置生效

- **WHEN** 用户在 Appearance 中调整 Editor 的 `Font size`
- **THEN** 编辑页面中的 `UnaEditor` **SHALL** 使用对应的字号渲染正文内容

#### Scenario: Editor 字体预设生效

- **WHEN** 用户在 Appearance 中切换 Editor 的 `Font family` 预设
- **THEN** 编辑页面中的 `UnaEditor` **SHALL** 使用与该预设对应的字体栈渲染正文内容

### Requirement: 代码块外观独立于全局 Theme

编辑页面中的代码块 live preview **MUST** 使用独立的代码块外观设置，包括代码主题、行号显示和代码字体族。代码块主题 **SHALL** 不受全局 Theme 的自动覆盖。

#### Scenario: Code Block theme 独立于全局 Theme

- **WHEN** 用户已经为 Code Block 选择了具体主题
- **THEN** 编辑页面中的代码块 **SHALL** 使用该主题渲染
- **AND** 即使全局 Theme 发生变化，代码块 **SHALL** 保持用户显式选择的主题

#### Scenario: Code Block line numbers 设置生效

- **WHEN** 用户切换 `Show line numbers`
- **THEN** 编辑页面中的代码块 **SHALL** 根据该设置显示或隐藏行号

#### Scenario: Code Block 字体预设生效

- **WHEN** 用户切换 Code Block 的 `Font family` 预设
- **THEN** 编辑页面中的代码块 **SHALL** 使用与该预设对应的代码字体栈渲染
