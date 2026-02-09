## ADDED Requirements

### Requirement: AI 提供商配置管理

用户 **MUST** 能够在 Preferences 页面配置一个或多个 OpenAI 兼容的 AI 提供商。每个提供商配置 **SHALL** 包含名称、API 端点 URL 和 API Key。

#### Scenario: 添加新的 AI 提供商

- **WHEN** 用户在 Preferences 的 AI 配置区点击"添加"按钮
- **THEN** 系统 **SHALL** 显示新的配置表单，包含名称、端点 URL、API Key 输入框
- **AND** 用户填写并保存后，配置 **SHALL** 持久化到 localStorage

#### Scenario: 配置多个提供商

- **WHEN** 用户已配置一个提供商后再次点击"添加"
- **THEN** 系统 **SHALL** 允许添加额外的提供商配置
- **AND** 所有配置 **SHALL** 以列表形式展示

#### Scenario: 删除提供商配置

- **WHEN** 用户点击某个提供商配置的"删除"按钮
- **THEN** 该配置 **SHALL** 从列表和 localStorage 中移除

#### Scenario: API Key 安全显示

- **WHEN** 提供商配置中包含 API Key
- **THEN** 界面 **SHALL** 使用密码输入框遮蔽显示 API Key，不以明文展示

### Requirement: 模型选择

AiInputBar **MUST** 提供模型选择下拉框，列出用户已配置的提供商及其模型。

#### Scenario: 选择 AI 模型

- **WHEN** 用户点击 AiInputBar 左侧的模型选择下拉框
- **THEN** 下拉框 **SHALL** 列出所有已配置提供商的名称
- **AND** 用户选择后，后续请求 **SHALL** 发送到对应提供商的端点

#### Scenario: 无可用模型时的提示

- **WHEN** 用户未配置任何 AI 提供商
- **THEN** AiInputBar **SHALL** 禁用发送按钮
- **AND** 显示提示引导用户前往 Preferences 配置

### Requirement: 模式选择

AiInputBar **MUST** 提供模式选择下拉框，允许用户选择 AI 的响应模式。

#### Scenario: 选择响应模式

- **WHEN** 用户点击 AiInputBar 中间的模式选择下拉框
- **THEN** 下拉框 **SHALL** 显示可用模式（如 quick、think）
- **AND** 选择的模式 **SHALL** 影响发送给 AI 的请求参数
