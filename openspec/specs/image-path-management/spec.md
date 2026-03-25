# image-path-management Specification

## Purpose
定义 HexoPress 中 Markdown 图片路径的生成与预览转换规则，确保发布态路径和本地预览资源 URL 的职责分离且行为一致。
## Requirements
### Requirement: 图片路径使用绝对路径格式

系统 MUST 在插入图片时使用绝对路径格式（从根目录开始），而非相对路径格式。

#### Scenario: 插入新图片使用绝对路径

- **WHEN** 用户通过上传或拖放方式插入图片
- **THEN** 系统 SHALL 生成绝对路径格式的 Markdown 图片语法
- **AND** 路径格式 SHALL 为 `![alt](/images/YYYY/MM/filename.ext)`
- **AND** 如果 Hexo 配置了 `root` 子目录，路径 SHALL 包含该子目录（如 `/HexoPress/images/...`）

#### Scenario: 根据 Hexo root 配置调整路径

- **WHEN** Hexo 配置中 `root` 为 `/`
- **THEN** 图片路径 SHALL 为 `/images/YYYY/MM/filename.ext`

- **WHEN** Hexo 配置中 `root` 为 `/HexoPress/`
- **THEN** 图片路径 SHALL 为 `/HexoPress/images/YYYY/MM/filename.ext`

#### Scenario: 绝对路径不受 permalink 影响

- **WHEN** 用户修改文章的 permalink 配置
- **THEN** 文章中已插入的图片路径 SHALL 保持不变
- **AND** 图片预览 SHALL 继续正常显示

### Requirement: 读取 Hexo root 配置

系统 MUST 读取 Hexo 配置文件中的 `root` 字段，用于生成正确的图片绝对路径。

#### Scenario: 读取 Hexo root 配置

- **WHEN** 系统初始化或加载 Hexo 配置
- **THEN** 系统 SHALL 读取 `hexo.config.root` 字段
- **AND** 如果 `root` 未配置，SHALL 使用默认值 `/`
- **AND** `root` 值 SHALL 存储在 `HexoConfig` 类型中

#### Scenario: HexoConfig 类型包含 root 字段

- **WHEN** 系统定义 `HexoConfig` 类型
- **THEN** 类型定义 MUST 包含 `root: string` 字段
- **AND** 该字段 SHALL 在主进程和渲染进程中可访问

#### Scenario: root 值被规范化

- **WHEN** 系统读取 Hexo 配置中的 `root`
- **THEN** 系统 SHALL 将空值规范化为 `/`
- **AND** 对于非根路径，系统 SHALL 将其规范化为带前导和尾随斜杠的形式（如 `HexoPress` → `/HexoPress/`）

### Requirement: 预览时转换图片路径

系统 MUST 在本地预览时将 Markdown 中的发布态图片路径转换为预览资源 URL。

#### Scenario: Electron mode 下转换绝对路径为预览 URL

- **WHEN** 编辑器渲染包含绝对路径图片的 Markdown（如 `/images/test.jpg`）
- **THEN** 系统 SHALL 将路径转换为基于 `VITE_ASSET_BASE_URL` 的预览 URL（如 `http://127.0.0.1:2357/images/test.jpg`）
- **AND** 转换后的 URL SHALL 能够正确加载图片

#### Scenario: 预览时剥离包含 root 的绝对路径前缀

- **WHEN** 图片路径包含 Hexo root（如 `/HexoPress/images/test.jpg`）
- **THEN** 系统 SHALL 在拼接 `VITE_ASSET_BASE_URL` 前剥离 `/HexoPress/` 前缀
- **AND** Electron mode 下转换结果 SHALL 为 `http://127.0.0.1:2357/images/test.jpg`

#### Scenario: Web mode 下使用 /assets/ 预览图片

- **WHEN** Web mode 中的 `VITE_ASSET_BASE_URL` 为 `/assets/`
- **AND** 图片路径为 `/HexoPress/images/test.jpg`
- **THEN** 系统 SHALL 将路径转换为 `/assets/images/test.jpg`
- **AND** 转换后的 URL SHALL 能够正确加载图片

#### Scenario: 保持 CDN 图片 URL 不变

- **WHEN** 图片路径为完整的 HTTP/HTTPS URL（如 `https://cdn.example.com/image.jpg`）
- **THEN** 系统 SHALL 不进行路径转换
- **AND** 直接使用原始 URL 加载图片

### Requirement: 向后兼容相对路径

系统 MUST 支持预览旧文章中使用相对路径的图片。

#### Scenario: 预览相对路径图片

- **WHEN** 编辑器渲染包含相对路径图片的 Markdown（如 `../images/test.jpg`）
- **THEN** 系统 SHALL 根据当前文章的 permalink 计算正确的绝对路径
- **AND** 将计算后的路径转换为基于 `VITE_ASSET_BASE_URL` 的预览 URL
- **AND** 图片 SHALL 正确显示

#### Scenario: 相对路径计算考虑 permalink 深度

- **WHEN** 文章 permalink 为 `a/`，图片路径为 `../images/test.jpg`
- **THEN** 系统 SHALL 计算出绝对路径为 `/images/test.jpg`

- **WHEN** 文章 permalink 为 `2026/a/`，图片路径为 `../../images/test.jpg`
- **THEN** 系统 SHALL 计算出绝对路径为 `/images/test.jpg`

### Requirement: 所有插入入口使用统一的图片路径策略

系统 MUST 在所有图片插入入口生成一致的发布态绝对路径。

#### Scenario: 编辑器上传插入使用统一路径策略

- **WHEN** 用户在 `EditorMain` 中拖放或上传图片
- **THEN** 系统 SHALL 使用统一的图片路径生成逻辑
- **AND** 生成的 Markdown SHALL 为面向部署的绝对路径格式

#### Scenario: 媒体库插入使用统一路径策略

- **WHEN** 用户在 `MediaPanel` 中插入图片
- **THEN** 系统 SHALL 使用与 `EditorMain` 相同的图片路径生成逻辑
- **AND** 生成的 Markdown SHALL 为面向部署的绝对路径格式

