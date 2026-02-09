## MODIFIED Requirements

### Requirement: Editor Log Hygiene

编辑器在生产运行环境下 **MUST** 不输出调试日志，且功能对应的日志信息 **SHALL** 准确。

#### Scenario: Correct log message for font size increase

- **WHEN** 用户点击"增大字号"按钮
- **THEN** 系统执行 `onFontBig` 函数
- **AND** **SHALL** 不输出错误的 `onFontSmall` 信息

#### Scenario: Clean console during normal operation

- **WHEN** 用户进行编辑、上传图片、保存文章等操作
- **THEN** 控制台 **SHALL** 不输出 `filterImage`、`upsertDraft` 等调试性质的 `console.log` 信息

## ADDED Requirements

### Requirement: 编辑器状态共享至 editorStore

EditorMain **MUST** 将全文内容、front-matter 和选区状态同步到 editorStore，供 AiPanel 等兄弟组件消费。

#### Scenario: 全文内容同步

- **WHEN** 编辑器中的文本内容发生变化
- **THEN** editorStore 中的 `text` 状态 **SHALL** 同步更新

#### Scenario: 选区状态同步

- **WHEN** 用户在编辑器中选中一段文本
- **THEN** editorStore 中的 `selectedText` **SHALL** 更新为选中的文本内容
- **AND** `selectionRange` **SHALL** 更新为 `{ from: number, to: number }` 格式的位置信息

#### Scenario: 取消选区

- **WHEN** 用户取消选区（点击空白处或光标移动）
- **THEN** editorStore 中的 `selectedText` **SHALL** 设为空字符串
- **AND** `selectionRange` **SHALL** 设为 null

#### Scenario: front-matter 同步

- **WHEN** 编辑器加载文章或 front-matter 发生变化
- **THEN** editorStore 中的 `frontMatter` **SHALL** 同步更新，包含标题、分类、标签等元数据
