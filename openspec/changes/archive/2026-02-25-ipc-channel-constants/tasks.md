## 1. 创建常量文件

- [x] 1.1 新建 `shared/ipc-channels.ts`，定义 `IPC` as const 对象，包含 `main/main.ts` 中全部 28 个 channel 字符串

## 2. 替换 main.ts

- [x] 2.1 在 `main/main.ts` 顶部引入 `IPC` 常量
- [x] 2.2 将所有 `ipcMain.handle('...',` 的字符串参数替换为对应的 `IPC.*` 常量

## 3. 替换 preload.ts

- [x] 3.1 在 `main/preload.ts` 顶部引入 `IPC` 常量
- [x] 3.2 将所有 `ipcRenderer.invoke('...',` 的字符串参数替换为对应的 `IPC.*` 常量

## 4. 验证

- [x] 4.1 运行 `npm run check-all`，确认无 TS 错误
- [x] 4.2 运行 `npm run test`，确认无回归
- [x] 4.3 确认 `main.ts` 和 `preload.ts` 中不再存在 IPC channel 字符串字面量
