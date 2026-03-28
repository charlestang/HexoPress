## Context

当前 `PreferencesView.vue` 已经使用 Tab 将设置分为 “通用” 和 “AI”，但视觉相关选项仍然散落在 “通用” 中：全局主题偏好（当前文案为 light / dark / system）与编辑器字号和博客目录、语言、自动保存、编辑模式等行为设置混在一起。与此同时，`EditorMain.vue` 对 `una-editor` 的接入只消费了极少数外观能力，尚未将 `lineWrap`、`theme`、`fontFamily`、`codeFontFamily`、`codeTheme`、`codeLineNumbers` 等能力暴露给用户。

本次变更是一个典型的渲染层跨模块调整：
- `PreferencesView.vue` 需要重构设置分组与表单项
- `appStore` 需要新增并持久化外观偏好
- `EditorMain.vue` 需要消费这些偏好并映射到 `UnaEditor`
- i18n 需要补充新的设置项文案

同时，本次范围有两个明确约束：
- **不**在这次变更中处理 `MdRenderer.vue` 的预览主题
- **不**展开整个应用的 dark/light 体系化改造，只让编辑页面中的 `una-editor` 跟随现有全局主题偏好

## Goals / Non-Goals

**Goals:**
- 在 Preferences 中新增独立的 **Appearance** 标签页，集中放置视觉相关选项
- 保留单一的全局主题偏好入口，由它驱动编辑器的明暗主题
- 为编辑器提供可持久化的外观设置：自动换行、字号、预设字体族
- 为代码块提供独立的可持久化外观设置：全部 `una-editor` 支持的代码主题、行号开关、预设代码字体族
- 让设置变更即时作用于编辑页面中的 `UnaEditor`

**Non-Goals:**
- 不统一 `MdRenderer`、预览弹窗或其他页面的代码块主题
- 不让编辑器拥有独立于全局主题之外的第二套 light/dark 选择
- 不提供自由文本形式的字体输入或系统字体枚举
- 不新增 IPC、bridge 或主进程能力
- 不在本次变更中重做整个应用的暗色 UI 体系

## Decisions

### Decision 1: 保留单一全局 Theme 偏好，不新增独立 editor theme

**选择**：Appearance 仅保留一套全局 Theme 选择（`System` / `Light` / `Dark`）。其中 `System` 表示“跟随系统当前生效结果”，并不代表应用自己按时间自动判定。编辑器整体主题直接跟随这套全局偏好，不再暴露单独的 editor 明暗切换。

**理由**：
- 编辑器是应用主工作区的一部分，不应与外层 UI 形成相互冲突的明暗状态
- 避免出现应用整体偏暗、编辑器单独偏亮的视觉断层
- 与用户心智一致：明暗偏好是全局视觉选择，不是 editor 私有设置

**替代方案**：给 `UnaEditor` 单独提供 `System` / `Light` / `Dark`
- 优点：灵活
- 缺点：设置层级冲突，容易产生难看的混搭状态

### Decision 2: Theme 解析只服务于编辑器，不扩展成全应用主题系统

**选择**：沿用现有全局主题偏好状态，并在渲染层为编辑器解析出实际的 `light` / `dark` 结果；当用户选择 `System` 时，编辑器读取当前系统/应用解析结果。若操作系统本身设置为自动切换深浅色，应用也只是跟随系统当下生效的结果。该解析结果仅用于 `UnaEditor.theme`，不驱动全应用 dark class 或其他组件的主题重构。

**理由**：
- 能满足本次“编辑器跟随全局主题”的诉求
- 不需要扩展 IPC 契约或主进程接口
- 能把“编辑页外观设置”与“全应用暗色体系重构”拆成两个独立 change

**替代方案**：本次同步补齐整个应用的 dark/light 体系
- 优点：长期更完整
- 缺点：范围大幅膨胀，牵涉到所有页面与全局样式

### Decision 3: 新增 Appearance tab，并将行为设置留在 General

**选择**：Preferences 使用三个标签页：`General`、`Appearance`、`AI`。`Appearance` 只承载视觉相关配置；`autoSave`、`editMode` 等行为型设置继续留在 `General`。

**理由**：
- “外观”和“行为”分离后，用户更容易找到想调的选项
- 避免 Appearance 被行为设置污染，保持页面语义清晰
- 与已有的 AI 独立分区保持一致

**替代方案**：
- 继续堆在 `General`：实现简单，但信息架构持续恶化
- 再单独增加 `Editor` 标签页：过度细分，当前设置量不值得

