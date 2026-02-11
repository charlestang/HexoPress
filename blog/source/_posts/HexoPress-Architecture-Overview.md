---
title: '[HexoPress] Architecture Overview'
permalink: hexopress-architecture-overview-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - architecture
  - electron
excerpt: A high-level look at the HexoPress architecture — Electron's multi-process model, IPC communication design, and frontend app structure.
date: 2026-02-11 12:00:00
updated: 2026-02-11 12:00:00
---

HexoPress is an Electron-based desktop application that provides a visual management interface for Hexo blogs. This article introduces its technical architecture from a high level, helping you quickly build a mental model of the entire project.

## Three-Process Model

Like all Electron apps, HexoPress runs across three cooperating processes:

The **main process** handles application lifecycle management and system-level operations. It hosts three core services: an agent layer that interfaces with Hexo, a service for file system operations, and a local HTTP server for image previews. All operations requiring Node.js capabilities happen here.

The **preload script** serves as the security bridge between the main and renderer processes. Using Electron's Context Bridge mechanism, it exposes the main process's capabilities to the renderer as a type-safe API. The renderer cannot access Node.js directly — all system operations must cross this bridge.

The **renderer process** is a standard Vue 3 single-page application responsible for all UI rendering and user interaction. It uses Pinia for state management, Vue Router for navigation, and Element Plus as the UI component library.

## IPC Communication Design

The three processes collaborate through IPC (Inter-Process Communication). HexoPress follows a clean channel naming convention: `domain:action`. For example, `site:posts` fetches the post list, and `post:save` saves a post.

All IPC calls follow an async request-response pattern. The renderer invokes methods through `window.site.*`, and the main process handles them and returns results. This design makes renderer code look like ordinary async function calls, hiding the complexity of cross-process communication.

The complete interface contract is enforced through TypeScript interface definitions, ensuring type consistency on both sides.

## Hexo Integration Strategy

One of HexoPress's key design decisions is importing Hexo directly as a Node.js library rather than shelling out to hexo-cli.

This means a Hexo instance runs within the main process, and HexoPress can directly access Hexo's in-memory database to query posts, categories, and tags. File reads and writes go through Hexo's Front Matter parser, ensuring metadata formats always remain Hexo-compatible.

This approach brings significant performance benefits — no need to repeatedly spawn child processes or parse CLI text output. It also lets HexoPress leverage Hexo's rich query API for complex filtering and statistics.

## Frontend App Structure

The renderer's Vue 3 application follows a classic layered structure:

The **routing layer** uses hash mode (more reliable under Electron's file:// protocol) and implements blog directory detection and auto-initialization logic through navigation guards.

The **state layer** consists of multiple Pinia stores, each managing state for a different domain. One notable design is the sharing of editor state — the editor's text content, selected text, heading structure, and other information are lifted into a global store, allowing external components like the AI panel to access editor context.

The **view layer** is split between page-level components and reusable components. The editor page uses a separate full-screen layout, distinct from the navigation layout of other management pages, providing an immersive writing experience.

## Build System

HexoPress uses Electron Forge with a Vite plugin for building. Each of the three processes has its own Vite configuration, optimized for its respective runtime environment (Node.js / sandbox / browser).

The renderer build also integrates UnoCSS (atomic CSS), auto-import for components, internationalization tooling, and more — maintaining a great developer experience while keeping bundle size under control.

That's the big picture of HexoPress's architecture. If you're interested in specific areas, subsequent articles dive deeper into editor design, AI integration, and other topics.
