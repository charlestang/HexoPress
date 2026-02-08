## Why

当前 Dashboard 页面存在布局失衡、内容组织混乱的问题：两个卡片标题重复（都叫 "Activities"），统计数字与系统信息混杂，Site Config 占据大量空间却无实际操作价值，底部右侧完全空白。作为用户打开应用后的第一个页面，Dashboard 需要快速回答"这是哪个博客"、"博客什么状态"、"最近在忙什么"这三个核心问题。

## What Changes

- **移除** Site Config 卡片（`_config.yml` 技术配置信息），将身份相关字段（title、subtitle、description、keywords、author、language）提取为 Blog Profile
- **新增** Blog Profile 卡片（左上角，span=8），展示博客身份信息 + 嵌入统计数字（已发布/草稿/页面）
- **重新布局** 热力图卡片（右上角，span=16），缩小格子尺寸使其更精致
- **拆分** 原 Activities 列表为"最近发布"和"草稿箱"两个并排卡片（各 span=12），各显示 5 条
- **新增** 列表"更多"加载交互：点击后继续加载内容，卡片设 max-height，超出部分出滚动条
- **移除** Overview 卡片中的系统信息（Package Name、Package Version、Hexo Version）
- **优化** 日期显示为相对时间格式（"3天前"）

## Capabilities

### New Capabilities
- `dashboard-layout`: Dashboard 页面的整体布局重构，包括 Blog Profile 卡片、热力图重新定位、最近发布/草稿箱并排列表、"更多"滚动加载交互

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- **渲染进程**：`src/views/DashboardView.vue` 需要完全重写模板和样式
- **数据获取**：需要新增草稿列表的数据请求（`getPosts(false, true, 5)` 拉取草稿），现有 IPC 接口已支持，无需修改主进程
- **依赖**：可能引入 `date-fns` 的 `formatDistanceToNow` 用于相对时间显示（`date-fns` 已在依赖中）
- **样式**：新页面使用 UnoCSS，替换现有 scoped CSS
