# thePile Lean V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal learning system that transforms passive content consumption into intentional learning through forced cognitive closure (Queue → Read → Takeaway → Verdict).

**Architecture:** Next.js 14 App Router with server actions for mutations, Prisma ORM connecting to Turso (SQLite edge database), Claude API for AI features. Three-queue system (Oldest, Mix It Up, Quick Win) surfaces items based on different dimensions. Progressive review flow enforces engagement before verdict.

**Tech Stack:** Next.js 14, TypeScript, Prisma, Turso (SQLite), Claude API, Tailwind CSS, shadcn/ui

---

## Phase 1: Project Setup & Infrastructure

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.env.local.example`

**Step 1: Create Next.js project with TypeScript**

```bash
npx create-next-app@14 thepile --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd thepile
```

**Step 2: Verify project runs**

```bash
npm run dev
```
Expected: Dev server starts at localhost:3000

**Step 3: Create environment template**

Create `.env.local.example`:
```env
# Database (Turso)
DATABASE_URL="libsql://your-db.turso.io"
DATABASE_AUTH_TOKEN="your-token"

# AI (Claude)
ANTHROPIC_API_KEY="sk-ant-..."

# YouTube API (for source fetching)
YOUTUBE_API_KEY="..."
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

### Task 1.2: Setup Prisma with Turso

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (add dependencies)

**Step 1: Install Prisma and Turso adapter**

```bash
npm install prisma @prisma/client @prisma/adapter-libsql @libsql/client
npx prisma init
```

**Step 2: Configure Prisma for Turso**

Replace `prisma/schema.prisma`:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Models will be added in Task 2.1
```

**Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (process.env.DATABASE_URL?.startsWith('libsql://')) {
    const libsql = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: setup Prisma with Turso adapter"
```

---

### Task 1.3: Setup shadcn/ui

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `tailwind.config.ts`

**Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

**Step 2: Add core components**

```bash
npx shadcn@latest add button card input textarea badge dialog tabs select toast
```

**Step 3: Verify components work**

Create `src/app/page.tsx`:
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>thePile</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </main>
  )
}
```

**Step 4: Run and verify**

```bash
npm run dev
```
Expected: Page renders with styled card and button

**Step 5: Commit**

```bash
git add .
git commit -m "chore: setup shadcn/ui with core components"
```

---

### Task 1.4: Setup Claude API Client

**Files:**
- Create: `src/lib/ai.ts`
- Modify: `package.json`

**Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

**Step 2: Create AI client**

Create `src/lib/ai.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined
}

export const anthropic = globalForAnthropic.anthropic ?? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

if (process.env.NODE_ENV !== 'production') {
  globalForAnthropic.anthropic = anthropic
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.text ?? ''
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "chore: setup Claude API client"
```

---

## Phase 2: Data Layer

### Task 2.1: Define Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Write complete schema**

Replace `prisma/schema.prisma`:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Item {
  id          String   @id @default(cuid())

  // Content - stored as JSON for flexibility
  sourceType  String   // 'link' | 'text' | 'document'
  sourceData  String   // JSON: { url, content } | { content, attribution } | { fileId, fileName, extractedText }

  title       String
  description String?
  estimatedMinutes Int?

  // Origin
  sourceId    String?
  source      Source?  @relation(fields: [sourceId], references: [id])
  savedAt     DateTime @default(now())
  userNote    String?

  // AI-generated
  aiSummary   String?

  // State
  status      String   @default("queued") // 'queued' | 'kept' | 'revisit' | 'discarded'
  priorityScore Float  @default(0)

  // Engagement
  readAt      DateTime?
  takeaway    String?
  takeawayAt  DateTime?
  verdict     String?  // 'keep' | 'revisit' | 'discard'
  verdictAt   DateTime?

  // Revisit tracking
  revisitCount Int     @default(0)
  revisitAfter DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  tags        ItemTag[]
  followUps   AIFollowUp[]
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  items ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String
  item   Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}

model Source {
  id        String   @id @default(cuid())

  // Configuration
  type      String   // 'blog' | 'youtube'
  url       String   @unique
  name      String

  // Fetch settings
  interval  String   @default("daily") // 'hourly' | 'daily' | 'weekly'
  maxPerFetch Int    @default(3)
  coldStartWindow String @default("30d") // '7d' | '30d' | '90d' | 'all'

  // Topic filtering
  topicFilter String?
  topicFilterEnabled Boolean @default(false)

  // Auto-tagging (stored as JSON array)
  autoTags  String   @default("[]")

  // State
  fetchedItemIds String @default("[]") // JSON array of item IDs
  lastFetchedAt DateTime?
  lastFetchStatus String @default("pending") // 'success' | 'error' | 'pending'
  lastFetchError String?

  // Stats
  itemsFetchedTotal Int @default(0)
  itemsQueuedTotal Int @default(0)
  itemsFilteredTotal Int @default(0)
  lastFetchStats String? // JSON: { fetched, queued, filtered }

  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())

  items     Item[]
}

model UserStats {
  id             String   @id @default("singleton")

  // Streak
  currentStreak  Int      @default(0)
  longestStreak  Int      @default(0)
  lastVerdictDate DateTime?

  // Counts
  totalKept      Int      @default(0)
  totalDiscarded Int      @default(0)
  totalRevisited Int      @default(0)

  // Weekly stats (reset weekly)
  weekStartDate  DateTime?
  weeklyKept     Int      @default(0)
  weeklyDiscarded Int     @default(0)

  updatedAt      DateTime @updatedAt
}

model AIFollowUp {
  id        String   @id @default(cuid())
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  question  String
  answer    String?
  askedAt   DateTime?
  createdAt DateTime @default(now())
}
```

**Step 2: Generate migration**

```bash
npx prisma migrate dev --name init
```

**Step 3: Generate Prisma client**

```bash
npx prisma generate
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema for items, sources, tags, and stats"
```

---

### Task 2.2: Create Type Definitions

**Files:**
- Create: `src/types/index.ts`

**Step 1: Write type definitions**

Create `src/types/index.ts`:
```typescript
import type { Item, Tag, Source, UserStats, AIFollowUp } from '@prisma/client'

// Source data types (stored as JSON in DB)
export type LinkSource = {
  type: 'link'
  url: string
  content?: string
}

export type TextSource = {
  type: 'text'
  content: string
  attribution?: string
}

export type DocumentSource = {
  type: 'document'
  fileId: string
  fileName: string
  extractedText: string
}

export type ItemSourceData = LinkSource | TextSource | DocumentSource

// Item with parsed source data and relations
export type ItemWithRelations = Item & {
  tags: { tag: Tag }[]
  followUps: AIFollowUp[]
  source: Source | null
}

// Verdict types
export type Verdict = 'keep' | 'revisit' | 'discard'
export type ItemStatus = 'queued' | 'kept' | 'revisit' | 'discarded'

// Queue types
export type QueueType = 'oldest' | 'mixUp' | 'quick'

export type QueueItem = {
  type: QueueType
  item: ItemWithRelations
  reason: string
}

export type MultiQueueResult = {
  oldest: QueueItem | null
  mixUp: QueueItem | null
  quick: QueueItem | null
  totalQueued: number
}

// Source types
export type SourceType = 'blog' | 'youtube'
export type FetchInterval = 'hourly' | 'daily' | 'weekly'
export type ColdStartWindow = '7d' | '30d' | '90d' | 'all'
export type FetchStatus = 'success' | 'error' | 'pending'

export type FetchStats = {
  fetched: number
  queued: number
  filtered: number
}

// Re-export Prisma types
export type { Item, Tag, Source, UserStats, AIFollowUp }
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 2.3: Create Database Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Step 1: Write seed script**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'AI' },
      update: {},
      create: { name: 'AI' },
    }),
    prisma.tag.upsert({
      where: { name: 'Prompting' },
      update: {},
      create: { name: 'Prompting' },
    }),
    prisma.tag.upsert({
      where: { name: 'DevOps' },
      update: {},
      create: { name: 'DevOps' },
    }),
    prisma.tag.upsert({
      where: { name: 'Security' },
      update: {},
      create: { name: 'Security' },
    }),
  ])

  // Create sample items
  const items = [
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://simonwillison.net/2024/Dec/19/context-engineering/',
      }),
      title: 'Context Engineering for AI Agents',
      description: 'How to design effective context for LLM-based agents',
      estimatedMinutes: 15,
      savedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      tags: ['AI', 'Prompting'],
    },
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://youtube.com/watch?v=example',
      }),
      title: 'Kubernetes Security Best Practices',
      description: 'Deep dive into K8s security',
      estimatedMinutes: 22,
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      tags: ['DevOps', 'Security'],
    },
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://anthropic.com/news/prompt-caching',
      }),
      title: 'Prompt Caching Explained',
      description: 'How prompt caching reduces latency and cost',
      estimatedMinutes: 4,
      savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      tags: ['AI'],
    },
  ]

  for (const itemData of items) {
    const { tags: tagNames, ...data } = itemData
    const item = await prisma.item.create({
      data: {
        ...data,
        tags: {
          create: tagNames.map((name) => ({
            tag: {
              connect: { name },
            },
          })),
        },
      },
    })
    console.log(`Created item: ${item.title}`)
  }

  // Create user stats singleton
  await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      currentStreak: 0,
      longestStreak: 0,
    },
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Step 2: Add seed script to package.json**

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

**Step 3: Install tsx for running TypeScript**

```bash
npm install -D tsx
```

**Step 4: Run seed**

```bash
npx prisma db seed
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add database seed script with sample data"
```

---

## Phase 3: Core Domain Logic

### Task 3.1: Queue Algorithm - Oldest Queue

**Files:**
- Create: `src/lib/queue/oldest.ts`
- Create: `src/lib/queue/oldest.test.ts`

**Step 1: Write the failing test**

Create `src/lib/queue/__tests__/oldest.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getOldestItem } from '../oldest'
import type { ItemWithRelations } from '@/types'

