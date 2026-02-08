## 1. Blog Profile 卡片（renderer）

- [x] 1.1 重构 `DashboardView.vue` 模板：移除旧的 Site Config 卡片和 Overview 卡片，创建顶部 `el-row` 使用 8:16 分割
- [x] 1.2 实现 Blog Profile 卡片（span=8）：展示博客标题（大字体）、副标题、描述、关键词（tag 样式）、作者、语言，数据来源 `hexoConfig`
- [x] 1.3 在 Profile 卡片底部添加分隔线和统计数字区域（已发布/草稿/页面），数据来源 `statsStore`

## 2. 热力图重新布局（renderer）

- [x] 2.1 将热力图移入顶部 `el-row` 右侧（span=16），调整 `CalendarHeatmap` 组件的样式使格子更小
- [x] 2.2 确保 Profile 卡片与热力图卡片高度对齐（flex stretch 或 min-height）

## 3. 最近发布 + 草稿箱列表（renderer）

- [x] 3.1 实现"最近发布"卡片（span=12）：调用 `getPosts(true, false, 5)` 获取已发布文章，展示标题和相对时间（`formatDistanceToNow`）
- [x] 3.2 实现"草稿箱"卡片（span=12）：调用 `getPosts(false, true, 5)` 获取草稿，展示标题和相对时间，草稿为空时显示空状态提示
- [x] 3.3 实现"更多"加载交互：点击后追加 5 条数据，卡片设置 `max-height` 和 `overflow-y: auto`，超出部分出现滚动条
- [x] 3.4 文章标题点击跳转到编辑器页面（复用现有 `router.push({ name: 'frame', query: { sourcePath } })` 逻辑）

## 4. 样式迁移与清理（renderer）

- [x] 4.1 将所有 Dashboard 样式迁移到 UnoCSS utility classes，移除 `<style scoped>` 中的旧样式
- [x] 4.2 添加 hexoConfig 为 null 时的加载/占位状态处理

## 5. 验证（renderer）

- [x] 5.1 运行 `npm run vue-check` 确保类型检查通过
- [x] 5.2 运行 `npm run lint` 和 `npm run format` 确保代码风格一致
- [x] 5.3 运行 `npm run test` 确保现有测试不受影响
