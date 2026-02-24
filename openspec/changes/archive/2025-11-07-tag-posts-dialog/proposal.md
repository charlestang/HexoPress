## Summary
在标签列表页（TagsView）点击"查看"时，弹出应用内对话框展示该标签下的关联文章列表，替代原有跳转外部站点的行为。

## Problem
标签列表页的"查看"操作通过 `window.site.openUrl` 跳转至站点前台，用户无法在管理后台直接查看标签关联文章，来回切换页面体验差。

## Goals
1. 点击"查看"弹出 TagPostsDialog，展示该标签下的文章列表。
2. 对话框内以列表形式呈现文章标题、所属分类与标签信息。
3. 替换原有跳转功能，不再打开外部站点。

## Non-Goals
- 不在对话框内提供批量操作（批量编辑、批量发布等）。
- 不实现分页，全量展示返回结果。
- 不支持导出标签下文章列表。

## Proposed Solution
新增 `TagPostsDialog` 组件，通过 `v-model` 控制可见性，传入标签 `id` 与 `name`。扩展 `window.site.getPosts` 增加 `tagId` 参数，弹窗打开时按标签过滤拉取文章。列表复用 `PostListView` 中的分类路径与标签展示逻辑。

## Outcome
已实现并合并，提交 `4a3252b`（2025-11-07）。
