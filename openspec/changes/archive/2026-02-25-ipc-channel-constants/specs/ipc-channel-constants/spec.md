## ADDED Requirements

### Requirement: IPC channel 名称集中定义
所有 IPC channel 字符串 SHALL 在 `shared/ipc-channels.ts` 中以 `as const` 对象统一定义，不得在其他文件中出现字符串字面量形式的 channel 名称。

#### Scenario: 常量文件包含全部 channel
- **WHEN** 开发者查看 `shared/ipc-channels.ts`
- **THEN** 文件中的 `IPC` 对象包含 `main/main.ts` 中所有 `ipcMain.handle` 调用所用的 channel 名称

#### Scenario: main.ts 不含魔法字符串
- **WHEN** 对 `main/main.ts` 执行字符串搜索（如 `'post:save'`）
- **THEN** 不存在任何 IPC channel 字符串字面量，所有引用均通过 `IPC.*` 常量

#### Scenario: preload.ts 不含魔法字符串
- **WHEN** 对 `main/preload.ts` 执行字符串搜索（如 `'post:save'`）
- **THEN** 不存在任何 IPC channel 字符串字面量，所有引用均通过 `IPC.*` 常量

### Requirement: 编译时一致性保障
`shared/ipc-channels.ts` 中的常量值 SHALL 与原有字符串字面量完全一致，确保替换后运行时行为不变。

#### Scenario: 类型检查通过
- **WHEN** 运行 `npm run check-all`
- **THEN** 所有类型检查通过，无 TS 错误

#### Scenario: 单元测试通过
- **WHEN** 运行 `npm run test`
- **THEN** 所有测试通过，无回归
