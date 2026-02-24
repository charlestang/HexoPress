# media-library Specification

## Purpose
媒体库模块提供 Hexo 静态资源的应用内浏览、分组预览与删除管理能力，包括图片分组卡片总览、图片详情页（含变体列表与引用查询）、文件列表，以及对常见图片格式的删除操作。

## Requirements

### Requirement: Media Library Overview With Image Groups and File List
MediaLibraryView MUST 以标签页区分图片与文件两类资产，图片按文件夹 + 归一化文件名分组展示卡片。

#### Scenario: Image tab shows grouped cards
- **GIVEN** 用户进入媒体库页面
- **WHEN** 页面加载完成
- **THEN** 系统 MUST 调用 `window.site.getAssets()` 拉取全量资产列表
- **AND** 图片页签 MUST 使用 `buildImageGroups` 对 `.png/.jpg/.jpeg/.gif/.svg/.webp` 格式资产按目录 + 归一化文件名（去除末尾 `-WxH` 模式）分组
- **AND** 每张卡片 MUST 展示代表图预览、文件显示名、变体数量
- **AND** 无可预览图片时 MUST 展示空态"暂无图片"

#### Scenario: File tab shows non-image assets
- **GIVEN** 用户切换到"文件"页签
- **THEN** 系统 MUST 展示所有非预览格式资产的表格，列含路径、修改时间等基础字段
- **AND** 无文件类资产时 MUST 展示空态"暂无文件"

### Requirement: Delete Asset With Confirmation
用户 MUST 能对支持格式（`.png/.jpg/.jpeg/.webp/.gif/.svg`）的资产执行删除操作，删除前需二次确认，执行中防止重复提交。

#### Scenario: Successful deletion refreshes list
- **GIVEN** 用户点击某资产的"删除"按钮
- **WHEN** 确认弹窗中点击确定
- **THEN** 系统 MUST 将该资产按钮置为 Loading 并禁用，调用 `window.site.deleteAsset(id)`
- **AND** 成功后 MUST 展示成功提示并重新调用 `getAssets()` 刷新列表
- **AND** 失败时 MUST 展示含原始错误信息的错误提示，并恢复按钮可用状态

### Requirement: Image Detail Page With Variants and References
MediaDetailView MUST 展示单个图片分组的详细信息、变体列表，并支持查看引用与删除单个变体。

#### Scenario: Detail page loads group info
- **GIVEN** 用户在媒体库点击某图片卡片
- **WHEN** 跳转到 `media-detail` 路由（参数 `groupKey` 经 `encodeURIComponent` 传递）
- **THEN** 页面 MUST 展示代表图大图预览、文件大小（KB/MB）、像素尺寸、创建/更新时间
- **AND** 变体表格 MUST 列出小图预览、文件路径、文件大小、像素尺寸，以及"打开""查看引用""删除"操作

#### Scenario: Invalid groupKey redirects back
- **GIVEN** 用户直接访问含无效 `groupKey` 的详情页 URL
- **WHEN** 资产数据加载完成后找不到对应分组
- **THEN** 系统 MUST 通过 `router.replace({ name: 'media-library' })` 自动回退到媒体库列表

#### Scenario: View references dialog
- **GIVEN** 用户点击变体的"查看引用"
- **WHEN** 引用对话框打开
- **THEN** 系统 MUST 调用 `FsAgent.findAssetReferences` 列出所有引用该图片的文章标题与源文件路径
- **AND** 无引用时 MUST 在对话框内提供"删除此图片"快捷入口，触发二次确认后删除
