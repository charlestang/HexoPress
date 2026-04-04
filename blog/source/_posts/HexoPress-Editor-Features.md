---
title: '[HexoPress] Editor Features'
permalink: hexopress-editor-features-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
  - editor
excerpt: A deep dive into the HexoPress editor — Markdown editing, side panels, and handy shortcuts.
date: 2026-02-11 10:30:00
updated: 2026-04-04 13:20:00
---

The HexoPress editor has grown into a writing workspace designed to keep momentum high: title, metadata, body text, images, outline, and AI all live in the same screen.

## Top Area: Title and Save Actions

The top area contains the title input and the primary save controls. The available action depends on the document state:

- **new post / draft**: `Save Draft`, `Publish`
- **published post**: `Update`

There is also a file-path dialog available from the title field, so you can inspect or adjust where the document lives on disk.

## Metadata Panel

The collapsible panel beside the editor centralizes Front Matter editing:

- publish date
- permalink
- categories
- tags

If the current post is already published, the panel also exposes deletion. Categories use a tree-based selector that works well for nested structures, while tags are optimized for quick add/remove operations.

> Illustration: add a screenshot of the editor header and metadata panel

## The Main Markdown Editor

The main body uses a live Markdown editor with:

- syntax highlighting
- live preview
- Vim mode
- immediate application of font, size, line-wrap, and code-block appearance settings from Preferences

In other words, the Appearance tab is not abstract configuration. Its changes are visible in the editor right away.

## Drag-and-Drop Image Upload

This is one of the most practical workflows in the current editor. When you drag a local image into the writing area, HexoPress:

1. opens an upload dialog
2. pre-fills a date-based destination path
3. uploads the image to `source/images/YYYY/MM/`
4. inserts the Markdown image syntax automatically

That is much smoother than manually copying files and composing relative paths yourself.

## Side Tool Panels

The editor includes a switchable side tool area.

### File Explorer

The file panel lets you browse the `source` directory structure and follow the current path through breadcrumbs. It is useful when you want quick filesystem context while writing.

### Table of Contents (TOC)

The TOC panel extracts the current heading structure and keeps track of the active heading. Clicking a TOC item scrolls the editor directly to that section.

### Media Panel

The media panel reads image assets from the blog and supports:

- search
- preview
- path and dimension lookup
- double-click insertion of Markdown image syntax

It complements the full Media Library: the library is for management, the panel is for fast in-editor insertion.

### AI Panel

The AI panel shares editor context, including the full document, the current selection, and Front Matter. It is ideal for polishing, summarizing, and in-flow writing assistance. For the full workflow, see `AI Writing Assistant`.

## Auto-Save and Writing Without Context Switching

If auto-save is enabled in Preferences, HexoPress periodically saves dirty documents in the background. Combined with drag-and-drop uploads, side panels, and the AI panel, the editor is built to minimize context switching while you write.
