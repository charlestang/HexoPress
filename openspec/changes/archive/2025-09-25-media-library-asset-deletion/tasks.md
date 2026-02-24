## Implementation Tasks
- [x] 在 `HexoAgent` 新增 `deleteAsset(assetId)` 方法：删除磁盘文件，更新 Hexo 资产数据库，失败时抛出详尽错误信息。
- [x] 新增 IPC 通道 `site:assetDelete`，在 `main/main.ts`、`main/preload.ts`、`types/local.d.ts` 中注册与声明。
- [x] 在 `MediaLibraryView` 扩展 `ElTable` 操作列，仅对 `png`/`jpg` 格式显示"删除"按钮。
- [x] 实现删除确认弹窗（`ElMessageBox.confirm`），文案包含文章引用风险提示。
- [x] 删除执行中禁用按钮防止重复提交，完成后通过 `ElMessage` 反馈成功/失败。
- [x] 删除成功后调用 `getAssets()` 刷新列表。
