## ADDED Requirements

### Requirement: 预置功能按钮区

AiPanel **MUST** 在聊天消息区上方提供预置功能按钮区，展示一组常用的 AI 辅助写作功能。

#### Scenario: 显示预置功能按钮

- **WHEN** 用户打开 AiPanel
- **THEN** 面板顶部 **SHALL** 显示预置功能按钮，包括：错别字检查、写作建议、段落润色、生成摘要

### Requirement: 全文类预置功能

错别字检查、写作建议、生成摘要等预置功能 **MUST** 以全文作为 context 发送给 AI。

#### Scenario: 执行错别字检查

- **WHEN** 用户点击"错别字检查"按钮
- **THEN** 系统 **SHALL** 将预置的 system prompt 和全文内容组装为请求发送给 AI
- **AND** AI 回复 **SHALL** 在聊天消息区以流式方式显示

#### Scenario: 执行写作建议

- **WHEN** 用户点击"写作建议"按钮
- **THEN** 系统 **SHALL** 将写作建议的 system prompt 和全文内容发送给 AI
- **AND** AI 回复 **SHALL** 包含对文章结构、逻辑、表达等方面的建议

#### Scenario: 生成摘要

- **WHEN** 用户点击"生成摘要"按钮
- **THEN** 系统 **SHALL** 将摘要生成的 system prompt 和全文内容发送给 AI
- **AND** AI 回复 **SHALL** 包含适合填入 front-matter description 字段的文章摘要

### Requirement: 选区类预置功能

段落润色 **MUST** 以用户选中的文本作为 context 发送给 AI。

#### Scenario: 有选区时执行段落润色

- **WHEN** 用户在编辑器中选中了一段文本，然后点击"段落润色"按钮
- **THEN** 系统 **SHALL** 将润色的 system prompt、选中文本和 front-matter 组装为请求发送给 AI
- **AND** AI 回复 **SHALL** 包含润色后的段落文本

#### Scenario: 无选区时点击段落润色

- **WHEN** 用户未选中任何文本，点击"段落润色"按钮
- **THEN** 系统 **SHALL** 提示用户"请先在编辑器中选中要润色的段落"
- **AND** 不发送 API 请求
