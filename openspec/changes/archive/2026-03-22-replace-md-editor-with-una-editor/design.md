## Context

当前 HexoPress 使用 `md-editor-v3` 作为 Markdown 编辑器，提供传统的 split view 预览模式。用户自研的 `una-editor` 基于 CodeMirror 6，提供 live preview 渲染（类似 Obsidian），已发布到 npm (0.3.0)。

**当前状态**：
- `EditorMain.vue` 使用 `MdEditor` 组件，包含工具栏、实时预览、Vim 模式等功能
- `PostPreviewDialog.vue` 使用 `MdPreview` 组件进行只读渲染
- 与 TOC Panel、AI Panel、Media Panel 有集成点
- 通过 `editorStore` 同步编辑器状态（文本、frontMatter、选区、标题）

**约束**：
- 仅渲染进程改动，不涉及主进程、IPC、bridge 接口
- 必须保持与现有 Panel 的兼容性
- 必须支持 Vim 模式、图片上传、自动保存等现有功能

## Goals / Non-Goals

**Goals:**
- 将编辑器从 md-editor-v3 替换为 una-editor，通过 `livePreview` 属性提供更好的实时预览体验
- 保持所有现有功能（图片上传、自动保存、Vim 模式、TOC/AI/Media Panel 集成）
- 简化 UI（移除所有工具栏和行内的字体控制面板）
- 字体大小控制移至全局系统设置 (通过 `appStore.editorFontSize` 与 Preferences 页面配合)
- 从 `feat/cm6-live-preview-editor` 分支复用 MdRenderer 组件
- 将选区共享契约简化为 `selectedText`，移除仅用于 UI 展示的 `selectionRange`

**Non-Goals:**
- 不改动主进程、IPC 通信、bridge 接口
- 不修改 ISite 接口定义
- 不引入新的后端功能
- 不改变文档存储格式或 Hexo 兼容性
- 不在本次变更中引入基于行号的选区标签展示

## Decisions

### Decision 1: 使用 una-editor 的完整 API

**选择**: 直接使用 una-editor 提供的 `insertText()`、`getHeadings()`、`scrollToLine()` 等方法

**理由**:
- una-editor 已经提供了所有需要的 API
- 避免通过 `getEditorView()` 直接操作 CodeMirror，降低耦合
- API 语义清晰，易于维护

**替代方案**: 使用 `getEditorView()` 直接访问 CodeMirror 实例
- 优点：最大灵活性
- 缺点：增加耦合，依赖 CodeMirror 内部 API

### Decision 2: 移植 MdRenderer 而非继续使用 MdPreview

**选择**: 从 `feat/cm6-live-preview-editor` 分支移植 `MdRenderer.vue` 和 `markdownImage.ts`

**理由**:
- MdRenderer 基于 markdown-it，提供本地近似预览能力，不保证与 Hexo 最终站点输出完全一致（Hexo 默认使用 marked，且有 tag plugin、主题渲染链等本地无法复现的环节）
- 出于安全考虑，除 `<!--more-->` 外的原始 HTML 会被转义为纯文本，这意味着包含 HTML 片段或 Hexo tag plugin 的内容在预览中会显示为源码
- 已经过验证，包含图片路径解析、代码高亮、错误处理等完整功能
- 不依赖 md-editor-v3，可以完全移除该依赖

**替代方案**: 继续使用 md-editor-v3 的 MdPreview
- 优点：无需移植代码
- 缺点：无法移除 md-editor-v3 依赖，增加包体积

### Decision 3: 移除工具栏及字体调整UI，将配置移至系统设置

**选择**: 移除所有工具栏按钮（bold、italic、image 等），以及用于行内调整字体大小的按钮组。字体大小 (`editorFontSize`) 通过 `appStore` 在系统的 `Preferences` 中进行全局配置。

**理由**:
- hybrid markdown 模式下，用户直接输入 markdown 语法更高效
- 用户认为工具栏"实际使用下来也没什么用"
- 字体大小调整放在行内会增加不必要的 UI 复杂度，且作为一个全局偏好，放在 `Preferences` 中更加合理。

**替代方案**: 保留部分常用工具栏按钮
- 优点：降低学习曲线
- 缺点：与 hybrid markdown 理念冲突，增加 UI 复杂度

