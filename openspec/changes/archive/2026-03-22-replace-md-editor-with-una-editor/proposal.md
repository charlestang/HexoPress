## Why

当前使用的 `md-editor-v3` 编辑体验与目标交互（Obsidian 风格 live preview）存在明显差距，导致写作流不连贯。用户自研的 `una-editor` 基于 CodeMirror 6 构建，提供了更好的 live preview 渲染体验，并已发布到 npm。现在是替换的最佳时机，可以在不改动 IPC/bridge 的前提下完成渲染层升级。

## What Changes

- 将 `EditorMain.vue` 中的 `MdEditor` (md-editor-v3) 替换为 `UnaEditor` (una-editor)
- 将 `PostPreviewDialog.vue` 中的 `MdPreview` (md-editor-v3) 替换为 `MdRenderer` 组件
- 从 `feat/cm6-live-preview-editor` 分支移植 `MdRenderer.vue` 组件和 `markdownImage.ts` 工具函数
- 移除 `md-editor-v3` 依赖
- 添加新依赖：`una-editor@^0.3.0`、`markdown-it`、`highlight.js`
- 移除所有工具栏相关代码和 UI (包括字体大小调整)
- 将字体大小配置 (`editorFontSize`) 移入全局设置页面 (`PreferencesView.vue`) 和 `appStore`
- 适配 `una-editor` 的新 API：`insertText()`、`getHeadings()`、`scrollToLine()`
- 启用 `livePreview` 属性以提供 Obsidian 风格的实时预览体验
- 调整编辑器与 AI 面板之间的选区共享契约：保留选中文本，移除 `selectionRange`，context 标识改为 `@selection(length)`

## Capabilities

### New Capabilities

（无新增 capability）

### Modified Capabilities

- `editor-ux`：编辑器同步到 `editorStore` 的选区状态从“文本 + 位置范围”调整为“仅文本内容”
- `ai-chat-panel`：AI 面板的选区 context 展示从 `@selection(from-to)` 调整为 `@selection(length)`

## Impact

- **受影响代码（渲染进程）**：
  - `src/components/EditorMain.vue` - 主编辑器组件
  - `src/components/PostPreviewDialog.vue` - 预览对话框
  - `src/components/MdRenderer.vue` - 新增只读渲染组件
  - `src/utils/markdownImage.ts` - 新增图片路径解析工具
  - `src/views/FrameView.vue` - 调用编辑器方法的父组件
  - `src/stores/editorStore.ts` - 需要移除 `selectionRange` 状态，仅保留 `selectedText`
  - `src/components/AiPanel.vue` - 需要将 context 标签改为基于选中文本长度
  - 相关测试文件（`src/components/__tests__/`）

- **依赖变化**：
  - 移除：`md-editor-v3@^6.0.1`
  - 新增：`una-editor@^0.3.0`、`markdown-it@^14.1.0`、`highlight.js@^11.11.1`
  - 新增类型定义：`@types/markdown-it@^14.1.2`

- **架构影响**：
  - 仅渲染进程改动
  - 主进程、IPC channel、bridge 接口、Web API 路由均不变
  - 不影响 `ISite` 接口定义

- **用户体验变化**：
  - 编辑器从传统 split view 预览切换到 live preview 模式（通过 `livePreview` 属性启用）
  - 移除工具栏按钮与字体大小调整 UI
  - 字体大小配置可通过系统全局偏好设置 `Preferences` 调整
  - Vim 模式继续支持（una-editor 内置）
  - AI 面板的选区提示由位置范围改为选中文本长度，减少噪音信息

- **兼容性**：
  - 与 TOC Panel、AI Panel、Media Panel 的集成需要验证
  - 图片上传、自动保存、文档加载等现有功能需要保持兼容
  - 需要同步更新 `editor-ux` 与 `ai-chat-panel` 的 delta spec，确保 OpenSpec artifact 与实现一致
  - **已知限制**：UnaEditor 的 live preview 无法正确显示相对路径图片（因为 CodeMirror 6 不提供自定义图片 URL 解析器）。用户需要通过预览对话框查看完整的图片渲染效果。最终生成的 Hexo 站点不受影响。
