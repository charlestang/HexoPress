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
updated: 2026-02-11 10:30:00
---

HexoPress comes with a feature-rich Markdown editor that lets you focus on writing while providing convenient tools at your fingertips.

## Editing Area

The main body of the editor is a Markdown editing area with syntax highlighting. You can write Markdown content just as you would in any text editor.

"插图：Screenshot of the full editor page, showing the Front Matter area at top, editing area in the middle, and side panel icons on the right"

The editor supports two modes:

- **Normal mode**: A standard text editing experience
- **Vim mode**: For Vim users — enable Vim keybindings in Preferences

### About Vim Mode

For old-school users who live and breathe Vim, this one's for you. When enabled, the editor supports Vim's modal editing along with common motion and editing commands, letting you maintain your familiar keyboard workflow right inside HexoPress.

Vim mode can be toggled on or off at any time in Preferences — no restart required. If you've never used Vim, just stick with the default normal mode.

## Front Matter Editing

At the top of the editor is a Front Matter editing area where you can directly modify the post's metadata:

- **Title**: The display title of the post
- **Date**: The publish date
- **Permalink**: A custom URL path for the post
- **Categories**: Select or create post categories (hierarchical categories supported)
- **Tags**: Add or remove tags
- **Excerpt**: A short description of the post

These fields correspond to the YAML Front Matter block at the top of the Markdown file.

"插图：Close-up screenshot of the Front Matter editing area, showing title, date, categories, tags fields"

## Auto-Save

HexoPress supports auto-save. When enabled, the editor will automatically save the file after you stop typing for a moment — no manual action needed. You can toggle this feature in Preferences.

## Side Panels

The editor provides four switchable side panels on the right. Click the corresponding icon to expand one:

### File Explorer

Displays the file structure of your blog's `source` directory with breadcrumb navigation. You can browse and switch to other files for editing without going back to the post list.

"插图：Screenshot of the File Explorer side panel expanded"

### Table of Contents (TOC)

Automatically parses the heading structure of the current post and generates a table of contents tree. Click any heading in the TOC to scroll the editor to that position — great for navigating long articles.

"插图：Screenshot of the TOC side panel expanded"

### Media Panel

Shows image assets from your blog with search and preview support. You can select an image directly from the media panel to insert it into the current post, saving you from manually typing image paths.

"插图：Screenshot of the Media side panel expanded, showing image list and search box"

### AI Panel

An integrated AI writing assistant that can help with spell-checking, polishing text, generating summaries, and more. For detailed usage, see the dedicated AI Writing Assistant tutorial.

"插图：Screenshot of the AI side panel expanded, showing preset buttons and chat area"
