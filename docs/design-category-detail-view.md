# 分类详情页面技术方案

## 1. 背景与目标
- **现状问题**：分类管理页的“查看”操作跳转浏览器查看线上页面，无法在客户端内快速清点、整理分类下的文章。
- **业务诉求**：提供一个专用详情页，便于作者审视分类结构、单篇或批量调整分类标签，最终让分类覆盖更均衡、命名更准确。
- **主要目标**：
  1. 在应用内部实现分类详情页，延续侧栏导航高亮与面包屑体验。
  2. 展示直接挂载在该分类下的文章（排除子分类文章），支持排序、加载和空态提示。
  3. 支持三种分类整理动作：单篇移除标签、批量重命名分类、批量删除分类。
  4. 操作后刷新前端缓存与分类统计，确保数据一致。

## 2. 功能拆分与需求对应
| 功能块 | 需求对应 | 关键点 |
| --- | --- | --- |
| 路由与导航 | 需求《功能与验收细项》导航部分 | 新增 `/categories/:id` 页面，面包屑、返回逻辑、导航高亮、返回后刷新分类统计 |
| 数据加载与过滤 | 数据加载章节、父子分类过滤 | `getPosts(categoryId)` -> 前端过滤掉子分类文章，保留直接挂载项，默认按 `updated` -> `date` 排序 |
| 单篇分类移除 | 分类标签操作 · 单篇 | `ElTag` closable + 二次确认，可清空所有分类，成功后更新行/移除文章；失败回滚 |
| 批量重命名 | 分类标签操作 · 批量重命名 | 入口、确认对话框、合并提示、调用批量 API、更名后刷新列表/面包屑 |
| 批量删除 | 分类标签操作 · 批量删除 | 入口、确认对话框、执行后清空列表、分类统计变 0、节点保留 |
| 进度反馈 | 技术提示补充 | 批量操作显示进度/禁用按钮/成功失败数量提示 |
| 缓存刷新 | 技术提示、导航说明 | 操作后刷新当前列表、分类统计、面包屑；返回分类页时重新拉取 `getCategories()` |

## 3. 数据与系统设计
### 3.1 数据流概览
```
Renderer(CategoryPostsView)
    ├─ window.site.getPosts(categoryId, { limit: -1, includeDraft: true })
    │      ↓
    ├─ 前端过滤：根据 Category tree 节点识别子分类 → 得到直接挂载的文章列表
    │      ↓
    ├─ 展示列表 + 分类标签，支持单篇/批量操作
    │      ↓
    ├─ 单篇移除 → window.site.updatePostCategories(postId, categories)
    │
    ├─ 批量重命名 → window.site.renameCategory(categoryId, newName, { merge: boolean })
    │
    └─ 批量删除 → window.site.removeCategoryFromAllPosts(categoryId)
```

### 3.2 渲染层设计
- **新页面组件**：`src/views/CategoryPostsView.vue`
  - 响应式 state：
    - `currentCategoryId`、`categoryInfo`（名称、父路径、文章总数/子分类信息）。
    - `posts`、`loading`、`error`。
    - `bulkState`：记录批量操作进度（整体百分比、成功数、失败数、当前处理文章 ID、isRunning 等）。
  - 依赖：`useRoute`, `useRouter`, `useI18n`, `useCategoryTree`（或扩展 hook 用于子分类过滤）。
  - 生命周期：
    1. 页面加载或路由参数变化 → 调用 `fetchCategoryInfo()`（从分类树或缓存拿名称/路径/父级）。
    2. 调用 `window.site.getPosts` 拉取文章 → `filterPostsForCategory()` 过滤。
    3. 根据过滤结果更新列表、空态提示。
  - UI 结构：
    - 面包屑：`分类（共 N 个） << 分类名称（返回）`。
    - 操作区：
      - 批量重命名按钮（`ElButton type="primary"`）。
      - 批量删除按钮（`ElButton type="danger"`）。
      - 操作进行中时禁用/显示进度。
    - 列表：`ElTable`
      - 列：标题、状态、最后更新时间、分类标签列（`ElTag` + closable）。
      - 标题列点击：`router.push({ name: 'Editor', params: { id: ... } })`；进入编辑器后用户返回 → `PostListView`。

