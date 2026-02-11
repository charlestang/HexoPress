---
title: '[HexoPress] AI Writing Assistant'
permalink: hexopress-ai-writing-assistant-en/
categories:
  - - HexoPress Tutorial
tags:
  - hexopress
  - guide
  - ai
excerpt: Configure and use the built-in AI writing assistant in HexoPress for spell-checking, polishing, and summarizing your posts.
date: 2026-02-11 11:00:00
updated: 2026-02-11 11:00:00
---

HexoPress includes a built-in AI writing assistant that provides real-time help while you write. It's integrated into the editor's side panel and supports any AI service compatible with the OpenAI API format.

## Configuring an AI Provider

Before using the AI assistant, you need to configure an AI service provider. Go to "Preferences" → "AI" tab:

1. Click "Add Provider"
2. Fill in the following details:
   - **Name**: A label for this provider, e.g., "OpenAI" or "Local Model"
   - **Endpoint**: The API endpoint URL
   - **API Key**: Your API key for the service
   - **Model ID**: The specific model to use, e.g., `gpt-4` or `claude-3-sonnet`

You can configure multiple providers and switch between them freely.

"插图：Screenshot of the Preferences AI tab, showing the provider configuration form"

## Opening the AI Panel

In the editor, click the AI icon in the right sidebar to expand the AI panel. The panel has four preset buttons at the top and a chat area below.

"插图：Screenshot of the AI panel expanded in the editor, showing the four preset buttons and chat input area"

## Built-in Presets

HexoPress provides four carefully designed AI presets covering the most common writing needs:

### 📝 Typo Check

Uses the full article as context and asks the AI to review it thoroughly — finding typos, grammar errors, punctuation issues, and unclear expressions. The AI returns a structured list of issues with specific suggestions for each.

### ✨ Writing Suggestions

Analyzes the entire article across four dimensions — structure, logic, expression, and readability — and provides specific, actionable improvement suggestions. Best used after completing a first draft.

### 🔄 Polish Text

Select a passage in the editor, and the AI will polish the selected text while preserving the original meaning — improving fluency and expression quality. You must select text in the editor before using this preset.

### 📋 Generate Summary

Uses the full article as context to generate a concise 2-3 sentence summary, suitable for use as the post's excerpt, SEO meta description, or social media preview text.

## Free Chat

Beyond the presets, you can type any question or instruction directly in the input box to have a free-form conversation with the AI. The AI can understand your article content based on the context mode you choose:

- **Full document**: The AI can see the entire article
- **Selection only**: The AI only sees the text you've selected in the editor
- **No context**: A pure conversation without any article content attached

Chat history is preserved in the panel, so you can review previous exchanges at any time.

"插图：Screenshot of an AI chat conversation, showing user messages and AI responses"
