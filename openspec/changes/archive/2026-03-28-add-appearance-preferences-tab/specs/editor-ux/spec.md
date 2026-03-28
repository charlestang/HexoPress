## ADDED Requirements

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
