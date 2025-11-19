## ADDED Requirements
### Requirement: Preview Top-Level Headings Use Emphasized Style
The preview dialog MUST render top-level headings with prominent styling and automatic numbering to improve readability.

#### Scenario: Top-level headings get blue styling and numbering
- **GIVEN** 用户在文章预览弹窗中查看正文，正文包含多级标题（例如 `##` 渲染为 h2，`###` 渲染为 h3）
- **WHEN** 预览渲染正文
- **THEN** 实际最高级标题（正文内出现的最小级别，如 h2 或 h1）MUST 使用深蓝色文字、粗 3px 底边线（约 1/3 行宽）并自动编号；标题上下留更大间距，避免贴近正文
- **AND** 紧邻的次级标题（顶级的下一层级）MUST 使用深蓝色文字与 1px 底边线（约 1/3 行宽），不编号
- **AND** 其它更低级标题保持原样式且不编号
- **AND** 样式作用范围 MUST 限定在预览内容区域，不影响源 Markdown 或其他页面
