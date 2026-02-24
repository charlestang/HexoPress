# window.site / IPC API 参考

本文档整理了渲染进程可用的 `window.site` 方法、对应的 IPC 通道、返回值结构与典型用途，方便在联调或扩展功能时快速查阅。【F:main/preload.ts†L1-L33】【F:types/local.d.ts†L42-L104】

## 站点数据读取
| 方法 | IPC 通道 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `getPosts(published?, draft?, limit?, offset?, categoryId?, monthCode?, keywords?, orderBy?, order?)` | `site:posts` | `Promise<PostsResults>` | 读取文章列表，可通过是否发布、草稿、分类、月份、关键词和排序参数组合过滤。HexoAgent 会等待初始化与缓存加载完成后再访问 `hexo.locals`。【F:main/main.ts†L38-L39】【F:main/lib/HexoAgent.ts†L54-L136】 |
| `getPostMonths()` | `site:postMonth` | `Promise<string[]>` | 返回存在文章的月份（`YYYY-MM`），用于归档视图或日历展示。【F:main/main.ts†L39-L40】【F:main/lib/HexoAgent.ts†L138-L169】 |
| `getCategories()` | `site:categories` | `Promise<Category[]>` | 读取分类树，包含父子关系、路径及文章数量，可用于树状导航。【F:main/main.ts†L40-L41】【F:main/lib/HexoAgent.ts†L171-L220】 |
| `getTags()` | `site:tags` | `Promise<Tag[]>` | 返回站点所有标签及关联文章数量。【F:main/main.ts†L41-L42】【F:main/lib/HexoAgent.ts†L222-L246】 |
| `getAssets()` | `site:assets` | `Promise<Asset[]>` | 列出 Hexo 资源（如 `source/_posts` 下的图片）。【F:main/main.ts†L42-L43】【F:main/lib/HexoAgent.ts†L248-L282】 |
| `deleteAsset(assetId)` | `site:assetDelete` | `Promise<void>` | 删除指定资源文件并同步 Hexo 资产缓存，删除失败会抛出详细异常。【F:main/main.ts†L43-L44】【F:main/lib/HexoAgent.ts†L348-L394】 |
| `getStats()` | `site:stats` | `Promise<Stats>` | 统计文章、草稿、页面数量，用于仪表盘总览。【F:main/main.ts†L43-L44】【F:main/lib/HexoAgent.ts†L284-L313】 |
| `getSiteInfo()` | `site:info` | `Promise<SiteInfo>` | 返回 HexoPress 与 Hexo 版本等基础信息，在设置页或关于页展示。【F:main/main.ts†L44-L45】【F:main/lib/HexoAgent.ts†L315-L339】 |
| `getHeatMap()` | `site:heatMap` | `Promise<DateEntry[]>` | 统计每日发文数量，为热力图组件提供数据。【F:main/main.ts†L46-L47】【F:main/lib/HexoAgent.ts†L108-L136】 |
| `getHexoConfig()` | `hexo:config` | `Promise<HexoConfig>` | 读取 `_config.yml` 核心配置，Pinia Store 会在代理初始化后自动缓存。【F:main/main.ts†L47-L48】【F:main/lib/HexoAgent.ts†L341-L370】 |
| `refreshSite()` | `site:refresh` | `Promise<void>` | 手动刷新 Hexo 缓存，等价于执行 `hexo.locals.invalidate()` 并重新加载。【F:main/main.ts†L45-L46】【F:main/lib/HexoAgent.ts†L372-L404】 |