const createMockItem = (overrides: Partial<ItemWithRelations> = {}): ItemWithRelations => ({
  id: 'test-id',
  sourceType: 'link',
  sourceData: '{}',
  title: 'Test Item',
  description: null,
  estimatedMinutes: 10,
  sourceId: null,
  savedAt: new Date(),
  userNote: null,
  aiSummary: null,
  status: 'queued',
  priorityScore: 0,
  readAt: null,
  takeaway: null,
  takeawayAt: null,
  verdict: null,
  verdictAt: null,
  revisitCount: 0,
  revisitAfter: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  followUps: [],
  source: null,
  ...overrides,
})

describe('getOldestItem', () => {
  it('returns null for empty array', () => {
    expect(getOldestItem([])).toBeNull()
  })

  it('returns the oldest item by savedAt date', () => {
    const oldest = createMockItem({
      id: 'oldest',
      savedAt: new Date('2024-01-01'),
    })
    const newer = createMockItem({
      id: 'newer',
      savedAt: new Date('2024-06-01'),
    })
    const newest = createMockItem({
      id: 'newest',
      savedAt: new Date('2024-12-01'),
    })

    const result = getOldestItem([newest, oldest, newer])
    expect(result?.id).toBe('oldest')
  })

  it('only considers queued items', () => {
    const oldButKept = createMockItem({
      id: 'old-kept',
      savedAt: new Date('2024-01-01'),
      status: 'kept',
    })
    const newerQueued = createMockItem({
      id: 'newer-queued',
      savedAt: new Date('2024-06-01'),
      status: 'queued',
    })

    const result = getOldestItem([oldButKept, newerQueued])
    expect(result?.id).toBe('newer-queued')
  })
})
```

**Step 2: Setup Vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 3: Run test to verify it fails**

```bash
npm run test:run -- src/lib/queue/__tests__/oldest.test.ts
```
Expected: FAIL with "Cannot find module '../oldest'"

**Step 4: Write minimal implementation**

Create `src/lib/queue/oldest.ts`:
```typescript
import type { ItemWithRelations } from '@/types'

export function getOldestItem(items: ItemWithRelations[]): ItemWithRelations | null {
  const queued = items.filter((item) => item.status === 'queued')

  if (queued.length === 0) return null

  return queued.reduce((oldest, current) => {
    return current.savedAt < oldest.savedAt ? current : oldest
  })
}
```

**Step 5: Run test to verify it passes**

```bash
npm run test:run -- src/lib/queue/__tests__/oldest.test.ts
```
Expected: PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add oldest queue algorithm"
```

---

### Task 3.2: Queue Algorithm - Quick Win Queue

**Files:**
- Create: `src/lib/queue/quick.ts`
- Create: `src/lib/queue/__tests__/quick.test.ts`

**Step 1: Write the failing test**

Create `src/lib/queue/__tests__/quick.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getQuickItem } from '../quick'
import type { ItemWithRelations } from '@/types'

const createMockItem = (overrides: Partial<ItemWithRelations> = {}): ItemWithRelations => ({
  id: 'test-id',
  sourceType: 'link',
  sourceData: '{}',
  title: 'Test Item',
  description: null,
  estimatedMinutes: 10,
  sourceId: null,
  savedAt: new Date(),
  userNote: null,
  aiSummary: null,
  status: 'queued',
  priorityScore: 0,
  readAt: null,
  takeaway: null,
  takeawayAt: null,
  verdict: null,
  verdictAt: null,
  revisitCount: 0,
  revisitAfter: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  followUps: [],
  source: null,
  ...overrides,
})

describe('getQuickItem', () => {
  it('returns null for empty array', () => {
    expect(getQuickItem([])).toBeNull()
  })

  it('returns the shortest item by estimatedMinutes', () => {
    const shortest = createMockItem({ id: 'short', estimatedMinutes: 4 })
    const medium = createMockItem({ id: 'medium', estimatedMinutes: 15 })
    const longest = createMockItem({ id: 'long', estimatedMinutes: 30 })

    const result = getQuickItem([longest, shortest, medium])
    expect(result?.id).toBe('short')
  })

  it('excludes specified item IDs', () => {
    const shortest = createMockItem({ id: 'short', estimatedMinutes: 4 })
    const medium = createMockItem({ id: 'medium', estimatedMinutes: 15 })

    const result = getQuickItem([shortest, medium], ['short'])
    expect(result?.id).toBe('medium')
  })

  it('treats null estimatedMinutes as infinity', () => {
    const withTime = createMockItem({ id: 'timed', estimatedMinutes: 30 })
    const noTime = createMockItem({ id: 'no-time', estimatedMinutes: null })

    const result = getQuickItem([noTime, withTime])
    expect(result?.id).toBe('timed')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/queue/__tests__/quick.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**

Create `src/lib/queue/quick.ts`:
```typescript
import type { ItemWithRelations } from '@/types'

