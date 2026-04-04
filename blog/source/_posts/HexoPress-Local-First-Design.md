---
title: '[HexoPress] Local-First Design Philosophy'
permalink: hexopress-local-first-design-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - design
  - local-first
excerpt: Why does HexoPress still emphasize local-first principles even after adding a self-hosted web mode?
date: 2026-02-11 12:10:00
updated: 2026-04-04 13:35:00
---

HexoPress started from a local-first desktop mindset, and that principle still matters even after the project added a self-hosted web mode. The key idea is no longer "everything must live on one laptop," but rather "your blog remains in files and infrastructure you control."

## What Local-First Means in HexoPress Today

For HexoPress, local-first means:

- your source of truth is still the Hexo project on disk
- there is no proprietary database layer that owns your content
- you can keep working with Git, editors, and deployment pipelines you already trust

In desktop mode, that usually means the blog lives directly on your machine. In Web mode, it means the blog lives on your own server rather than inside a hosted SaaS product.

## Why This Still Matters

### Data Ownership

Posts, drafts, media files, configuration, and themes all remain regular project files. You can back them up however you want, review them in Git, and open them in any editor at any time.

### Low Operational Overhead

Desktop mode remains close to zero-config: point HexoPress at a local Hexo directory and start working. Web mode adds a server, but still keeps the operational model simple because the app works directly against the blog files rather than a separate application database.

### Workflow Compatibility

HexoPress is designed to join your toolchain, not replace it. Use VS Code, Git, CI/CD, or manual deployment whenever you want. HexoPress changes are still just file changes.

## Hexo as a Library, Not a CLI Wrapper

One of the technical foundations of this philosophy is that HexoPress integrates Hexo as a Node.js library rather than shelling out to `hexo` commands repeatedly.

That gives the runtime direct access to:

- Hexo's data model
- query capabilities for posts, categories, and tags
- Front Matter parsing and writing logic

The same idea holds across runtime modes: Electron and Web mode both use service layers that work directly with the Hexo project instead of treating it as an opaque external command.

## The Filesystem Remains the Source of Truth

HexoPress does not introduce its own content database. It reads and writes the same files that your Hexo project already uses:

- Markdown content under `source/_posts/` and `source/_drafts/`
- media and static assets under `source/`
- blog configuration in `_config.yml`

That is why the app stays compatible with the rest of the Hexo ecosystem.

## Offline vs Remote Access

Desktop mode still preserves the strongest local-first benefits:

- no network needed for normal editing
- no external service dependency for core blog management
- direct access to local files

Web mode is a deliberate tradeoff. You give up strict locality in exchange for remote access, but you do not give up ownership because the deployment is still yours.

## Privacy Implications

Core HexoPress functionality does not require sending blog content to a third-party service. The main exception is AI assistance, and that only happens if you explicitly configure an external endpoint.

So the practical promise is this: HexoPress manages content you control, on infrastructure you control, using file formats you already own.
