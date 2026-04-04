---
title: '[HexoPress] Categories and Tags'
permalink: hexopress-categories-and-tags-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
excerpt: Use the visual interface in HexoPress to manage your blog's category hierarchy and tag system.
date: 2026-02-11 10:40:00
updated: 2026-04-04 13:20:00
---

HexoPress now treats category overview and category cleanup as two separate jobs: the category list gives you the structure, while the category detail page is where bulk maintenance happens. Tags follow a similar pattern: the tag page gives you usage visibility, and the tag dialog is where quick cleanup happens.

## Categories Page: Start with the Tree

Open `Categories` from the left sidebar to see the full category tree. Every category shows its post count and preserves the original hierarchy.

For example, Hexo supports nested categories like:

```yaml
categories:
  - - Technology
    - Frontend
```

HexoPress renders that hierarchy directly, so you can see at a glance whether a category is top-level or nested under another one.

> Illustration: add a screenshot of the categories page with the tree structure and post counts

## Category Detail Page: Where Bulk Work Happens

Click `View` on any category row to open its detail page. This page is a working list of posts rather than a read-only summary.

### Toggle Parent vs Direct Posts

If you open a parent category, the detail page can include posts that belong to descendant categories as well. A banner at the top explains what you're seeing and lets you switch to:

- the full list including descendants
- only the posts directly assigned to the current category

This is especially useful when refactoring a large category tree.

### Bulk Replace Categories

After selecting multiple posts, you can replace the current category with one or more new category paths. This is useful for:

- reorganizing the category system
- migrating old categories into new ones
- reclassifying a subset of posts in one pass

HexoPress shows a confirmation summary first, then reports success and failure counts when the operation finishes.

### Bulk Remove Categories

You can also remove the current category from the selected posts. If some of those posts would end up with no categories at all, the confirmation dialog warns you before continuing.

### Jump Straight Back to the Editor

Post titles in the category detail table are clickable, so you can go from bulk cleanup back into single-post editing immediately.

> Illustration: add a screenshot of the category detail page showing the info banner, bulk action buttons, and the post table

## Tags Page: Ranked by Usage

The `Tags` page sorts tags by post count and lays them out in two columns for easier scanning.

> Illustration: add a screenshot of the tags page with the two-column layout

## Tag Posts Dialog

Click `View` on a tag to open a dialog listing the posts that use it. This dialog is more than a viewer. It lets you:

- open a post in the editor
- remove the current tag from a post directly

That makes tag cleanup much faster than editing Front Matter one post at a time, especially when cleaning up legacy, duplicate, or temporary tags.

## Categories and Tags in the Editor

You can also manage metadata while writing from the editor's top metadata area:

- **Categories**: choose from the category tree and add a new category path on the fly
- **Tags**: add or remove tags with the tag input component

The dedicated pages are best for large-scale cleanup. The editor metadata area is best for small adjustments while you write. Together they cover the day-to-day category and tag workflow of a Hexo blog.
