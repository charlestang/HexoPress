## ADDED Requirements

### Requirement: Remove Tag From Post Within TagPostsDialog
在 TagPostsDialog 的文章列表中，每个标签 chip MUST 提供 `X` 删除动作；当用户确认删除时，系统 MUST 仅移除当前文章与该标签之间的关联，并以可感知动画即时更新对话框内容。

#### Scenario: Inline removal updates post tags
- **GIVEN** 管理员在 TagsView 中打开 TagPostsDialog，查看标签 `T` 的文章列表，其中一行文章 `P` 的“标签”列包含标签 `T`
- **WHEN** 管理员点击 `P` 行中标签 `T` chip 旁的 `X` 并确认
- **THEN** 渲染层调用 `window.site.removeTagFromPost(P.sourcePath, T.id)`（或等效 `sourcePath` 标识）
- **AND** `HexoAgent` MUST 更新文章 `P` 的 FrontMatter，将标签 `T` 移除并刷新 Hexo 缓存
- **AND** 操作完成后 TagPostsDialog MUST 立即更新：`P` 行的标签不再显示 `T`；若 `P` 不再包含当前筛选标签，则通过淡出或滑动动画将该行从列表中移除

#### Scenario: Failure leaves UI unchanged with actionable error
- **GIVEN** 管理员尝试在 TagPostsDialog 中移除文章 `P` 的标签 `T`，但后端返回错误（例如文件写入失败）
- **WHEN** 删除请求失败
- **THEN** 对话框 MUST 显示错误消息并保持原有标签显示
- **AND** 该标签 chip 的删除动作在错误提示关闭后可再次触发
- **AND** 其它行的标签删除功能不受影响

#### Scenario: Closing dialog refreshes tag counts
- **GIVEN** 管理员在 TagPostsDialog 中对一篇或多篇文章移除了标签 `T`
- **WHEN** 管理员关闭 TagPostsDialog 并返回标签列表
- **THEN** 系统 MUST 重新获取标签数据并更新 TagsView，使标签 `T` 的文章数量与最新状态一致