### Decision 4: 字体使用预设下拉，内部映射为字体栈

**选择**：Preferences 只暴露预设字体选项，不允许用户自由输入字体名。内部持久化的是预设 ID，运行时映射为具体 `font-family` stack。

**编辑器字体预设**：
- `clean-sans`
- `reading-serif`
- `mono`

**代码字体预设**：
- `system-mono`
- `jetbrains-mono`
- `fira-code`

**理由**：
- 避免用户输入本机不存在的字体名称导致渲染不可预测
- 能在 macOS / Windows / Linux 上通过 fallback stack 保持稳定体验
- 预设 ID 更适合持久化和测试，不把长字体栈散落在多个组件里

**替代方案**：
- 自由文本输入：灵活但高风险，且产品体验差
- 直接读取系统字体列表：实现复杂、跨平台不稳定

### Decision 5: Code Block theme 独立于全局 Theme，且不提供 `auto`

**选择**：代码块使用独立的 `codeTheme` 设置，直接暴露 `una-editor` 支持的全部具体主题，按 light / dark 分组展示；不提供 `auto` 选项。

**Dark themes**：
- `one-dark`
- `dracula`
- `monokai`
- `solarized-dark`
- `nord`
- `tokyo-night`

**Light themes**：
- `github-light`
- `solarized-light`
- `atom-one-light`

**理由**：
- 代码块本来就是独立视觉区域，允许与正文区形成对比
- 不提供 `auto` 可以避免它重新被外层主题耦合，保持“用户明确指定”
- 主题数量不多，直接完整开放比做二次抽象更简单

**替代方案**：
- `auto` 跟随编辑器主题：会削弱代码块作为独立视觉区域的价值
- 仅开放少数精选主题：更克制，但不必要限制现有能力

### Decision 6: 用共享配置常量统一 Options 与运行时映射

**选择**：将 Appearance 所需的 theme 分组、字体预设、默认值与字体栈映射集中到一个渲染层共享模块中，由 `PreferencesView`、`appStore`、`EditorMain` 与测试共同复用。

**理由**：
- 避免多个组件重复维护相同的 option 列表和默认值
- 便于测试断言稳定地引用相同 preset ID
- 后续如果增加更多外观预设，扩展点明确

**替代方案**：分别在视图和组件中硬编码
- 优点：短期改动少
- 缺点：容易造成选项列表、默认值和映射关系漂移

## Risks / Trade-offs

- **[全局 Theme 语义大于当前实际覆盖范围]** → 这一版主要让 editor 跟随全局 theme，但不会立刻让所有页面完成 dark/light 一致性改造。  
  **Mitigation**：在 proposal / design / specs 中明确这次范围仅覆盖编辑页面中的 `UnaEditor`。

- **[System 模式的系统主题联动可能不覆盖所有运行时切换场景]** → 如果本次只解析“当前结果”，而不订阅完整的系统主题变化事件，用户在应用运行期间切换系统主题时，编辑器可能不会即时刷新。  
  **Mitigation**：本次先保证打开编辑页与用户主动切换设置时结果正确；更完整的全应用主题联动在后续 change 中处理。

- **[字体预设在不同平台的视觉一致性有限]** → 即使使用字体栈，不同操作系统最终命中的字体仍可能不同。  
  **Mitigation**：用预设 ID + fallback stack 降低风险，并优先选择跨平台常见字体族。

- **[Preferences 页面复杂度上升]** → 增加 Appearance 后，设置项数量更多，若布局处理不好会显得拥挤。  
  **Mitigation**：按 Theme / Editor / Code Block 三组分区展示，避免平铺成单长表单。

## Migration Plan

1. 在 `appStore` 中补齐外观配置的默认值、持久化与 setter
2. 在渲染层共享模块中定义外观选项与 preset 映射
3. 重构 `PreferencesView.vue`：新增 `Appearance` tab，并将视觉设置迁入其中
4. 更新 `EditorMain.vue`：把外观偏好映射到 `UnaEditor` 的 `theme`、`lineWrap`、`fontSize`、`fontFamily`、`codeFontFamily`、`codeTheme`、`codeLineNumbers`
5. 补充 i18n 文案与相关单元测试

**回滚策略**：
- 移除新增的 Appearance 表单项与 store 字段
- 保留原有 `darkMode` / `editorFontSize` 的旧入口
- `UnaEditor` 回退为当前固定外观参数

## Open Questions

- 暂无阻塞实现的开放问题；`MdRenderer` 预览主题统一已明确留到后续 change 处理