### Decision 4: 简化选区同步逻辑

**选择**: 使用 `getSelection()` 获取选中文本，并将 editor / AI 的共享契约收敛为 `selectedText`；`selectionRange` 从 `editorStore` 中移除，AiPanel 改为显示 `@selection(length)`

**理由**:
- AI Panel 组装提示词时只使用选中的文本内容，不消费位置范围
- 位置范围 `(from-to)` 仅用于 UI 展示，提示价值有限，噪音高于收益
- 选中文本长度比字符偏移更容易让用户理解
- 简化 `editorStore` 与编辑器暴露 API，降低实现复杂度

**替代方案**: 保留 `selectionRange` 或新增行号映射能力
- 优点：可以继续展示位置相关提示
- 缺点：需要额外维护偏移量或行号映射，而当前没有实际消费场景

### Decision 5: 依赖版本选择

**选择**:
- `una-editor@^0.3.0`
- `markdown-it@^14.1.0`
- `highlight.js@^11.11.1`
- `@types/markdown-it@^14.1.2`

**理由**:
- una-editor 0.3.0 是当前使用版本，提供所需的完整 API（包括 `livePreview` 属性）
- markdown-it 14.x 是当前稳定版，与 Hexo 兼容
- highlight.js 11.x 是主流版本，支持广泛的语言

## Risks / Trade-offs

### Risk 1: 与现有 Panel 的集成兼容性

**风险**: TOC Panel、AI Panel、Media Panel 可能依赖 md-editor-v3 的特定行为，或依赖旧的选区共享契约

**缓解措施**:
- 显式更新 `editor-ux` 与 `ai-chat-panel` delta spec，使 capability 变更与实现计划一致
- `editorStore` 保留 `setText`、`setFrontMatter`、`setSelection`、`setHeadings` 四类职责，但 `setSelection` 改为仅同步文本内容
- 使用 una-editor 的 `getHeadings()` 替代原有的 `@get-catalog` 事件
- 图片插入使用 `insertText()` 替代原有的 `insert()` 方法
- 完成后进行完整的集成测试

### Risk 2: 用户习惯变化

**风险**: 移除工具栏可能导致部分用户不适应

**缓解措施**:
- hybrid markdown 模式提供更直观的所见即所得体验（通过 `livePreview` 属性启用）
- Vim 模式用户本来就不依赖工具栏
- 字体大小调整移入 Preferences，满足定制化的基础需求且页面更加干净
- 如果用户反馈强烈，可以在后续版本考虑添加最小化工具栏

### Risk 3: 测试覆盖

**风险**: 编辑器替换涉及大量交互逻辑，测试用例需要更新

**缓解措施**:
- 更新 `EditorMain.test.ts` 和 `PostPreviewDialog.test.ts`
- 添加 `MdRenderer.test.ts`
- 保持测试覆盖率不降低
- 手动测试所有关键功能（图片上传、自动保存、Vim 模式、Panel 集成）

### Risk 4: 性能影响

**风险**: una-editor 的 hybrid markdown 渲染可能影响大文档性能

**缓解措施**:
- una-editor 基于 CodeMirror 6，性能优于 md-editor-v3
- live preview 使用增量渲染，只处理可见区域
- 如果遇到性能问题，可以通过 `livePreview` prop 关闭实时预览

### Risk 5: Live Preview 中的图片路径解析限制

**风险**: UnaEditor 的 live preview 无法正确显示相对路径图片

**根本原因**:
- UnaEditor@0.3.0 基于 CodeMirror 6 的 `@codemirror/lang-markdown`，使用内置的 markdown 渲染
- 不提供自定义图片 URL 解析器的扩展点（无 `imageResolver` prop）
- 图片插入使用 permalink-relative 路径（如 `../images/2024/01/photo.jpg`）
- MdRenderer 通过 `resolveMarkdownImageUrl()` 将相对路径转换为绝对 URL（如 `http://127.0.0.1:2357/images/2024/01/photo.jpg`）
- UnaEditor 的 live preview 直接使用相对路径，导致 404

