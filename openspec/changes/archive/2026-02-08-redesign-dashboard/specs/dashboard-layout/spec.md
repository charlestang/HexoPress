## ADDED Requirements

### Requirement: Blog Profile 卡片展示博客身份信息
Dashboard 页面 MUST 在左上角（span=8）展示 Blog Profile 卡片，包含以下信息：博客标题（大字体）、副标题、描述、关键词（tag 样式）、作者、语言。数据来源为 `hexoConfig`。

#### Scenario: 正常加载 Profile
- **WHEN** 用户进入 Dashboard 页面且 hexoConfig 已加载
- **THEN** Profile 卡片展示博客标题、副标题、描述、关键词、作者和语言信息

#### Scenario: hexoConfig 未加载
- **WHEN** 用户进入 Dashboard 页面但 hexoConfig 为 null
- **THEN** Profile 卡片展示占位内容或加载状态，不显示空白

### Requirement: 统计数字嵌入 Profile 卡片
Profile 卡片底部 MUST 通过分隔线隔开，展示三个统计数字：已发布文章数、草稿数、页面数。

#### Scenario: 统计数字正常展示
- **WHEN** Profile 卡片渲染完成且 statsStore 数据已加载
- **THEN** 分隔线下方展示已发布数、草稿数、页面数三个统计值

### Requirement: 热力图卡片右上角展示
Dashboard 页面 MUST 在右上角（span=16）展示写作热力图，格子尺寸 MUST 比当前更小以适配缩窄的宽度。

#### Scenario: 热力图正常渲染
- **WHEN** 用户进入 Dashboard 页面且热力图数据已加载
- **THEN** 热力图在 span=16 的区域内完整展示，格子更小更精致

#### Scenario: 热力图与 Profile 卡片高度对齐
- **WHEN** 顶部两个卡片并排渲染
- **THEN** 两个卡片的高度视觉上保持一致（通过 flex stretch 或 min-height）

### Requirement: 最近发布列表
Dashboard 页面 MUST 在下方左侧（span=12）展示"最近发布"卡片，默认显示最近 5 篇已发布文章，每条包含文章标题（可点击跳转编辑器）和相对时间。

#### Scenario: 正常展示最近发布
- **WHEN** 用户进入 Dashboard 页面
- **THEN** "最近发布"卡片展示最近 5 篇已发布文章，日期显示为相对时间格式（如"3天前"）

#### Scenario: 点击文章标题
- **WHEN** 用户点击最近发布列表中的文章标题
- **THEN** 跳转到该文章的编辑器页面（FrameView）

#### Scenario: 点击"更多"加载
- **WHEN** 用户点击列表底部的"更多"链接
- **THEN** 追加加载下一批 5 篇文章，卡片出现内部滚动条（max-height 限制），不改变卡片外部高度

### Requirement: 草稿箱列表
Dashboard 页面 MUST 在下方右侧（span=12）展示"草稿箱"卡片，默认显示最近 5 篇草稿，每条包含草稿标题（可点击跳转编辑器）和相对时间。

#### Scenario: 正常展示草稿箱
- **WHEN** 用户进入 Dashboard 页面
- **THEN** "草稿箱"卡片展示最近 5 篇草稿，日期显示为相对时间格式

#### Scenario: 草稿为空
- **WHEN** 用户没有任何草稿
- **THEN** 草稿箱卡片展示空状态提示（如"暂无草稿"）

#### Scenario: 点击"更多"加载草稿
- **WHEN** 用户点击草稿箱底部的"更多"链接
- **THEN** 追加加载下一批 5 篇草稿，卡片出现内部滚动条

### Requirement: 移除 Site Config 和 Overview 系统信息
Dashboard 页面 MUST NOT 展示 Site Config 卡片（permalink、date_format、time_format、theme、source_dir、url、timezone）。Dashboard 页面 MUST NOT 展示系统信息（Package Name、Package Version、Hexo Version）。

#### Scenario: Site Config 不再展示
- **WHEN** 用户进入 Dashboard 页面
- **THEN** 页面不包含 Site Config 卡片和 Overview 中的系统信息区域

### Requirement: 样式使用 UnoCSS
Dashboard 页面的样式 MUST 使用 UnoCSS utility classes，替换现有的 scoped CSS。

#### Scenario: 无 scoped CSS 残留
- **WHEN** Dashboard 页面重构完成
- **THEN** `<style scoped>` 块中不包含旧的布局样式，所有样式通过 UnoCSS class 实现