## 内容读取与写入
| 方法 | IPC 通道 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `getContent(path)` | `post:content` | `Promise<string>` | 读取指定 Markdown 文件内容，路径为相对 `source/` 的 `source/_posts` 或 `source/_drafts` 下文件。【F:main/main.ts†L48-L49】【F:main/lib/HexoAgent.ts†L406-L435】 |
| `saveContent(path, content)` | `post:save` | `Promise<void>` | 将编辑内容写回原文件，自动创建目录并保留 Front Matter。【F:main/main.ts†L49-L50】【F:main/lib/HexoAgent.ts†L437-L479】 |
| `createFile(type, title, slug, content)` | `post:create` | `Promise<string>` | 新建草稿或文章，`type` 为 `post`/`draft`，返回生成的相对路径。【F:main/main.ts†L50-L52】【F:main/lib/HexoAgent.ts†L481-L557】 |
| `moveFile(sourcePath, content)` | `post:move` | `Promise<string>` | 将草稿移动到 `_posts`（或反向），并写入最新内容，常用于“发布草稿”流程。【F:main/main.ts†L52-L53】【F:main/lib/HexoAgent.ts†L559-L620】 |
| `deleteFile(path)` | `post:delete` | `Promise<void>` | 删除指定文章或草稿文件，同时清理对应的资源目录（如果存在）。【F:main/main.ts†L53-L54】【F:main/lib/HexoAgent.ts†L622-L682】 |
| `saveImage(path, content)` | `fs:saveImage` | `Promise<void>` | 将 Base64/ArrayBuffer 图像写入 `source/images/<path>`，写入后会触发 Hexo 重新生成静态文件。【F:main/main.ts†L59-L63】【F:main/lib/FsAgent.ts†L43-L58】 |

## 文件系统与环境
| 方法 | IPC 通道 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `openDirDialog()` | `dialog:dir` | `Promise<DialogResult>` | 打开系统目录选择器，供用户选择 Hexo 根目录。【F:main/main.ts†L48-L49】 |
| `getReadDir(path?)` | `fs:readdir` | `Promise<FileEntry[]>` | 列举 `source/` 下指定子目录内容，过滤隐藏文件，常用于媒体资源浏览。【F:main/main.ts†L57-L58】【F:main/lib/FsAgent.ts†L9-L31】 |
| `mv(from, to)` | `fs:mv` | `Promise<boolean>` | 在 `source/` 中重命名或移动文件/目录，内部会确保目标目录存在。【F:main/main.ts†L58-L59】【F:main/lib/FsAgent.ts†L31-L43】 |
| `initializeAgent(path)` | `agent:init` | `Promise<boolean>` | 校验所选目录是否为合法 Hexo 项目，并在通过时初始化 HexoAgent、FsAgent 与 HttpServer。【F:main/main.ts†L63-L74】【F:main/lib/HexoAgent.ts†L9-L44】【F:main/lib/FsAgent.ts†L9-L17】【F:main/lib/HttpServer.ts†L10-L33】 |
| `getSystemLocale()` | `sys:locale` | `Promise<string>` | 读取操作系统语言，结合 `appStore` 决定默认界面语言。【F:main/main.ts†L55-L56】 |
| `openUrl(url)` | `shell:openUrl` | `Promise<void>` | 委托系统默认浏览器打开外部链接。【F:main/main.ts†L56-L57】 |
| `getDarkMode()` | `dark:get` | `Promise<string>` | 返回当前主题模式（`light`/`dark`/`system`），由主进程的 `nativeTheme` 提供。【F:main/main.ts†L74-L77】 |
| `setDarkMode(value)` | `dark:set` | `Promise<void>` | 设置主进程 `nativeTheme.themeSource`，用于响应用户的主题切换。【F:main/main.ts†L77-L78】【F:src/stores/app.ts†L24-L52】 |

## 使用建议
1. **类型优先**：在 TS 代码中直接引入 `types/local.d.ts` 中的类型别名，可以享受参数与返回值的完整提示与编译期校验。【F:types/local.d.ts†L42-L104】
2. **异步流程**：大部分接口都依赖 HexoAgent 的初始化承诺，调用前可结合 `appStore.isAgentInitialized` 避免界面初次挂载时的空数据竞态。【F:src/router/index.ts†L44-L74】【F:src/stores/app.ts†L61-L89】
3. **错误处理**：当前接口默认抛出异常，建议在渲染层包装统一的错误提示与日志上报，方便定位 Hexo CLI 或文件操作失败的原因。
