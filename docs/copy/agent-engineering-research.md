---
type: Research Note
title: AI learning resources
description: Primary references for the public-docs test kit.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---

# Practical starting points

These sources support proposed experiments, not claims of experience or shipped results.

- [promptfoo](https://www.promptfoo.dev/docs/getting-started/): version prompts, providers and tests. Start with deterministic local fixtures; make paid providers opt-in.
- [Ragas faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/): assess support for answer claims in retrieved context. This is narrower than correctness; keep human review.
- [LangSmith evaluation](https://docs.langchain.com/langsmith/evaluation): compare runs against datasets and inspect traces. Adopt it only if it helps this test kit.

The first release should help a maintainer catch fabricated links, unsupported answers and failure to abstain before a docs assistant reaches users. Scope and completion criteria live in `content/roadmap.ts` under `docs-checks`.
