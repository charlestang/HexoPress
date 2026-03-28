## 1. 外观配置基础设施 (renderer, 无 IPC 变更)

- [x] 1.1 创建渲染层共享的外观配置常量模块，集中定义全局 Theme 选项、代码主题分组、编辑器字体预设、代码字体预设、默认值与字体栈映射
- [x] 1.2 扩展 `src/stores/app.ts`：新增编辑器自动换行、编辑器字体预设、代码主题、代码行号、代码字体预设等状态与 setter，并通过 `web-storage-cache` 持久化
- [x] 1.3 为新增的 Appearance 设置补充类型与默认值回退逻辑，确保旧用户在缺少 localStorage 键时也能获得稳定初始值

## 2. Preferences 页面重构 (renderer, 无 IPC 变更)

- [x] 2.1 修改 `src/views/PreferencesView.vue`：新增 `Appearance` 标签页，并将现有视觉设置从 `General` 中迁移到 Appearance
- [x] 2.2 在 Appearance 中实现三组表单：全局 Theme、Editor、Code Block，使用预设下拉与开关控件承载新配置项
- [x] 2.3 更新 `src/locales/en.json` 与 `src/locales/zh-CN.json`，补充 Appearance、字体预设、代码主题分组与设置说明文案
- [x] 2.4 调整 Preferences 页面的即时保存交互，避免用户必须点击额外保存按钮才能让 Appearance 设置生效的误导

## 3. 编辑器外观接入 (renderer, 无 IPC 变更)

- [x] 3.1 修改 `src/components/EditorMain.vue`：基于全局 Theme 偏好解析 `UnaEditor` 的实际 `theme` 值，并确保 editor 不再拥有独立的 light/dark 入口
- [x] 3.2 将 `appStore` 中的外观配置映射到 `UnaEditor` props：`lineWrap`、`fontSize`、`fontFamily`、`codeTheme`、`codeLineNumbers`、`codeFontFamily`
- [x] 3.3 验证 Code Block theme 与全局 Theme 的独立性：全局 Theme 变化时，代码块继续使用用户显式选择的具体主题

## 4. 测试与验证

- [x] 4.1 为外观配置常量与 `appStore` 持久化逻辑补充单元测试，覆盖默认值、恢复值与 setter 行为
- [x] 4.2 为 `PreferencesView.vue` 补充测试，覆盖 Appearance 标签页、分组渲染、预设选项与即时持久化交互
- [x] 4.3 为 `EditorMain.vue` 补充测试，覆盖全局 Theme 到 editor theme 的映射，以及 line wrap / 字号 / 字体 / 代码块主题 / 行号 / 代码字体的 props 传递
- [x] 4.4 运行 `npm run format`、`npm run lint -- --fix`、`npm run check-all`、`npm run test`，确认实现满足仓库提交要求
