## 1. 升级依赖和扩展类型定义

- [x] 1.1 升级 una-editor 依赖：`npm install una-editor@^0.4.0-alpha.0`
- [x] 1.2 扩展 `types/local.d.ts` 中的 `HexoConfig` 类型，添加 `root: string` 字段
- [x] 1.3 运行类型检查：`npm run check-all`，确保无类型错误

## 2. 修改主进程（读取 Hexo root 配置）

- [x] 2.1 修改 `main/lib/HexoAgent.ts` 的 `getHexoConfig()` 方法，读取 `this.hexo.config.root`
- [x] 2.2 在 `getHexoConfig()` 中提供 `root` 的默认值 `/`（如果未配置）
- [x] 2.3 确保返回的配置对象包含 `root` 字段
- [x] 2.4 运行主进程类型检查：`npm run node-check`

## 3. 修改渲染进程（图片路径管理）

- [x] 3.1 修改 `src/utils/path.ts`，将 `computeRelativeImagePath()` 重命名为 `computeImagePath()`
- [x] 3.2 修改 `computeImagePath()` 实现，返回面向部署的绝对路径（考虑 Hexo root）
- [x] 3.3 在 `src/utils/markdownImage.ts` 中增加 `root` 规范化与剥离逻辑，用于本地预览路径转换
- [x] 3.4 保留 `resolveMarkdownImageUrl()` 用于向后兼容相对路径，并让其与新的 root 剥离逻辑协同工作
- [x] 3.5 更新 `src/utils/__tests__/path.test.ts`，适配新的函数签名和行为
- [x] 3.6 新增或更新 `src/utils/__tests__/markdownImage.test.ts`，覆盖 root 剥离、相对路径兼容、Electron/Web 两种 `VITE_ASSET_BASE_URL` 场景
- [x] 3.7 运行测试：`npm run test`，确保路径计算逻辑正确

## 4. 修改编辑器组件（实现 renderHooks）

- [x] 4.1 在 `src/components/EditorMain.vue` 中实现 `resolveImageUrl()` 函数
- [x] 4.2 `resolveImageUrl()` 处理三种情况：绝对 URL（CDN）、带 root 的绝对路径、相对路径
- [x] 4.3 `resolveImageUrl()` 返回符合 una-editor 0.4.0-alpha.0 的 `Partial<ImageRenderResult>` 对象，而不是裸字符串
- [x] 4.4 添加 `renderHooks` prop 到 `<UnaEditor>` 组件，传入 `{ image: resolveImageUrl }`
- [x] 4.5 修改图片插入逻辑（`uploaded` 回调），使用新的 `computeImagePath()` 函数
- [x] 4.6 确保 `resolveImageUrl()` 能访问 `hexoConfig.root` 和 `frontMatter.permalink`
- [x] 4.7 更新 `src/components/MediaPanel.vue`，统一使用新的 `computeImagePath()` 生成插入 Markdown
- [x] 4.8 更新 `src/components/MdRenderer.vue`，继续复用共享预览路径转换逻辑，避免与 EditorMain 分叉
- [x] 4.9 运行渲染进程类型检查：`npm run vue-check`

## 5. 更新测试

- [x] 5.1 更新 `src/components/__tests__/EditorMain.test.ts`，适配新的图片插入逻辑
- [x] 5.2 添加 `renderHooks.image` 的测试用例，覆盖 root 剥离与 `Partial<ImageRenderResult>` 返回形态
- [x] 5.3 更新 `src/components/__tests__/MediaPanel.test.ts` 或新增测试，覆盖媒体库插入绝对路径
- [x] 5.4 更新 `src/components/__tests__/MdRenderer.test.ts`，覆盖带 root 的绝对路径预览转换
- [x] 5.5 运行完整测试套件：`npm run test`
- [x] 5.6 运行类型检查：`npm run check-all`

## 6. 手动测试和验证

- [x] 6.1 启动应用：`npm run dev`
- [x] 6.2 验证 `hexoConfig.root` 正确读取（通过 DevTools 检查 appStore）
- [x] 6.3 插入新图片，验证使用绝对路径（检查 Markdown 源码）
- [x] 6.4 在配置 `root: "/HexoPress/"` 时，验证 Markdown 中保存的是 `/HexoPress/images/...`
- [x] 6.5 验证 live preview 中新插入的图片正确显示，且本地请求会剥离 `/HexoPress/` 前缀
- [x] 6.6 打开包含相对路径图片的旧文章，验证图片仍能正确预览
- [x] 6.7 修改文章的 permalink，验证图片路径不变且预览正常
- [x] 6.8 测试 CDN 图片（完整 URL），验证不受影响
- [x] 6.9 以 Web mode 启动应用：`npm run web:dev`，验证 `/assets/` 路径下的预览行为正确

## 7. 代码质量检查

- [x] 7.1 运行格式化：`npm run format`
- [x] 7.2 运行 lint 检查：`npm run lint`
- [x] 7.3 运行完整类型检查：`npm run check-all`
- [x] 7.4 运行完整测试：`npm run test`
- [x] 7.5 验证所有检查通过

## 8. 提交和清理

- [x] 8.1 创建 git commit：`feat: upgrade una-editor to 0.4.0-alpha.0 and fix image preview with absolute paths`
- [x] 8.2 验证 commit 后工作目录干净：`git status --porcelain`
- [ ] 8.3 （可选）如果在独立分支，创建 PR 合并到 main
