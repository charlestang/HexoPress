## Summary
在媒体库列表中为 `png`/`jpg` 格式资源新增单个删除入口，提供二次确认与风险提示，删除后同步更新 Hexo 资产数据并刷新列表。

## Problem
媒体库页面（MediaLibraryView）只支持浏览，无法直接删除图片。用户需要手动切换到文件管理器删除，效率低且容易误删。大量从 WordPress 迁移过来的无用图片无法在应用内清理。

## Goals
1. 在媒体资源列表中为 `png`/`jpg` 类型资源提供"删除"操作入口。
2. 删除前弹出二次确认，提示可能存在文章引用风险。
3. 删除后同步更新文件系统与 Hexo 资产缓存，列表自动刷新。

## Non-Goals
- 不处理删除后文章引用失效的检测或修复。
- 不支持批量删除、撤销删除、回收站等高级功能。
- 暂不对 `gif`、`svg` 等其他格式开放删除。

## Proposed Solution
在 `HexoAgent` 新增 `deleteAsset(assetId)` 方法，删除磁盘文件并更新 Hexo 资产数据库。通过新 IPC 通道 `site:assetDelete` 暴露给渲染进程。前端在 `MediaLibraryView` 的 `ElTable` 中扩展操作列，使用 `ElMessageBox.confirm` 二次确认，完成后复用现有 `getAssets()` 刷新逻辑。

## Outcome
已实现并合并，提交 `db3be19`（2025-09-25）。
