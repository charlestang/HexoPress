## 1. 依赖安装和组件移植

- [x] 1.1 安装 una-editor 依赖：`npm install una-editor@^0.3.0`
- [x] 1.2 安装 markdown-it 和 highlight.js：`npm install markdown-it@^14.1.0 highlight.js@^11.11.1`
- [x] 1.3 安装类型定义：`npm install -D @types/markdown-it@^14.1.2`
- [x] 1.4 从 `feat/cm6-live-preview-editor` 分支移植 `src/components/MdRenderer.vue`
- [x] 1.5 从 `feat/cm6-live-preview-editor` 分支移植 `src/utils/markdownImage.ts`
- [x] 1.6 检查并添加必要的 i18n keys（`editor.imageNotFound`, `editor.moreDividerLabel`）
- [x] 1.7 确认 delta spec 与实现计划一致：`editor-ux` 改为仅同步 `selectedText`，`ai-chat-panel` 改为显示 `@selection(length)`

## 2. 替换 PostPreviewDialog

- [x] 2.1 在 `PostPreviewDialog.vue` 中导入 `MdRenderer` 组件
- [x] 2.2 替换 `<MdPreview>` 为 `<MdRenderer>`，传递 `modelValue` 和 `permalink` props
- [x] 2.3 移除 `filterImage` 函数和相关的 `_addPrefixToImgSrc` 函数（MdRenderer 内置处理）
- [x] 2.4 移除 `md-editor-v3` 的 CSS 导入（`import 'md-editor-v3/lib/preview.css'`）
- [x] 2.5 更新 `PostPreviewDialog.test.ts`，适配新的 MdRenderer 组件
- [x] 2.6 手动测试预览对话框功能（打开文章预览，验证渲染正确）

## 3. 替换 EditorMain 核心编辑器

- [x] 3.1 在 `EditorMain.vue` 中导入 `UnaEditor` 组件
- [x] 3.2 替换 `<MdEditor>` 为 `<UnaEditor>`，配置基础 props（`v-model`, `livePreview`, `vimMode`）
- [x] 3.3 移除 `md-editor-v3` 相关导入（`MdEditor`, `NormalToolbar`, `config`, `ExposeParam` 等）
- [x] 3.4 移除 `md-editor-v3` 的 CSS 导入（`import 'md-editor-v3/lib/style.css'`）
- [x] 3.5 移除 CodeMirror 扩展配置代码（`config()` 调用，Vim.defineEx 等）
- [x] 3.6 移除工具栏相关代码（`toolbars` ref, `NormalToolbar` 模板）
- [x] 3.7 移除字体大小调整按钮和逻辑，并改用 `appStore.editorFontSize` 作为配置项

## 4. 适配 UnaEditor API

- [x] 4.1 修改 `insertImageMarkdown()` 函数，使用 `editorRef.value?.insertText(markdown)`
- [x] 4.2 修改 `syncSelectionToStore()` 函数，使用 `editorRef.value?.getSelection()`
- [x] 4.3 移除选区位置同步逻辑（不再需要 `from`/`to`），只同步文本内容
- [x] 4.4 修改 `handleGetCatalog()` 为定时调用 `editorRef.value?.getHeadings()`
- [x] 4.5 修改 `scrollToLine()` 函数，直接调用 `editorRef.value?.scrollToLine(lineNumber)`
- [x] 4.6 移除 `getEditorView()` 的使用（如果有）
- [x] 4.7 更新 `editorRef` 的类型定义，从 `ExposeParam` 改为 UnaEditor 的 `EditorExposed`

## 5. 更新 editorStore 集成

- [x] 5.1 验证 `setText()` 调用正常工作
- [x] 5.2 验证 `setFrontMatter()` 调用正常工作
- [x] 5.3 更新 `setSelection()` 调用与状态定义，移除 `selectionRange`，仅保留 `selectedText`
- [x] 5.4 更新 `setHeadings()` 调用，使用 `getHeadings()` 返回的数据
- [x] 5.5 验证 TOC Panel 的标题跳转功能正常

## 6. 更新 FrameView 父组件

- [x] 6.1 验证 `handleInsertRequest()` 调用 `insertImageMarkdown()` 正常工作
- [x] 6.2 验证 Media Panel 的图片插入功能正常

## 7. 更新 AI Panel 集成

- [x] 7.1 更新 `AiPanel.vue` 中的 `contextLabel` 计算，改为显示 `@selection(length)` 与字符数
- [x] 7.2 更新消息历史中的 `label` 生成，选区消息显示为 `@selection(length)`，全文消息保持 `@full`
- [x] 7.3 验证 AI Panel 的上下文选择功能正常

## 8. 样式调整

- [x] 8.1 调整编辑器容器样式，确保 UnaEditor 正确填充空间
- [x] 8.2 将字体大小配置 (`editorFontSize`) 添加至设置页面并验证同步
- [x] 8.3 移除所有的内置工具栏、字体调整按钮相关的 CSS 样式
- [x] 8.4 验证 Vim 模式下的样式正常（如果有特殊样式）

## 9. 测试更新

- [x] 9.1 添加 `EditorMain.test.ts`，覆盖 store 同步、dirty 追踪、保存契约、自动保存、选区同步、标题同步、图片拖放
- [x] 9.2 更新 `PostPreviewDialog.test.ts`，适配 MdRenderer 组件
- [x] 9.3 添加 `MdRenderer.test.ts`（如果 cm6 分支有，直接移植）
- [x] 9.4 运行测试套件：`npm run test`，确保所有测试通过
- [x] 9.5 运行类型检查：`npm run check-all`，确保无类型错误
- [x] 9.6 修复 live preview 契约漂移：移除无效的 `hybridMarkdown` prop，使用正确的 `livePreview` prop
- [x] 9.7 更新测试 stub，将 `hybridMarkdown` 改为 `livePreview`

## 10. 清理和验证

- [x] 10.1 移除 `md-editor-v3` 依赖：`npm uninstall md-editor-v3`
- [x] 10.2 运行 `npm run format` 格式化代码
- [x] 10.3 运行 `npm run lint` 检查代码规范
- [x] 10.4 手动测试：文档加载和保存
- [x] 10.5 手动测试：图片上传和插入（发现并修复了 generate 前需要 updateCache 的问题）
- [x] 10.6 手动测试：自动保存功能
- [x] 10.7 手动测试：Vim 模式（`:w` 保存等）**[una-editor 0.3.0 已验证]**
- [x] 10.8 手动测试：TOC Panel 标题跳转
- [x] 10.9 手动测试：AI Panel 上下文选择
- [x] 10.10 手动测试：Media Panel 图片插入
- [x] 10.11 手动测试：设置页面的字体大小配置 (`editorFontSize`) 并应用
- [x] 10.12 手动测试：live preview 实时渲染效果

## 11. 文档和提交

- [x] 11.1 更新 CHANGELOG（如果有）（无 CHANGELOG 文件，跳过）
- [x] 11.2 创建 git commit：`fix: correct livePreview prop and fix image upload preview`
- [x] 11.3 验证 commit 后工作目录干净：`git status --porcelain`
