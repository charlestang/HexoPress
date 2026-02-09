## ADDED Requirements

### Requirement: AI 提供商配置管理

用户 **MUST** 能够在 Preferences 页面的"AI"标签页中配置一个或多个 OpenAI 兼容的 AI 提供商。每个提供商配置 **SHALL** 包含名称、API 端点 URL、API Key、API 规范（provider）和模型 ID（modelId）。

#### Scenario: 设置页面 Tab 分区

- **WHEN** 用户打开 Preferences 页面
- **THEN** 页面标题下方 **SHALL** 显示 Tab 标签页导航，包含"通用"和"AI"两个标签
- **AND** "通用"标签包含原有设置项，"AI"标签包含 AI 提供商配置

#### Scenario: 添加新的 AI 提供商

- **WHEN** 用户在 AI 标签页点击"添加"按钮
- **THEN** 系统 **SHALL** 显示新的配置卡片，包含名称、端点 URL、API Key、API 规范下拉框、Model ID 输入框
- **AND** 用户填写后，配置 **SHALL** 实时持久化到 localStorage

#### Scenario: 配置多个提供商

- **WHEN** 用户已配置一个提供商后再次点击"添加"
- **THEN** 系统 **SHALL** 允许添加额外的提供商配置
- **AND** 所有配置 **SHALL** 以卡片列表形式展示

#### Scenario: 删除提供商配置

- **WHEN** 用户点击某个提供商配置的"删除"按钮
- **THEN** 该配置 **SHALL** 从列表和 localStorage 中移除
- **AND** 如果删除的是当前默认选中的供应商，默认选择 **SHALL** 被清空

#### Scenario: API Key 安全显示

- **WHEN** 提供商配置中包含 API Key
- **THEN** 界面 **SHALL** 使用密码输入框遮蔽显示 API Key，不以明文展示

### Requirement: 供应商选择

AiInputBar **MUST** 提供供应商选择下拉框，列出用户已配置的提供商，并在旁边以标签形式显示当前供应商的 Model ID。

#### Scenario: 选择 AI 供应商

- **WHEN** 用户点击 AiInputBar 的供应商选择下拉框
- **THEN** 下拉框 **SHALL** 列出所有已配置提供商的名称
- **AND** 用户选择后，后续请求 **SHALL** 发送到对应提供商的端点，使用其 modelId 作为 API 请求的 model 参数

#### Scenario: 默认供应商选择

- **WHEN** 用户首次打开 AI 面板且已配置供应商
- **THEN** 系统 **SHALL** 自动选中第一个供应商
- **AND** 用户手动切换供应商后，选择 **SHALL** 通过 appStore.defaultAiProviderId 持久化
- **AND** 下次启动应用时 **SHALL** 恢复上次的选择

#### Scenario: 无可用供应商时的提示

- **WHEN** 用户未配置任何 AI 提供商
- **THEN** AiInputBar **SHALL** 禁用发送按钮
- **AND** 显示提示引导用户前往 Preferences 配置
