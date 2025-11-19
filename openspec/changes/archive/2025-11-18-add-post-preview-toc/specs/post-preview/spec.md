## ADDED Requirements
### Requirement: Post Preview Dialog Shows Navigable TOC
The post preview dialog MUST provide a navigable table of contents alongside the rendered article for easier section jumping.

#### Scenario: Two-column layout with TOC and content
- **GIVEN** 用户在文章列表页打开“预览”弹窗查看文章 `P`
- **WHEN** 弹窗渲染内容
- **THEN** 弹窗 MUST 采用左右两列布局，左侧为目录（较窄），右侧为正文（较宽）；弹窗宽度可适当加宽以适配双栏

#### Scenario: TOC limited to three levels with numbering
- **GIVEN** 文章 `P` 包含层级标题
- **WHEN** 目录生成
- **THEN** 目录 MUST 仅展示前 3 级标题；下级标题显示缩进；**实际最顶级标题级别（h1/h2/h3 中出现的最高级）前 MUST 显示章节序号（1., 2., ...），其余子级不编号**，以便辨识章节数量

#### Scenario: Clicking TOC scrolls preview to heading
- **GIVEN** 目录已展示且正文可滚动
- **WHEN** 用户点击任一目录项
- **THEN** 右侧正文区域 MUST 滚动并定位至对应标题位置
- **AND** 定位应平滑或瞬时但准确，无跳转错误
