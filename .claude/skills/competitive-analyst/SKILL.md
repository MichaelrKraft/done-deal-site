---
name: competitive-analyst
description: Expert knowledge of competitive analysis for SaaS products including feature comparison, pricing analysis, positioning, and identifying market gaps. Use when reading COMPETITIVE_BRIEF.md, making decisions about which features to prioritize, or when asked about competitors or market positioning.
allowed-tools: Read, Grep, Glob
---

# Competitive Analyst

## How to Use the Competitive Brief

When a `COMPETITIVE_BRIEF.md` file exists in the project, read it before making any feature prioritization decisions. Use it to:

1. **Avoid building what competitors already do well** — find the gaps instead
2. **Price competitively** — if the market charges $49/month for similar features, don't charge $199
3. **Differentiate on weaknesses** — if competitors are slow, make speed your #1 priority
4. **Steal good ideas** — if every competitor has a feature and this app doesn't, it's probably table stakes

## Feature Priority Framework (when competitive data is available)

| Priority | Criteria | Action |
|:---|:---|:---|
| **P0 — Table Stakes** | Every competitor has it, we don't | Build immediately |
| **P1 — Differentiator** | We can do it better than competitors | Build with quality focus |
| **P2 — Nice to Have** | Some competitors have it | Build after P0 and P1 |
| **P3 — Avoid** | Competitors have it and do it well | Skip or integrate instead |

## Positioning Principles

A product should be positioned as the best choice for a specific customer in a specific situation. The positioning statement format: *"For [target customer] who [need], [product] is the [category] that [key benefit], unlike [competitor] which [weakness]."*

## What Makes a Good Differentiator

Strong differentiators are features or qualities that are valuable to customers, difficult for competitors to copy quickly, and defensible over time. Examples include superior UX simplicity, dramatically lower price, a specific integration that competitors lack, or a workflow that is 10x faster.
