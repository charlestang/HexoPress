---
title: '[HexoPress] Modular Editor Design'
permalink: hexopress-editor-modular-design-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - design
  - editor
excerpt: How the HexoPress editor uses modular side panels and shared state to offer rich features while keeping the interface clean.
date: 2026-02-11 12:20:00
updated: 2026-02-11 12:20:00
---

The editor is the most complex part of HexoPress. It needs to provide a smooth Markdown editing experience while integrating file browsing, outline navigation, media insertion, and AI assistance. How to accommodate all these features without bloating the interface is an interesting design challenge.

## Separating Core from Panels

The design philosophy of the HexoPress editor is: keep the core editing area pure, and deliver auxiliary features through switchable side panels.

The editing area cares about exactly two things: editing Markdown text and managing Front Matter metadata. It doesn't know or care what panels exist beside it. This separation keeps the editing experience free from auxiliary distractions — when you're focused on writing, you can collapse all panels for maximum editing space.

The side panels are independent functional modules, each with its own responsibility:

- **File Explorer**: Navigate the blog's source file directory
- **Table of Contents**: Display the heading structure of the current post
- **Media Panel**: Browse and insert image assets
- **AI Panel**: Chat with the AI assistant

These panels don't depend on each other and can be developed and tested independently.

## Collaboration Through Shared State

While the panels are independent, they need access to the editor's context. For example, the TOC panel needs to know the article's heading structure, and the AI panel needs to read the article content or selected text.

HexoPress's solution is to lift the editor's key state into a global state manager. The editor component is responsible for syncing its state (text content, selected text, heading list, Front Matter, etc.) to this shared space, and panel components read the data they need from it.

The benefits of this design:

**Loose coupling.** Panels don't need to directly reference the editor component or know its internal implementation. They only depend on the shared state's data structure.

**Extensible.** Adding a new panel only requires reading from shared state — no changes to the editor's code.

**Testable.** Panels can be tested independently by mocking the shared state, without spinning up the full editor environment.

## Selection Awareness

An interesting detail is how the editor lets external components know about the user's text selection.

The editor periodically checks the underlying editing engine's selection state and syncs the selected text and position information to the shared state. This way, the AI panel can know what the user currently has selected, enabling context-aware features like "polish selected text."

This polling mechanism isn't as elegant as event-driven approaches, but it's simple and reliable, avoiding the need to build complex event bridges between the editing engine and Vue's reactivity system.

## Immersive Writing Experience

The editor page is separated from other management pages at the routing level, using an independent full-screen layout. This means that when you enter the editor, the left navigation bar disappears, and the entire window is dedicated to writing.

This design decision reflects a philosophy: management and writing are two different mental modes. When managing, you need navigation, filtering, and overviews. When writing, you need focus, immersion, and freedom from distraction. By separating these two modes at the routing level, HexoPress lets each experience be its best.

## Future-Ready Extensibility

The modular panel design leaves room for future feature expansion. New auxiliary features can be added as new panels without restructuring the existing editor architecture. The pattern of panels communicating through shared state also makes collaboration between multiple panels natural.

If you're interested in contributing a new editor panel to HexoPress, this architecture makes your work relatively straightforward — define the panel's UI, read the data you need from shared state, and you're ready to go.