- **状态缓存**：
  - 可将 `posts` 缓存在组件局部；离开页面后不持久化。
  - 返回分类页前，触发 `window.site.getCategories` 更新分类统计。

### 3.3 子分类过滤逻辑
- 输入：
  - 当前分类节点的 ID（来自路由参数）。
  - `window.site.getPosts` 返回的文章数组，每篇包含 `categories` 字段（树状列表）或 `categoryIds`（如有）。
- 处理：
  1. 使用 `useCategoryTree` 的 `nodeMap` 根据当前节点 ID 获取其所有子节点 IDs（通过 DFS）。
  2. 对每篇文章，检查其 FrontMatter `categories`（二维数组）中是否存在路径是 `currentCategory -> ...` 且长度 > 1。若存在，则视为子分类文章 → 排除。
  3. 若文章同时存在 `['工作心得']` 和 `['技术', '工作心得']` 两条路径，只要有直接挂载（长度为 1 且等于当前分类）则保留。
- 输出：保留直接挂载的文章列表。

### 3.4 批量操作流程
#### 3.4.1 单篇移除
1. 用户点击标签 `X` → 弹出 `ElMessageBox.confirm`。
2. 确认后：
   - 计算新的分类集合（移除当前分类）。
   - `await window.site.updatePostCategories(post.id, newCategories)`。
   - 成功 → 更新该行数据，若已不含当前分类则从列表移除。
   - 失败 → `ElMessage.error`，恢复标签显示。

#### 3.4.2 批量重命名
1. 点击“批量重命名”按钮 → 打开对话框：输入新名称、显示受影响文章数量（列表长度）。
2. 若新名称与现有分类重名，确认对话框追加“是否合并到现有分类”提示（merge = true）。
3. 用户确认 → 执行批量任务：
   - 遍历当前列表文章：
     - 对每篇文章生成新的分类路径（`currentCategory` → `newName`，保留其它分类）。
     - 调用 `updatePostCategories`（或新接口 `bulkUpdatePostCategories` 逐批）。
     - 进度条/提示：显示 `已处理 X/Y`。
     - 捕获失败：记录失败列表。
   - 完成后：
     - 重新拉取 `getPosts` + 过滤。
     - 更新面包屑标题（使用新名称）。
     - 通过 `ElMessage` 显示成功/失败数量。
     - 触发 `window.site.getCategories()` 刷新统计。

> 若数据量较大，可考虑后端提供批量接口，一次传递文章 ID 列表以减少 IPC 次数；方案里预留两种实现路径。

#### 3.4.3 批量删除
1. 点击按钮 → 确认弹窗提示将影响 `posts.length` 篇文章，提醒不可逆。
2. 用户确认 → 同样逐篇或批量调用分类更新接口，移除当前分类。
3. 完成后：
   - 列表应为空 → 显示空态。
   - `ElMessage` 显示结果。
   - 调用 `window.site.getCategories()` 刷新分类统计（该分类文章数应为 0）。

### 3.5 后端与 IPC
#### 3.5.1 新增 / 扩展接口
| API | 调用方 | 说明 |
| --- | --- | --- |
| `window.site.updatePostCategories(postId, categories)` | 单篇移除 & 批量流程 | 若已存在，可直接复用；需确保支持传入空数组（文章无分类）。|
| `window.site.renameCategory(categoryId, newName, merge?)` | 批量重命名 | 封装批量更新逻辑；内部实现：找到所有含该分类的文章，替换 FrontMatter，若 `merge=true`，则将旧分类路径替换为已有分类路径。 |
| `window.site.removeCategoryFromAllPosts(categoryId)` | 批量删除 | 移除所有文章中的该分类标签；执行后调用 `HexoAgent.updateCache()` 保证数据库一致。 |

