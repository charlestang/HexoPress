<div align="center">

<img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />

# HexoPress

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

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [HexoPress](#hexopress)
  - [I. Introduction](#i-introduction)
    - [Features List](#features-list)
    - [Acknowledgements](#acknowledgements)
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

## I. Introduction

Hexo is a fast, simple, and efficient blogging framework. It compiles and renders articles on the server, generating static pages that are then published to the internet, providing a smooth reading experience for visitors. However, Hexo's content management approach, based on configuration and text files, is not particularly user-friendly for blog authors. For example, metadata used to organize blog content, such as categories and tags, is scattered at the beginning of each article, making it impossible to offer a real-time and global management interface. Editing metadata for a single article, such as categories, tags, update times, and publication statuses, requires manual editing in Yaml or JSON formats, which are different from Markdown syntax. This presents a significant mental burden for authors unfamiliar with Yaml/JSON syntax and the Front Matter organization format, including professional programmers.

To address these challenges, I designed **HexoPress**. Its core principle leverages cache files generated by Hexo's own generators to display metadata information like categories and tags in a tree directory format on the editing interface in real-time. This allows authors to set categories and tags with a simple click and avoid the distraction of handling Front Matter data while editing articles, as the system organizes content automatically upon saving according to syntax. Additionally, **HexoPress** features a user-friendly Markdown editor that supports the Vim editing mode, favored by many programmers, making the writing process more enjoyable.

I used popular web development technologies such as Vue 3, Element Plus, and Vite 5, and packaged them into a desktop application with Electron, allowing it to run on multiple platforms including Windows, MacOS, and Linux. I hope this open-source software enhances your blogging experience. If you like this project, please recommend it to your friends and star us on GitHub. Your support is a great encouragement to us, thank you ❤️!

### Features List

---

- [x] 📝 Article list shows all posts and allows filtering by "Published" or "Draft";
- [x] 📅 Filter or search the article list by **published month**;
- [x] 🗂️ Filter or search the article list by **category**;
- [x] 🔍 Filter or search the article list by **key-words**;
- [x] 🌳 Tree view for **categories list** with article count statistics;
- [x] 🏷️ List view for **tags list** with article count statistics;
- [x] 🖼️ Display of media resources list such as images;
- [x] ✍️ Article editor with Markdown preview support;
- [x] 📋 Editor supports an Outline panel for navigation;
- [x] ⌨️ Editor supports Vim key bindings;
- [x] 📊 Editor supports dropdown selection for categories and tag search;
- [ ] 🔖 Batch edit the categories and tags for articles;
- [x] ⚙️ Support for quickly editing metadata (FrontMatter) without opening the article.

:star: Star us on GitHub — it motivates us a lot!

### Acknowledgements

Special thanks to WordPress, from which HexoPress draws its design inspiration for the management and editing interfaces. WordPress is the world's finest blogging platform/software and has been my personal choice for blogging software for many years.

## II. Installation

### 0. Compatibility

The client internally uses the API of Hexo version 7.1.1. Hexo blog versions above v7.0.0 can be used, while other versions have not been tested. Before using, make sure the blog directory has been backed up with `git`.

### 1. Mac

[Download for Apple Silicon: v1.2.0][download-for-apple]

[Download for Intel Chip: v1.2.0][download-for-intel]

### 2. Windows

[Download for Windows: v1.2.0][download-for-win]

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

- Node.js >= v20.8.1
- npm >= v10.5.5
- tcp port:5173 used by the internal webpage
- tcp port:2357 HTTP service used to serve local images

### 3. Install Dependencies

```bash
npm install
```

### 4. Run

Run local dev server:

```bash
npm run dev
```

Run ESLint：

```bash
npm run lint
```

Run code format with prettier：

```bash
npm run format
```

Run tests：

```bash
npm run test
```

### 5. Package

```bash
npm run package
npm run make
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

[docs-hexo-get-start]: https://blog.charlestang.org/HexoPress/howto-build-a-blog-with-hexo/
[download-for-apple]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-darwin-arm64-1.2.0.zip
[download-for-intel]: https://github.com/charlestang/HexoPress/releases/download/v1.2.0/HexoPress-darwin-x64-1.2.0.zip
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
