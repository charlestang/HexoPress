### Requirement: Delete Single Asset From Media Library
MediaLibraryView MUST 为 `png`/`jpg` 格式资源提供单个删除入口，删除前需二次确认并提示引用风险，执行中防止重复提交。

#### Scenario: Delete button shown only for supported formats
- **GIVEN** 媒体库列表加载完成
- **THEN** 系统 MUST 仅对 `png`/`jpg` 格式的资源行显示"删除"操作按钮
- **AND** 其他格式（`gif`、`svg` 等）的资源行 MUST 不显示删除入口

#### Scenario: Confirmation dialog warns about references
- **GIVEN** 用户点击某资源行的"删除"按钮
- **WHEN** 确认弹窗弹出
- **THEN** 弹窗文案 MUST 包含"可能有文章引用，删除后导致图片显示为空白"的风险提示
- **AND** 用户取消时 MUST 不触发任何删除请求

#### Scenario: Successful deletion updates list
- **GIVEN** 用户在确认弹窗中点击确定
- **WHEN** 删除执行
- **THEN** 系统 MUST 禁用该按钮（或显示加载态）防止重复提交
- **AND** 后端 MUST 删除对应磁盘文件并更新 Hexo 资产数据库，使后续 `getAssets()` 不再返回该记录
- **AND** 前端 MUST 重新调用 `getAssets()` 刷新列表，已删除资源不再出现
- **AND** 系统 MUST 通过 `ElMessage` 提示"删除成功"

#### Scenario: Failed deletion shows error and restores button
- **GIVEN** 删除请求失败（文件不存在或文件系统报错）
- **WHEN** 错误返回
- **THEN** 系统 MUST 展示包含错误详情的 `ElMessage` 提示
- **AND** 删除按钮 MUST 恢复可点击状态，列表保持原状