> 若短期难以推出批量接口，也可在渲染层循环调用 `updatePostCategories`。不过考虑 50+ 篇文章场景，建议在主进程/HexoAgent 层提供批量实现减少 IO 次数。

#### 3.5.2 HexoAgent 层实现建议
- **工具函数**：
  - `getCategoryDescendants(categoryId)`：从 Hexo 数据库计算子分类集合。
  - `listPostsByCategory(categoryId)`：返回包含该分类的文章记录（含草稿、已发布）。
  - `updatePostFrontMatter(sourcePath, updater)`：读取文章文件，修改 FrontMatter 后写回。
- **批量重命名**：
  - 遍历目标文章：替换 `categories` 数组中路径中的旧名称。
  - 若合并到已有分类，需要去重，避免重复路径。
- **批量删除**：
  - 同样遍历文章，移除分类后保存。
  - 若分类下文章全部被清空，保留分类节点（Hexo 会在无文章时 length=0）。
- 执行完批量操作后调用 `updateCache()` 或 `this.hexo.load()` 刷新数据库，再返回处理结果统计。

## 4. 错误处理与用户反馈
- 所有操作提供 `ElMessage` 成功/失败提示；批量操作完成后输出 `成功 X 条，失败 Y 条`。
- 批量操作进行中禁用相关按钮，切换按钮文案（例如“重命名中… (3/20)”）。
- 若部分失败，可提供“查看失败详情”按钮（展开列出失败文章标题，后续手动处理）。
- 网络或文件写入异常需捕获并返回清晰错误信息（如“文件写入失败：xxx.md”）。

## 5. 风险与缓解
| 风险 | 描述 | 缓解措施 |
| --- | --- | --- |
| 批量操作耗时长 | 60+ 篇文章逐一写文件 | 主进程实现批量处理、异步逐步反馈、进度提示 |
| 分类合并冲突 | 新名称与其他分类同名 | 二次确认“合并”逻辑，代码中去重处理 |
| 前端过滤失误 | 子分类识别错误导致遗漏或错误展示 | 使用分类树 nodeMap + 深度遍历确保覆盖；编写单元测试验证 |
| 返回数据延迟 | 返回分类页未刷新最新数量 | 在 `beforeRouteLeave` 或返回按钮事件中重新拉取 `getCategories()` |
| 编辑页面导航差异 | 用户从编辑页返回期望与实际不同 | 在面包屑说明“从编辑器返回将进入文章列表”或保留当前行为但文档说明 |

## 6. 验证方案
1. **手动场景**（与需求文档一致）：
   - 有/无子分类场景下的数据加载与空态。
   - 单篇移除、批量重命名、批量删除的成功/失败路径。
   - 批量操作进度展示、部分失败提示。
   - 批量删除后返回分类页，文章数为 0。
2. **自动化**：
   - `CategoryPostsView` 单元测试：过滤逻辑、按钮状态、进度状态。
   - 主进程/HexoAgent 单元测试：批量重命名/删除对 FrontMatter 的处理。
   - 集成测试（如有）：模拟 IPC 调用链、验证返回数据更新。
3. **回归**：
   - `npm run lint`、`npm run test`。
   - 重点关注 `CategoriesView`, `HexoAgent`, `router` 等相关模块。

## 7. 实施阶段划分
1. **基础搭建**：新增路由与 `CategoryPostsView`，可展示过滤后的文章列表（无操作）。
2. **单篇操作**：实现标签 `X` 移除分类，更新数据与提示。
3. **批量重命名**：实现对话框、合并确认、批量 API。
4. **批量删除**：实现确认弹窗、批量移除逻辑。
5. **进度反馈与错误处理**：完善批量操作的进度/失败提示，刷新分类统计。
6. **测试与文档**：补充单元/集成测试，更新用户文档/帮助。

