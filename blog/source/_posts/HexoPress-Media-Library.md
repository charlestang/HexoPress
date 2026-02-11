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
updated: 2026-02-11 10:50:00
---

Blogs frequently need images and other file assets. The HexoPress Media Library provides a centralized interface for managing all of them.

## Accessing the Media Library

Click "Media Library" in the left sidebar to enter the media management page. The page is divided into two tabs:

- **Images**: Manage all image assets in your blog
- **Files**: Manage other types of files

## Image Management

### Browsing Images

The Images tab displays all blog images in a grid layout with thumbnail previews. HexoPress automatically groups images with the same name but different formats (e.g., `photo.jpg` and `photo.webp`) together for easier management.

Image previews are powered by HexoPress's built-in local HTTP server (port 2357), which starts automatically — no extra configuration needed.

"插图：Screenshot of the Media Library Images tab, showing the image grid with thumbnail previews"

### Cleaning Up Unused Images

The Media Library offers a handy feature: deleting images that aren't referenced by any post. This helps you clean up redundant assets in your blog directory and reduce its overall size.

Supported image formats for cleanup include: PNG, JPG, JPEG, WebP, GIF, and SVG.

## File Management

The Files tab displays non-post files under the blog's `source` directory in a table format, showing filenames, modification dates, and other information.

"插图：Screenshot of the Media Library Files tab, showing the file table"

## Inserting Images from the Editor

In addition to browsing images in the Media Library, you can search for and insert images directly from the editor's media side panel. After selecting an image, the editor will automatically generate the Markdown image syntax and insert it at the cursor position.

## A Major Upgrade from Command-Line Image Management

In the traditional Hexo workflow, managing images is quite tedious. You need to manually copy images to the right location under the `source` directory, hand-write image paths in Markdown, and keep track of which images are in use and which aren't.

The HexoPress Media Library transforms this experience entirely:

- **Visual browsing**: A thumbnail grid lets you see all images at a glance — no more digging through file managers
- **Smart grouping**: Images with the same name but different formats are automatically grouped, making multi-format asset management clearer
- **One-click insertion**: Select an image from the editor's side panel to insert it — no more hand-writing paths
- **Redundancy cleanup**: Automatically detects unreferenced images, helping you keep your blog directory tidy

Together, these features turn image management from a headache into a smooth experience.
