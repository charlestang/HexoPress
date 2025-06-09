<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

**The ultimate desktop editor for Hexo blogs — simple, efficient, and ready to use!**

[![license][license-badge]][LICENSE]
[![last-commit][last-commit-badge]](last-commit)
![Electron.js][electron-badge]
![vue][vuejs-badge]
![NodeJS][nodejs-badge]
![npm][npm-badge]
![vite][vite-badge]
![Fastify][fastify-badge]
[![downloads][downloads-badge]][releases]

An open-source blogging software that offers a user-friendly article editing interface and content management system for Hexo-based blogs.

English | [简体中文](./README_zh.md)

</div>

---

> ⭐️ **If you like HexoPress, please [star us](https://github.com/charlestang/HexoPress) and help more people discover it!**

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

- [HexoPress](#hexopress)
  - [Quick Start](#quick-start)
  - [I. Introduction](#i-introduction)
    - [Tech Stack](#tech-stack)
  - [II. Installation](#ii-installation)
    - [0. Compatibility](#0-compatibility)
    - [1. Mac](#1-mac)
    - [2. Windows](#2-windows)
  - [III. Features](#iii-features)
  - [IV. User Guides](#iv-user-guides)
  - [V. Screenshots](#v-screenshots)
    - [1. Dashboard](#1-dashboard)
    - [2. Posts List](#2-posts-list)
    - [3. Editor](#3-editor)
    - [4. Categories Management](#4-categories-management)
    - [5. Tags Management](#5-tags-management)
  - [VI. Getting Started from Source Code](#vi-getting-started-from-source-code)
    - [1. Clone the source code](#1-clone-the-source-code)
    - [2. Running Environment](#2-running-environment)
    - [3. Install Dependencies](#3-install-dependencies)
    - [4. Run](#4-run)
    - [5. Package](#5-package)
  - [VII. Contribution](#vii-contribution)
    - [1. Report Issues](#1-report-issues)
    - [2. Contribute Code](#2-contribute-code)
  - [VIII. Join the Community](#viii-join-the-community)
  - [IX. Appendix](#ix-appendix)


## Quick Start

1. [Download the version for your OS](#ii-installation)
2. Unzip and run HexoPress
3. Select your Hexo blog directory and start writing!

---

## I. Introduction

HexoPress makes Hexo blogging as easy as WordPress! No more manual Front Matter editing — what you see is what you get, with multi-platform support and a desktop-level experience.

- **Pain Point**: Hexo's native content management is scattered and complex, with metadata requiring manual editing.
- **Solution**: HexoPress reads Hexo's cache in real time, displays categories/tags in a tree, and lets you set metadata with a click. Front Matter is auto-organized.
- **Core Value**: Minimal operation, WYSIWYG, Vim mode support, and a true desktop experience.

### Tech Stack

- Vue 3, Element Plus, Vite 5, Electron, Fastify

---

## II. Installation

### 0. Compatibility

- Supports Hexo 7.0.0 and above (uses Hexo 7.1.1 API internally)
- Please back up your blog directory before use (git integration recommended)

### 1. Mac

- [Download for Apple Silicon: v1.3.0][download-for-apple]
- [Download for Intel Chip: v1.3.0][download-for-intel]

### 2. Windows

- [Download for Windows: v1.2.0][download-for-win]

---

## III. Features

- 📝 Article list with "Published"/"Draft" filter
- 📅 Filter by month
- 🗂️ Filter by category
- 🔍 Keyword search
- 🌳 Tree view for categories with article count
- 🏷️ Tag list with article count
- 🖼️ Media resource management
- ✍️ Markdown editor with preview
- 📋 Outline panel
- ⌨️ Vim key bindings
- 📊 Dropdown for categories/tags
- 🔖 Batch edit categories/tags (coming soon)
- ⚙️ Quick FrontMatter editing

---

## IV. User Guides

- [How to build a blog with Hexo?][docs-hexo-get-start]

---

## V. Screenshots

> Each screenshot is briefly explained below

### 1. Dashboard
![Dashboard][screenshot-dashboard]
_Overview of your blog data_

### 2. Posts List
![Posts List][screenshot-postlist]
_Quickly filter and manage all posts_

### 3. Editor
![Editor][screenshot-editor]
_WYSIWYG, Vim mode supported_

### 4. Categories Management
![Categories Management][screenshot-categories]
_Tree structure for intuitive category management_

### 5. Tags Management
![Tags Management][screenshot-tags]
_Clear tag overview and statistics_

---

## VI. Getting Started from Source Code

### 1. Clone the source code

```bash
git clone https://github.com/charlestang/HexoPress.git
```

### 2. Running Environment

- Node.js >= v20.8.1
- npm >= v10.5.5
- Ports: 5173 (frontend), 2357 (local image service)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run

```bash
npm run dev      # Start dev environment
npm run lint     # Lint code
npm run format   # Format code
npm run test     # Run tests
```

### 5. Package

```bash
npm run package
npm run make
```

---

## VII. Contribution

### 1. Report Issues

- [Submit an Issue](https://github.com/charlestang/HexoPress/issues)

### 2. Contribute Code

1. Fork this repository
2. Create your feature branch: `git checkout -b <feature-name>`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin <feature-name>`
5. Submit a pull request

---

## VIII. Join the Community

- WeChat/QQ/Telegram (add if available)

---

## IX. Appendix

- [Why I built HexoPress][blog-why-hexopress]

---

> ⭐️ **If you like HexoPress, please star us and help more people discover it!**

---

[blog-why-hexopress]: https://blog.charlestang.org/2023/how-to-use-hexo-and-github-actions-to-build-a-personal-blog/
[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/howto-build-a-blog-with-hexo/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.3.0/HexoPress-darwin-arm64-1.3.0.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.3.0/HexoPress-darwin-x64-1.3.0.zip
[download-for-win]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-squirrel.windows-x64-1.2.0.zip
[downloads-badge]: https://img.shields.io/github/downloads/charlestang/HexoPress/total
[electron-badge]: https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white
[fastify-badge]: https://img.shields.io/badge/fastify-%23000000.svg?logo=fastify&logoColor=white
[last-commit-badge]: https://img.shields.io/github/last-commit/charlestang/HexoPress.svg
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
