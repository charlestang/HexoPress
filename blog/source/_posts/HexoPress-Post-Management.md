---
title: '[HexoPress] Post Management'
permalink: hexopress-post-management-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
excerpt: Learn how to browse, filter, create, and manage your blog posts in HexoPress.
date: 2026-02-11 10:20:00
updated: 2026-04-04 13:20:00
---

The Posts page is the closest thing HexoPress has to a content operations center. Its job is to help you locate the right article quickly instead of digging through folders one by one.

## Post List

Open `Posts` from the left sidebar. Each row shows:

- title
- post status (published or draft)
- category paths
- tags
- time information

When you hover over the title area, quick actions for that post appear inline.

> Illustration: add a screenshot of the post list page with the filter bar and table

## Top Filters

The list supports combining several filters:

- **Status**: published, draft, or all
- **Month**: narrow the list by month
- **Category**: filter by category
- **Keyword search**: search by title keywords

For larger blogs, this is much faster than browsing folders manually.

## Switch the Time Column

The right-most time column can switch between two views:

- **Published At**
- **Updated At**

That makes it easy to review either your publishing rhythm or your recent maintenance work.

## Post Actions

Each post comes with four common actions:

- **Preview**: open a rendered reading view with a table of contents
- **Edit**: open the full editor
- **Edit Metadata**: update title, dates, categories, tags, excerpt, and other Front Matter fields
- **Delete**: remove the post file with confirmation

`Edit Metadata` is especially useful for lightweight cleanup when you do not need the full editor.

## Where New Posts Are Created

The `New Post` action now lives in the top bar of the main window rather than inside the post list. Clicking it opens a blank editor.

From there, you can either:

- **Save Draft** first
- or **Publish** directly

On first save, HexoPress creates the actual file path from the title and permalink, then continues managing it as a normal draft or post.

## Pagination

The post list supports pagination and page-size switching. This is more stable for long-running blogs and better suited to day-to-day filtering and review work than loading everything at once.

## Preview Without Leaving the List

The preview dialog renders the post and builds a lightweight TOC. You can quickly verify layout, categories, and tags before deciding whether you need to open the full editor.

That makes the Posts page not just an entry point into files, but also a very efficient review surface.
