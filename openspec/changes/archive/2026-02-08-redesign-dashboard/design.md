## Context

当前 `DashboardView.vue` 使用 Element Plus 的 `el-row`/`el-col` 栅格系统布局，包含四个 `el-card`：热力图（span=24）、最近文章（span=12）、Overview（span=12）、Site Config（span=12）。页面存在布局失衡（右下空白）、内容重复（两个 "Activities" 标题）、信息价值低（Site Config 不可编辑）等问题。

数据层面，现有 IPC 接口已完全满足需求：`getPosts` 支持 published/draft 过滤和分页，`getHeatMap` 返回热力图数据，`getHexoConfig` 返回站点配置，`getStats` 返回统计数据。无需修改主进程代码。

## Goals / Non-Goals

**Goals:**
- 重构 Dashboard 布局，使信息层次清晰：博客身份 → 统计概览 → 最近活动 → 写作激励
- 将 Site Config 中的身份信息提取为 Blog Profile 卡片
- 新增草稿箱列表，与最近发布并排展示
- 热力图与 Profile 并排放置，缩小格子尺寸
- 列表支持"更多"加载，卡片内滚动

**Non-Goals:**
- 不修改主进程 IPC 接口或 HexoAgent 逻辑
- 不实现 `_config.yml` 的编辑功能
- 不修改其他页面的布局
- 不引入新的 npm 依赖（`date-fns` 已在项目中）

## Decisions

### 1. 布局方案：Profile(8) + 热力图(16) 顶部并排

**选择**：使用 `el-row`/`el-col` 栅格，顶部 8:16 分割，底部 12:12 分割。

**替代方案**：
- CSS Grid 自定义布局：更灵活但与项目现有模式不一致，其他页面都用 `el-row`/`el-col`
- Profile 全宽 + 热力图全宽：Profile 拉宽后内容稀疏，视觉效果差

**理由**：保持与项目现有布局模式一致，8:16 比例让 Profile 紧凑、热力图有足够空间。

### 2. 统计数字嵌入 Profile 卡片

**选择**：在 Profile 卡片底部用分隔线隔开，展示已发布/草稿/页面三个统计数字。

**替代方案**：
- 独立统计卡片行：多占一行空间，页面更长
- 统计数字放在热力图卡片内：语义不匹配

**理由**：Profile + 统计 = "这个博客是什么 + 有多大"，逻辑内聚，减少一行布局。

### 3. 日期显示使用 `date-fns` 的 `formatDistanceToNow`

**选择**：使用 `date-fns/formatDistanceToNow` 配合 `zhCN` locale 显示相对时间。

**理由**：`date-fns` 已是项目依赖，`formatDistanceToNow` 支持中文 locale，输出如"3天前"、"1个月前"。

### 4. "更多"加载使用卡片内滚动

**选择**：列表卡片设置 `max-height`，点击"更多"后追加数据，超出部分出现滚动条。

**替代方案**：
- 卡片展开：会推动页面其他内容，两个并排卡片高度不一致
- 分页：交互更重，不适合 Dashboard 的快速浏览场景

**理由**：卡片内滚动保持页面结构稳定，两个并排卡片独立滚动互不干扰。

### 5. 样式方案使用 UnoCSS

**选择**：新 Dashboard 使用 UnoCSS utility classes，替换现有 scoped CSS。

**理由**：遵循项目规范——新页面优先使用 UnoCSS。Dashboard 是完全重写，适合整体迁移。

## Risks / Trade-offs

- **热力图组件尺寸适配**：`vue3-calendar-heatmap` 的格子大小通过 CSS 控制，缩小格子后需要测试在 span=16 宽度下的显示效果。→ 通过 CSS 变量或 style 覆盖调整格子尺寸，开发时实际测试。
- **"更多"加载的 max-height 值**：需要根据实际内容高度调试，5 条列表项的高度作为初始 max-height，加载更多后才出现滚动条。→ 开发时根据实际渲染效果微调。
- **Profile 卡片与热力图卡片高度对齐**：两个卡片内容量不同，可能出现高度不一致。→ 可通过设置最小高度或 flex stretch 对齐。
