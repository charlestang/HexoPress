## MODIFIED Requirements

### Requirement: 编辑器状态共享至 editorStore

EditorMain **MUST** 将全文内容、front-matter 和选中文本状态同步到 `editorStore`，供 AiPanel 等兄弟组件消费。

#### Scenario: 全文内容同步

- **WHEN** 编辑器中的文本内容发生变化
- **THEN** `editorStore.text` **SHALL** 同步更新

#### Scenario: 选区文本同步

- **WHEN** 用户在编辑器中选中一段文本
- **THEN** `editorStore.selectedText` **SHALL** 更新为选中的文本内容
- **AND** `editorStore` **SHALL NOT** 再存储 `{ from, to }` 形式的 `selectionRange`

#### Scenario: 取消选区

- **WHEN** 用户取消选区（点击空白处或光标移动）
- **THEN** `editorStore.selectedText` **SHALL** 设为空字符串

#### Scenario: front-matter 同步

- **WHEN** 编辑器加载文章或 front-matter 发生变化
- **THEN** `editorStore.frontMatter` **SHALL** 同步更新，包含标题、分类、标签等元数据
