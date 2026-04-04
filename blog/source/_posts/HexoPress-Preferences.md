---
title: '[HexoPress] Preferences'
permalink: hexopress-preferences-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
excerpt: Explore HexoPress preferences and customize the editor to fit your workflow.
date: 2026-02-11 11:10:00
updated: 2026-04-04 13:20:00
---

The Preferences page is now organized into three tabs: **General**, **Appearance**, and **AI**. Most changes apply immediately, so you can tune the app without restarting it.

> Illustration: add a screenshot of the full Preferences page with all three tabs

## General

### Blog Base Path

This section shows the currently connected blog directory.

- In the desktop app, you can click `Unbind or Change` to switch to another local Hexo site
- In Web mode, the path is configured on the server and is mostly informational here

### Language

HexoPress currently supports English and Simplified Chinese. Switching languages updates navigation labels, buttons, and other UI text right away.

### Auto-Save

When enabled, the editor periodically saves dirty documents for you. It's useful for long writing sessions. If you prefer explicit save actions, turn it off.

### Editor Mode

Choose between the normal editing experience and Vim mode. The change is applied directly to the main editor without restarting the window.

## Appearance

The Appearance tab controls the overall look of the app and the reading feel of the editor.

### Theme

Three modes are available:

- **System**
- **Light**
- **Dark**

The selected theme affects both the application shell and the editor presentation.

### Editor

These settings target the main writing area:

- **Line Wrap**
- **Editor Font Size**
- **Editor Font Family**

The built-in presets cover both reading-oriented and developer-oriented styles.

### Code Blocks

This section affects code snippets in editing and preview:

- **Code Block Theme**, grouped into dark and light families
- **Show Line Numbers**
- **Code Font Family**

If you write technical posts frequently, this tab has a noticeable impact on readability.

> Illustration: add a screenshot of the Appearance tab showing the Theme, Editor, and Code Block sections

## AI

The AI tab manages the providers used by the editor's AI side panel.

### Add a Provider

You can configure multiple providers. Each provider includes:

- **Provider Name**
- **API Endpoint**
- **API Key**
- **API Spec**: currently OpenAI-compatible
- **Model ID**

### Switch Providers in the Editor

Once configured, the AI input bar in the editor shows a provider selector. You can switch models depending on the task, and HexoPress remembers the last selected provider as the default.

### Remove Old Configurations

Providers you no longer use can be deleted directly from Preferences. The AI panel updates immediately after removal.

> Illustration: add a screenshot of the AI tab showing multiple provider cards and the Model ID field

For day-to-day usage patterns, continue with `AI Writing Assistant`.
