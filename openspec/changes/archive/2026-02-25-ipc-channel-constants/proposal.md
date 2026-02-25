## Why

`main/main.ts` 和 `main/preload.ts` 中的 IPC channel 字符串（如 `'post:save'`、`'fs:readdir'`）各自独立维护，两处拼写必须完全一致，但 TypeScript 无法静态验证——拼错只能在运行时发现。将这些字符串提取为共享常量后，编译器可在构建阶段捕获不一致，重命名时也只需改一处。

## What Changes

- 新增 `shared/ipc-channels.ts`，以 `as const` 对象导出全部 IPC channel 名称
- `main/main.ts` 中所有 `ipcMain.handle(...)` 的 channel 参数改为引用常量
- `main/preload.ts` 中所有 `ipcRenderer.invoke(...)` 的 channel 参数改为引用常量
- HTTP 路由字符串（`web/routes.ts`、`src/bridge/web.ts`）本次不处理

## Capabilities

### New Capabilities

- `ipc-channel-constants`：IPC channel 名称的单一真相源，消灭主进程两侧的魔法字符串

### Modified Capabilities

（无——本次为纯重构，不改变任何运行时行为或对外接口）

## Impact

- 新增文件：`shared/ipc-channels.ts`
- 修改文件：`main/main.ts`、`main/preload.ts`
- 渲染进程、`src/bridge/`、`web/routes.ts` 均不受影响
- 无 breaking change，无运行时行为变化
- 构建产物不变（常量在编译时内联）
