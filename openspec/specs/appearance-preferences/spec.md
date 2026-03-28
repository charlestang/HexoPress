# appearance-preferences Specification

## Purpose
定义 HexoPress Preferences 页面中外观设置的分组、选项组织、持久化与恢复行为，确保编辑页面的视觉配置具备一致且可发现的入口。

## Requirements
### Requirement: Preferences 提供独立的 Appearance 标签页

Preferences 页面 **MUST** 提供独立的 Appearance 标签页，用于集中管理所有视觉相关配置，并将行为型设置继续保留在其他标签页中。

#### Scenario: 设置页面显示三个标签页

- **WHEN** 用户打开 Preferences 页面
- **THEN** 页面 **SHALL** 显示 `General`、`Appearance`、`AI` 三个标签页
- **AND** Appearance 标签页 **SHALL** 承载视觉相关配置

#### Scenario: Appearance 页面按视觉领域分组

- **WHEN** 用户切换到 Appearance 标签页
- **THEN** 页面 **SHALL** 至少按 `Theme`、`Editor`、`Code Block` 三组展示设置项
- **AND** 用户 **SHALL** 能在同一标签页内完成编辑页面外观的主要配置

#### Scenario: 行为设置不进入 Appearance

- **WHEN** 用户查看 Appearance 标签页
- **THEN** `autoSave`、`editMode` 等行为型设置 **SHALL NOT** 出现在该标签页中
- **AND** 这些设置 **SHALL** 继续保留在非 Appearance 的设置分区中

### Requirement: Appearance 提供预设化的 Editor 外观设置

Appearance 标签页 **MUST** 提供编辑器外观设置，包括全局 Theme、自动换行、字号和预设字体族；字体配置 **SHALL** 通过预设下拉提供，而不是自由文本输入。

#### Scenario: 全局 Theme 提供三种选项

- **WHEN** 用户查看 Appearance 中的 Theme 设置
- **THEN** 系统 **SHALL** 提供 `System`、`Light`、`Dark` 三个选项
- **AND** `System` **SHALL** 表示跟随系统/当前应用解析结果，而不是应用自行按时间自动判定

#### Scenario: Editor 设置提供基础排版控制

- **WHEN** 用户查看 Appearance 中的 Editor 分组
- **THEN** 系统 **SHALL** 提供 `Line wrap`、`Font size`、`Font family` 三类设置
- **AND** `Font size` **SHALL** 允许以数值方式调整

#### Scenario: Editor 字体族使用预设下拉

- **WHEN** 用户展开 Editor 的字体族选择器
- **THEN** 系统 **SHALL** 提供预设选项而非自由输入框
- **AND** 预设 **SHALL** 至少包含 `clean-sans`、`reading-serif`、`mono`

### Requirement: Appearance 提供独立的 Code Block 外观设置

Appearance 标签页 **MUST** 提供代码块主题、代码行号和代码字体族设置。代码块主题 **SHALL** 独立于全局 Theme，并暴露 `una-editor` 当前支持的全部代码主题。

#### Scenario: Code Block theme 按 light / dark 分组展示

- **WHEN** 用户展开 Code Block 的 theme 选择器
- **THEN** 系统 **SHALL** 将主题按 `Dark themes` 和 `Light themes` 两组展示
- **AND** `Dark themes` **SHALL** 包含 `one-dark`、`dracula`、`monokai`、`solarized-dark`、`nord`、`tokyo-night`
- **AND** `Light themes` **SHALL** 包含 `github-light`、`solarized-light`、`atom-one-light`

#### Scenario: Code Block theme 不提供 auto

- **WHEN** 用户查看 Code Block 的 theme 选项
- **THEN** 系统 **SHALL NOT** 提供 `auto` 作为可选值
- **AND** 用户 **SHALL** 明确选择一个具体的代码主题

#### Scenario: Code Block 提供行号和字体预设

- **WHEN** 用户查看 Appearance 中的 Code Block 分组
- **THEN** 系统 **SHALL** 提供 `Show line numbers` 开关与 `Font family` 选择器
- **AND** 代码字体预设 **SHALL** 至少包含 `system-mono`、`jetbrains-mono`、`fira-code`

### Requirement: Appearance 设置本地持久化并恢复

Appearance 相关设置 **MUST** 通过本地持久化保存，并在后续启动或重新进入页面时恢复。

#### Scenario: 修改 Appearance 设置后立即持久化

- **WHEN** 用户修改 Appearance 标签页中的任一设置
- **THEN** 新值 **SHALL** 被持久化到本地配置存储
- **AND** 用户无需额外提交表单即可保留该设置

#### Scenario: 重新打开应用后恢复 Appearance 设置

- **WHEN** 用户在先前已经保存过 Appearance 设置的情况下重新打开应用
- **THEN** Preferences 页面 **SHALL** 恢复上次保存的外观配置
- **AND** 编辑页面 **SHALL** 使用相同的配置作为初始值
