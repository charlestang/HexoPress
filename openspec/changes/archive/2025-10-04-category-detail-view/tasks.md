## Implementation Tasks
- [x] 新增 `CategoryPostsView` 页面组件与 `/categories/:id` 路由。
- [x] 实现子分类过滤逻辑：通过 `parent` 字段回溯父链，区分直接挂载与子分类文章。
- [x] 实现批量修改分类：分类树弹窗、禁用当前分类节点、调用 `replaceCategoryForPosts`。
- [x] 实现批量删除分类：确认弹窗、调用 `removeCategoryFromPosts`、刷新列表与统计。
- [x] 新增 `HexoAgent.replaceCategoryForPosts` 和 `removeCategoryFromPosts` 方法。
- [x] 更新 IPC 注册（`main.ts`、`preload.ts`、`types/local.d.ts`）。
- [x] 批量操作进度反馈：禁用按钮、ElAlert 进度提示、成功/失败数量摘要。
- [x] 新增中英文 i18n 文案。
- [x] 补充单元测试，覆盖过滤逻辑与批量操作 API 调用。
