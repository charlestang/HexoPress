---
title: '[HexoPress] Getting Started'
permalink: hexopress-getting-started-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
excerpt: Download and launch HexoPress, connect it to your Hexo blog directory, and start managing your blog visually.
date: 2026-02-11 10:00:00
updated: 2026-04-04 13:20:00
---

HexoPress now runs in two forms: a desktop app and a self-hosted web app. Both modes lead to the same main interface once the blog is initialized: Dashboard, Posts, Categories, Tags, Media Library, Preferences, and the top-bar entry for creating a new post.

## Pick a Runtime Mode

### Desktop App (Electron)

This is the fastest way to get started. Download the installer from GitHub Releases:

- macOS: `.dmg`
- Windows: `.exe`
- Linux: `.AppImage` or `.deb`

Install it and launch HexoPress.

### Web Mode (Self-hosted)

If you want browser-based access, deploy the web app instead:

```bash
git clone https://github.com/charlestang/HexoPress.git
cd HexoPress
npm install
cp web/hexopress.config.example.json hexopress.config.json
```

Set your blog directory, port, and login credentials in `hexopress.config.json`, then run:

```bash
npm run web:build
node dist/server.cjs
```

For development:

```bash
npm run web:dev
```

## First Entry

### Desktop App

On first launch, you'll see the Setup page asking for a local Hexo blog root directory.

> Illustration: add a screenshot of the desktop Setup page with the directory picker

Pick the directory that contains `_config.yml`, `source`, `themes`, and the rest of your Hexo project. HexoPress will initialize the site and load posts, drafts, categories, tags, and media assets.

### Web Mode

Web mode starts with a login page. Sign in with the username and password configured on the server, and HexoPress will continue into the main interface. The blog directory is already configured server-side, so there is no directory picker in the browser.

> Illustration: add a screenshot of the Web mode login page

## After Initialization

Once loading finishes, you land on the Dashboard. It shows your blog title, subtitle, keywords, content counts, writing heatmap, recent published posts, and drafts.

The left sidebar gives you access to:

- **Dashboard**: overall site status
- **Posts**: filtering, searching, previewing, and maintaining content
- **Categories**: category tree plus category detail pages for bulk reorganization
- **Tags**: usage overview plus a tag dialog for quick cleanup
- **Media Library**: centralized image and file management
- **Preferences**: language, editor behavior, appearance, and AI provider settings

The top bar also has a **New Post** button. It opens a blank editor where you can either save the document as a draft first or publish it directly.

## Recommended Next Reads

- `Dashboard Overview` to understand the homepage at a glance
- `Post Management` for filters, preview, and metadata editing
- `Editor Features` for writing, drag-and-drop uploads, and side panels
- `Media Library` for grouped images, detail pages, and reference lookup

At this point, you're ready to manage your Hexo blog with HexoPress.
