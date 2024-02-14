<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

[![license][license-badge]][LICENSE]
[![downloads][downloads-badge]][releases]
![NodeJS][nodejs-badge]
![npm][npm-badge]
![vue][vuejs-badge]
![vite][vite-badge]
![Fastify][fastify-badge]
![Electron.js][electron-badge]

A client software designed specifically for editing blog articles and managing blog content that supports Hexo!

English | [简体中文](./README_zh.md)

</div>



<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [I. Features](#i-features)
- [II. Installation](#ii-installation)
  - [0. Compatibility](#0-compatibility)
  - [1. Mac](#1-mac)
  - [2. Windows](#2-windows)
- [III. User Guides](#iii-user-guides)
- [IV. Screenshots](#iv-screenshots)
  - [1. Dashboard](#1-dashboard)
  - [2. Posts List](#2-posts-list)
  - [3. Editor](#3-editor)
  - [4. Categories Management](#4-categories-management)
  - [5. Tags Management](#5-tags-management)
- [V. Getting Started from Source Code](#v-getting-started-from-source-code)
  - [1. Clone the source code](#1-clone-the-source-code)
  - [2. Running Environment](#2-running-environment)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Run](#4-run)
  - [5. Package](#5-package)
- [VI. Contribution](#vi-contribution)
  - [1. Report Issues](#1-report-issues)
  - [2. Contribute Code](#2-contribute-code)

<!-- /code_chunk_output -->




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

[Download for Apple Silicon: v1.0.0-alpha.2][download-for-apple]

[Download for Intel Chip: v1.0.0-alpha.2][download-for-intel]

### 2. Windows

[Download for Windows: v1.0.0-alpha.2][download-for-win]

## III. User Guides

1. [How to build a blog with Hexo?][docs-hexo-get-start]

## IV. Screenshots

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

## V. Getting Started from Source Code

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

## VI. Contribution

### 1. Report Issues

Visit https://github.com/charlestang/HexoPress/issues to submit issues.

### 2. Contribute Code
1. Fork this repository
1. Create your feature branch: git checkout -b <feature-name>
1. Commit your changes: git commit -am 'Add some feature'
1. Push to the branch: git push origin <feature-name>
1. Submit a pull request

[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/2024/02/07/How-to-create-a-blog-with-Hexo/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-darwin-arm64-1.0.0-alpha.2.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-darwin-x64-1.0.0-alpha.2.zip
[download-for-win]: https://github.com/charlestang/HexoPress/releases/download/v1.0.0-alpha.2/HexoPress-win-x64-1.0.0-alpha.2.zip
[downloads-badge]: https://img.shields.io/github/downloads/charlestang/HexoPress/total
[electron-badge]: https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white
[fastify-badge]: https://img.shields.io/badge/fastify-%23000000.svg?logo=fastify&logoColor=white
[license]: https://github.com/charlestang/HexoPress/blob/main/LICENSE
[license-badge]: https://img.shields.io/github/license/charlestang/HexoPress
[nodejs-badge]: https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white
[npm-badge]: https://img.shields.io/badge/NPM-%23CB3837.svg?logo=npm&logoColor=white
[releases]: https://github.com/charlestang/HexoPress/releases
[screenshot-categories]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/categories.png
[screenshot-dashboard]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/dashboard.png
[screenshot-editor]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/editor.png
[screenshot-postlist]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/postlist.png
[screenshot-tags]: https://github.com/charlestang/HexoPress/blob/main/docs/screenshots/tags.png
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white
[vuejs-badge]: https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D