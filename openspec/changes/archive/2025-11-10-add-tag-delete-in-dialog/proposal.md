## Summary
- 在 TagPostsDialog 的“标签”列中，为每个标签 chip 增加带 `X` 的删除按钮。
- 点击 `X` 时，仅移除该标签在当前文章 FrontMatter 中的引用，并即时更新对话框列表。
- 删除成功后保持对话框开启，同时根据需要刷新标签计数 / 列表以保持数据一致。

## Problem
标签列表页已按文章数量排序，并能通过 TagPostsDialog 查看选中标签 `T` 下的文章。但当发现某篇文章不应继续使用 `T` 时，必须跳出对话框、进入其他界面甚至编辑 Markdown 才能移除标签，破坏了“边查看边清理”的体验。缺少对话框内逐篇移除标签的快捷方式，导致标签整理效率低、误操作多。

## Goals
1. 在 TagPostsDialog -> 标签列的每个标签 chip 右侧提供 `X` 删除入口，仅作用于当前文章。
2. 删除成功后，该行标签列表立即更新；若文章不再包含当前筛选的标签，必须以易察觉的淡出/滑动动画从结果中移除。
3. 删除失败时提示可重试的错误信息，且不会影响对话框内的其他操作。

## Non-Goals
- 不在标签列表页整体提供批量删除或永久删除标签实体的能力。
- 不引入标签重命名、合并或跨文章批量操作。
- 不调整 TagPostsDialog 现有的排序、分页或字段展示方式。

## Proposed Solution
### UI / UX
- 在 TagPostsDialog 的“标签”列，渲染形如 `标签名 ×` 的 chip；hover 时展示 tooltip “移除标签”。
- 点击 `×` 弹出确认提示（包含文章标题与将被移除的标签名），确认后执行删除；期间禁用同一行的删除入口并显示 loading。
- 删除完成后，该 chip 立即消失；若文章不再含当前筛选标签，使用淡出或滑动动画将整行移除，避免瞬间消失造成困惑。
- 当用户关闭 TagPostsDialog 返回标签列表时，自动刷新 `TagsView` 的全部标签统计数量，确保与最新文章标签一致。

- 在 `HexoAgent` 新增 `removeTagFromPost(sourcePath: string, tagId: string)`（或扩展现有更新方法）以只更新单篇文章的 FrontMatter，并调用 `updateCache()`。
- 经由 `ipcMain.handle('posts:remove-tag', …)` 暴露到 `window.site.removeTagFromPost(sourcePath, tagId)`，统一使用 `sourcePath` 作为文章标识（与现有接口保持一致）。
- 删除成功后，前端重新获取受影响文章的最新数据，必要时刷新 `getTags()` 以更新标签计数。
- 在用户关闭对话框时触发一次 `getTags()`（或等效机制）以同步标签长度。

### Error Handling & Validation
- 传入空 `postId`/`tagId` 时在前端直接阻止；HexoAgent 若找不到记录需抛出明确错误。
- 请求过程中禁用该标签 chip 的删除操作，失败后恢复并展示错误提示，可再次尝试。
- 若刷新列表失败，也要提示用户并允许手动重试。

## Open Questions
1. 是否需要在删除前保留文章原始 FrontMatter 备份，以便撤销？

## Risks & Mitigations
- **数据一致性**：单篇更新后若未及时刷新标签计数可能造成 TagsView 显示不准 → 删除后触发一次 `getTags()` 刷新或在后台延迟更新。
- **性能风险**：频繁修改 FrontMatter 可能触发多次 `updateCache()` → 可考虑为批量连续删除设计节流或提示用户操作耗时。
- **交互误触**：chip 上 `X` 易被误点 → 通过确认对话框与 tooltip 明确动作，减少误删。
