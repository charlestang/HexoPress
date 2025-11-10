## Implementation Tasks
- [x] Backend：在 `HexoAgent` 中新增 `removeTagFromPost(sourcePath: string, tagId: string)`（或扩展现有保存逻辑），确保只更新指定文章的 FrontMatter 并调用 `updateCache()`；补充单元测试覆盖成功/失败场景。
- [x] IPC & 类型：在 `main/main.ts`、`main/preload.ts`、`types/local.d.ts` 暴露 `removeTagFromPost(sourcePath, tagId)`，渲染层通过 `window.site.removeTagFromPost` 调用保持 `sourcePath` 约定一致。
- [x] 前端 UI：更新 `TagPostsDialog`，在“标签”列的 chip 上渲染 `X` 删除入口，含确认提示、loading/禁用状态及错误信息展示；删除成功后若文章不再包含当前标签，触发淡出/滑动动画再从表格移除该行。
- [x] 数据刷新：删除成功后重新拉取受影响文章或局部更新 `posts` 列表；在 TagPostsDialog 关闭时触发 `getTags()`（或等效事件）刷新标签统计。
- [x] 本地化与测试：新增中英文提示文案；添加组件测试验证 chip 删除行为、错误处理与列表刷新逻辑。
