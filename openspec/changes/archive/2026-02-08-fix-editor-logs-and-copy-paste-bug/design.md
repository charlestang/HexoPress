## Context

`EditorMain.vue` 包含多个用于开发阶段调试的 `console.log` 语句，这些语句在正式代码中应当被清理。同时 `onFontBig` 函数中存在一个明显的文案错误。

## Goals

- 修正 `onFontBig` 的日志/逻辑误导。
- 清理冗余日志。

## Decisions

### Decision 1: Remove all development console logs

移除 `src/components/EditorMain.vue` 中所有用于追踪函数执行流程或打印中间状态的 `console.log` 调用。具体涉及：
- 图片过滤与路径转换逻辑
- 文章保存、发布、删除流程
- 目录生成逻辑
- 字号调整逻辑
