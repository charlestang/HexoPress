# ADR：API 契约的多层手工维护

## 问题陈述

HexoPress 同时支持 Electron 桌面模式和 Web 服务器模式，两种模式共用同一套渲染进程代码。为此，后端能力需要在四个层面同时声明或实现：

1. **类型层** (`types/local.d.ts` → `ISite` 接口)
2. **IPC 桥接层** (`main/preload.ts` → `contextBridge.exposeInMainWorld`)
3. **IPC 实现层** (`main/main.ts` → `ipcMain.handle`)
4. **HTTP 路由层** (`web/routes.ts` → Fastify 路由)

渲染进程通过 `src/bridge/` 抽象层调用后端，编译时由 Vite alias 决定走 `electron.ts`（转发到 `window.site.*`）还是 `web.ts`（转发到 HTTP fetch）。

## 现状

`src/bridge/web.ts` 实现了 `SiteBridge`（即 `ISite`）接口，TypeScript 编译器会强制它覆盖所有方法——这一层有静态保障。

但其余层之间没有任何静态约束：

- `preload.ts` 和 `main.ts` 之间靠 IPC channel 字符串（如 `'fs:readdir'`）匹配，拼错不报错
- `web.ts` 里的 fetch 路径（如 `'/api/fs/readdir'`）和 `web/routes.ts` 里的路由注册之间，同样靠字符串匹配

## 漂移现象

每次新增一个后端方法，需要改动六个文件：

```
FsAgent.ts / HexoAgent.ts   → 实现方法
main/main.ts                → ipcMain.handle('xxx:yyy', ...)
main/preload.ts             → xxx: (...) => ipcRenderer.invoke('xxx:yyy', ...)
types/local.d.ts            → ISite 接口加签名
web/routes.ts               → fastify.get/post('/api/xxx/yyy', ...)
src/bridge/web.ts           → xxx: (...) => apiGet/apiPost('/api/xxx/yyy', ...)
```

其中只有 `web.ts` 的改动受 TypeScript 约束，其余五处均为手工维护，无静态验证。

## 根本成因

架构存在两条平行的"字符串驱动协议"：

```
IPC 协议（Electron）
  preload.ts:  方法名 → IPC channel 字符串
  main.ts:     IPC channel 字符串 → 实现

HTTP 协议（Web）
  web.ts:      方法名 → URL 字符串
  routes.ts:   URL 字符串 → 实现
```

TypeScript 的类型系统无法约束字符串之间的匹配关系，因此两条协议的一致性只能靠人工保证。

## 可行方案

### 方案 A：维持现状（已选）

不做架构改动，接受六文件手工维护的成本。

### 方案 B：路由常量表

将所有 API 路径和 IPC channel 提取为共享常量：

```ts
// shared/api-contract.ts
export const IPC = { fsReaddir: 'fs:readdir', ... } as const
export const API = { fsReaddir: '/api/fs/readdir', ... } as const
```

`preload.ts`、`main.ts`、`web.ts`、`routes.ts` 均从此处引用，消灭魔法字符串。
改动文件数不变，但拼错会在编译时报错。

### 方案 C：Contract 驱动自动注册

设计一个统一的 contract 描述结构，从中自动生成 IPC 注册、preload 暴露、HTTP 路由注册。加一个方法只改一个地方。

代价：需要设计 `ContractMap` 类型、三个工厂函数、处理 GET/POST 参数序列化差异（IPC 直传对象，HTTP 需区分 query/body）、处理 `ArrayBuffer` 等特殊类型的跨协议转换。工程量较大，引入间接层后调试链路变长。

### 方案 D：覆盖测试

写测试枚举 `SiteBridge` 所有方法，验证 `web.ts` 里每个 fetch 路径在 `routes.ts` 里都有对应注册。不减少维护步骤，但能在 CI 阶段捕获漂移。

## 决策

**选择方案 A，维持现状。**

理由：

- 当前 API 面相对稳定，新增方法的频率不高，六文件维护的实际成本可接受
- 方案 C 的工程量与收益不成比例，且引入的间接层会增加日常调试的认知负担
- 方案 B 和 D 能降低漂移风险，但不解决根本问题，性价比有限
- `src/bridge/web.ts` 实现 `SiteBridge` 接口这一层已有 TypeScript 保障，最容易出错的"渲染进程调用点"已经收敛

## 维护约定

新增后端方法时，按以下顺序改动，逐一核对：

1. `FsAgent.ts` 或 `HexoAgent.ts` 实现方法
2. `types/local.d.ts` 的 `ISite` 接口加签名（TypeScript 会在下一步报错提醒）
3. `src/bridge/web.ts` 加 fetch 实现（编译器强制，不会遗漏）
4. `web/routes.ts` 加对应路由（手工，注意路径与 web.ts 一致）
5. `main/main.ts` 加 `ipcMain.handle`（手工，注意 channel 名）
6. `main/preload.ts` 加 `ipcRenderer.invoke`（手工，channel 名必须与第 5 步完全一致）
