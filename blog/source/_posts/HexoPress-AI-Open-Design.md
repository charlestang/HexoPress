---
title: '[HexoPress] Open Design of AI Integration'
permalink: hexopress-ai-open-design-en/
categories:
  - - HexoPress Technical
tags:
  - hexopress
  - design
  - ai
excerpt: How the HexoPress AI writing assistant achieves provider-agnostic, context-flexible, and preset-extensible design — an integration approach built for an open ecosystem.
date: 2026-02-11 12:30:00
updated: 2026-02-11 12:30:00
---

When integrating an AI writing assistant into HexoPress, we faced a core question: the AI landscape changes extremely fast — today's leading model might be surpassed tomorrow. How do you design an integration that won't quickly become obsolete?

The answer: don't bind to any specific AI provider.

## Provider-Agnostic Design

HexoPress's AI integration is built on the OpenAI-compatible API format. This isn't because we favor OpenAI, but because this API format has become the de facto industry standard. Nearly all major AI services — whether OpenAI, Anthropic, Google, or various local deployment solutions for open-source models — offer interfaces compatible with this format.

Users can configure multiple AI providers, each requiring just four parameters: name, endpoint URL, API key, and model ID. This means:

- You can use OpenAI's GPT series
- You can use Anthropic's Claude series (via compatible endpoints)
- You can use locally deployed open-source models (e.g., through Ollama or LM Studio)
- You can use any service that provides an OpenAI-compatible API

Switching providers is as simple as changing a dropdown selection.

## Streaming Responses

AI replies use streaming (Server-Sent Events) rather than waiting for the complete response before displaying. This means you can watch the AI generate its reply word by word, providing a better interactive experience without staring at a blank screen while waiting for long responses.

The streaming parser handles various edge cases, including incomplete data chunks, network interruptions, and format anomalies, ensuring stable operation under varying network conditions.

## Context Modes

A key design of the AI assistant is its flexible context modes. Different writing scenarios call for different contexts:

**Full document mode** sends the entire article as context to the AI. Ideal for tasks that require understanding the full text, such as checking spelling across the entire article, analyzing structure, or generating summaries.

**Selection mode** sends only the text the user has selected in the editor. Ideal for local operations like polishing a paragraph or rewriting a sentence. This mode saves token consumption and lets the AI focus more precisely on the target text.

**No context mode** sends no article content at all, suitable for pure Q&A conversations.

These three modes let users precisely control what the AI can see, protecting privacy (you might not want to send an entire unpublished article to the AI) while optimizing results (more precise context typically yields better responses).

## Preset System

The four built-in presets (typo check, writing suggestions, polish, summary generation) aren't hardcoded features — they're an extensible pattern. Each preset is essentially a combination of parameters:

- A system prompt defining the AI's role and behavior
- A user prompt template describing the specific task
- A context mode determining what content to send to the AI

This design means adding new presets is straightforward — just define these three parameters. In the future, this system can naturally evolve to support user-defined custom presets, letting everyone create personalized AI workflows tailored to their writing habits.

## Integration with the Editor

The AI panel collaborates with the editor through shared state rather than direct coupling. It reads article content, selected text, and metadata from the global state, meaning the AI panel's implementation is completely independent of the editor's internal details.

This loosely coupled design lets the AI feature evolve independently. Even if the underlying editing engine is replaced in the future, as long as the shared state interface remains the same, the AI panel needs no modifications.

## Privacy Considerations

It's worth emphasizing that the AI feature is entirely optional. If you don't configure any AI provider, all other HexoPress features work normally, and no data is sent externally.

When you do use the AI feature, data goes directly from your computer to the AI service you've configured — HexoPress doesn't handle or store any intermediate data. You have complete control over where your data flows.
