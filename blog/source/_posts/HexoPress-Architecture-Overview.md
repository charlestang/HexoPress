---
title: '[HexoPress] Architecture Overview'
permalink: hexopress-architecture-overview-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - architecture
  - electron
  - web
excerpt: A high-level look at the HexoPress architecture — dual runtime modes, shared renderer, and the service layers behind Hexo management.
date: 2026-02-11 12:00:00
updated: 2026-04-04 13:35:00
---

HexoPress is no longer just an Electron desktop app. It now supports two runtime modes: a desktop experience built on Electron, and a self-hosted web app built on Fastify. Both modes share the same renderer application and the same Hexo-facing service logic.

## Two Runtime Modes

### Electron Mode

The desktop app uses the familiar Electron split:

- **Main process** for lifecycle management, Hexo integration, filesystem operations, and local services
- **Preload script** as the secure bridge that exposes `window.site.*`
- **Renderer** for the actual UI

This mode is optimized for local editing with the blog directory chosen directly on the user's machine.

### Web Mode

The self-hosted deployment replaces Electron's IPC boundary with an HTTP boundary:

- **Fastify server** hosts authentication, API routes, and site initialization
- **Renderer SPA** runs in the browser
- **Same Hexo/FS services** power the actual blog operations on the server side

This mode is useful when you want remote access while still keeping the deployment under your own control.

## Shared Service Layer

Under both runtime modes, HexoPress relies on the same backend responsibilities:

- **HexoAgent** for loading Hexo data, querying posts/categories/tags, and writing content
- **FsAgent** for controlled access to files under `source/`
- **Asset serving and metadata support** for previews, file inspection, and reference lookup

The important architectural decision is that business capabilities are not duplicated per runtime. Electron IPC handlers and Fastify routes both map to the same underlying services.

## Bridge and API Contract

The renderer talks to the backend through a unified `site` interface.

- In Electron mode, that interface is backed by IPC calls exposed from preload
- In Web mode, the same interface is implemented through `fetch` calls to `/api/*`

This shared contract keeps renderer code largely runtime-agnostic. The UI does not need to care whether a request crosses an IPC channel or an HTTP route.

## Renderer Structure

The renderer is a Vue 3 single-page app using:

- **Vue Router** for navigation
- **Pinia** for application state
- **Element Plus** and **UnoCSS** for UI composition

The main navigation includes dashboard, posts, categories, tags, media library, and preferences, while the editor uses a separate full-screen workspace with its own side tools.

## Editor-Centered State Sharing

One of the more important architectural choices is that the editor does not keep all useful state to itself. The current text, selection, heading outline, and Front Matter are lifted into shared stores so that other panels can collaborate with the editor.

That is what makes these features possible without tight coupling:

- TOC synchronized with the current headings
- AI panel aware of full text and selection
- media insertion that understands the current post context

## Hexo as a Library, Not a CLI

HexoPress embeds Hexo directly as a Node.js library rather than shelling out to `hexo` commands for every operation.

This gives the app:

- direct access to Hexo's in-memory data model
- faster queries for filtering and statistics
- consistent Front Matter handling when reading and writing files

The result is less process overhead and a more reliable editing experience.

## Build and Delivery

The project uses different build paths for the two runtime modes:

- **Electron mode**: Electron Forge + Vite
- **Web mode**: Vite for the SPA and esbuild-powered server bundling for Fastify

Even though delivery differs, the architectural goal stays the same: one renderer experience, one service model, two deployment choices.
