# 分类详情页面技术方案

## 1. 背景与目标
- **现状问题**：分类管理页的“查看”操作跳转浏览器查看线上页面，无法在客户端内快速清点、整理分类下的文章。
- **业务诉求**：提供一个专用详情页，便于作者审视分类结构、批量调整分类标签，最终让分类覆盖更均衡、命名更准确。
- **主要目标**：
  1. 在应用内部实现分类详情页，延续侧栏导航高亮与面包屑体验。
  2. 展示直接挂载在该分类下的文章（排除子分类文章），支持排序、加载和空态提示。
  3. 支持两种分类整理动作：批量修改分类、批量删除分类。
  4. 操作后刷新前端缓存与分类统计，确保数据一致。

## 2. 功能拆分与需求对应
| 功能块 | 需求对应 | 关键点 |
| --- | --- | --- |
| 路由与导航 | 需求《功能与验收细项》导航部分 | 新增 `/categories/:id` 页面，面包屑、返回逻辑、导航高亮、返回后刷新分类统计 |
| 数据加载与过滤 | 数据加载章节、父子分类过滤 | `getPosts(categoryId)` -> 前端过滤掉子分类文章，保留直接挂载项，默认按 `updated` -> `date` 排序 |
| 批量修改 | 分类标签操作 · 批量修改 | 勾选文章、选择目标分类树、调用批量 API 替换分类集合、刷新列表/面包屑 |
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
    ├─ 展示列表 + 分类标签，支持批量操作
    │      ↓
    ├─ 批量修改 → window.site.replaceCategoryForPosts(categoryId, sources[], replacements[][])
    │
    └─ 批量删除 → window.site.removeCategoryFromPosts(categoryId, sources[])
