---
title: '[HexoPress] Contributing Guide'
permalink: hexopress-contributing-guide-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - contributing
  - open-source
excerpt: Want to contribute to HexoPress? This article helps you quickly understand the project structure, dev environment, and contribution workflow.
date: 2026-02-11 12:40:00
updated: 2026-02-11 12:40:00
---

HexoPress is an open-source project, and contributions of all kinds are welcome — whether it's fixing a bug, improving a feature, or enhancing documentation. This article helps you get started quickly.

## Tech Stack

Before diving in, here's the technology stack HexoPress uses:

- **Electron**: Desktop application framework
- **Vue 3**: Frontend framework (Composition API + `<script setup>`)
- **TypeScript**: Used throughout the entire project
- **Vite**: Build tool
- **Pinia**: State management
- **Element Plus**: UI component library
- **UnoCSS**: Atomic CSS framework
- **Vitest**: Unit testing framework

If you're familiar with Vue 3 and TypeScript, you'll get up to speed very quickly. Even without Electron development experience, the renderer process development experience is nearly identical to a regular Vue project.

### A Learner-Friendly Tech Stack

An important consideration behind HexoPress's technology choices is approachability. Vue 3 and Element Plus are among the most mainstream and well-documented frontend technologies, with rich community resources and a gentle learning curve. If you're learning frontend development, HexoPress makes an excellent practice project — it covers most real-world desktop application scenarios while keeping the codebase at a manageable size.

The project keeps all npm dependencies up to date and follows best practices for each library. The code consistently demonstrates idiomatic Vue 3 Composition API patterns, TypeScript type safety practices, and Pinia state management patterns. The patterns you learn here can be directly applied to your own projects.

## Project Structure

The core directories:

- `main/`: Electron main process code, including Hexo integration, file operations, and HTTP server
- `src/`: The renderer process Vue 3 application
  - `views/`: Page-level components
  - `components/`: Reusable components
  - `stores/`: Pinia state management
  - `router/`: Route configuration
- `shared/`: Utility functions shared between main and renderer processes
- `types/`: Global type definitions

## Setting Up the Dev Environment

After cloning the repository, install dependencies and start the dev server:

```shell
npm install
npm run dev
```

In development mode, the frontend runs on port 5173 (with hot reload), and the image server runs on port 2357. The Electron window opens automatically.

## Development Workflow

Before submitting code, make sure you pass all checks:

```shell
npm run format    # Code formatting
npm run lint      # ESLint checks
npm run check-all # Type checking (Vue + Node + Vitest)
npm run test      # Unit tests
```

Once all four commands pass, your code is ready to commit.

## Commit Conventions

HexoPress follows Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Test-related changes

Commit messages are written in English. Each commit should be a complete, runnable unit.

## Where to Start

If you're not sure where to begin, here are some suggestions:

**Fixing bugs or improving existing features** is the best starting point. Browse GitHub Issues, find one that interests you, understand the context, and submit a PR.

**Adding a new editor panel** is an interesting direction. The editor's modular design makes adding new panels relatively straightforward — you just need to create a Vue component and read editor context from the shared state.

**Improving internationalization** is a low-barrier way to contribute. HexoPress supports both Chinese and English. If you find inaccurate or missing translations, you can directly modify the language files.

**Expanding test coverage** is always welcome. The project uses Vitest with `@vue/test-utils`, and test files live in `__tests__/` directories alongside the source code.

## Coding Style

A few coding conventions to keep in mind:

- Variables and fields use `camelCase`; classes and types use `PascalCase`
- New pages should prefer UnoCSS for styling
- Element Plus components need properly typed props/emit stubs in tests
- Maintain a linear Git commit history — rebase onto main before submitting a PR

## Join the Community

If you run into issues during development or want to discuss a design proposal for a new feature, feel free to start a discussion in GitHub Issues. We value every contributor's ideas and are happy to help newcomers get started.

The beauty of open source lies in collective intelligence. We look forward to your participation.
