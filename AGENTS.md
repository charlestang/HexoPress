
# AGENTS.md — Repository Root

## Scope & Precedence

- 此文件适用于 **整个仓库**（目录根：`/`）的所有内容。
- 若子目录存在自己的 `AGENTS.md`，**子目录文件优先级更高**，对该子树进行覆盖或补充。
- 若与**直接的系统/开发者/用户指令**冲突，以后者为准。
- 与开发者沟通，请使用中文，而提交代码撰写 commit message 时候，请保持英文。

## Project Layout

- 代码组织：
  - `blog/`：HexoPress 可以用来管理的博客示例，未来里面的文章是 HexoPress 的操作手册
  - `docs/`：项目的文档，给 GitHub 的 README 引用的截屏，编码规范，贡献指南等，还有一些产品需求，以及对应的设计文档
  - `main/`：Electron 主进程代码，入口是 `main.ts`，`lib/`目录下，主要是运行在主进程中的模块，`preload.ts` 是 Electron 进程和渲染进程通信的桥梁
  - `shared/`：主进程和渲染进程共享的代码，一些无状态的工具函数，日期处理，数组处理等等
  - `src/`: 渲染进程代码，入口是 `renderer.ts`，主要是运行在渲染进程中的模块
  - `tsconfig/`：主要放`tsc`命令和`vue-tsc`命令的配置文件，用于 lint 和构建
  - `types/`：全局类型声明文件
- 入口与构建：
  - Node ≥ 20.8.1；npm >= 10.5.5
  - 必须使用 `npm`

## Style & Conventions (Repository-wide)

- 命名：
  - 代码：`camelCase`（变量/字段），`PascalCase`（类/Type）
- 代码风格：
  - eslint + prettier，配置位于 `/eslint.config.mjs`、`/.prettierrc*`、`/.prettierignore`
- 提交信息（Commit）：
  - Conventional Commits：`feat: ...` / `fix: ...` / `docs: ...` / `refactor: ...`

## Tests & Run

- 单元测试：
  ```bash
  npm run test
  ```
- 本地启动：
  ```bash
  npm run dev
  ```
- 代码检查：
  ```bash
  npm run lint
  ```
- 格式化：
  ```bash
  npm run format
  ```

## Programmatic Checks (MANDATORY)

> **如果修改了代码，在提交之前，都必须运行以下检查并确保通过。**
> **如果修改了`docs/` 以外的文档（`.md` 文件），必须执行 `npm run format` 来格式化。**

```bash
# 1) 安装依赖
npm install

# 2) 代码质量
npm run format
npm run lint --fix
npm run check-all

# 3) 测试
npm run test

# 4) 工作区干净（必须提交，且无未跟踪/未提交文件）
git status --porcelain
# 预期输出为空；否则请提交或清理
```

- 任何一步失败都不得合入。

## Git Workflow (MANDATORY)

- **保持主干线性提交记录**
- **分支合入主干之后立即删除分支**，避免长期存在的分支引起混乱
- **分支提交 PR 之前，需要先 rebase 最新主干**，避免不必要的合并提交
- **每次提交尽量完备** 每个 commit 都是一个完整的、可运行的单元，里面修改的内容相对内聚，可以通过 `--amend` 参数不断往一个 commit 里添加修改，直到满足完备要求
- 完成改动后执行：
  ```bash
  git status    # 应无改动
  ```

## Pull Request Message (REQUIRED SECTIONS)

提交 PR 时，请严格按照以下结构书写描述（可由模板自动生成）：

- **What**：本次变更做了什么（要点列表 + 受影响模块/文件目录）
- **Why**：动机/问题背景（链接到 issue/讨论）
- **How**：实现要点（关键设计/接口变化/迁移步骤）
- **Risk**：潜在风险与兼容性说明（含破坏性变更）
- **Test Evidence**：测试方式与结果（命令输出摘要、截图、覆盖率变化）
- **Rollback Plan**：回滚策略（如何快速还原以及数据迁移回滚手段）
- **Related**：关联 issue/PR/文档链接

## Common Pitfalls & Fixes

- **类型检查配置分离**：如果修改了 `.vue` 文件，请在项目根目录下执行 `npm run vue-check`，如果修改了 `main` 目录下的文件，请执行 `npm run node-check`，如果修改了测试文件，请执行 `npm run vitest-check`。如果一次修改的文件较多，涉及多种类型，也可以执行 `npm run check-all`，就会按顺序执行上述各种检查，会比较简单。
- **Element Plus 组件桩**：在测试里直接 `v-model`/监听事件时，记得给 stub 指定 props/emit 定义及类型断言，否则 `vue-tsc` 会把 `props.data` 推断为 `unknown` 并产生 TS2345/TS2532。
- **异步侦听器**：组件中常见多层 `nextTick` 更新（如 `watch` 里调用 `setCurrentKey`）。测试断言需封装 `await nextTick()` 两次的 `flush` 助手，避免竞态或未触发的期望。
- **隐式 any**：模板内联箭头函数（`@update:modelValue="(val) => emit(...)"` 等）在 TS 检查下会报 TS7006，优先将处理器提取为命名函数。
- **Array.prototype.at**：不同 tsconfig 的 `lib` 设置差异使 `.at()` 未必可用。测试/工具代码若需要末尾元素，可使用 `arr[arr.length - 1]` 或封装助手函数。
- **示例博客修改**：`blog/` 目录被视作演示数据，修改前确认是否影响文档或示例。若需写操作，优先通过应用逻辑或在测试中使用临时副本。
- **UnoCSS 渐进迁移**：部分页面已改用 UnoCSS，其余仍保留旧样式体系。新增页面优先选择 UnoCSS，并复用 `src/uno.config.ts` 中的预设；若修改旧页面，确认是否需要同步迁移，避免同一页面混杂两套写法。更新规范时请在此文档记录。