```

### 3.2 渲染层设计
- **新页面组件**：`src/views/CategoryPostsView.vue`
  - 响应式 state：
    - `categoryId`、`categoryPath`（名称路径）。
    - `rawPosts`、`loading`、`error`。
    - `bulkState`：记录批量操作状态、当前执行的动作、结果摘要。
  - 依赖：`useRoute`, `useRouter`, `useI18n`, `useCategoryTree`（或扩展 hook 用于子分类过滤）。
  - 生命周期：
    1. 页面加载或路由参数变化 → 调用 `fetchCategoryInfo()`（从分类树或缓存拿名称/路径/父级）。
    2. 调用 `window.site.getPosts` 拉取文章 → `filterPostsForCategory()` 过滤。
    3. 根据过滤结果更新列表、空态提示。
  - UI 结构：
    - 面包屑：`分类（共 N 个） << 分类名称（返回）`。
    - 操作区：
      - 批量修改按钮（`ElButton type="primary"`）。
      - 批量删除按钮（`ElButton type="danger"`）。
      - 操作进行中时禁用/显示进度。
    - 列表：`ElTable`
      - 列：标题、状态、最后更新时间、分类路径列（`ElTag` 展示 `父级 > 子级`，仅展示标签）。
      - 标题列点击：`router.push({ path: '/frame', query: { sourcePath } })`。

- **状态缓存**：
  - 可将 `posts` 缓存在组件局部；离开页面后不持久化。
  - 返回分类页前，触发 `window.site.getCategories` 更新分类统计。

### 3.3 子分类过滤逻辑
- 输入：
  - 当前分类节点的 ID（来自路由参数）。
  - `window.site.getPosts` 返回的文章数组，每篇携带 `categories`（数组，元素含 `_id`、`name`、`parent`）。
- 处理：
  1. 使用 `useCategoryTree` 的 `nodeMap` 辅助，通过 `parent` 字段回溯父链。
  2. 若文章包含与当前分类同 `_id` 的分类，则标记为“直接挂载”，加入展示列表。
  3. 若未直接命中，则沿着各分类的 `parent` 链逐级回溯，判断是否存在祖先为当前分类；若存在则计入“子分类命中”数量，用于过滤提示，不纳入列表。
- 输出：
  - 直接挂载文章列表（用于表格展示）。
  - 仅子分类命中的数量（用于顶部提示“已过滤 X 篇子分类文章”）。

### 3.4 批量操作流程
#### 3.4.1 批量修改
1. 勾选目标文章，点击“批量修改”打开分类树弹窗（默认选中当前分类路径）。
2. 用户在树上勾选目标分类集合，必要时通过弹窗入口新增缺失分类。
3. 确认后调用 `window.site.replaceCategoryForPosts(categoryId, postSources, replacements)`，`replacements` 为二维数组表示的目标分类路径集合。
4. 后端返回成功/失败统计，前端通过 `ElMessage` 提示并刷新分类列表与面包屑。

#### 3.4.2 批量删除
1. 点击“批量删除” → 确认弹窗提示影响篇数。
2. 确认后调用 `window.site.removeCategoryFromPosts(categoryId, postSources)`。
3. 根据返回的结果展示摘要，重新获取分类与文章列表，必要时显示空态。

### 3.5 后端与 IPC
#### 3.5.1 新增 / 扩展接口
| API | 调用方 | 说明 |
| --- | --- | --- |
| `window.site.replaceCategoryForPosts(categoryId, sources[], replacements[][])` | 批量修改 | 前端提供受影响文章列表与目标分类集合，主进程遍历 FrontMatter 替换并去重分类路径。 |
| `window.site.removeCategoryFromPosts(categoryId, sources[])` | 批量删除 | 移除提供的文章集合中的指定分类标签；完成后刷新 Hexo 缓存保证分类统计一致。 |

#### 3.5.2 HexoAgent 层实现建议
- **工具函数**：
  - `getCategoryDescendants(categoryId)`：从 Hexo 数据库计算子分类集合。
  - `listPostsByCategory(categoryId)`：返回包含该分类的文章记录（含草稿、已发布）。
  - `updatePostFrontMatter(sourcePath, updater)`：读取文章文件，修改 FrontMatter 后写回。
- **批量修改**：
  - 遍历目标文章：替换 `categories` 数组，移除旧路径后合并新的分类层级集合。
  - 需去重避免重复路径，确保保留文章中原本不相关的分类。
- **批量删除**：
  - 同样遍历文章，移除分类后保存。
  - 若分类下文章全部被清空，保留分类节点（Hexo 会在无文章时 length=0）。
- 执行完批量操作后调用 `updateCache()` 或 `this.hexo.load()` 刷新数据库，再返回处理结果统计。

## 4. 错误处理与用户反馈
- 所有操作提供 `ElMessage` 成功/失败提示；批量操作完成后输出 `成功 X 条，失败 Y 条`。
- 批量操作进行中禁用相关按钮，切换按钮文案（例如“修改中… (3/20)”）。
- 若部分失败，可提供“查看失败详情”按钮（展开列出失败文章标题，后续手动处理）。
- 网络或文件写入异常需捕获并返回清晰错误信息（如“文件写入失败：xxx.md”）。

## 5. 风险与缓解
| 风险 | 描述 | 缓解措施 |
| --- | --- | --- |
| 批量操作耗时长 | 60+ 篇文章逐一写文件 | 主进程实现批量处理、异步逐步反馈、进度提示 |
| 分类合并冲突 | 新名称与其他分类同名 | 二次确认“合并”逻辑，代码中去重处理 |
| 前端过滤失误 | 子分类识别错误导致遗漏或错误展示 | 使用分类 `parent` 链结合 `nodeMap` 验证；补充单元测试 |
| 返回数据延迟 | 返回分类页未刷新最新数量 | 在 `beforeRouteLeave` 或返回按钮事件中重新拉取 `getCategories()` |
| 编辑页面导航差异 | 用户从编辑页返回期望与实际不同 | 在面包屑说明“从编辑器返回将进入文章列表”或保留当前行为但文档说明 |

## 6. 验证方案
1. **手动场景**（与需求文档一致）：
   - 有/无子分类场景下的数据加载与空态。
   - 批量修改、批量删除的成功/失败路径。
   - 批量操作进度展示、部分失败提示。
   - 批量删除后返回分类页，文章数为 0。
2. **自动化**：
   - `CategoryPostsView` 单元测试：过滤逻辑、按钮状态、进度状态。
   - 主进程/HexoAgent 单元测试：批量修改/删除对 FrontMatter 的处理。
   - 集成测试（如有）：模拟 IPC 调用链、验证返回数据更新。
3. **回归**：
   - `npm run lint`、`npm run test`。
   - 重点关注 `CategoriesView`, `HexoAgent`, `router` 等相关模块。

## 7. 实施阶段划分
1. **基础搭建**：新增路由与 `CategoryPostsView`，可展示过滤后的文章列表（无操作）。
2. **批量修改**：实现分类树弹窗、批量 API。
3. **批量删除**：实现确认弹窗、批量移除逻辑。
4. **进度反馈与错误处理**：完善批量操作的进度/失败提示，刷新分类统计。
5. **测试与文档**：补充单元/集成测试，更新用户文档/帮助。
