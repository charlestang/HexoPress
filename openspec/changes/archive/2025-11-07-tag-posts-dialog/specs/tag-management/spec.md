### Requirement: View Tag Posts In-App Dialog
TagsView 的"查看"操作 MUST 在应用内弹出 TagPostsDialog，展示该标签下的关联文章列表，不再跳转外部站点。

#### Scenario: Dialog opens with post list
- **GIVEN** 用户在 TagsView 中点击任意标签行的"查看"
- **WHEN** TagPostsDialog 打开
- **THEN** 系统 MUST 调用 `window.site.getPosts(true, true, -1, 0, '', '', '', tagId)` 拉取该标签下的全部文章
- **AND** 对话框标题 MUST 展示"{标签名} · 标签文章（共 N 篇）"，N 为返回结果数量
- **AND** 列表 MUST 展示文章标题、所属分类路径（`父级 > 子级` 格式）、关联标签

#### Scenario: Empty tag shows empty state
- **GIVEN** 某标签下无关联文章
- **WHEN** TagPostsDialog 打开并完成加载
- **THEN** 系统 MUST 展示空态提示"暂无文章关联该标签"

#### Scenario: Load failure shows retry
- **GIVEN** 拉取文章列表时接口失败
- **WHEN** 错误发生
- **THEN** 对话框 MUST 展示错误提示与"重试"按钮，加载期间禁止重复触发

#### Scenario: Dialog close clears state
- **GIVEN** 用户关闭 TagPostsDialog
- **WHEN** 再次打开同一或不同标签的对话框
- **THEN** 系统 MUST 重新加载数据，不残留上次的文章列表或错误状态
