## ADDED Requirements
### Requirement: Edit Tag Post From Dialog
TagPostsDialog MUST support jumping into a post editor while preserving tag context on return.
#### Scenario: Title opens editor with tag context
- **GIVEN** 管理员在 TagsView 中打开 TagPostsDialog，查看标签 `T` 的文章列表，其中一行文章为 `P`
- **WHEN** 管理员在对话框中点击文章 `P` 的标题
- **THEN** 系统 MUST 导航到 `P` 的编辑页面（Frame 视图），并携带 `P.source` 与标签 `T.id` 以便返回时恢复上下文
- **AND** TagPostsDialog 关闭或隐藏不影响返回后恢复

#### Scenario: Returning reopens dialog and refreshes membership
- **GIVEN** 管理员从 TagPostsDialog 的文章 `P` 打开了编辑页面，并在编辑器中修改了标签
- **WHEN** 管理员通过返回导航回到标签列表页
- **THEN** 系统 MUST 自动再次打开 TagPostsDialog，定位标签 `T` 并重新获取该标签的文章列表
- **AND** 若 `P` 不再包含标签 `T`，该文章 MUST 不出现在列表中；仍包含时应显示最新标签数据

### Requirement: Highlight Current Tag Chip In Dialog
Tag chips in TagPostsDialog MUST visually distinguish the active tag from other tags without removing existing interactions.
#### Scenario: Active tag rendered with accent color
- **GIVEN** 管理员在 TagPostsDialog 中查看标签 `T` 的文章列表，列表项的标签列包含标签 `T` 及其他标签
- **WHEN** 对话框渲染标签列的 chip
- **THEN** 代表标签 `T` 的 chip MUST 使用当前默认的浅蓝色样式（与“查看”面板现有主色一致）
- **AND** 其他标签的 chip MUST 使用 normal/灰色样式，以与当前标签区分
- **AND** 标签 chip 的其他交互（如删除当前标签）保持可用