export function getQuickItem(
  items: ItemWithRelations[],
  excludeIds: string[] = []
): ItemWithRelations | null {
  const queued = items.filter(
    (item) => item.status === 'queued' && !excludeIds.includes(item.id)
  )

  if (queued.length === 0) return null

  return queued.reduce((quickest, current) => {
    const quickestTime = quickest.estimatedMinutes ?? Infinity
    const currentTime = current.estimatedMinutes ?? Infinity
    return currentTime < quickestTime ? current : quickest
  })
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/lib/queue/__tests__/quick.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add quick win queue algorithm"
```

---

### Task 3.3: Queue Algorithm - Mix It Up Queue

**Files:**
- Create: `src/lib/queue/diversity.ts`
- Create: `src/lib/queue/__tests__/diversity.test.ts`

**Step 1: Write the failing test**

Create `src/lib/queue/__tests__/diversity.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getMixUpItem, countTagOverlap } from '../diversity'
import type { ItemWithRelations } from '@/types'
import type { Tag } from '@prisma/client'

const createTag = (name: string): { tag: Tag } => ({
  tag: { id: name, name },
})

const createMockItem = (
  id: string,
  tagNames: string[]
): ItemWithRelations => ({
  id,
  sourceType: 'link',
  sourceData: '{}',
  title: 'Test Item',
  description: null,
  estimatedMinutes: 10,
  sourceId: null,
  savedAt: new Date(),
  userNote: null,
  aiSummary: null,
  status: 'queued',
  priorityScore: 0,
  readAt: null,
  takeaway: null,
  takeawayAt: null,
  verdict: null,
  verdictAt: null,
  revisitCount: 0,
  revisitAfter: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: tagNames.map(createTag),
  followUps: [],
  source: null,
})

describe('countTagOverlap', () => {
  it('returns 0 for no overlap', () => {
    const itemTags = ['AI', 'ML']
    const recentTags = ['DevOps', 'Security']
    expect(countTagOverlap(itemTags, recentTags)).toBe(0)
  })

  it('counts overlapping tags', () => {
    const itemTags = ['AI', 'ML', 'Prompting']
    const recentTags = ['AI', 'Prompting', 'RAG']
    expect(countTagOverlap(itemTags, recentTags)).toBe(2)
  })
})

