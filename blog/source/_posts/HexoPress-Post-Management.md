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
updated: 2026-02-11 10:20:00
---

The post list is one of the most frequently used pages in HexoPress. Here you can browse all your articles, apply filters and searches, and perform various operations on your posts.

## Post List

Click "Posts" in the left sidebar to enter the post list page. Each post displays its title, publish date, update date, categories, and status (published or draft).

"插图：Screenshot of the post list page, showing post entries and the filter bar at the top"

## Filtering and Searching

The top of the post list provides several filtering options:

- **Status filter**: Choose to view "Published", "Draft", or "All" posts
- **Date filter**: Filter posts by month to quickly locate content from a specific time period
- **Category filter**: Show only posts under a specific category
- **Keyword search**: Enter keywords to search post titles in real time

These filters can be combined to help you quickly find what you're looking for among a large number of posts.

"插图：Close-up screenshot of the filter bar, showing status, date, category filters and search box"

## Sorting

The post list supports two sorting modes:

- Sort by publish date
- Sort by update date

Click the corresponding sort button to switch between them.

## Creating a New Post

On the post list page, click the "New Post" button. A dialog will appear asking for the post's filename. After confirming, HexoPress will create a new Markdown file in the `source/_posts/` directory and automatically open the editor.

"插图：Screenshot of the New Post dialog"

## Post Actions

Each post has action buttons on its right side:

- **Edit**: Open the editor to modify the post
- **Preview**: Preview the rendered post in a popup
- **Edit Metadata**: Modify the post's Front Matter (title, date, categories, tags, etc.) without entering the editor
- **Delete**: Delete the post (with a confirmation prompt)

"插图：Close-up screenshot of the action buttons on a post row, showing Edit, Preview, Metadata, and Delete buttons"

## Drafts and Publishing

In Hexo, drafts are stored in the `source/_drafts/` directory, while published posts live in `source/_posts/`. With HexoPress, you can easily switch between the two — publish a draft or move a published post back to draft status.
