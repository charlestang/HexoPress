## Implementation Tasks
- [x] 扩展 `HexoAgent.getPosts` 增加 `tagId` 参数，按标签过滤文章。
- [x] 更新 `main/main.ts`、`main/preload.ts`、`types/local.d.ts` 的 `getPosts` 签名，增加 `tagId` 参数。
- [x] 新增 `TagPostsDialog` 组件，含加载状态、空态、错误重试、ESC 关闭。
- [x] 在 `TagsView` 中引入组件，拦截"查看"操作改为打开弹窗。
- [x] 新增中英文 i18n 文案。
- [x] 补充组件测试，覆盖加载逻辑与错误处理。
