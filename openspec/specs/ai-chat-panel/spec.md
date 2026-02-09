## ADDED Requirements

### Requirement: AI 聊天面板入口

编辑器侧边栏 **MUST** 提供 AI 面板图标按钮（outline 风格机器人 SVG 图标），与 FileExplorer、TocPanel、MediaPanel 并列。点击图标 **SHALL** 展开/折叠 AiPanel，交互行为与其他面板一致。

#### Scenario: 打开 AI 面板

- **WHEN** 用户点击侧边栏的 AI 图标按钮
- **THEN** 侧边栏展开并显示 AiPanel 内容

#### Scenario: 切换面板

- **WHEN** AI 面板已展开，用户点击其他面板图标（如 TOC）
- **THEN** 面板内容切换为对应面板，AI 面板状态通过 keep-alive 保留

### Requirement: 聊天消息显示

AiPanel **MUST** 包含可滚动的聊天消息区域，显示用户消息和 AI 回复的完整对话历史。

#### Scenario: 显示用户消息

- **WHEN** 用户发送一条消息
- **THEN** 消息区域 **SHALL** 显示用户消息气泡，包含消息文本和附着的 context 标识（如 `@full` 或 `@selection(from-to)`）

#### Scenario: 流式显示 AI 回复

- **WHEN** AI 开始返回流式响应
- **THEN** 消息区域 **SHALL** 实时追加 AI 回复内容，逐 chunk 更新显示
- **AND** 消息区域 **SHALL** 自动滚动到底部

#### Scenario: AI 回复 Markdown 渲染

- **WHEN** AI 回复包含 Markdown 格式（代码块、列表、加粗等）
- **THEN** 消息气泡 **SHALL** 使用 markdown-it 渲染为 HTML 显示

### Requirement: Context 状态栏

AiPanel **MUST** 在输入框上方显示 Context 状态栏，指示当前附着的上下文信息。

#### Scenario: 无选区时显示全文 context

- **WHEN** 编辑器中没有选中文本
- **THEN** 状态栏 **SHALL** 显示 `@full` 及全文字数

#### Scenario: 有选区时显示选区 context

- **WHEN** 用户在编辑器中选中了一段文本
- **THEN** 状态栏 **SHALL** 显示 `@selection(from-to)` 及选中字数，其中 from 和 to 为字符位置索引

#### Scenario: 用户移除 context

- **WHEN** 用户点击状态栏上的 ✕ 按钮
- **THEN** context **SHALL** 被移除，后续发送消息时不附带文章上下文

#### Scenario: front-matter 始终附带

- **WHEN** 用户发送消息且 context 未被移除
- **THEN** 请求中 **MUST** 始终包含文章的 front-matter 信息（标题、分类、标签等）

### Requirement: 切换文章时重置会话

切换文章时 **MUST** 清空聊天历史并重置 context 状态，开始全新会话。

#### Scenario: 切换到另一篇文章

- **WHEN** 用户通过 FileExplorer 或路由切换到另一篇文章
- **THEN** 聊天消息列表 **SHALL** 被清空
- **AND** context 状态 **SHALL** 重置为 @full（新文章的全文）

### Requirement: 输入区域拖拽调整高度

AiPanel **MUST** 在 Context 状态栏和输入区域之间提供拖拽分割线，允许用户调整输入区域高度。

#### Scenario: 拖拽调整输入区高度

- **WHEN** 用户将鼠标移到 Context 状态栏和输入区域之间的分割线上
- **THEN** 鼠标光标 **SHALL** 变为 `ns-resize`（上下箭头）
- **AND** 分割线 **SHALL** 显示浅色高亮提示

#### Scenario: 拖动分割线

- **WHEN** 用户按住分割线并上下拖动
- **THEN** 输入区域高度 **SHALL** 随鼠标移动实时调整
- **AND** 高度 **SHALL** 限制在 80px 到 400px 之间
- **AND** 默认高度 **SHALL** 为 120px

### Requirement: 发送消息

用户 **MUST** 能够通过 AiInputBar 输入并发送消息给 AI。

#### Scenario: 发送自由聊天消息

- **WHEN** 用户在输入框中输入文本并点击发送按钮
- **THEN** 系统 **SHALL** 将用户消息、当前 context（文章内容或选区）和 front-matter 组装为 API 请求
- **AND** 通过渲染进程直接 fetch 发送到用户选择的 AI 端点

#### Scenario: 流式响应处理

- **WHEN** AI 端点返回 SSE 流式响应
- **THEN** 系统 **SHALL** 逐 chunk 解析响应并实时更新 AI 消息气泡内容
