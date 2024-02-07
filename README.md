<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

[![license][license-badge]][LICENSE]
[![downloads][downloads-badge]][releases]
[![npm][npm-badge]]

A client software designed specifically for editing blog articles and managing blog content that supports Hexo!

English | [简体中文](./README_zh.md)

</div>



## I. Features
-----
- [x] 📝 Display of the list of published articles and drafts;
- [x] 🔍 Article categorization filter and sorting by time;
- [x] 🌳 Categorical tree display and management with article count statistics;
- [x] 🏷️ Display of tag list with article count statistics;
- [ ] 🖼️ Display of media resources list such as images;
- [x] ✍️ Article editor with Markdown preview support;
- [x] 🗂️ Editor supports an Outline panel for navigation;
- [x] ⌨️ Editor supports Vim key bindings;
- [x] 📊 Editor supports dropdown selection for categories and tag search;
- [x] ⚙️ Support for quickly editing metadata (FrontMatter) without opening the article.

:star: Star us on GitHub — it motivates us a lot!

## II. Installation

### 0. Compatibility

The client internally uses the API of Hexo version 7.1.1. Hexo blog versions above v7.0.0 can be used, while other versions have not been tested. Before using, make sure the blog directory has been backed up with `git`.

### 1. Mac

[Download for Apple Silicon: v1.0.0alpha](https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha/HexoPress-darwin-arm64-1.0.0-alpha.zip)

[Download for Intel Chip: v1.0.0alpha](https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha/HexoPress-darwin-x64-1.0.0-alpha.zip)

### 2. Windows

Download to be provided.

## III. Screenshots

### 1. Dashboard
![Dashboard][screenshot-dashboard]

### 2. Posts List
![Posts List][screenshot-postlist]

### 3. Editor
![Editor][screenshot-editor]

### 4. Categories Management
![Categories Management][screenshot-categories]

### 5. Tags Management
![Tags Management][screenshot-tags]

## IV. Getting Started from Source Code

### 1. Clone the source code

```bash
git clone https://github.com/charlestang/HexoPress.git
```

### 2. Running Environment
- Node.js >= v21.1.0
- npm >= v10.3.0
- tcp port:5173 used by the internal webpage
- tcp port:2357 HTTP service used to serve local images

### 3. Install Dependencies
```bash
npm install
```
### 4. Run
```bash
npm run electron:run
```
### 5. Package
```bash
npm run build
npm run forge:make
```

## V. Contribution

### 1. Report Issues

Visit https://github.com/charlestang/HexoPress/issues to submit issues.

### 2. Contribute Code
1. Fork this repository
1. Create your feature branch: git checkout -b <feature-name>
1. Commit your changes: git commit -am 'Add some feature'
1. Push to the branch: git push origin <feature-name>
1. Submit a pull request

[downloads-badge]: https://img.shields.io/github/downloads/charlestang/HexoPress/total
[license]: https://github.com/charlestang/HexoPress/blob/main/LICENSE
[license-badge]: https://img.shields.io/github/license/charlestang/HexoPress
[npm-badge]: https://img.shields.io/npm/v/npm.svg?logo=nodedotjs
[releases]: https://github.com/charlestang/HexoPress/releases
[screenshot-categories]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/categories.png
[screenshot-dashboard]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/dashboard.png
[screenshot-editor]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/editor.png
[screenshot-postlist]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist.png
[screenshot-tags]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags.png