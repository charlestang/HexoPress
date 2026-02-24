# 媒体库与图片详情技术方案

## 1. 背景与目标
- **现状问题**：Hexo 生成的静态资源只能通过文件系统查看，缺少客户端内的预览与管理入口。
- **业务诉求**：在桌面端提供统一的媒体浏览体验，快速定位图片变体、查看文件元数据，并支持对常见图片格式执行删除动作。
- **主要目标**：
  1. 构建媒体库总览页，分栏管理图片与普通文件。
  2. 提供图片分组卡片与跳转详情页的导航体验。
  3. 支持在总览页及详情页对指定格式的图片执行删除操作，并正确反馈执行结果。

## 2. 功能拆分与需求映射
| 功能块 | 需求对应 | 关键点 |
| --- | --- | --- |
| 资源拉取与刷新 | 功能与验收细项 · 数据加载 | `window.site.getAssets()` 获取完整资产列表；删除成功后重新加载 |
| 图片分组展示 | 图片页签与详情页 | 依赖 `buildImageGroups`，对可预览扩展名进行归组，展示卡片与代表图 |
| 文件列表展示 | 文件页签 | 非预览资产进入表格视图，提供基础字段列 |
| 删除操作 | 删除操作 | 限定扩展名，确认弹窗、防重提交、消息提示、刷新数据 |
| 详情页渲染 | 图片详情页 | 面包屑、代表图、元数据、变体表格、无效参数回退 |
| 导航与重定向 | 图片分组与导航 | 通过 `router.push` / `router.replace` 控制卡片点击与参数异常处理 |

## 3. 数据与系统设计
### 3.1 数据流概览
```
Renderer(MediaLibraryView)
    ├─ window.site.getAssets()
    │      ↓
    ├─ buildImageGroups(assets, previewableExts) → imageGroups
    │      ↓
    ├─ 图片卡片点击 → router.push({ name: 'media-detail', params: { groupKey } })
    │
    └─ 文件表格 → 删除按钮 → window.site.deleteAsset(id) → 成功后 fetchAssets()

Renderer(MediaDetailView)
    ├─ window.site.getAssets()
    │      ↓
    ├─ buildImageGroups → selectedGroup
    │      ↓
    ├─ 表格删除 → window.site.deleteAsset(id) → 成功后 fetchAssets()
    │
    └─ watchEffect → 若 selectedGroup 缺失则 router.replace('media-library')
```

### 3.2 媒体库总览（MediaLibraryView）
- **状态管理**：
  - `assets: Ref<Asset[]>`：全量资产列表。
  - `activeTab: Ref<'images' | 'files'>`：标签页状态。
  - `deletingState: Ref<Record<string, boolean>>`：删除中的资产 id 集合。
  - 常量：`previewableExtensions`（图片判定，含 `.png`/`.jpg`/`.jpeg`/`.gif`/`.svg`/`.webp`）、`deletableExtensions`（允许删除的格式，同预览列表）、`assetBaseUrl`（预览服务根路径）。
- **计算属性**：
  - `imageGroups`：调用 `buildImageGroups(assets, previewableExtensions)` 返回图片分组。
  - `fileAssets`：过滤出不可预览的资产，进入文件列表。
- **视图结构**：
  - `ElTabs` + `ElTabPane`：切换图片/文件。
  - 图片页签：`div.media-grid` 内循环卡片，展示代表图、显示名、变体数，卡片点击后执行 `router.push({ name: 'media-detail', params: { groupKey } })`。
  - 文件页签：`ElTable` 渲染资产字段，删除按钮仅对可删除扩展名呈现。
  - 空数据时统一使用 `ElEmpty`。
- **删除流程**：
  1. 点击删除 → `ElMessageBox.confirm` 二次确认。
  2. 设置 `deletingState[id] = true`，调用 `window.site.deleteAsset(id)`。
  3. 成功后展示成功消息并调用 `fetchAssets()` 刷新；失败时展示错误消息。
  4. 无论成功失败，最后解除删除状态。
