## Why

修复 `EditorMain.vue` 中的代码拷贝粘贴引起的错误，并清理冗余的调试日志，提高代码质量和控制台整洁度。

## What Changes

- 修复 `onFontBig` 函数中错误的 `console.log` 内容（由 `onFontSmall` 修正为 `onFontBig`）。
- 移除 `src/components/EditorMain.vue` 中所有非必要的 `console.log` 调试语句。

## Capabilities

### Modified Capabilities
- `editor-ux`: 提升编辑器组件的运行环境整洁度，移除调试信息。**SHALL** 确保控制台无冗余输出。

## Impact

- `src/components/EditorMain.vue`: 逻辑修正与日志清理。
