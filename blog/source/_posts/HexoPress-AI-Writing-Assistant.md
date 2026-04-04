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
updated: 2026-04-04 13:20:00
---

The AI panel in HexoPress is not a detached chatbot. It is a writing assistant that works directly with the editor, using the current document, the selected text, and the post metadata as context. That makes it much more useful for in-flow writing than for generic standalone chatting.

## Configure a Provider First

Go to `Preferences` → `AI` and add at least one provider. The current configuration fields are:

- Provider Name
- API Endpoint
- API Key
- API Spec (currently OpenAI-compatible)
- Model ID

You can configure multiple providers, such as a cloud model and a local proxy, and switch between them in the editor depending on the task.

> Illustration: add a screenshot of the AI settings page with provider cards and the Model ID field

## Opening the AI Panel

Click the AI icon on the right side of the editor to open the panel. It has three major parts:

- preset buttons at the top
- the message area in the middle
- the input bar and provider selector at the bottom

The input bar shows the active provider and displays the current model ID beside it.

## Four Built-in Presets

The panel currently ships with four high-frequency presets:

### Typo Check

Uses the full document as context and looks for typos, grammar issues, punctuation problems, and unclear expression.

### Writing Tips

Uses the full document and reviews structure, logic, expression, and readability.

### Polish

Uses only the currently selected text. If nothing is selected, HexoPress prompts you to select text first.

### Summary

Uses the full document to generate a short summary suitable for excerpts, SEO descriptions, or social previews.

> Illustration: add a screenshot of the AI panel showing the four preset buttons and the message list

## Context Is Chosen Automatically

You do not have to manually pick a context mode every time. The AI panel infers context from the editor state:

- if you have a text selection, it prefers the selection
- if there is no selection, it defaults to the full document
- if you dismiss the context chip, the next request becomes context-free

That means simply selecting a paragraph in the editor turns the AI panel into a local rewriting assistant without extra setup.

## Free Chat

You can also type your own instructions directly, for example:

- make this paragraph sound more conversational
- what is weak in the structure of this article
- propose five punchier titles for this post

Responses stream into the message area progressively, so you can evaluate them while they arrive and decide whether to keep iterating.

## Best Use Cases

The AI writing assistant is especially useful for:

- reviewing a draft after the first pass
- polishing a selected paragraph without touching the rest
- generating summaries, intros, or social snippets quickly
- discussing article direction without leaving the editor

If you want AI involved in the development workflow instead of the writing workflow, continue with `AI-Assisted Development with OpenSpec`.
