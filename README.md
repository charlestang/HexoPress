<div align="center">
  <p align="center">
    <img style="width:500px" src="https://github.com/charlestang/HexoPress/blob/main/docs/logo.svg" alt="logo" />
  </p>
  <h1>HexoPress</h1>
  <p>A client software designed specifically for editing blog articles and managing blog content that supports Hexo!</p>
  <p align="center"><!-- some badges like version, release status, test coverage, license, etc.-->
    <a href="https://github.com/charlestang/HexoPress/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/charlestang/HexoPress?color=%232dce89&logo=github&style=flat-square" alt="license">
    </a>
  </p>
</div>

English | [简体中文](./README_zh.md)


## Features
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


This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
