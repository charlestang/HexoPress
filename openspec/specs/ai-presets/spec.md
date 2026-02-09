## ADDED Requirements

### Requirement: 预置功能按钮区

AiPanel **MUST** 在聊天消息区上方提供预置功能按钮区，展示一组常用的 AI 辅助写作功能。

#### Scenario: 显示预置功能按钮

- **WHEN** 用户打开 AiPanel
- **THEN** 面板顶部 **SHALL** 显示预置功能按钮，包括：错别字检查、写作建议、段落润色、生成摘要

### Requirement: 预置功能填充输入框

点击预置功能按钮 **MUST** 将结构化提示词填入输入框，而非自动发送。

#### Scenario: 点击预置按钮

- **WHEN** 用户点击任一预置功能按钮
- **THEN** 系统 **SHALL** 将该预置功能的结构化提示词（包含任务描述、输出格式要求等）填入 AiInputBar 的输入框
- **AND** 系统 **SHALL** 记录当前激活的预置功能（activePreset）
- **AND** 用户可以审阅、编辑提示词后手动点击发送

#### Scenario: 预置消息的聊天气泡显示

- **WHEN** 用户发送了由预置功能填充的消息
- **THEN** 聊天气泡 **SHALL** 显示预置功能的短标签（如"📝 错别字检查"），而非完整提示词
- **AND** 实际发送给 AI 的 **SHALL** 是完整的结构化提示词

#### Scenario: 发送后清除预置状态

- **WHEN** 预置消息发送完成
- **THEN** activePreset **SHALL** 被清除
- **AND** 后续手动输入的消息 **SHALL** 作为普通消息处理

### Requirement: 结构化提示词

每个预置功能 **MUST** 包含精心设计的结构化提示词（userPrompt）和角色设定（systemPrompt）。

#### Scenario: 错别字检查提示词

- **GIVEN** 预置功能为"错别字检查"
- **THEN** systemPrompt **SHALL** 设定角色为精通写作的文学家和吹毛求疵的语文老师
- **AND** userPrompt **SHALL** 包含任务描述（审阅错别字、语病、标点、表达）和输出格式要求（问题类型、原文引用、问题说明、修改建议）
- **AND** contextMode **SHALL** 为 `full`

#### Scenario: 写作建议提示词

- **GIVEN** 预置功能为"写作建议"
- **THEN** systemPrompt **SHALL** 设定角色为资深写作教练和内容策略师
- **AND** userPrompt **SHALL** 要求从结构、逻辑、表达、可读性四个维度分析
- **AND** contextMode **SHALL** 为 `full`

#### Scenario: 段落润色提示词

- **GIVEN** 预置功能为"段落润色"
- **THEN** systemPrompt **SHALL** 设定角色为文笔优美的编辑
- **AND** userPrompt **SHALL** 要求保持原意、提升表达、直接输出润色文本
- **AND** contextMode **SHALL** 为 `selection`

#### Scenario: 生成摘要提示词

- **GIVEN** 预置功能为"生成摘要"
- **THEN** systemPrompt **SHALL** 设定角色为善于提炼要点的内容编辑
- **AND** userPrompt **SHALL** 要求生成 80-160 字的摘要，适合 SEO 和社交分享
- **AND** contextMode **SHALL** 为 `full`

### Requirement: 选区类预置功能校验

段落润色 **MUST** 以用户选中的文本作为 context 发送给 AI。

#### Scenario: 无选区时点击段落润色

- **WHEN** 用户未选中任何文本，点击"段落润色"按钮
- **THEN** 系统 **SHALL** 提示用户"请先在编辑器中选中要润色的段落"
- **AND** 不填充输入框，不设置 activePreset
