<div align="center">
  <p align="center">
    <img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />
  </p>
  <h1>HexoPress</h1>
  <p>支持Hexo的文章编辑和内容管理客户端软件！</p>
  <p align="center"><!-- some badges like version, release status, test coverage, license, etc.-->
    <a href="https://github.com/charlestang/HexoPress/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/charlestang/HexoPress" alt="license" />
    </a>
    <img src="https://img.shields.io/github/downloads/charlestang/HexoPress/total" alt="downloads" />
    <img src="https://img.shields.io/github/v/release/charlestang/HexoPress" alt="latest" />
  </p>
</div>

[English](./README.md) | 简体中文

## 一、特性
-----

- [x] 📝 已发布文章和草稿的列表显示；
- [x] 🔍 文章分类筛选及按时间筛选、排序；
- [x] 🌳 分类以树状形式展示和管理，包括文章数量统计；
- [x] 🏷️ 标签列表显示，包括文章数量统计；
- [ ] 🖼️ 图片等媒体资源列表展示；
- [x] ✍️ 文章编辑器，支持Markdown预览；
- [x] 🗂️ 编辑器支持目录 Outline 面板；
- [x] ⌨️ 编辑器支持 Vim 的 key bindings；
- [x] 📊 编辑器支持分类的下拉选择和标签检索；
- [x] ⚙️ 支持不打开文章快捷编辑元信息（FrontMatter）。

## 二、安装

### 1. Mac

[下载 苹果M1芯片版本: v1.0.0alpha](https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha/HexoPress-darwin-arm64-1.0.0-alpha.zip)

[下载 Intel芯片版本: v1.0.0alpha](https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha/HexoPress-darwin-x64-1.0.0.zip)

### 2. Windows

待提供

## 三、截图

### 1. 仪表盘
![Dashborad](https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/dashboard.png)

### 2. 文章列表
![Posts List](https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist.png)

### 3. 文章编辑器
![Editor](https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/editor.png)

### 4. 分类管理
![Categories Management](https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/categories.png)

### 5. 标签管理
![Tags Management](https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags.png)

## 四、从源码开始

### 1. 克隆源代码

```bash
git clone https://github.com/charlestang/HexoPress.git
```

### 2. 运行环境

- Node.js >= v21.1.0
- npm >= v10.3.0
- tcp port:5173 内部网页使用的端口号
- tcp port:2357 HTTP 服务用来伺服本地图片

### 3. 安装依赖

```bash
npm install
```

### 4. 运行

```bash
npm run electron:run
```

### 5. 打包

```bash
npm run build
npm run forge:make 
```

## 五、贡献

### 1. 发现问题

访问 https://github.com/charlestang/HexoPress/issues 提交问题。

### 2. 贡献代码

1. Fork 本仓库
2. 创建分支：`git checkout -b <feature-name>`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin <feature-name>`
5. 提交合并请求

