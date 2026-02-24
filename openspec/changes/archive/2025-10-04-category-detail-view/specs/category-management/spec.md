### Requirement: Category Detail Page Shows Directly Assigned Posts
CategoryPostsView MUST 只展示直接挂载在目标分类下的文章，排除挂在其子分类下的文章，并提示被过滤的数量。

#### Scenario: Direct posts shown, child-category posts filtered
- **GIVEN** 用户在 CategoriesView 点击某分类的"查看"
- **WHEN** 跳转到 `/categories/:id` 详情页并完成加载
- **THEN** 系统 MUST 调用 `getCategories()` 构建分类树，再调用 `getPosts(true, true, -1, 0, categoryId)` 拉取文章
- **AND** 前端 MUST 通过 `parent` 字段回溯父链，过滤掉挂在任一子分类下的文章，仅保留直接属于当前分类的文章
- **AND** 若存在被过滤的子分类文章，页面 MUST 以信息条提示"已过滤 X 篇子分类文章"
- **AND** 侧边导航 MUST 保持"分类"菜单高亮

#### Scenario: Empty result after filtering
- **GIVEN** 某分类下所有文章均挂在子分类下
- **WHEN** 过滤完成
- **THEN** 系统 MUST 展示空态"暂无文章（仅显示直接挂载的文章）"，并保留子分类文章数量提示

### Requirement: Bulk Replace Category For Posts
用户 MUST 能勾选文章后通过分类树弹窗批量替换这些文章的分类归属。

#### Scenario: Replace category assignments
- **GIVEN** 用户勾选若干文章并点击"批量修改"
- **WHEN** 在分类树弹窗中选择目标分类并确认
- **THEN** 系统 MUST 过滤掉与当前分类路径完全相同的目标，若无有效目标则阻止提交并提示
- **AND** 确认后调用 `window.site.replaceCategoryForPosts(categoryId, sources, replacements)`
- **AND** 成功后 MUST 刷新分类树与文章列表，展示"成功 X 条，失败 Y 条"摘要
- **AND** 操作进行中 MUST 禁用相关按钮并展示进度提示

### Requirement: Bulk Remove Category From Posts
用户 MUST 能一键移除当前分类在所有关联文章中的标签，操作前提示影响篇数与潜在"无分类"文章数量。

#### Scenario: Remove category tag from all direct posts
- **GIVEN** 用户点击"批量删除"并在确认弹窗中确认
- **WHEN** 操作执行
- **THEN** 系统 MUST 调用 `window.site.removeCategoryFromPosts(categoryId, sources)`
- **AND** 成功后 MUST 刷新分类树与文章列表；若该分类下已无直接文章则展示空态，但分类节点仍保留
- **AND** 返回 CategoriesView 时 MUST 重新拉取 `getCategories()` 以更新文章数量统计
