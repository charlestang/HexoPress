## MODIFIED Requirements

### Requirement: Editor Log Hygiene

编辑器在生产运行环境下 **MUST** 不输出调试日志，且功能对应的日志信息 **SHALL** 准确。

#### Scenario: Correct log message for font size increase

- **WHEN** 用户点击“增大字号”按钮
- **THEN** 系统执行 `onFontBig` 函数
- **AND** **SHALL** 不输出错误的 `onFontSmall` 信息

#### Scenario: Clean console during normal operation

- **WHEN** 用户进行编辑、上传图片、保存文章等操作
- **THEN** 控制台 **SHALL** 不输出 `filterImage`、`upsertDraft` 等调试性质的 `console.log` 信息
