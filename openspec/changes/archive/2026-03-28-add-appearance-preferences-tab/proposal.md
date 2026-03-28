## Why

当前 Preferences 页面中的设置按主题混放，界面语言、博客目录、编辑器行为和视觉选项都堆在同一个 “通用” 标签页中，导致用户难以集中调整外观体验。与此同时，`una-editor` 已经支持编辑器主题、换行、字体、代码块主题与行号等能力，但 HexoPress 还没有将这些能力整理成统一的外观配置入口。

## What Changes

- 在 Preferences 页面新增一个独立的 **Appearance** 标签页，用于集中管理外观相关选项
- 将现有的全局主题偏好（`system` / `light` / `dark`）与编辑器外观配置从 “通用” 标签页迁移到 **Appearance**
- 在 **Appearance** 中新增编辑器外观设置：是否自动换行、字体大小、预设字体族
- 在 **Appearance** 中新增代码块外观设置：完整的 `una-editor` 代码主题列表（按 light / dark 分组展示）、是否显示行号、预设代码字体族
- 调整主编辑器，使 `una-editor` 在编辑页面中消费上述配置；编辑器整体主题跟随全局主题偏好，代码块主题保持独立配置
- 明确本次变更仅覆盖编辑页面中的 `una-editor` 外观配置，不扩展 `MdRenderer` 预览主题，也不展开整个应用的暗色体系重构

## Capabilities

### New Capabilities
- `appearance-preferences`: Preferences 中的外观配置入口与持久化规则，包括标签页分组、配置项组织、预设选项与本地保存

### Modified Capabilities
- `editor-ux`: 编辑器需要读取并应用外观偏好，包括主题联动、自动换行、字号、字体、代码块主题、代码块行号与代码字体

## Impact

- **受影响代码（渲染进程）**：
  - `src/views/PreferencesView.vue`：新增 Appearance 标签页并重组现有设置项
  - `src/stores/app.ts`：新增外观相关持久化状态与 setter
  - `src/components/EditorMain.vue`：将外观偏好映射到 `UnaEditor` props
  - `src/locales/en.json` 与 `src/locales/zh-CN.json`：新增 Appearance 相关文案
  - 相关测试文件（Preferences / appStore / EditorMain）

- **架构影响**：
  - 仅渲染进程与本地持久化改动
  - 不新增 IPC channel，不修改 `ISite`、`main/preload.ts`、`main/main.ts`、`web/routes.ts`
  - 复用现有全局主题偏好与 `site.getDarkMode()` / `site.setDarkMode()` 相关能力，不在本次变更中扩展全应用主题系统

- **依赖与兼容性**：
  - 不新增第三方依赖
  - 依赖 `una-editor` 已提供的主题、代码主题、字体与行号配置能力