- **数据刷新**：
  - 通过 `watchEffect(fetchAssets)` 在组件挂载时拉取数据；`fetchAssets` 内部调用 `window.site.getAssets()` 并覆盖 `assets`。

### 3.3 图片详情页（MediaDetailView）
- **状态管理**：
  - `assets`、`deletingState` 与总览页一致，共享删除逻辑。
  - 通过 `computed` 读取 `route.params.groupKey` 并解码；使用 `imageGroups`（同样基于 `buildImageGroups`）查找 `selectedGroup`。
- **导航守卫**：
  - `watchEffect` 在资产加载完成后，若 `selectedGroup` 为空则执行 `router.replace({ name: 'media-library' })`，确保 URL 无效时回退。
- **布局结构**：
  - 面包屑：`媒体库 / 分组名称`，包含返回按钮。
  - 主卡片：代表图大图、元数据描述列表、变体表格。
  - 变体表格内的删除按钮沿用 `handleDelete`，删除后刷新整个资产列表；若删除导致该分组不再存在，重定向逻辑生效返回列表。
  - 当 `selectedGroup` 为空（例如加载中或已被删除）时，展示 `ElEmpty` 与回到列表按钮。
- **其他处理**：
  - `assetBaseUrl` 与总览页保持一致，确保预览链接统一。
  - 详情页不区分代表图和其他变体的删除逻辑，统一判断扩展名。

### 3.4 工具函数 `buildImageGroups`
- 依据资产目录 + 归一化文件名构造 key，归一化规则：去除文件名末尾 `-WxH` 模式（大小写不敏感）。
- 将同一 key 下的资产按路径排序，并选取文件名与归一化基名一致的项作为代表图（找不到时采用首个变体）。
- 返回结果按显示名排序，保证列表稳定。

## 4. 错误处理与用户反馈
- 删除失败或接口异常时，通过 `ElMessage.error` 展示带有原始错误信息的提示。
- 删除执行中禁用按钮 + Loading 状态，避免重复触发。
- 详情页若因无效参数导致找不到分组，通过路由重定向回媒体库，同时模板提供空态兜底。
- 图片或文件加载失败由浏览器原生行为处理，必要时可在后续补充占位图。

## 5. 风险与缓解
| 风险 | 描述 | 缓解措施 |
| --- | --- | --- |
| 资源列表较大导致渲染卡顿 | 图片/文件过多时卡片与表格渲染耗时 | 可在后续迭代中加入分页或虚拟列表 |
| 删除后缓存未刷新 | HexoAgent 未立即同步更新缓存 | 删除成功后已强制调用 `fetchAssets()`；需确保主进程刷新缓存 |
| 预览路径变动 | 资源服务端口或地址变化导致图片不可预览 | 将 `assetBaseUrl` 抽离到可配置项或根据 `window.site` 配置动态获取 |
| 分组规则遗漏 | 文件名归一化规则不足以覆盖所有尺寸命名方式 | 扩展 `normalizeBaseName` 规则，并新增单元测试覆盖 |

## 6. 验证方案
1. **手动验证**：
   - 切换标签页、验证空态文案、卡片导航、详情页展示。
   - 删除图片/文件的正向与反向路径，包括取消确认、接口失败等情况。
   - 模拟无效 `groupKey` 的直接访问，确认会重定向至媒体库。
2. **自动化测试**：
   - 对 `buildImageGroups` 编写单元测试，覆盖常见命名与排序场景。
   - 组件层测试按钮禁用、确认弹窗触发、删除成功后的刷新逻辑。
3. **回归**：
   - 运行 `npm run lint`、`npm run test`（若存在）。
   - 检查与 `window.site.getAssets/deleteAsset` 相关的 IPC 流程，确保无兼容性问题。

## 7. 实施阶段建议
1. **基础结构**：实现媒体库路由与标签页布局，接入 `getAssets` 并展示列表/空态。
2. **图片分组**：整合 `buildImageGroups`，完成图片卡片与导航。
3. **删除流程**：实现删除确认、状态管理及消息反馈。
4. **详情页**：构建详情视图、变体表格、重定向策略。
5. **验收与文档**：补充测试、完善文档、确认翻译文案。
