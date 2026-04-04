---
title: '[HexoPress] Media Library'
permalink: hexopress-media-library-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
excerpt: Use the HexoPress Media Library to manage images and file assets in your blog.
date: 2026-02-11 10:50:00
updated: 2026-04-04 13:20:00
---

The media experience in HexoPress is no longer just a flat image list. It now consists of an **image group overview**, a **media detail page**, and a **file list**, with a stronger focus on variant management, reference lookup, and fast insertion into posts.

## Entering the Media Library

Open `Media Library` from the left sidebar. The page has two tabs:

- **Images**: grouped image resources
- **Files**: other non-image files under `source`

## Image Overview: Groups First, Variants Second

The Images tab groups together files that belong to the same visual asset, even if they differ by format or size. For example, `cover.png`, `cover.webp`, and `cover@2x.png` appear as one card with a variant count.

> Illustration: add a screenshot of the Images tab with grouped cards and the variant count label

This grouping works especially well for responsive images, multiple export formats, or hand-maintained size variants.

## Media Detail Page

Click any image card to open the detail page for that group. It shows:

- a representative preview
- file size
- dimensions
- created and updated timestamps
- a direct browser link to the asset

Below that, a table lists every variant in the group.

### Actions per Variant

Each file variant supports:

- **Open**: view the file directly in the browser
- **View references**: find which posts reference that image
- **Delete**: remove a single variant

> Illustration: add a screenshot of the media detail page with the top metadata panel and the variant table

## Reference Lookup

`View references` opens a dialog listing the posts that reference the selected image. From there, you can jump back into the editor and fix the content immediately.

If no post references the image, the dialog says so explicitly and lets you decide whether to delete the asset.

This is far more practical than manually searching filenames across your blog directory.

## What Deletion Currently Means

Before deleting, HexoPress shows a warning that the file **may still be referenced by posts**. In other words, deletion is available, but the app asks for confirmation instead of assuming the file is unused.

Common directly deletable formats currently include:

- PNG
- JPG / JPEG
- WebP
- GIF
- SVG

## Files Tab

The Files tab is for non-image resources under `source`, such as downloadable files, attachments, or other static assets. It gives you a table view of paths and timestamps.

> Illustration: add a screenshot of the Files tab in table layout

## Editor Integration

The editor also includes a dedicated media side panel:

- search images
- preview image metadata
- double-click to insert Markdown image syntax at the cursor

You can also drag a local image directly into the editor. HexoPress opens an upload dialog, defaults the destination to `source/images/YYYY/MM/`, uploads the file, and inserts the Markdown image path automatically.

That turns "upload image + get the path right + insert it into the post" into one continuous action instead of a manual file-copy workflow.
