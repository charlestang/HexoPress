## 1. 基础设施：类型定义与依赖 (renderer)

- [ ] 1.1 在 `types/local.d.ts` 中新增 AI 相关类型定义：`AiProvider`（id, name, baseUrl, apiKey）、`AiPreset`（id, name, icon, systemPrompt, contextMode）、`AiMessage`（role, content, contextLabel）、`SelectionRange`（from, to）
- [ ] 1.2 安装 `markdown-it` 为直接依赖，安装 `@types/markdown-it` 为 devDependency
- [ ] 1.3 在 `src/locales/en.json` 和 `src/locales/zh-CN.json` 中新增 AI 相关 i18n 文案（面板标题、预置功能名称、占位文本、提示信息等）

## 2. 状态管理：Store 扩展 (renderer)

- [ ] 2.1 扩展 `src/stores/editorStore.ts`：新增 `text`、`frontMatter`、`selectedText`、`selectionRange` 状态及对应 setter 方法
- [ ] 2.2 扩展 `src/stores/app.ts`：新增 `aiProviders` 数组状态，使用 `web-storage-cache` 持久化，提供 add/update/remove 方法

## 3. AI 服务层 (renderer)

- [ ] 3.1 创建 `src/services/aiService.ts`：封装 OpenAI 兼容 API 的 fetch 调用，支持 SSE 流式响应解析，返回 AsyncGenerator 逐 chunk 产出内容
- [ ] 3.2 在 aiService 中实现请求组装逻辑：根据 contextMode（full/selection/none）组装 system prompt 和 user message，始终附带 front-matter

## 4. 编辑器状态同步 (renderer)

- [ ] 4.1 修改 `src/components/EditorMain.vue`：将 `text` 内容同步到 editorStore（watch text → editorStore.setText）
- [ ] 4.2 修改 `src/components/EditorMain.vue`：监听 CodeMirror 选区变化，通过 `getEditorView().state.selection` 获取选区范围，同步到 editorStore 的 `selectedText` 和 `selectionRange`
- [ ] 4.3 修改 `src/components/EditorMain.vue`：将 front-matter 数据同步到 editorStore

## 5. AI 面板组件 (renderer)

- [ ] 5.1 创建 `src/components/AiMessageBubble.vue`：单条消息气泡组件，区分 user/assistant 角色样式，使用 markdown-it 渲染 assistant 消息内容，user 消息显示 context 标识
- [ ] 5.2 创建 `src/components/AiInputBar.vue`：输入框组件，底部工具栏包含模型选择下拉框（读取 appStore.aiProviders）、模式选择下拉框（quick/think）、发送按钮；无可用模型时禁用发送并显示提示
- [ ] 5.3 创建 `src/components/AiPanel.vue`：面板主体，包含预置功能按钮区、聊天消息滚动区（v-for AiMessageBubble）、Context 状态栏（显示 @full/@selection 及 ✕ 按钮）、AiInputBar；管理聊天状态（messages 数组）和 context 状态

## 6. 面板集成 (renderer)

- [ ] 6.1 修改 `src/views/FrameView.vue`：在 panels 注册表中添加 `aiPanel: AiPanel`，侧边栏新增 AI 图标按钮，传递必要的 props
- [ ] 6.2 在 FrameView 中处理文章切换时的会话重置：监听路由变化或 EditorMain 的文章加载事件，通知 AiPanel 清空聊天历史

## 7. AI 提供商配置 (renderer)

- [ ] 7.1 修改 `src/views/PreferencesView.vue`：新增 AI 提供商配置区，包含提供商列表（名称、端点、API Key 密码框）、添加/删除按钮，数据绑定到 appStore.aiProviders

## 8. 预置功能 (renderer)

- [ ] 8.1 在 AiPanel 中实现预置功能按钮逻辑：定义内置 AiPreset 数组（错别字检查、写作建议、段落润色、生成摘要），点击时根据 contextMode 组装请求并发送
- [ ] 8.2 实现选区类预置功能的校验：段落润色点击时检查 editorStore.selectedText 是否为空，为空则提示用户先选中文本

## 9. 测试与验证

- [ ] 9.1 为 `aiService.ts` 编写单元测试：测试请求组装逻辑、SSE chunk 解析、错误处理
- [ ] 9.2 运行 `npm run check-all` 确保类型检查通过
- [ ] 9.3 运行 `npm run test` 确保所有测试通过
- [ ] 9.4 运行 `npm run lint` 和 `npm run format` 确保代码规范