describe('getMixUpItem', () => {
  it('returns null for empty array', () => {
    expect(getMixUpItem([], [])).toBeNull()
  })

  it('returns item with least tag overlap', () => {
    const aiItem = createMockItem('ai-item', ['AI', 'ML'])
    const devOpsItem = createMockItem('devops-item', ['DevOps', 'K8s'])
    const mixedItem = createMockItem('mixed', ['AI', 'DevOps'])

    const recentTags = ['AI', 'ML', 'Prompting'] // Recent focus on AI

    const result = getMixUpItem([aiItem, devOpsItem, mixedItem], recentTags)
    expect(result?.id).toBe('devops-item') // Zero overlap with recent
  })

  it('excludes specified item IDs', () => {
    const devOpsItem = createMockItem('devops-item', ['DevOps'])
    const aiItem = createMockItem('ai-item', ['AI'])

    const result = getMixUpItem([devOpsItem, aiItem], ['AI'], ['devops-item'])
    expect(result?.id).toBe('ai-item')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/queue/__tests__/diversity.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**

Create `src/lib/queue/diversity.ts`:
```typescript
import type { ItemWithRelations } from '@/types'

export function countTagOverlap(itemTags: string[], recentTags: string[]): number {
  const recentSet = new Set(recentTags)
  return itemTags.filter((tag) => recentSet.has(tag)).length
}

export function getMixUpItem(
  items: ItemWithRelations[],
  recentVerdictTags: string[],
  excludeIds: string[] = []
): ItemWithRelations | null {
  const queued = items.filter(
    (item) => item.status === 'queued' && !excludeIds.includes(item.id)
  )

  if (queued.length === 0) return null

  // Sort by least overlap first
  const sorted = [...queued].sort((a, b) => {
    const aTags = a.tags.map((t) => t.tag.name)
    const bTags = b.tags.map((t) => t.tag.name)
    const aOverlap = countTagOverlap(aTags, recentVerdictTags)
    const bOverlap = countTagOverlap(bTags, recentVerdictTags)
    return aOverlap - bOverlap
  })

  return sorted[0]
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/lib/queue/__tests__/diversity.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add mix-it-up diversity queue algorithm"
```

---

### Task 3.4: Queue Algorithm - Combined Multi-Queue

**Files:**
- Create: `src/lib/queue/index.ts`
- Create: `src/lib/queue/__tests__/index.test.ts`

**Step 1: Write the failing test**

Create `src/lib/queue/__tests__/index.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getMultiQueueItems } from '../index'
import type { ItemWithRelations } from '@/types'
import type { Tag } from '@prisma/client'

const createTag = (name: string): { tag: Tag } => ({
  tag: { id: name, name },
})

const createMockItem = (
  id: string,
  savedAt: Date,
  estimatedMinutes: number,
  tagNames: string[] = []
): ItemWithRelations => ({
  id,
  sourceType: 'link',
  sourceData: '{}',
  title: `Item ${id}`,
  description: null,
  estimatedMinutes,
  sourceId: null,
  savedAt,
  userNote: null,
  aiSummary: null,
  status: 'queued',
  priorityScore: 0,
  readAt: null,
  takeaway: null,
  takeawayAt: null,
  verdict: null,
  verdictAt: null,
  revisitCount: 0,
  revisitAfter: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: tagNames.map(createTag),
  followUps: [],
  source: null,
})

describe('getMultiQueueItems', () => {
  it('returns null for all queues when empty', () => {
    const result = getMultiQueueItems([], [])
    expect(result.oldest).toBeNull()
    expect(result.mixUp).toBeNull()
    expect(result.quick).toBeNull()
    expect(result.totalQueued).toBe(0)
  })

  it('deduplicates across queues', () => {
    // This item is oldest AND quickest AND most diverse
    const superItem = createMockItem(
      'super',
      new Date('2024-01-01'),
      2,
      ['Rare']
    )
    const normalItem = createMockItem(
      'normal',
      new Date('2024-06-01'),
      15,
      ['AI']
    )

    const result = getMultiQueueItems([superItem, normalItem], ['AI'])

    // Super item wins oldest (first priority)
    expect(result.oldest?.item.id).toBe('super')
    // Normal item fills other slots
    expect(result.mixUp?.item.id).toBe('normal')
    expect(result.quick?.item.id).toBe('normal')
  })

  it('fills three different items when possible', () => {
    const oldest = createMockItem('oldest', new Date('2024-01-01'), 30, ['AI'])
    const diverse = createMockItem('diverse', new Date('2024-06-01'), 20, ['DevOps'])
    const quick = createMockItem('quick', new Date('2024-12-01'), 5, ['AI'])

    const result = getMultiQueueItems([oldest, diverse, quick], ['AI'])

    expect(result.oldest?.item.id).toBe('oldest')
    expect(result.mixUp?.item.id).toBe('diverse') // Zero AI overlap
    expect(result.quick?.item.id).toBe('quick')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/queue/__tests__/index.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**

Create `src/lib/queue/index.ts`:
```typescript
import type { ItemWithRelations, MultiQueueResult, QueueItem } from '@/types'
import { getOldestItem } from './oldest'
import { getQuickItem } from './quick'
import { getMixUpItem } from './diversity'

export { getOldestItem } from './oldest'
export { getQuickItem } from './quick'
export { getMixUpItem, countTagOverlap } from './diversity'

export function getMultiQueueItems(
  items: ItemWithRelations[],
  recentVerdictTags: string[]
): MultiQueueResult {
  const queued = items.filter((i) => i.status === 'queued')
  const excludeIds: string[] = []

  // Priority 1: Oldest
  const oldestItem = getOldestItem(queued)
  let oldest: QueueItem | null = null
  if (oldestItem) {
    oldest = {
      type: 'oldest',
      item: oldestItem,
      reason: 'Oldest item in queue',
    }
    excludeIds.push(oldestItem.id)
  }

  // Priority 2: Mix It Up (most diverse)
  const mixUpItem = getMixUpItem(queued, recentVerdictTags, excludeIds)
  let mixUp: QueueItem | null = null
  if (mixUpItem) {
    mixUp = {
      type: 'mixUp',
      item: mixUpItem,
      reason: 'Different from recent topics',
    }
    excludeIds.push(mixUpItem.id)
  }

  // Priority 3: Quick Win (shortest)
  const quickItem = getQuickItem(queued, excludeIds)
  let quick: QueueItem | null = null
  if (quickItem) {
    quick = {
      type: 'quick',
      item: quickItem,
      reason: `Only ${quickItem.estimatedMinutes ?? '?'} minutes`,
    }
  }

  return {
    oldest,
    mixUp,
    quick,
    totalQueued: queued.length,
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/lib/queue/__tests__/index.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add combined multi-queue algorithm with deduplication"
```

---

### Task 3.5: Streak Logic

**Files:**
- Create: `src/lib/streak.ts`
- Create: `src/lib/streak.test.ts`

**Step 1: Write the failing test**

Create `src/lib/__tests__/streak.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { updateStreak } from '../streak'

describe('updateStreak', () => {
  it('starts a new streak on first verdict', () => {
    const result = updateStreak(
      { current: 0, longest: 0, lastVerdictDate: null },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(1)
    expect(result.longest).toBe(1)
  })

  it('maintains streak for same day verdict', () => {
    const result = updateStreak(
      { current: 5, longest: 10, lastVerdictDate: new Date('2024-12-15T10:00:00') },
      new Date('2024-12-15T18:00:00')
    )
    expect(result.current).toBe(5) // No change
    expect(result.longest).toBe(10)
  })

  it('increments streak for consecutive day', () => {
    const result = updateStreak(
      { current: 5, longest: 10, lastVerdictDate: new Date('2024-12-14') },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(6)
    expect(result.longest).toBe(10) // Doesn't beat record
  })

  it('updates longest when current exceeds it', () => {
    const result = updateStreak(
      { current: 10, longest: 10, lastVerdictDate: new Date('2024-12-14') },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(11)
    expect(result.longest).toBe(11)
  })

  it('resets streak after gap', () => {
    const result = updateStreak(
      { current: 10, longest: 15, lastVerdictDate: new Date('2024-12-10') },
      new Date('2024-12-15') // 5 days later
    )
    expect(result.current).toBe(1)
    expect(result.longest).toBe(15) // Preserved
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/streak.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**

Create `src/lib/streak.ts`:
```typescript
export interface Streak {
  current: number
  longest: number
  lastVerdictDate: Date | null
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function differenceInDays(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1)
  const d2 = startOfDay(date2)
  const diffMs = d1.getTime() - d2.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

export function updateStreak(streak: Streak, verdictDate: Date): Streak {
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
      lastVerdictDate: verdictDate,
    }
  }

  // Streak broken
  return {
    current: 1,
    longest: streak.longest,
    lastVerdictDate: verdictDate,
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/lib/__tests__/streak.test.ts
```
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add streak logic for tracking consecutive verdict days"
```

---

## Phase 4: Server Actions & Data Access

### Task 4.1: Items Data Access Layer

**Files:**
- Create: `src/lib/data/items.ts`

**Step 1: Create items data access**

Create `src/lib/data/items.ts`:
```typescript
import { db } from '@/lib/db'
import type { ItemWithRelations, ItemSourceData, Verdict } from '@/types'

export async function getQueuedItems(): Promise<ItemWithRelations[]> {
  return db.item.findMany({
    where: {
      status: 'queued',
      OR: [
        { revisitAfter: null },
        { revisitAfter: { lte: new Date() } },
      ],
    },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    },
    orderBy: { savedAt: 'asc' },
  })
}

export async function getBacklogItems(): Promise<ItemWithRelations[]> {
  return db.item.findMany({
    where: { status: 'kept' },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    },
    orderBy: { verdictAt: 'desc' },
  })
}

export async function getItemById(id: string): Promise<ItemWithRelations | null> {
  return db.item.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    },
  })
}

export async function getRecentVerdictTags(limit = 3): Promise<string[]> {
  const recentItems = await db.item.findMany({
    where: { verdict: { not: null } },
    orderBy: { verdictAt: 'desc' },
    take: limit,
    include: { tags: { include: { tag: true } } },
  })

  return recentItems.flatMap((item) => item.tags.map((t) => t.tag.name))
}

export async function createItem(data: {
  sourceType: string
  sourceData: ItemSourceData
  title: string
  description?: string
  estimatedMinutes?: number
  tags: string[]
  userNote?: string
  aiSummary?: string
  sourceId?: string
}): Promise<ItemWithRelations> {
  const { tags, sourceData, ...rest } = data

  return db.item.create({
    data: {
      ...rest,
      sourceData: JSON.stringify(sourceData),
      tags: {
        create: tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    },
  })
}

export async function markItemRead(id: string): Promise<void> {
  await db.item.update({
    where: { id },
    data: { readAt: new Date() },
  })
}

export async function saveTakeaway(id: string, takeaway: string): Promise<void> {
  await db.item.update({
    where: { id },
    data: {
      takeaway,
      takeawayAt: new Date(),
    },
  })
}

export async function recordVerdict(
  id: string,
  verdict: Verdict
): Promise<ItemWithRelations> {
  const statusMap: Record<Verdict, string> = {
    keep: 'kept',
    revisit: 'revisit',
    discard: 'discarded',
  }

  const item = await db.item.findUnique({ where: { id } })
  if (!item) throw new Error('Item not found')

  const updateData: Record<string, unknown> = {
    verdict,
    verdictAt: new Date(),
    status: statusMap[verdict],
  }

  if (verdict === 'revisit') {
    updateData.revisitCount = item.revisitCount + 1
    updateData.revisitAfter = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  return db.item.update({
    where: { id },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    },
  })
}

export async function deleteItem(id: string): Promise<void> {
  await db.item.delete({ where: { id } })
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add items data access layer"
```

---

### Task 4.2: User Stats Data Access

**Files:**
- Create: `src/lib/data/stats.ts`

**Step 1: Create stats data access**

Create `src/lib/data/stats.ts`:
```typescript
import { db } from '@/lib/db'
import { updateStreak, type Streak } from '@/lib/streak'
import type { UserStats, Verdict } from '@/types'

export async function getUserStats(): Promise<UserStats> {
  let stats = await db.userStats.findUnique({
    where: { id: 'singleton' },
  })

  if (!stats) {
    stats = await db.userStats.create({
      data: { id: 'singleton' },
    })
  }

  return stats
}

export async function recordVerdictStats(verdict: Verdict): Promise<UserStats> {
  const stats = await getUserStats()
  const now = new Date()

  // Update streak
  const currentStreak: Streak = {
    current: stats.currentStreak,
    longest: stats.longestStreak,
    lastVerdictDate: stats.lastVerdictDate,
  }
  const newStreak = updateStreak(currentStreak, now)

  // Prepare update data
  const updateData: Record<string, unknown> = {
    currentStreak: newStreak.current,
    longestStreak: newStreak.longest,
    lastVerdictDate: newStreak.lastVerdictDate,
  }

  // Update counts
  switch (verdict) {
    case 'keep':
      updateData.totalKept = stats.totalKept + 1
      updateData.weeklyKept = stats.weeklyKept + 1
      break
    case 'discard':
      updateData.totalDiscarded = stats.totalDiscarded + 1
      updateData.weeklyDiscarded = stats.weeklyDiscarded + 1
      break
    case 'revisit':
      updateData.totalRevisited = stats.totalRevisited + 1
      break
  }

  return db.userStats.update({
    where: { id: 'singleton' },
    data: updateData,
  })
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add user stats data access with streak tracking"
```

---

### Task 4.3: Server Actions for Queue

**Files:**
- Create: `src/app/actions/queue.ts`

**Step 1: Create queue server actions**

Create `src/app/actions/queue.ts`:
```typescript
'use server'

import { getQueuedItems, getRecentVerdictTags } from '@/lib/data/items'
import { getMultiQueueItems } from '@/lib/queue'
import type { MultiQueueResult, ItemWithRelations } from '@/types'

export async function fetchMultiQueue(tagFilter?: string): Promise<MultiQueueResult> {
  const [items, recentTags] = await Promise.all([
    getQueuedItems(),
    getRecentVerdictTags(),
  ])

  let filtered = items
  if (tagFilter) {
    filtered = items.filter((item) =>
      item.tags.some((t) => t.tag.name === tagFilter)
    )
  }

  return getMultiQueueItems(filtered, recentTags)
}

export async function fetchFilteredQueue(tagFilter: string): Promise<{
  current: ItemWithRelations | null
  upcoming: ItemWithRelations[]
  total: number
  filteredCount: number
}> {
  const items = await getQueuedItems()

  const filtered = items.filter((item) =>
    item.tags.some((t) => t.tag.name === tagFilter)
  )

  // Sort by oldest first
  const sorted = [...filtered].sort(
    (a, b) => a.savedAt.getTime() - b.savedAt.getTime()
  )

  return {
    current: sorted[0] ?? null,
    upcoming: sorted.slice(1, 4), // Next 3 items
    total: items.length,
    filteredCount: filtered.length,
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add server actions for queue fetching"
```

---

### Task 4.4: Server Actions for Items

**Files:**
- Create: `src/app/actions/items.ts`

**Step 1: Create item server actions**

Create `src/app/actions/items.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import {
  getItemById,
  createItem,
  markItemRead,
  saveTakeaway,
  recordVerdict,
  deleteItem,
} from '@/lib/data/items'
import { recordVerdictStats } from '@/lib/data/stats'
import type { ItemSourceData, Verdict, ItemWithRelations } from '@/types'

export async function fetchItem(id: string): Promise<ItemWithRelations | null> {
  return getItemById(id)
}

export async function addItem(data: {
  sourceType: string
  sourceData: ItemSourceData
  title: string
  description?: string
  estimatedMinutes?: number
  tags: string[]
  userNote?: string
}): Promise<ItemWithRelations> {
  // TODO: Generate AI summary here
  const item = await createItem(data)
  revalidatePath('/')
  return item
}

export async function markRead(id: string): Promise<void> {
  await markItemRead(id)
  revalidatePath(`/review/${id}`)
}

export async function submitTakeaway(id: string, takeaway: string): Promise<void> {
  await saveTakeaway(id, takeaway)
  revalidatePath(`/review/${id}`)
}

export async function submitVerdict(
  id: string,
  verdict: Verdict
): Promise<ItemWithRelations> {
  const [item] = await Promise.all([
    recordVerdict(id, verdict),
    recordVerdictStats(verdict),
  ])

  revalidatePath('/')
  revalidatePath('/backlog')
  return item
}

export async function discardItem(id: string): Promise<void> {
  await recordVerdict(id, 'discard')
  await recordVerdictStats('discard')
  revalidatePath('/')
}

export async function removeItem(id: string): Promise<void> {
  await deleteItem(id)
  revalidatePath('/')
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add server actions for item operations"
```

---

## Phase 5: UI Components

### Task 5.1: Layout & Navigation

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/nav.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create header component**

Create `src/components/layout/header.tsx`:
```tsx
import Link from 'next/link'
import { getUserStats } from '@/lib/data/stats'

export async function Header() {
  const stats = await getUserStats()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          thePile
        </Link>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-sm text-orange-500">
            <span>🔥</span>
            <span>{stats.currentStreak} day streak</span>
          </div>
        )}
      </div>
    </header>
  )
}
```

**Step 2: Create navigation component**

Create `src/components/layout/nav.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, BookOpen, Rss, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/backlog', label: 'Backlog', icon: BookOpen },
  { href: '/sources', label: 'Sources', icon: Rss },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-around px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Step 3: Install lucide-react**

```bash
npm install lucide-react
```

**Step 4: Update root layout**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Nav } from '@/components/layout/nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'thePile',
  description: 'Transform passive consumption into intentional learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-20">{children}</main>
          <Nav />
        </div>
      </body>
    </html>
  )
}
```

**Step 5: Run and verify**

```bash
npm run dev
```
Expected: Header and bottom nav visible

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add layout with header and bottom navigation"
```

---

### Task 5.2: Queue Card Component

**Files:**
- Create: `src/components/queue/queue-card.tsx`

**Step 1: Create queue card component**

Create `src/components/queue/queue-card.tsx`:
```tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { QueueItem } from '@/types'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

const queueIcons: Record<string, string> = {
  oldest: '🕰️',
  mixUp: '🎲',
  quick: '⚡',
}

const queueLabels: Record<string, string> = {
  oldest: 'OLDEST',
  mixUp: 'MIX IT UP',
  quick: 'QUICK WIN',
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

interface QueueCardProps {
  queueItem: QueueItem
}

export function QueueCard({ queueItem }: QueueCardProps) {
  const { type, item, reason } = queueItem
  const sourceData = JSON.parse(item.sourceData)
  const domain = sourceData.url
    ? new URL(sourceData.url).hostname.replace('www.', '')
    : 'Manual'

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>{queueIcons[type]}</span>
          <span>{queueLabels[type]}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="font-semibold leading-tight">{item.title}</h3>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{domain}</span>
          {item.estimatedMinutes && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{item.estimatedMinutes} min
              </span>
            </>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatTimeAgo(item.savedAt)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {item.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>

        {reason && type !== 'oldest' && (
          <p className="text-sm text-muted-foreground">{reason}</p>
        )}

        <Button asChild className="w-full">
          <Link href={`/review/${item.id}`}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Start Review
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add queue card component"
```

---

### Task 5.3: Tag Filter Component

**Files:**
- Create: `src/components/queue/tag-filter.tsx`

**Step 1: Create tag filter component**

Create `src/components/queue/tag-filter.tsx`:
```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  currentFilter?: string
}

export function TagFilter({ tags, currentFilter }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('tag')
    } else {
      params.set('tag', value)
    }
    router.push(`/?${params.toString()}`)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    router.push(`/?${params.toString()}`)
  }

  if (currentFilter) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtering:</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={clearFilter}
          className="gap-1"
        >
          {currentFilter}
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Select onValueChange={handleFilterChange} defaultValue="all">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add tag filter component"
```

---

### Task 5.4: Home Page - Multi-Queue View

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/lib/data/tags.ts`

**Step 1: Create tags data access**

Create `src/lib/data/tags.ts`:
```typescript
import { db } from '@/lib/db'

export async function getAllTags(): Promise<string[]> {
  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
  })
  return tags.map((t) => t.name)
}
```

**Step 2: Update home page**

Replace `src/app/page.tsx`:
```tsx
import { Suspense } from 'react'
import { fetchMultiQueue, fetchFilteredQueue } from '@/app/actions/queue'
import { getAllTags } from '@/lib/data/tags'
import { getUserStats } from '@/lib/data/stats'
import { QueueCard } from '@/components/queue/queue-card'
import { TagFilter } from '@/components/queue/tag-filter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>
}

async function MultiQueueView() {
  const [queue, tags] = await Promise.all([
    fetchMultiQueue(),
    getAllTags(),
  ])

  if (queue.totalQueued === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h3 className="font-semibold mb-2">Queue clear!</h3>
          <p className="text-muted-foreground mb-4">
            You've processed everything. Nice work.
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/sources">Add something new</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TagFilter tags={tags} />
        <span className="text-sm text-muted-foreground">
          {queue.totalQueued} in queue
        </span>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">WHAT'S NEXT</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {queue.oldest && <QueueCard queueItem={queue.oldest} />}
          {queue.mixUp && <QueueCard queueItem={queue.mixUp} />}
          {queue.quick && <QueueCard queueItem={queue.quick} />}
        </div>
      </div>
    </div>
  )
}

async function FilteredQueueView({ tag }: { tag: string }) {
  const [result, tags] = await Promise.all([
    fetchFilteredQueue(tag),
    getAllTags(),
  ])

  if (!result.current) {
    return (
      <div className="space-y-6">
        <TagFilter tags={tags} currentFilter={tag} />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No items with tag [{tag}]
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TagFilter tags={tags} currentFilter={tag} />
        <span className="text-sm text-muted-foreground">
          {result.filteredCount} of {result.total} items
        </span>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">WHAT'S NEXT IN [{tag}]</h2>

        <QueueCard
          queueItem={{
            type: 'oldest',
            item: result.current,
            reason: `Oldest item in [${tag}]`,
          }}
        />

        {result.upcoming.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              UP NEXT IN [{tag}] ({result.upcoming.length} more)
            </h3>
            <div className="space-y-2">
              {result.upcoming.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.estimatedMinutes
                          ? `~${item.estimatedMinutes} min`
                          : 'Time unknown'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag } = await searchParams

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div>Loading queue...</div>}>
        {tag ? <FilteredQueueView tag={tag} /> : <MultiQueueView />}
      </Suspense>
    </div>
  )
}
```

**Step 3: Run and verify**

```bash
npm run dev
```
Expected: Home page shows 3 queue cards or filtered view

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add home page with multi-queue and filtered views"
```

---

## Phase 6: Review Flow

### Task 6.1: Review Page Layout

**Files:**
- Create: `src/app/review/[id]/page.tsx`

**Step 1: Create review page**

Create `src/app/review/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { fetchItem } from '@/app/actions/items'
import { ReviewFlow } from './review-flow'

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const item = await fetchItem(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ReviewFlow item={item} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add review page structure"
```

---

### Task 6.2: Review Flow Component - Read Step

**Files:**
- Create: `src/app/review/[id]/review-flow.tsx`

**Step 1: Create review flow component**

Create `src/app/review/[id]/review-flow.tsx`:
```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ExternalLink, Check, Trash2 } from 'lucide-react'
import { markRead, submitTakeaway, submitVerdict, discardItem } from '@/app/actions/items'
import type { ItemWithRelations, Verdict } from '@/types'

type ReviewStep = 'read' | 'takeaway' | 'verdict'

interface ReviewFlowProps {
  item: ItemWithRelations
}

export function ReviewFlow({ item }: ReviewFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<ReviewStep>(item.readAt ? 'takeaway' : 'read')
  const [takeaway, setTakeaway] = useState(item.takeaway ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sourceData = JSON.parse(item.sourceData)
  const sourceUrl = sourceData.url

  const handleMarkRead = async () => {
    setIsSubmitting(true)
    await markRead(item.id)
    setStep('takeaway')
    setIsSubmitting(false)
  }

  const handleSubmitTakeaway = async () => {
    if (takeaway.trim().length < 20) return
    setIsSubmitting(true)
    await submitTakeaway(item.id, takeaway)
    setStep('verdict')
    setIsSubmitting(false)
  }

  const handleVerdict = async (verdict: Verdict) => {
    setIsSubmitting(true)
    await submitVerdict(item.id, verdict)
    router.push('/')
  }

  const handleDiscard = async () => {
    if (confirm('Discard this item? This cannot be undone.')) {
      setIsSubmitting(true)
      await discardItem(item.id)
      router.push('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDiscard}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Discard
        </Button>
      </div>

      {/* Item Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{item.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {sourceUrl && (
              <span>{new URL(sourceUrl).hostname.replace('www.', '')}</span>
            )}
            {item.estimatedMinutes && (
              <>
                <span>·</span>
                <span>~{item.estimatedMinutes} min read</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-1 pt-2">
            {item.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm">
        <span className={step !== 'read' ? 'text-green-600' : ''}>
          {step !== 'read' ? '✓ Read' : '○ Read'}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className={step === 'verdict' ? 'text-green-600' : ''}>
          {step === 'verdict' ? '✓ Takeaway' : '○ Takeaway'}
        </span>
        <span className="text-muted-foreground">→</span>
        <span>○ Verdict</span>
      </div>

      {/* Step Content */}
      {step === 'read' && (
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <h3 className="font-semibold">STEP 1 OF 3: READ</h3>
            <p className="text-muted-foreground">
              Read the article at the source.
              <br />
              Take your time. Come back when you're done.
            </p>
            {sourceUrl && (
              <Button asChild variant="outline">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Article
                </a>
              </Button>
            )}
            <div className="pt-4">
              <Button onClick={handleMarkRead} disabled={isSubmitting}>
                <Check className="mr-2 h-4 w-4" />
                I've read this
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'takeaway' && (
        <Card>
          <CardContent className="py-8 space-y-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">What will you remember from this?</h3>
            </div>

            <Textarea
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              placeholder="What's the one thing you'd tell someone about this?"
              className="min-h-[120px] resize-none"
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {takeaway.length < 20
                  ? `${20 - takeaway.length} more characters needed`
                  : takeaway.length <= 300
                    ? 'Perfect length ✓'
                    : `${takeaway.length} characters`}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">💡 Need inspiration?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• What surprised you?</li>
                <li>• What's the one thing you'd tell someone?</li>
                <li>• What will you do differently now?</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmitTakeaway}
              disabled={takeaway.trim().length < 20 || isSubmitting}
              className="w-full"
            >
              Continue →
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'verdict' && (
        <div className="space-y-6">
          {/* User's takeaway */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">YOUR TAKEAWAY</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="italic text-muted-foreground border-l-2 pl-4">
                "{takeaway || item.takeaway}"
              </blockquote>
            </CardContent>
          </Card>

          {/* AI Takeaways (placeholder for now) */}
          {item.aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI TAKEAWAYS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.aiSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Verdict buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">STEP 3 OF 3: VERDICT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 hover:bg-green-50 hover:border-green-500"
                  onClick={() => handleVerdict('keep')}
                  disabled={isSubmitting}
                >
                  <span className="text-lg mb-1">✓</span>
                  <span className="font-semibold">Keep</span>
                  <span className="text-xs text-muted-foreground">Worth retaining</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 hover:bg-yellow-50 hover:border-yellow-500"
                  onClick={() => handleVerdict('revisit')}
                  disabled={isSubmitting}
                >
                  <span className="text-lg mb-1">↻</span>
                  <span className="font-semibold">Revisit</span>
                  <span className="text-xs text-muted-foreground">Try again later</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col h-auto py-4 hover:bg-red-50 hover:border-red-500"
                  onClick={() => handleVerdict('discard')}
                  disabled={isSubmitting}
                >
                  <span className="text-lg mb-1">✗</span>
                  <span className="font-semibold">Discard</span>
                  <span className="text-xs text-muted-foreground">Not useful</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Run and verify**

```bash
npm run dev
```
Expected: Review flow works through all 3 steps

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add complete review flow with read, takeaway, and verdict steps"
```

---

## Phase 7: Backlog Page

### Task 7.1: Backlog Page

**Files:**
- Create: `src/app/backlog/page.tsx`

**Step 1: Create backlog page**

Create `src/app/backlog/page.tsx`:
```tsx
import { getBacklogItems } from '@/lib/data/items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function BacklogPage() {
  const items = await getBacklogItems()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Backlog</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-semibold mb-2">Your backlog is empty</h3>
            <p className="text-muted-foreground mb-4">
              Items you Keep will appear here.
              <br />
              This becomes your personal knowledge base.
            </p>
            <Link href="/" className="text-primary hover:underline">
              → Go to Queue
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Backlog</h1>

      <Input placeholder="🔍 Search your knowledge..." className="max-w-md" />

      <p className="text-sm text-muted-foreground">{items.length} items kept</p>

      <div className="space-y-3">
        {items.map((item) => {
          const sourceData = JSON.parse(item.sourceData)
          const domain = sourceData.url
            ? new URL(sourceData.url).hostname.replace('www.', '')
            : 'Manual'

          return (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Kept {item.verdictAt?.toLocaleDateString()} · {domain}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.takeaway && (
                  <blockquote className="text-sm italic text-muted-foreground border-l-2 pl-3">
                    "{item.takeaway}"
                  </blockquote>
                )}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add backlog page with kept items"
```

---

## Phase 8: Sources & Manual Input

### Task 8.1: Sources Page Structure

**Files:**
- Create: `src/app/sources/page.tsx`
- Create: `src/lib/data/sources.ts`

**Step 1: Create sources data access**

Create `src/lib/data/sources.ts`:
```typescript
import { db } from '@/lib/db'
import type { Source, FetchStats } from '@/types'

export async function getAllSources(): Promise<Source[]> {
  return db.source.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSourceById(id: string): Promise<Source | null> {
  return db.source.findUnique({ where: { id } })
}

export async function createSource(data: {
  type: string
  url: string
  name: string
  interval?: string
  maxPerFetch?: number
  coldStartWindow?: string
  topicFilter?: string
  topicFilterEnabled?: boolean
  autoTags?: string[]
}): Promise<Source> {
  const { autoTags, ...rest } = data
  return db.source.create({
    data: {
      ...rest,
      autoTags: JSON.stringify(autoTags ?? []),
    },
  })
}

export async function updateSource(
  id: string,
  data: Partial<{
    name: string
    interval: string
    maxPerFetch: number
    topicFilter: string
    topicFilterEnabled: boolean
    autoTags: string[]
    enabled: boolean
  }>
): Promise<Source> {
  const { autoTags, ...rest } = data
  return db.source.update({
    where: { id },
    data: {
      ...rest,
      ...(autoTags !== undefined && { autoTags: JSON.stringify(autoTags) }),
    },
  })
}

export async function deleteSource(id: string): Promise<void> {
  await db.source.delete({ where: { id } })
}
```

**Step 2: Create sources page**

Create `src/app/sources/page.tsx`:
```tsx
import { Suspense } from 'react'
import { getAllSources } from '@/lib/data/sources'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rss, Plus, Globe, Youtube } from 'lucide-react'
import Link from 'next/link'

async function SourcesList() {
  const sources = await getAllSources()

  if (sources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="font-semibold mb-2">No sources configured</h3>
          <p className="text-muted-foreground mb-4">
            Add blogs or YouTube channels to automatically
            <br />
            populate your queue with new content.
          </p>
          <Button asChild>
            <Link href="/sources/add">
              <Plus className="mr-2 h-4 w-4" />
              Add your first source
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/sources/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Link>
        </Button>
      </div>

      {sources.map((source) => {
        const autoTags = JSON.parse(source.autoTags) as string[]
        const Icon = source.type === 'youtube' ? Youtube : Globe

        return (
          <Card key={source.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{source.name}</CardTitle>
                </div>
                <Badge variant={source.enabled ? 'default' : 'secondary'}>
                  {source.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{source.url}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {source.interval} · Max {source.maxPerFetch} per fetch
                {source.topicFilterEnabled && source.topicFilter && (
                  <> · Filter: "{source.topicFilter}"</>
                )}
              </div>
              {autoTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {autoTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {source.lastFetchedAt
                  ? `Last fetch: ${new Date(source.lastFetchedAt).toLocaleString()} · ${source.lastFetchStatus}`
                  : 'Never fetched'}
              </div>
              <div className="text-xs text-muted-foreground">
                📊 {source.itemsQueuedTotal} queued · {source.itemsFilteredTotal} filtered
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function SourcesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Sources & Input</h1>

      <Tabs defaultValue="sources">
        <TabsList className="mb-4">
          <TabsTrigger value="sources">
            <Rss className="mr-2 h-4 w-4" />
            Auto Sources
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="mr-2 h-4 w-4" />
            Add Manually
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Suspense fallback={<div>Loading sources...</div>}>
            <SourcesList />
          </Suspense>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardContent className="py-6">
              <p className="text-muted-foreground text-center">
                Manual add form coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add sources page with list view"
```

---

### Task 8.2: Add Item Form

**Files:**
- Create: `src/app/sources/add-item-form.tsx`
- Create: `src/app/actions/add-item.ts`

**Step 1: Create add item server action**

Create `src/app/actions/add-item.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createItem } from '@/lib/data/items'
import type { LinkSource, TextSource } from '@/types'

export async function addLinkItem(formData: FormData) {
  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const tags = (formData.get('tags') as string).split(',').filter(Boolean).map(t => t.trim())
  const userNote = formData.get('userNote') as string | null

  const sourceData: LinkSource = {
    type: 'link',
    url,
  }

  await createItem({
    sourceType: 'link',
    sourceData,
    title: title || url,
    tags,
    userNote: userNote || undefined,
  })

  revalidatePath('/')
  revalidatePath('/sources')
}

export async function addTextItem(formData: FormData) {
  const content = formData.get('content') as string
  const title = formData.get('title') as string
  const attribution = formData.get('attribution') as string | null
  const tags = (formData.get('tags') as string).split(',').filter(Boolean).map(t => t.trim())

  const sourceData: TextSource = {
    type: 'text',
    content,
    attribution: attribution || undefined,
  }

  await createItem({
    sourceType: 'text',
    sourceData,
    title,
    tags,
  })

  revalidatePath('/')
  revalidatePath('/sources')
}
```

**Step 2: Create add item form component**

Create `src/app/sources/add-item-form.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link2, FileText } from 'lucide-react'
import { addLinkItem, addTextItem } from '@/app/actions/add-item'

export function AddItemForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLinkSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await addLinkItem(formData)
    router.push('/')
  }

  const handleTextSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await addTextItem(formData)
    router.push('/')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ADD TO QUEUE</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link">
          <TabsList className="mb-4">
            <TabsTrigger value="link">
              <Link2 className="mr-2 h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="mr-2 h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <form action={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  name="url"
                  type="url"
                  placeholder="https://example.com/article"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title (optional)</label>
                <Input
                  name="title"
                  placeholder="Will be auto-detected if empty"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  name="tags"
                  placeholder="AI, Prompting"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Note (optional)</label>
                <Input
                  name="userNote"
                  placeholder="Why did you save this?"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                Add to Queue
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="text">
            <form action={handleTextSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  placeholder="What is this about?"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  name="content"
                  placeholder="Paste or write the content here..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Attribution (optional)</label>
                <Input
                  name="attribution"
                  placeholder="Where did this come from?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  name="tags"
                  placeholder="AI, Prompting"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                Add to Queue
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Update sources page to include form**

Update `src/app/sources/page.tsx` TabsContent for manual:
```tsx
<TabsContent value="manual">
  <AddItemForm />
</TabsContent>
```

And add import:
```tsx
import { AddItemForm } from './add-item-form'
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add manual item input form"
```

---

## Phase 9: Settings Page

### Task 9.1: Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`

**Step 1: Create settings page**

Create `src/app/settings/page.tsx`:
```tsx
import { getAllTags } from '@/lib/data/tags'
import { getUserStats } from '@/lib/data/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const [tags, stats] = await Promise.all([getAllTags(), getUserStats()])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">STATS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current streak:</span>
              <span className="ml-2 font-semibold">{stats.currentStreak} days</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longest streak:</span>
              <span className="ml-2 font-semibold">{stats.longestStreak} days</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total kept:</span>
              <span className="ml-2 font-semibold">{stats.totalKept}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total discarded:</span>
              <span className="ml-2 font-semibold">{stats.totalDiscarded}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TAGS</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">DATA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Button variant="outline" className="w-full justify-start">
              Export Data
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Download all items, takeaways, and verdicts
            </p>
          </div>
          <div>
            <Button variant="destructive" className="w-full justify-start">
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently delete everything
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add settings page with stats and tags"
```

---

## Phase 10: AI Integration

### Task 10.1: AI Summary Generation

**Files:**
- Create: `src/lib/ai/summary.ts`

**Step 1: Create summary generation**

Create `src/lib/ai/summary.ts`:
```typescript
import { generateText } from '@/lib/ai'

export async function generateItemSummary(
  title: string,
  content: string
): Promise<string> {
  const systemPrompt = `You are a concise summarizer. Generate 3-5 bullet points summarizing the key insights from the content. Each bullet should be one sentence. Focus on:
- Main argument or thesis
- Key supporting points
- Practical implications
- Anything surprising or novel

Use tentative language ("The author suggests..." not "This is true...").
Do not include a title or introduction, just the bullets.`

  const userPrompt = `Title: ${title}

Content:
${content.slice(0, 8000)}` // Limit content length

  return generateText(systemPrompt, userPrompt, 500)
}

export async function generateFollowUpQuestions(
  title: string,
  content: string,
  userTakeaway: string
): Promise<string[]> {
  const systemPrompt = `Generate 2-3 follow-up questions that would help someone deepen their understanding of this content. Consider:
- Clarifying questions about concepts
- Practical application questions
- Critical analysis questions
- Questions that connect to related topics

The user has already written their takeaway, so don't ask about what they already mentioned.

Return ONLY the questions, one per line, no numbering or bullets.`

  const userPrompt = `Title: ${title}

Content summary:
${content.slice(0, 4000)}

User's takeaway:
${userTakeaway}`

  const response = await generateText(systemPrompt, userPrompt, 300)
  return response.split('\n').filter((q) => q.trim().length > 0).slice(0, 3)
}

export async function answerFollowUpQuestion(
  title: string,
  content: string,
  question: string
): Promise<string> {
  const systemPrompt = `Answer the question based on the content provided. Keep your answer to 3-5 sentences. Be helpful and informative while acknowledging any limitations in the source material.`

  const userPrompt = `Content title: ${title}

Content:
${content.slice(0, 6000)}

Question: ${question}`

  return generateText(systemPrompt, userPrompt, 300)
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add AI summary and follow-up question generation"
```

---

### Task 10.2: Topic Filter for Sources

**Files:**
- Create: `src/lib/ai/topic-filter.ts`

**Step 1: Create topic filter**

Create `src/lib/ai/topic-filter.ts`:
```typescript
import { generateText } from '@/lib/ai'

export interface FilterResult {
  matching: Array<{ title: string; url: string; relevant: boolean }>
  notMatching: Array<{ title: string; url: string; relevant: boolean }>
}

export async function filterByTopic(
  items: Array<{ title: string; url: string; description?: string }>,
  topicFilter: string
): Promise<FilterResult> {
  if (items.length === 0) {
    return { matching: [], notMatching: [] }
  }

  const systemPrompt = `You are a topic relevance classifier. For each item, determine if it matches the user's topic filter.

Topic filter: "${topicFilter}"

For each item, respond with either "YES" or "NO" on a separate line, in the same order as the items provided.`

  const itemsList = items
    .map((item, i) => `${i + 1}. ${item.title}${item.description ? ` - ${item.description}` : ''}`)
    .join('\n')

  const response = await generateText(systemPrompt, itemsList, 200)
  const results = response.split('\n').map((line) => line.trim().toUpperCase())

  const matching: FilterResult['matching'] = []
  const notMatching: FilterResult['notMatching'] = []

  items.forEach((item, i) => {
    const isRelevant = results[i]?.includes('YES') ?? false
    const result = { ...item, relevant: isRelevant }
    if (isRelevant) {
      matching.push(result)
    } else {
      notMatching.push(result)
    }
  })

  return { matching, notMatching }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add AI-based topic filtering for sources"
```

---

## Phase 11: Final Polish

### Task 11.1: Run All Tests

**Step 1: Run complete test suite**

```bash
npm run test:run
```
Expected: All tests pass

**Step 2: Fix any failing tests**

If tests fail, debug and fix.

**Step 3: Commit if changes made**

```bash
git add .
git commit -m "fix: resolve test failures"
```

---

### Task 11.2: Type Check

**Step 1: Run TypeScript compiler**

```bash
npx tsc --noEmit
```
Expected: No type errors

**Step 2: Fix any type errors**

If errors exist, fix them.

**Step 3: Commit if changes made**

```bash
git add .
git commit -m "fix: resolve type errors"
```

---

### Task 11.3: Build Verification

**Step 1: Run production build**

```bash
npm run build
```
Expected: Build succeeds

**Step 2: Test production build locally**

```bash
npm run start
```
Expected: App runs correctly

**Step 3: Commit if changes made**

```bash
git add .
git commit -m "fix: resolve build issues"
```

---

## Summary

This implementation plan covers:

1. **Phase 1**: Project setup with Next.js 14, Prisma/Turso, shadcn/ui, and Claude API
2. **Phase 2**: Data layer with complete schema and seed data
3. **Phase 3**: Core domain logic (queue algorithms, streak tracking)
4. **Phase 4**: Server actions for data operations
5. **Phase 5**: UI components (layout, queue cards, filters)
6. **Phase 6**: Complete review flow (Read → Takeaway → Verdict)
7. **Phase 7**: Backlog page
8. **Phase 8**: Sources page and manual input
9. **Phase 9**: Settings page
10. **Phase 10**: AI integration (summaries, follow-ups, topic filtering)
11. **Phase 11**: Final verification

**Not included in V1** (per design doc):
- Browser extension
- Source auto-fetching scheduler (infrastructure dependent)
- Try archetype (V2)
- Knowledge map

---

*End of Implementation Plan*
