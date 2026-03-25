## MODIFIED Requirements

### Requirement: 聊天消息显示

AiPanel **MUST** 包含可滚动的聊天消息区域，显示用户消息和 AI 回复的完整对话历史。

#### Scenario: 显示用户消息

- **WHEN** 用户发送一条消息
- **THEN** 消息区域 **SHALL** 显示用户消息气泡，包含消息文本和附着的 context 标识（如 `@full` 或 `@selection(length)`）

### Requirement: Context 状态栏

AiPanel **MUST** 在输入框上方显示 Context 状态栏，指示当前附着的上下文信息。

#### Scenario: 无选区时显示全文 context

- **WHEN** 编辑器中没有选中文本
- **THEN** 状态栏 **SHALL** 显示 `@full` 及全文字数

#### Scenario: 有选区时显示选区 context

- **WHEN** 用户在编辑器中选中了一段文本
- **THEN** 状态栏 **SHALL** 显示 `@selection(length)` 及选中字数
- **AND** `length` **SHALL** 表示当前 `selectedText` 的字符数
