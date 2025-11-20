## ADDED Requirements
### Requirement: Editor Media Panel Lists Images
FrameView toolbar MUST provide a media panel that lists all image assets for quick browsing.

#### Scenario: Panel loads all images with scrollable thumbnails
- **THEN** 系统 MUST 在每次展开 mediaPanel 时通过现有媒体接口（例如 `window.site.getAssets`）获取全部图片（如 gif/jpg/jpeg/png/svg 等）并按更新时间倒序展示；折叠后无需缓存
- **AND** 缩略图 MUST 根据面板宽度自适应列数：不少于 1 列、缩略图宽度保持在 80px~160px 范围，宽度再增则自动换列；高度可裁剪并支持纵向滚动，不需要分页
- **AND** 面板 MUST 标注每张图片的名称或相对路径以便识别

### Requirement: Media Panel Supports Keyword Search and Navigation
Users MUST be able to filter and navigate search hits directly inside the media panel via a dedicated search UI.

#### Scenario: Keyword search with hit count and up/down jump
- **GIVEN** 面板顶部有搜索输入框（由可复用的 `SearchBar` 组件提供，可在 MediaLibrary、fileTree 等场景共用）
- **WHEN** 用户输入关键字（仅匹配文件名，不含路径/大小等字段；大小写不敏感，空输入不执行搜索）
- **THEN** 面板 MUST 立即在前端过滤匹配的图片并显示命中数量（例如“2 / 5”代表第 2 个命中）
- **AND** 面板 MUST 提供“上一条/下一条”按钮，在命中项之间循环跳转并自动滚动到对应缩略图
- **AND** 当前命中的缩略图或文件名 MUST 高亮，以便用户识别

### Requirement: Preview Dialog Inserts Markdown into Body
Clicking a thumbnail MUST open a preview dialog that allows inserting Markdown into the editor body.

#### Scenario: Preview dialog with insert action
- **GIVEN** 用户在 mediaPanel 中点击任意缩略图
- **WHEN** 弹出预览对话框
- **THEN** 对话框 MUST 显示放大图片、路径、尺寸、大小、创建时间等信息（紧凑排版）以及“插入”和“关闭(X)”按钮
- **AND** 当用户点击“插入”时，系统 MUST 生成 Markdown 图片语法（`![](relative-path)`，`alt` 可留空）并插入到当前正文编辑器：若当前光标位于正文，则插入到光标处；若光标不在正文（例如标题或其它输入区域），则插入到正文末尾并追加换行
- **AND** 相对路径 MUST 基于当前文章 permalink 与 Hexo 构建后 `images/` 目录的位置计算，确保发布后能访问（如文章 permalink 为 `2025/test-article/`，图片 `images/image-name.jpg` 应插入为 `![](../../images/image-name.jpg)`）
- **AND** 单击缩略图弹出预览、双击缩略图 MUST 直接插入 Markdown 并关闭对话框；插入完成后对话框自动关闭并恢复正文焦点
- **AND** 当用户在编辑器中成功上传图片后，mediaPanel MUST 刷新并在顶部显示最新图片
