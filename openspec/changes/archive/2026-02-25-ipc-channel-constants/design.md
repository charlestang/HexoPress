## Context

HexoPress 主进程通过 Electron IPC 与渲染进程通信。`main/main.ts` 注册 handler，`main/preload.ts` 通过 contextBridge 暴露调用方法，两侧各自写字符串字面量（如 `'post:save'`），TypeScript 无法验证它们是否一致。

当前共有约 28 个 IPC channel，分布在两个文件中，全部为手工维护的魔法字符串。

## Goals / Non-Goals

**Goals:**
- 将所有 IPC channel 字符串提取到 `shared/ipc-channels.ts` 单一文件
- `main.ts` 和 `preload.ts` 均从该文件引用，消灭重复字符串
- 拼写错误或遗漏引用在 `npm run check-all` 阶段即可发现

**Non-Goals:**
- HTTP 路由字符串（`web/routes.ts`、`src/bridge/web.ts`）不在本次范围内
- 不改变 IPC 通信的运行时行为
- 不引入 contract 驱动的自动注册（方案 C）

## Decisions

**常量文件放在 `shared/` 目录**

`shared/` 已用于主进程与 web 服务器之间的共享代码（如 `shared/config.ts`）。`ipc-channels.ts` 放在此处语义清晰，且不会被渲染进程的 Vite 打包误引入。

**使用 `as const` 对象而非枚举**

```ts
export const IPC = {
  agentInit: 'agent:init',
  postSave: 'post:save',
  // ...
} as const
```

- 比 `enum` 更轻量，编译产物为普通对象
- `as const` 使值类型收窄为字面量类型，可用于类型推导
- 不引入额外的运行时开销

**不拆分命名空间对象**

所有 channel 放在单一 `IPC` 对象中，而非按 `IPC_POST`、`IPC_FS` 等分组。原因：channel 数量（~28）不多，单一对象更易于全局搜索和 IDE 自动补全。

## Risks / Trade-offs

- [风险] 机械替换过程中遗漏某个 channel → `npm run check-all` 会报 TS 错误，可在提交前发现
- [风险] `shared/` 目录被渲染进程 Vite 配置误引入 → 检查 `vite.config.renderer.ts` 的 alias/exclude 配置，确认不影响前端打包
