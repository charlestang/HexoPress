---
title: '[HexoPress] Open Design of AI Integration'
permalink: hexopress-ai-open-design-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - design
  - ai
excerpt: How the HexoPress AI writing assistant stays provider-agnostic, stream-friendly, and editor-aware without locking itself to a single vendor.
date: 2026-02-11 12:30:00
updated: 2026-04-04 13:35:00
---

The AI landscape changes too fast for hard-coded vendor integrations to age well. HexoPress addresses that by treating AI as a pluggable capability around the editor rather than as a single-provider feature.

## Provider-Agnostic by Design

HexoPress currently targets the OpenAI-compatible API shape because it has become the most practical interoperability layer across hosted services and local model gateways.

Each provider configuration now includes:

- provider name
- endpoint URL
- API key
- API spec
- model ID

That keeps the editor flexible enough to work with:

- hosted commercial models
- proxy gateways
- local runtimes such as Ollama or LM Studio, when exposed through a compatible endpoint

At the UI level, switching providers is just changing the selector in the AI input bar. HexoPress also remembers the last selected provider as the default for the next session.

## Streaming First

AI replies are rendered as a stream instead of waiting for a full response. This matters because writing assistance is interactive. Users should be able to judge direction early, interrupt mentally, and iterate quickly rather than stare at a blank panel.

## Context That Follows the Editor

The most important design choice is that context is derived from editor state rather than entered manually every time.

- If the user has a text selection, the AI panel prefers that selection
- If there is no selection, it falls back to the full document
- If the context chip is dismissed, the request becomes context-free

This gives the panel three effective context modes without turning every request into a settings exercise.

## Presets as Data, Not Hardcoded Behavior

The built-in actions such as typo check, writing tips, polish, and summary are modeled as combinations of:

- a system prompt
- a user prompt template
- a context strategy

That is a much more extensible pattern than shipping one-off buttons with bespoke logic. Adding a new preset mostly means defining those inputs cleanly.

## Loosely Coupled Editor Integration

The AI panel does not reach directly into editor internals. Instead, it consumes shared state:

- current text
- selected text
- Front Matter
- active article context

That separation matters. It allows the editor and the AI panel to evolve independently as long as the shared state contract remains stable.

## Optional by Nature

The AI feature is intentionally optional. If you configure no providers, the rest of HexoPress still works normally.

When AI is used, the request goes directly to the endpoint you configured. HexoPress itself is not positioned as an AI relay service, which keeps data flow explicit and under user control.
