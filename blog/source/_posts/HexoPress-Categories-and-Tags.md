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
updated: 2026-02-11 10:40:00
---

Categories and tags are the two pillars of content organization in a blog. HexoPress provides an intuitive visual interface to manage both.

## Category Management

Click "Categories" in the left sidebar to enter the category management page.

### Tree View

HexoPress displays all categories in a tree structure, fully representing the category hierarchy. Each category shows the number of posts it contains.

Hexo supports multi-level categories. For example:

```yaml
categories:
  - - Technology
    - Frontend
```

This means the post belongs to the "Frontend" subcategory under "Technology". In HexoPress's tree view, you can clearly see this hierarchical structure.

"插图：Screenshot of the Categories page, showing the tree structure with post counts"

### Viewing Posts by Category

Click any category to view all posts under it. From there, you can jump directly to a post's editing page.

### Batch Category Management

When your blog grows to hundreds of posts, modifying categories one by one becomes painful. HexoPress includes a carefully designed batch category management tool for exactly this scenario.

In the post list under a category, you can select multiple posts using checkboxes, then perform bulk operations:

- **Batch Replace**: Replace the current category with different categories for all selected posts. For example, move some posts from "Frontend" to "Full Stack" in one click
- **Batch Remove**: Remove the current category from all selected posts

A confirmation prompt appears before each operation, and a summary of successes and failures is shown afterward. This feature is especially useful when reorganizing your blog's category structure — you can quickly adjust categories across many posts without opening the editor for each one.

"插图：Screenshot of the category post list with multiple posts selected and batch action buttons visible"

## Tag Management

Click "Tags" in the left sidebar to enter the tag management page.

### Tag List

All tags are displayed in a list, sorted by post count from most to least. Each tag shows the number of associated posts, giving you an instant view of which tags are used most frequently.

"插图：Screenshot of the Tags page, showing the tag list with post counts"

### Viewing Posts by Tag

Click any tag to open a dialog listing all posts with that tag. You can jump to post editing directly from here.

### Managing Tags from the Dialog

The tag dialog isn't just a post list — you can manage the relationship between posts and tags right here. Each post has a remove action next to it, letting you quickly clean up tag assignments without opening the editor.

Compared to manually editing each post's Front Matter via the command line to adjust tags, this visual approach is far more efficient.

## Managing Categories and Tags in the Editor

Beyond the dedicated management pages, you can also set categories and tags directly in the editor's Front Matter area:

- **Categories**: Use the dropdown selector to choose an existing category, or type a new category name
- **Tags**: Type a tag name and press Enter to add it; click the close button on a tag to remove it

"插图：Close-up screenshot of the category selector and tag input in the editor's Front Matter area"

This approach is ideal for organizing posts on the fly while writing.
