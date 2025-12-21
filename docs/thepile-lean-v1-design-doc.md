# thePile — Lean V1 Design Document

> **Version:** 1.0 (Lean)
> **Date:** December 2024
> **Status:** Ready for Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Design Philosophy](#3-design-philosophy)
4. [Target User](#4-target-user)
5. [Core Concepts](#5-core-concepts)
6. [Data Model](#6-data-model)
7. [Screens & Flows](#7-screens--flows)
8. [Multi-Queue Algorithm](#8-multi-queue-algorithm)
9. [AI Integration](#9-ai-integration)
10. [Sources (Auto-Fetch)](#10-sources-auto-fetch)
11. [Edge Cases & Empty States](#11-edge-cases--empty-states)
12. [Success Criteria](#12-success-criteria)
13. [Pre-Launch: Landing Page](#13-pre-launch-landing-page)
14. [V2: Try Archetype](#14-v2-try-archetype)
15. [Future Considerations](#15-future-considerations)

---

## 1. Overview

**thePile** is a personal learning system that transforms passive content consumption into intentional, engaged learning.

Unlike read-later apps that become content graveyards, thePile enforces **cognitive closure**: every item must eventually receive a **Verdict** that determines its fate. Saving is not completing. Verdict is completing.

### Lean V1 Scope

- **Learn archetype only** (articles, videos, docs, PDFs)
- **Single user**
- **Core loop: Queue → Read → Takeaway → Verdict**
- **Sources for auto-fetching content**

---

## 2. Problem Statement

### The Three Pain Points

#### 1. False Accomplishment
Saving content feels productive, but it's not. The act of adding to a read-later app creates a false sense of progress while the content sits unread. The inbox grows. The guilt compounds.

#### 2. Recency Bias
Always gravitating toward the newest saved items. Older content gets buried and forgotten, creating an ever-growing graveyard of "I'll get to it later." You never do.

#### 3. Analysis Paralysis
Too many items, no clear priority. Opening the reading list triggers decision fatigue: "What should I read?" becomes a blocker to reading anything at all. So you save one more thing instead.

### The Result

A growing pile of unprocessed content that weighs on your mind without improving it.

---

## 3. Design Philosophy

### Core Principles

#### 3.1 Saving ≠ Learning
The system distinguishes between "added" and "learned." Only items with a Verdict count as processed. Everything else is just noise in your queue.

#### 3.2 The App Decides What's Next
Users choose *when* to engage, not *what* to engage with. The algorithm surfaces the right item based on age, topic diversity, and source affinity. This kills analysis paralysis.

#### 3.3 Older Items Rise
Age is weighted heavily in prioritization. Items saved weeks ago surface before items saved today. This kills recency bias.

#### 3.4 Forced Closure
Every item must receive a Verdict: Keep, Revisit, or Discard. No limbo states. No infinite backlog of "unread" items. This kills false accomplishment.

#### 3.5 Think First, AI Second
Users write their own takeaway before seeing AI-generated insights. This prevents passive consumption of AI summaries and forces actual engagement with the material.

### What thePile Is NOT

- ❌ A read-later app (saving isn't the goal)
- ❌ A note-taking app (minimal writing, focused on decisions)
- ❌ A knowledge graph tool (no maps or connections in V1)
- ❌ An AI chat interface (closed questions only)
- ❌ A bookmarking service (items must be processed or discarded)

---

## 4. Target User

Lean V1 is designed for:

- **Solo learners** — developers, researchers, knowledge workers
- **Reflective thinkers** — comfortable writing short summaries
- **Intentional consumers** — willing to trade friction for clarity
- **Quality over quantity** — interested in learning depth, not volume

This is not a mass-market product in V1. It's a tool for people who recognize their current system is broken and want something more disciplined.

---

## 5. Core Concepts

### Item
A unit of content to be processed. Can be an article, blog post, video, PDF, or manually entered text.

### Source
A recurring origin of items that auto-fetches new content. Supports blogs (RSS/scraping) and YouTube channels.

### Queue
The prioritized list of items awaiting processing. The system decides order. User decides pace.

### Backlog
The collection of items that received a **Keep** verdict. This is your knowledge base—things you've actually learned and decided were worth retaining.

### Verdict
The forced decision that closes an item:

| Verdict | Meaning | Effect |
|---------|---------|--------|
| **Keep** | "I learned something worth retaining" | Moves to Backlog |
| **Revisit** | "Interesting but didn't land—try later" | Re-queues with cooldown |
| **Discard** | "Not useful, not for me" | Gone forever |

### Takeaway
The user's own words summarizing what they learned. Required before Verdict. This is the primary record of learning.

---

## 6. Data Model

### 6.1 Item

```typescript
interface Item {
  id: string
  
  // Content
  source:
    | { type: 'link'; url: string; content?: string }
    | { type: 'text'; content: string; attribution?: string }
    | { type: 'document'; fileId: string; fileName: string; extractedText: string }
  
  title: string
  description?: string
  estimatedMinutes?: number
  tags: string[]
  
  // Origin
  sourceId?: string          // Reference to Source if auto-fetched
  savedAt: Date
  userNote?: string          // Note added at save time
  
  // AI-generated (on fetch)
  aiSummary?: string         // 3-5 bullet summary
  
  // State
  status: 'queued' | 'kept' | 'revisit' | 'discarded'
  priorityScore: number
  
  // Engagement (filled during review)
  readAt?: Date
  takeaway?: string          // User's own words
  takeawayAt?: Date
  verdict?: 'keep' | 'revisit' | 'discard'
  verdictAt?: Date
  
  // For revisit items
  revisitCount?: number
  revisitAfter?: Date
  
  createdAt: Date
  updatedAt: Date
}
```

### 6.2 Source

```typescript
interface Source {
  id: string

  // Configuration
  type: 'blog' | 'youtube'
  url: string
  name: string

  // Fetch settings
  interval: 'hourly' | 'daily' | 'weekly'
  maxPerFetch: number
  coldStartWindow: '7d' | '30d' | '90d' | 'all'

  // Topic filtering (AI-based relevance check)
  topicFilter?: string            // e.g., "AI, machine learning, LLMs"
  topicFilterEnabled: boolean

  // Auto-tagging
  autoTags: string[]

  // State
  fetchedItemIds: string[]
  lastFetchedAt: Date | null
  lastFetchStatus: 'success' | 'error' | 'pending'
  lastFetchError?: string

  // Fetch statistics
  itemsFetchedTotal: number       // All items ever fetched
  itemsQueuedTotal: number        // Items that passed topic filter
  itemsFilteredTotal: number      // Items filtered out (off-topic)
  lastFetchStats?: {
    fetched: number
    queued: number
    filtered: number
  }

  enabled: boolean
  createdAt: Date
}
```

### 6.3 User Stats

```typescript
interface UserStats {
  // Streak
  currentStreak: number
  longestStreak: number
  lastVerdictDate: Date | null
  
  // Counts
  totalKept: number
  totalDiscarded: number
  totalRevisited: number
  
  // This period
  thisWeek: {
    kept: number
    discarded: number
  }
}
```

### 6.4 AI Follow-up

```typescript
interface AIFollowUp {
  itemId: string
  question: string
  answer: string
  askedAt: Date
}
```

---

## 7. Screens & Flows

### 7.1 Screen Inventory

| Screen | Purpose |
|--------|---------|
| **Home** | Multi-queue view (3 cards) or filtered single-queue view |
| **Review** | Core flow: Read → Takeaway → AI → Verdict (detail screen, not in nav) |
| **Backlog** | Search/browse kept items |
| **Sources & Input** | Auto-fetch sources (tab 1) + Manual add (tab 2) |
| **Settings** | Tags, preferences, data export |

---

### 7.2 Home Screen (Multi-Queue View)

The home screen shows three curated queues, each optimized for a different reading dimension. This replaces a single opaque priority algorithm with transparent, mood-based options.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   thePile                                              🔥 12 day streak │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Filter by tag: [Select tag ▾]                                   │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   WHAT'S NEXT                                              12 in queue │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   🕰️ OLDEST                                                     │  │
│   │                                                                 │  │
│   │   Context Engineering for AI Agents                            │  │
│   │   simonwillison.net · ~15 min · saved 3 weeks ago              │  │
│   │   [AI] [Prompting]                                             │  │
│   │                                                                 │  │
│   │   [→ Start Review]                                             │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   🎲 MIX IT UP                                                  │  │
│   │                                                                 │  │
│   │   Kubernetes Security Best Practices                           │  │
│   │   YouTube · ~22 min · saved 5 days ago                         │  │
│   │   [DevOps] [Security]                                          │  │
│   │                                                                 │  │
│   │   You've read 4 AI articles lately. Try something different.   │  │
│   │                                                                 │  │
│   │   [→ Start Review]                                             │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   ⚡ QUICK WIN                                                  │  │
│   │                                                                 │  │
│   │   Prompt Caching Explained                                     │  │
│   │   anthropic.com · ~4 min · saved 1 week ago                    │  │
│   │   [AI] [Performance]                                           │  │
│   │                                                                 │  │
│   │   [→ Start Review]                                             │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   [+ Add Item]                [📚 Backlog]                [⚙️ Settings]│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### The Three Queues

| Queue | Icon | Rule | Purpose |
|-------|------|------|---------|
| **Oldest** | 🕰️ | Sorted by `savedAt` ascending | Fight recency bias |
| **Mix It Up** | 🎲 | Maximize topic distance from last 3 verdicts | Prevent tunnel vision |
| **Quick Win** | ⚡ | Sorted by `estimatedMinutes` ascending | Low-energy moments |

#### Deduplication

If an item qualifies for multiple queues (e.g., oldest item is also quickest), it shows in the first applicable queue only. Other queues backfill with next-best item.

**Priority order:** Oldest → Mix It Up → Quick

```typescript
function getQueueItems(items: Item[]): { oldest: Item, mixUp: Item, quick: Item } {
  const queued = items.filter(i => i.status === 'queued')

  // First queue: pure oldest
  const oldest = sortByAge(queued)[0]

  // Second queue: most diverse, excluding oldest pick
  const mixUp = sortByDiversity(queued)
    .find(i => i.id !== oldest.id)

  // Third queue: quickest, excluding both above
  const quick = sortByTime(queued)
    .find(i => i.id !== oldest.id && i.id !== mixUp?.id)

  return { oldest, mixUp, quick }
}
```

#### Small Queue Handling

| Queue size | Behavior |
|------------|----------|
| **3+ items** | Show 3 cards |
| **2 items** | Show 2 cards (Oldest + one other) |
| **1 item** | Show 1 card |
| **0 items** | Empty state |

---

### 7.3 Home Screen: Filtered Mode

When a user selects a tag filter, the multi-queue view collapses to a single queue. The user has already expressed intent ("I want AI content now"), so showing 3 options is redundant.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   thePile                                              🔥 12 day streak │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Filtering: [AI ×]                                               │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   WHAT'S NEXT IN [AI]                                    5 of 12 items │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   Context Engineering for AI Agents                            │  │
│   │   simonwillison.net · ~15 min                                  │  │
│   │   Saved 3 weeks ago · [AI] [Prompting]                         │  │
│   │                                                                 │  │
│   │   Oldest item in [AI]                                          │  │
│   │                                                                 │  │
│   │   [→ Start Review]                                             │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   UP NEXT IN [AI] (4 more)                                             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ RAG vs Fine-tuning                          2 weeks ago    [⋮] │  │
│   │ Manual · ~10 min · [AI] [RAG]                                  │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │ Prompt Caching Explained                    1 week ago     [⋮] │  │
│   │ anthropic.com · ~4 min · [AI] [Performance]                    │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │ Building Effective Agents                   5 days ago     [⋮] │  │
│   │ anthropic.com · ~30 min · [AI] [Agents]                        │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   [⋮] menu: Discard                                                    │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   [+ Add Item]                [📚 Backlog]                [⚙️ Settings]│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Unfiltered vs Filtered Behavior

| Aspect | Unfiltered (No tag) | Filtered (Tag selected) |
|--------|---------------------|-------------------------|
| **Cards shown** | 3 (Oldest, Mix It Up, Quick) | 1 (oldest in filter) |
| **"Up Next" list** | Hidden | Shown (peek at queue depth) |
| **Header** | "WHAT'S NEXT" | "WHAT'S NEXT IN [TAG]" |
| **Item count** | Total queue size | Filtered / total |

#### Why Filters Collapse to Single Queue

The multi-queue design provides variety across dimensions (age, topic, time). When user filters by tag, they've made a topic choice—"Mix It Up" would conflict (it shows *different* topics).

**Mental model:**
- **No filter** = "Surprise me" → 3 angles
- **Filter active** = "I know what I want" → app picks oldest in that set

#### Filter Options (V1)

- **Tag filter only** — time dimension covered by Quick queue, topic diversity by Mix It Up
- Filtered view shows oldest item first within the tag
- Clear filter returns to multi-queue view

---

### 7.4 Review Screen (Core Flow)

This is the heart of thePile. A single, focused screen with progressive disclosure.

#### State 1: Read

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Back                                                    [Discard]   │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Context Engineering for AI Agents                                    │
│   simonwillison.net · ~15 min read                                     │
│   Saved 3 weeks ago                                                    │
│                                                                         │
│   Tags: [AI] [Prompting]                                               │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   STEP 1 OF 3: READ                                                    │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │   Read the article at the source.                              │  │
│   │   Take your time. Come back when you're done.                  │  │
│   │                                                                 │  │
│   │   [🔗 Open Article]                                            │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   [✓ I've read this]                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### State 2: Takeaway

This is the **critical friction point** of the entire app. The design must be warm, inviting, and low-pressure. Users who feel intimidated here will abandon the flow.

**Design Principles for Takeaway Screen:**
- Generous whitespace—don't crowd the writing area
- Warm, encouraging tone—not clinical or demanding
- Multiple prompt options to inspire (not require)
- Save drafts automatically—never lose work
- Character counter that celebrates brevity, doesn't punish length

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Back                                                    [Discard]   │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Context Engineering for AI Agents                                    │
│   simonwillison.net · ~15 min read                                     │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   ✓ Read                                                               │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│                                                                         │
│                                                                         │
│              ╭─────────────────────────────────────────────╮            │
│              │                                             │            │
│              │     What will you remember from this?       │            │
│              │                                             │            │
│              │     ────────────────────────────────────    │            │
│              │                                             │            │
│              │     ┌─────────────────────────────────┐     │            │
│              │     │                                 │     │            │
│              │     │                                 │     │            │
│              │     │  Context engineering is about  │     │            │
│              │     │  designing what surrounds the  │     │            │
│              │     │  prompt—system instructions,   │     │            │
│              │     │  examples, retrieved docs—not  │     │            │
│              │     │  just the prompt wording       │     │            │
│              │     │  itself.                       │     │            │
│              │     │                                 │     │            │
│              │     │                                 │     │            │
│              │     └─────────────────────────────────┘     │            │
│              │                                             │            │
│              │     Just 1-3 sentences. Perfect.  ✓         │            │
│              │                                             │            │
│              ╰─────────────────────────────────────────────╯            │
│                                                                         │
│                                                                         │
│              ┌─────────────────────────────────────────────┐            │
│              │  💡 Need inspiration?                       │            │
│              │                                             │            │
│              │  • What surprised you?                      │            │
│              │  • What's the one thing you'd tell someone? │            │
│              │  • What will you do differently now?        │            │
│              │                                             │            │
│              └─────────────────────────────────────────────┘            │
│                                                                         │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│                              [Continue →]                               │
│                                                                         │
│              Draft auto-saved · You can always come back               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Alternative: Minimalist Version**

For users who prefer less guidance:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Back                                                    [Discard]   │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                         What did you learn?                             │
│                                                                         │
│              ┌─────────────────────────────────────────────┐            │
│              │                                             │            │
│              │                                             │            │
│              │                                             │            │
│              │                                             │            │
│              │                                             │            │
│              │                                             │            │
│              │                                             │            │
│              └─────────────────────────────────────────────┘            │
│                                                                         │
│                     1-3 sentences · No pressure                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                              [Continue →]                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**UX Details:**

| Element | Behavior |
|---------|----------|
| **Text area** | Auto-grows, no scroll needed for 1-3 sentences |
| **Character counter** | Shows only after 50+ chars; says "Perfect length ✓" at 50-300 |
| **Draft saving** | Auto-save every 5 seconds; persists across sessions |
| **Inspiration prompts** | Collapsed by default; expand on tap; rotates 3 random prompts |
| **Continue button** | Disabled until at least 20 characters entered |
| **Back button** | Warns if discarding draft; offers to save for later |

#### State 3: AI Takeaways + Follow-ups + Verdict

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Back                                                    [Discard]   │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Context Engineering for AI Agents                                    │
│   simonwillison.net · ~15 min read                                     │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   ✓ Read · ✓ Takeaway saved                                            │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   YOUR TAKEAWAY                                                        │
│                                                                         │
│   "Context engineering is about designing what surrounds the prompt—   │
│    system instructions, examples, retrieved docs—not just the prompt   │
│    wording itself."                                                    │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   AI TAKEAWAYS                                                         │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  • The article frames context windows as "canvases" to design  │  │
│   │  • RAG, system prompts, and few-shot examples all count as     │  │
│   │    context engineering                                         │  │
│   │  • Author argues this skill matters more than prompt wording   │  │
│   │  • Comparison to UX design: you're designing the AI's          │  │
│   │    "environment," not just its instructions                    │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   GO DEEPER (optional)                                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  [How is this different from prompt engineering?]              │  │
│   │                                                                 │  │
│   │  [What would this look like in my observability work?]         │  │
│   │                                                                 │  │
│   │  [What are the limitations of this framing?]                   │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   STEP 3 OF 3: VERDICT                                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  [✓ Keep]       [↻ Revisit]       [✗ Discard]                  │  │
│   │                                                                 │  │
│   │  Worth          Not ready yet.    Not useful                   │  │
│   │  retaining.     Try again later.  or relevant.                 │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### State 3b: After clicking a follow-up question

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   GO DEEPER                                                            │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  Q: How is this different from prompt engineering?             │  │
│   │                                                                 │  │
│   │  ─────────────────────────────────────────────────────────     │  │
│   │                                                                 │  │
│   │  Prompt engineering focuses on the wording of your direct      │  │
│   │  instruction—how you phrase the ask. Context engineering is    │  │
│   │  broader: it's about everything the model sees. This includes  │  │
│   │  system prompts, few-shot examples, retrieved documents, and   │  │
│   │  conversation history.                                         │  │
│   │                                                                 │  │
│   │  Think of it this way: prompt engineering is writing a good    │  │
│   │  question. Context engineering is setting up the entire        │  │
│   │  conversation environment before you ask.                      │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  [What would this look like in my observability work?]         │  │
│   │                                                                 │  │
│   │  [What are the limitations of this framing?]                   │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   2 of 3 follow-ups remaining                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.5 Backlog Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Backlog                                                            │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ 🔍 Search your knowledge...                                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Tags: [All ▾]   Source: [All ▾]   Date: [All ▾]                │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   34 items kept                                                        │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  Context Engineering for AI Agents                             │  │
│   │  Kept 2 days ago · simonwillison.net                           │  │
│   │                                                                 │  │
│   │  "Context engineering is about designing what surrounds the    │  │
│   │   prompt—system instructions, examples, retrieved docs."       │  │
│   │                                                                 │  │
│   │  [AI] [Prompting]                                              │  │
│   │                                                                 │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │                                                                 │  │
│   │  RAG vs Fine-tuning                                            │  │
│   │  Kept 1 week ago · Manual                                      │  │
│   │                                                                 │  │
│   │  "RAG = retrieve at inference. Fine-tuning = bake into        │  │
│   │   weights. RAG for changing knowledge, FT for behavior."       │  │
│   │                                                                 │  │
│   │  [AI] [RAG]                                                    │  │
│   │                                                                 │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │  ...                                                           │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Clicking an item expands to show:**
- Full takeaway
- AI takeaways
- Any follow-up Q&As
- Link to original source
- Option to revisit (re-queue for review)

---

### 7.6 Sources & Input Screen

This screen combines auto-fetching sources and manual input into a single location with tabs.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Sources & Input                                                    │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │   [📡 Auto Sources]        [➕ Add Manually]                     │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   AUTO SOURCES                                          [+ Add Source] │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  🌐 Simon Willison's Blog                         [Enabled ●]  │  │
│   │  simonwillison.net                                              │  │
│   │                                                                 │  │
│   │  Daily · Max 3 per fetch · Tags: [AI]                          │  │
│   │  Topic filter: "AI, LLMs, prompt engineering"                  │  │
│   │                                                                 │  │
│   │  Last fetch: 2 hours ago · ✓ Success                           │  │
│   │  ┌───────────────────────────────────────────────────────────┐ │  │
│   │  │  📊 47 queued · 12 filtered (off-topic) · 59 total        │ │  │
│   │  └───────────────────────────────────────────────────────────┘ │  │
│   │                                                                 │  │
│   │  [Fetch Now]   [Edit]   [Delete]                               │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  📺 Anthropic                                     [Enabled ●]  │  │
│   │  youtube.com/@anthropic                                         │  │
│   │                                                                 │  │
│   │  Weekly · Max 5 per fetch · Tags: [AI] [Anthropic]             │  │
│   │  Topic filter: (none)                                          │  │
│   │                                                                 │  │
│   │  Last fetch: 3 days ago · ✓ Success                            │  │
│   │  ┌───────────────────────────────────────────────────────────┐ │  │
│   │  │  📊 12 queued · 0 filtered · 12 total                     │ │  │
│   │  └───────────────────────────────────────────────────────────┘ │  │
│   │                                                                 │  │
│   │  [Fetch Now]   [Edit]   [Delete]                               │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  📺 Fireship                                      [Disabled ○] │  │
│   │  youtube.com/@Fireship                                          │  │
│   │                                                                 │  │
│   │  Daily · Max 1 per fetch · Tags: [Tools]                       │  │
│   │  Topic filter: (none)                                          │  │
│   │                                                                 │  │
│   │  Last fetch: 5 hours ago · ⚠️ Error (rate limited)             │  │
│   │  ┌───────────────────────────────────────────────────────────┐ │  │
│   │  │  📊 8 queued · 0 filtered · 8 total                       │ │  │
│   │  └───────────────────────────────────────────────────────────┘ │  │
│   │                                                                 │  │
│   │  [Fetch Now]   [Edit]   [Delete]                               │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.7 Add Source Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Add Source                                                    [×]    │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Type                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  (●) 🌐 Blog       ( ) 📺 YouTube                              │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   URL                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ https://simonwillison.net                                      │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Display Name                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Simon Willison's Blog                                          │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   FETCH SETTINGS                                                       │
│                                                                         │
│   Check interval                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  ( ) Hourly    (●) Daily    ( ) Weekly                         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Max items per fetch                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [3 ▾]                                                         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Cold start (initial lookback)                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [Last 30 days ▾]                                              │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   TOPIC FILTER (optional)                                              │
│                                                                         │
│   Only queue posts about these topics:                                 │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ AI, LLMs, prompt engineering, Claude                           │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│   Leave blank to queue all posts from this source.                     │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   Auto-apply tags                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [AI ×]  [+ Add tag]                                           │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│                                      [Cancel]   [Add Source]           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.8 Add Manually Tab (within Sources & Input)

The second tab of the Sources & Input screen. Supports multiple input types.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Sources & Input                                                    │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │   [📡 Auto Sources]        [➕ Add Manually]                     │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   ADD TO QUEUE                                                         │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [🔗 Link]   [📝 Text]   [📄 Document]   [📋 Bulk CSV]         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   URL                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ https://simonwillison.net/2024/Dec/19/context-engineering/     │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ⏳ Fetching...                                                       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │  Context Engineering for AI Agents                             │  │
│   │  simonwillison.net · ~15 min read                              │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Tags                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [AI ×]  [Prompting ×]  [+ Add tag]                            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   Note (optional)                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Referenced in Anthropic's docs                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│                                      [Cancel]   [Add to Queue]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Bulk CSV Import

When selecting "Bulk CSV":

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BULK IMPORT                                                          │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [🔗 Link]   [📝 Text]   [📄 Document]   [📋 Bulk CSV]         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   Upload a CSV file with links to add multiple items at once.          │
│                                                                         │
│   Expected format:                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  url,tags,note                                                  │  │
│   │  https://example.com/article1,"AI,Prompting",Optional note      │  │
│   │  https://example.com/article2,"RAG",                            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │                    [📁 Choose CSV File]                        │  │
│   │                                                                 │  │
│   │                    or drag and drop here                        │  │
│   │                                                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   After upload: Preview of items to import, then confirm.              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.9 Settings Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ← Settings                                                           │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   GENERAL                                                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Theme                                     [System ▾]          │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   TAGS                                                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [AI]              18 items                     [Edit] [Delete]│  │
│   │  [Prompting]        8 items                     [Edit] [Delete]│  │
│   │  [Observability]    5 items                     [Edit] [Delete]│  │
│   │  [RAG]              3 items                     [Edit] [Delete]│  │
│   │                                                                 │  │
│   │  [+ Create Tag]                                                │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   DATA                                                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  [Export Data]                                                 │  │
│   │  Download all items, takeaways, and verdicts                   │  │
│   │                                                                 │  │
│   │  [Clear All Data]                                              │  │
│   │  Permanently delete everything                                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   ACCOUNT                                                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Signed in as: user@example.com                                │  │
│   │  [Sign Out]                                                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 7.10 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           ITEM ENTERS                                  │
│                    (Source auto-fetch or manual add)                   │
│                               │                                        │
│                               ▼                                        │
│                        ┌──────────┐                                    │
│                        │  QUEUE   │                                    │
│                        │          │                                    │
│                        │ Priority │                                    │
│                        │ sorted   │                                    │
│                        └────┬─────┘                                    │
│                             │                                          │
│                             │ User opens "What's Next"                 │
│                             ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                                                                 │  │
│   │                      REVIEW FLOW                                │  │
│   │                                                                 │  │
│   │  ┌──────────┐     ┌──────────┐     ┌──────────┐                │  │
│   │  │          │     │          │     │          │                │  │
│   │  │   READ   │────▶│ TAKEAWAY │────▶│ AI + Q&A │                │  │
│   │  │          │     │          │     │          │                │  │
│   │  │ Open     │     │ Write    │     │ See AI   │                │  │
│   │  │ source   │     │ 1-3      │     │ bullets  │                │  │
│   │  │ external │     │ sentences│     │ Ask 0-3  │                │  │
│   │  │          │     │          │     │ follow-  │                │  │
│   │  │          │     │          │     │ ups      │                │  │
│   │  └──────────┘     └──────────┘     └────┬─────┘                │  │
│   │                                         │                       │  │
│   └─────────────────────────────────────────┼───────────────────────┘  │
│                                             │                          │
│                                             ▼                          │
│                                      ┌──────────┐                      │
│                                      │ VERDICT  │                      │
│                                      └────┬─────┘                      │
│                                           │                            │
│                    ┌──────────────────────┼──────────────────────┐     │
│                    │                      │                      │     │
│                    ▼                      ▼                      ▼     │
│              ┌──────────┐          ┌──────────┐          ┌──────────┐ │
│              │   KEEP   │          │ REVISIT  │          │ DISCARD  │ │
│              │          │          │          │          │          │ │
│              │ → Backlog│          │ → Queue  │          │ → Gone   │ │
│              │ (learned)│          │ (later)  │          │ (signal) │ │
│              │          │          │          │          │          │ │
│              │ Streak++ │          │ Cooldown │          │ Weights  │ │
│              │          │          │ applied  │          │ adjusted │ │
│              └──────────┘          └──────────┘          └──────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Multi-Queue Algorithm

Instead of a single weighted priority score, thePile uses **three separate queues**, each optimized for a different dimension. This provides transparency ("why this item?") and lets users choose based on current mood without browsing.

### 8.1 The Three Queues

| Queue | Sort Logic | Purpose |
|-------|------------|---------|
| **🕰️ Oldest** | `savedAt` ascending | Fight recency bias |
| **🎲 Mix It Up** | Maximize tag distance from last 3 verdicts | Prevent topic tunnel vision |
| **⚡ Quick Win** | `estimatedMinutes` ascending | Low-energy moments |

### 8.2 Queue Selection Logic

```typescript
function getQueueItems(items: Item[]): { oldest: Item, mixUp: Item, quick: Item } {
  const queued = items.filter(i => i.status === 'queued')

  // First queue: pure oldest
  const oldest = sortByAge(queued)[0]

  // Second queue: most diverse, excluding oldest pick
  const mixUp = sortByDiversity(queued, getRecentVerdictTags())
    .find(i => i.id !== oldest.id)

  // Third queue: quickest, excluding both above
  const quick = sortByTime(queued)
    .find(i => i.id !== oldest.id && i.id !== mixUp?.id)

  return { oldest, mixUp, quick }
}
```

### 8.3 Diversity Score (Mix It Up Queue)

```typescript
function sortByDiversity(items: Item[], recentTags: string[]): Item[] {
  return items.sort((a, b) => {
    const aOverlap = countOverlap(a.tags, recentTags)
    const bOverlap = countOverlap(b.tags, recentTags)
    return aOverlap - bOverlap  // Lower overlap = higher priority
  })
}

function getRecentVerdictTags(): string[] {
  // Get tags from last 3 items that received a verdict
  return getRecentVerdicts(3).flatMap(item => item.tags)
}
```

**Effect:** If user has been reading AI articles, Mix It Up surfaces items with non-AI tags.

### 8.4 Deduplication

If an item qualifies for multiple queues (e.g., oldest is also quickest), show it in the first applicable queue only. Others backfill with next-best.

**Priority order:** Oldest → Mix It Up → Quick

### 8.5 Revisit Handling

**Revisit cooldown:** Items marked Revisit re-enter the queue after 7 days.

**Revisit limit:** After 3 revisits, force a final decision: "You've revisited this 3 times. Keep or discard?"

**Revisit in queues:** Revisited items are eligible for all three queues but sorted by their *original* `savedAt` date (not revisit date) to prevent gaming.

### 8.6 Filtered Mode

When a tag filter is active, the multi-queue collapses to a single queue:
- Show oldest item within the filtered set
- No Mix It Up (user already chose topic)
- No Quick (can browse "Up Next" list for short items)

---

## 9. AI Integration

### 9.1 Philosophy

AI is used to:
- **Reduce friction** (auto-summaries, metadata extraction)
- **Provide contrast** (AI takeaways complement user's view)
- **Deepen understanding** (closed follow-up questions)

AI is NOT used to:
- Replace thinking
- Generate verdicts
- Provide open-ended chat

### 9.2 AI Touchpoints

| Touchpoint | What AI Does | User Control |
|------------|--------------|--------------|
| **On fetch** | Generates 3-5 bullet summary, estimates read time, suggests tags | User can edit tags |
| **After takeaway** | Shows AI takeaways (hidden until user writes theirs) | None (no spoilers) |
| **Follow-ups** | Provides 2-3 contextual questions with short answers | User chooses which to ask |

### 9.3 Follow-up Question Design

Questions are generated based on:
- The content itself
- User's tags/interests (if known)
- Common learning patterns

**Question types:**

| Type | Template | When to Use |
|------|----------|-------------|
| **Clarifying** | "What's the difference between X and Y?" | Article compares concepts |
| **Practical** | "What would a simple example look like?" | Article is theoretical |
| **Personal** | "How might this apply to [user's domain]?" | User context known |
| **Critical** | "What are the limitations of this approach?" | Article is one-sided |
| **Connecting** | "How does this relate to [past item]?" | Semantic similarity found |

**Limits:**
- Max 3 questions per item
- Max 1 answer request per question
- Answers are 3-5 sentences max

### 9.4 AI Takeaways Guidelines

AI is instructed to:
- NOT repeat what the user wrote
- Add angles the user might have missed
- Highlight disagreements or nuances
- Use tentative language ("The author suggests..." not "This is true...")

---

## 10. Sources (Auto-Fetch)

### 10.1 Supported Source Types

| Type | Input | Fetch Method |
|------|-------|--------------|
| **Blog** | Homepage URL | AI agent (reasoning required) |
| **YouTube** | Channel URL or handle | YouTube API (deterministic) |

#### Blog Fetching: Agent-Based Approach

Blogs have variable structures—no standard API, inconsistent layouts, different pagination patterns. Unlike YouTube (where we can deterministically call an API), blogs require **reasoning** to:

1. **Understand the homepage** — identify what's a post vs navigation/sidebar
2. **Extract post URLs** — find the actual article links
3. **Parse metadata** — title, date, description from varied HTML structures
4. **Filter by topic** — determine relevance based on user's topic filter

**V1 Implementation:** Use an LLM agent for each fetch. The agent:
- Fetches the homepage/feed URL
- Reasons about the page structure
- Extracts post links and metadata
- Applies topic filtering
- Returns structured item data

**Future Optimization:** Cache the "extraction pattern" per source. Once the agent successfully parses a blog, store the extraction rules (e.g., "posts are in `.post-list li a`", "date is in `.post-meta time`"). Use deterministic script for subsequent fetches; re-invoke agent only when extraction fails (indicating blog redesign).

### 10.2 Source Configuration

| Setting | Options | Default |
|---------|---------|---------|
| **Interval** | Hourly, Daily, Weekly | Daily |
| **Max per fetch** | 1, 3, 5, 10, Unlimited | 3 |
| **Cold start** | 7d, 30d, 90d, All time | 30d |
| **Topic filter** | Free text (e.g., "AI, LLMs") | None |
| **Auto-tags** | User-defined | None |

### 10.3 Topic Filtering

Each source can have an optional **topic filter**—a free-text description of what content should be queued.

**How it works:**
- AI evaluates each fetched item against the topic filter
- Items matching the filter → queued
- Items not matching → tracked as "filtered" but not queued
- Both counts visible in source stats for transparency

**Example:**
- Source: Simon Willison's Blog
- Topic filter: "AI, LLMs, prompt engineering, Claude"
- Result: AI-related posts queued; posts about Django or Python packaging filtered out

This prevents queue pollution from prolific sources that cover multiple topics.

### 10.4 Fetch Logic

```typescript
async function fetchSource(source: Source): Promise<void> {
  // 1. Check if interval has elapsed
  if (!shouldFetch(source)) return

  // 2. Fetch items from source (agent for blogs, API for YouTube)
  const items = source.type === 'blog'
    ? await fetchBlogWithAgent(source)
    : await fetchYouTubeWithAPI(source)

  // 3. Filter already-seen items
  const newItems = items.filter(i => !source.fetchedItemIds.includes(i.id))

  // 4. Apply cold start filter (first fetch only)
  const afterColdStart = source.lastFetchedAt
    ? newItems
    : filterByColdStart(newItems, source.coldStartWindow)

  // 5. Apply topic filter (if enabled)
  let toQueue: Item[]
  let filtered: Item[]

  if (source.topicFilterEnabled && source.topicFilter) {
    const results = await applyTopicFilter(afterColdStart, source.topicFilter)
    toQueue = results.matching
    filtered = results.notMatching
  } else {
    toQueue = afterColdStart
    filtered = []
  }

  // 6. Apply max per fetch limit
  const limited = toQueue.slice(0, source.maxPerFetch)

  // 7. Create queue items
  for (const item of limited) {
    await createQueueItem(item, source)
  }

  // 8. Mark ALL fetched items as seen (including filtered)
  source.fetchedItemIds.push(...items.map(i => i.id))

  // 9. Update source state with detailed stats
  source.lastFetchedAt = new Date()
  source.lastFetchStatus = 'success'
  source.itemsFetchedTotal += newItems.length
  source.itemsQueuedTotal += limited.length
  source.itemsFilteredTotal += filtered.length
  source.lastFetchStats = {
    fetched: newItems.length,
    queued: limited.length,
    filtered: filtered.length
  }
}
```

---

## 11. Edge Cases & Empty States

### 11.1 Empty States

**Queue Empty:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   🎉 Queue clear!                                                      │
│                                                                         │
│   You've processed everything. Nice work.                              │
│                                                                         │
│   [+ Add something new]    [📡 Check sources]                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Backlog Empty:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Your backlog is empty                                                │
│                                                                         │
│   Items you Keep will appear here.                                     │
│   This becomes your personal knowledge base.                           │
│                                                                         │
│   [→ Go to Queue]                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**No Sources:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   No sources configured                                                │
│                                                                         │
│   Add blogs or YouTube channels to automatically                       │
│   populate your queue with new content.                                │
│                                                                         │
│   [+ Add your first source]                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Duplicate URL** | Detect and notify; offer to view existing item |
| **Source fetch fails** | Show error, retry next interval, notify after 3 failures |
| **Very long content** | Show warning, suggest bookmarking specific sections |
| **Revisit limit reached** | Force Keep or Discard decision |
| **Offline** | Queue viewable, verdicts queued for sync |
| **User deletes tag** | Items keep tag, tag removed from suggestions |

---

## 12. Success Criteria

Lean V1 is successful if:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Queue doesn't grow unbounded** | Queue size stable or shrinking over 30 days | Track daily queue size |
| **Users reach verdicts** | >70% of items get a verdict within 14 days | Track item lifecycle |
| **Backlog is meaningful** | Users search/revisit backlog items | Track backlog interactions |
| **Habit forms** | >50% of users have 7+ day streak | Track streak data |
| **Recency bias broken** | Avg item age at verdict > 7 days | Track age at verdict |

---

## 13. Pre-Launch: Landing Page

Before building the full product, validate demand with a simple landing page and early access signup.

### 13.1 Purpose

- **Gauge interest** — measure signups to validate the problem resonates
- **Build waitlist** — collect emails for launch day
- **Refine messaging** — test which pain points resonate most
- **Share broadly** — post to HN, Reddit, Twitter, relevant communities

### 13.2 Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   thePile                                                              │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Your read-later app is a graveyard.                                  │
│   This isn't.                                                          │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   THE PROBLEM                                                          │
│                                                                         │
│   • Saving feels productive. It isn't.                                 │
│   • You always read the newest thing. Old stuff rots.                  │
│   • Too many items. You read nothing.                                  │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   THE SOLUTION                                                         │
│                                                                         │
│   thePile forces you to actually learn:                                │
│                                                                         │
│   ✓ The app decides what's next (no more decision fatigue)            │
│   ✓ Older items rise to the top (no more recency bias)                │
│   ✓ Every item needs a verdict (no more infinite backlog)             │
│                                                                         │
│   ───────────────────────────────────────────────────────────────────  │
│                                                                         │
│   GET EARLY ACCESS                                                     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  your@email.com                              [Join Waitlist]    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   No spam. Just a heads up when we launch.                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.3 Optional: Quick Survey

After signup, offer a 3-question survey (Typeform/Tally):

1. **What's your current read-later app?** (Pocket, Instapaper, Notion, Browser bookmarks, Other)
2. **How many unread items do you have?** (< 10, 10-50, 50-100, 100+, "I stopped counting")
3. **What type of content do you save most?** (Articles, Videos, PDFs, All of the above)

Use responses to prioritize features and understand the audience.

### 13.4 Distribution Channels

| Channel | Approach |
|---------|----------|
| **Hacker News** | "Show HN: I built X because Y" post |
| **Reddit** | r/productivity, r/PKM, r/selfhosted |
| **Twitter/X** | Thread on the problem + solution |
| **Indie Hackers** | Product launch post |
| **Personal network** | Direct shares to relevant people |

### 13.5 Success Metrics

| Metric | Target | Signal |
|--------|--------|--------|
| **Signups** | 100+ in first week | Problem resonates |
| **Conversion rate** | >5% of page visitors | Messaging works |
| **Survey completion** | >30% of signups | Engaged audience |
| **Shares/mentions** | Organic discussion | Word of mouth potential |

---

## 14. V2: Try Archetype

### Overview

The **Try** archetype addresses the same pain points for a different type of content: actionable items that require *doing*, not *understanding*.

**Explicitly deferred to V2** to validate the core Learn loop first.

### What It Covers

- Prompts to try ("Use this prompt for code reviews")
- Tools to test (CLI tools, VS Code extensions)
- Snippets to use (bookmarklets, code snippets)
- Workflows to adopt (Claude skills, automations)
- GitHub repos to evaluate

### Why It's Different

| | Learn | Try |
|---|---|---|
| **Goal** | Understand | Do |
| **Completion signal** | Takeaway + Verdict | Tried it + Verdict |
| **Verdict options** | Keep / Revisit / Discard | Adopt / Revisit / Pass |
| **Backlog becomes** | Knowledge base | Toolkit |

### V2 Try Flow (Preview)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ITEM ENTERS (prompt, tool, snippet, repo)                            │
│         │                                                              │
│         ▼                                                              │
│   ┌──────────┐                                                         │
│   │  QUEUE   │                                                         │
│   └────┬─────┘                                                         │
│        │                                                               │
│        ▼                                                               │
│   ┌──────────┐                                                         │
│   │  TRY IT  │ ← Actually use it: run the prompt, install the tool    │
│   └────┬─────┘                                                         │
│        │                                                               │
│        ▼                                                               │
│   ┌──────────┐                                                         │
│   │  NOTES   │ ← Quick note: "Worked great for X" (optional)          │
│   └────┬─────┘                                                         │
│        │                                                               │
│        ▼                                                               │
│   ┌──────────┐                                                         │
│   │ VERDICT  │                                                         │
│   │          │                                                         │
│   │ • Adopt  │ → Toolkit (things I use)                               │
│   │ • Revisit│ → Re-queue                                             │
│   │ • Pass   │ → Gone                                                 │
│   │          │                                                         │
│   └──────────┘                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### V2 Scope Notes

- Separate queue for Try items
- Toolkit view (adopted items)
- AI suggests "try this with..." ideas
- No POC tracking (too heavy for V1)

---

## 15. Future Considerations

### Post-V2 Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Browser Extension** | Quick-add from any page | High |
| **Mobile Share Sheet** | Add via system share | High |
| **Knowledge Map** | Visual graph of connections | Medium |
| **Spaced Resurfacing** | Periodic review of kept items | Medium |
| **Cross-item Connections** | Link related items | Medium |
| **Audio Summaries** | Listen to AI summary | Low |
| **Social Sharing** | Share backlog items | Low |

### Additional Source Types (Future)

| Source | Complexity | Value |
|--------|------------|-------|
| RSS Feeds (generic) | Low | High |
| GitHub Stars | Medium | High |
| Twitter/X Bookmarks | Medium | Medium |
| Newsletter Parser | High | High |
| Podcast Feeds | Medium | Low |

### Integrations (Future)

| Integration | Use Case |
|-------------|----------|
| Readwise | Import highlights |
| Notion | Export backlog |
| Obsidian | Sync with vault |

---

## Appendix A: Streak Logic

```typescript
interface Streak {
  current: number
  longest: number
  lastVerdictDate: Date | null
}

function updateStreak(streak: Streak, verdictDate: Date): Streak {
  const today = startOfDay(verdictDate)
  const lastDate = streak.lastVerdictDate 
    ? startOfDay(streak.lastVerdictDate) 
    : null
  
  if (!lastDate) {
    // First verdict ever
    return { current: 1, longest: 1, lastVerdictDate: verdictDate }
  }
  
  const daysDiff = differenceInDays(today, lastDate)
  
  if (daysDiff === 0) {
    // Same day
    return { ...streak, lastVerdictDate: verdictDate }
  }
  
  if (daysDiff === 1) {
    // Consecutive day
    const newCurrent = streak.current + 1
    return {
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastVerdictDate: verdictDate
    }
  }
  
  // Streak broken
  return {
    current: 1,
    longest: streak.longest,
    lastVerdictDate: verdictDate
  }
}
```

**What counts:** Any verdict (Keep, Revisit, or Discard) counts toward the streak.

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Item** | A unit of content to be processed |
| **Source** | Auto-fetch configuration for a blog or YouTube channel |
| **Queue** | Prioritized list of items awaiting review |
| **Backlog** | Collection of items that received Keep verdict |
| **Verdict** | Forced decision: Keep, Revisit, or Discard |
| **Takeaway** | User's own words summarizing what they learned |
| **Cold Start** | Initial fetch lookback period for new source |
| **Revisit** | Verdict that re-queues item for later review |

---

## Appendix C: Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| **No open AI chat** | Prevents rabbit holes; closed questions force focus |
| **Takeaway required before AI** | Forces active thinking, prevents passive consumption |
| **Multi-queue over weighted algorithm** | Three queues (Oldest, Mix It Up, Quick) more transparent than single opaque score; user understands "why this item" from structure alone; lets user pick based on mood without browsing full queue |
| **Three verdicts only** | Simple, exhaustive, mutually exclusive |
| **Revisit has limits** | Prevents "Revisit" from becoming hoarding |
| **No knowledge map in V1** | Validate core loop first |
| **Try archetype in V2** | Focus on one content type to prove model |
| **Agent-based blog fetching** | Blogs have variable structure; deterministic scripts can't handle variability. Agent per fetch in V1, optimize later by caching extraction patterns |
| **Topic filtering per source** | Prevents queue pollution from prolific multi-topic sources |
| **Sources & Input combined** | Single screen for "where content comes from"—reduces navigation, unified mental model |
| **CSV bulk import** | Power users have existing link collections to migrate |
| **Tag filter collapses to single queue** | Filter = user chose topic, so "Mix It Up" conflicts; show oldest in filtered set only |
| **Merged Home and Queue screens** | With multi-queue, Home IS the queue; separate screen redundant |
| **Tag-only filter in V1** | Time covered by Quick queue, diversity by Mix It Up; tag is main user intent signal |
| **Warm takeaway design** | Critical friction point—must feel inviting, not demanding |
| **Landing page before build** | Validate demand before investing in full implementation |

---

*End of Lean V1 Design Document*