**影响范围**:
- ✅ 预览对话框（MdRenderer）：能正确显示图片
- ❌ 主编辑器 live preview（UnaEditor）：无法显示相对路径图片
- ✅ 最终生成的 Hexo 站点：不受影响（Hexo 会正确处理相对路径）

**缓解措施**:
- 短期：在文档中说明此限制，用户可以通过预览对话框查看完整效果
- 中期：向 UnaEditor 提交 feature request，建议添加 `imageResolver` prop
- 长期：如果上游不支持，考虑 fork 并添加自定义图片解析支持

**架构影响**:
- 图片路径解析逻辑分散在两处：`MdRenderer.vue` 和 `markdownImage.ts`
- 没有形成统一的"编辑器能力"契约
- 未来如果需要统一，需要在 UnaEditor 层面提供扩展点

## Migration Plan

### 阶段 1: 依赖安装和组件移植
1. 安装新依赖：`npm install una-editor@^0.3.0 markdown-it@^14.1.0 highlight.js@^11.11.1`
2. 安装类型定义：`npm install -D @types/markdown-it@^14.1.2`
3. 从 `feat/cm6-live-preview-editor` 分支移植：
   - `src/components/MdRenderer.vue`
   - `src/utils/markdownImage.ts`
4. 添加必要的 i18n keys（如果有新增）
5. 补充 delta spec，覆盖 `editor-ux` 与 `ai-chat-panel` 中的选区契约变更

### 阶段 2: 替换 PostPreviewDialog
1. 替换 `MdPreview` 为 `MdRenderer`
2. 移除 `filterImage` 函数（MdRenderer 内置图片路径处理）
3. 更新测试用例
4. 验证预览功能正常

### 阶段 3: 替换 EditorMain
1. 替换 `MdEditor` 为 `UnaEditor`
2. 移除所有工具栏与字体调整 UI 控制代码
3. 将字体大小配置 (`editorFontSize`) 移入 `appStore` 以及 `PreferencesView.vue`
4. 启用 `livePreview` 属性以提供实时预览体验
5. 适配新 API：
   - `insertImageMarkdown()` 使用 `insertText()`
   - `syncSelectionToStore()` 使用 `getSelection()`
   - `editorStore.setSelection()` 仅同步 `selectedText`
   - `handleGetCatalog()` 使用 `getHeadings()`
   - `scrollToLine()` 直接调用 una-editor 的方法
6. 更新 `FrameView.vue` 中的方法调用
7. 更新测试用例，确保 stub 的 props 包含 `livePreview` 而非 `hybridMarkdown`

### 阶段 4: 清理和验证
1. 移除 `md-editor-v3` 依赖：`npm uninstall md-editor-v3`
2. 移除相关的 CSS 导入
3. 运行完整测试套件：`npm run test`
4. 运行类型检查：`npm run check-all`
5. 手动测试所有功能：
   - 文档加载和保存
   - 图片上传和插入
   - 自动保存
   - Vim 模式
   - TOC Panel 跳转
   - AI Panel 上下文（含 `@selection(length)` 标签）
   - Media Panel 插入
   - 设置应用并更改字体大小
   - Live preview 实时渲染效果

### 回滚策略
如果遇到严重问题：
1. 恢复 `md-editor-v3` 依赖
2. 回退 `EditorMain.vue` 和 `PostPreviewDialog.vue`
3. 移除 `MdRenderer.vue` 和 `markdownImage.ts`
4. 回退测试用例

## Post-Implementation Fixes

### Fix 1: 图片上传后需要 updateCache

**问题**: 新上传的图片无法在预览中显示，但历史图片可以正常显示

**根本原因**:
- `saveImage` 将图片保存到 `source/images/` 目录
- 直接调用 `generate()` 时，Hexo 的 source processor 没有识别到新文件
- 需要先调用 `updateCache()` 让 Hexo 重新扫描 source 目录

**修复**:
- `main/main.ts:84-87`: 在 `saveImage` 后先调用 `updateCache()` 再调用 `generate()`
- `web/routes.ts:229-238`: 同样的修复应用到 Web mode

**验证**: 手动测试图片上传和预览功能

## Open Questions

- `@selection(length)` 是否需要统一包含空格格式（例如 `@selection(128)` vs `@selection (128 chars)`）；当前建议沿用紧凑格式，避免额外噪音
