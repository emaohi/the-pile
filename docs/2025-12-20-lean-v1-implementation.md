# thePile — Lean V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build thePile Lean V1 — a personal learning system that enforces cognitive closure through forced Verdicts, age-weighted priority, and the core loop: Queue → Read → Takeaway → Verdict.

**Architecture:** Next.js 14 App Router with Server Actions. SQLite via Turso for deployment. Prisma ORM. Claude API for AI features. Single-user with password auth.

**Tech Stack:** Next.js 14, TypeScript, Prisma, Turso (SQLite), Claude API, Tailwind CSS, shadcn/ui

**Design Doc:** See `thepile-lean-v1-design-doc.md` for full context.

---

## Development Conventions

### Branching Strategy
- **Never commit directly to master** - all work happens on feature branches
- Create one branch per phase: `feature/phase-N-<description>`
- Merge to master via PR when phase is complete and verified

### Key Design Principles (from design doc)
1. **Saving ≠ Learning** - Only items with Verdict count as processed
2. **The App Decides What's Next** - User chooses when, not what
3. **Older Items Rise** - Age is weighted heavily in prioritization
4. **Forced Closure** - Every item must get a Verdict: Keep, Revisit, or Discard
5. **Think First, AI Second** - User writes takeaway before seeing AI insights

---

## Phase 0: Landing Page (Pre-Launch Validation)

### Task 0.1: Create Landing Page Project

**Files:**
- Create: Project scaffolding via create-next-app (minimal)

**Step 1: Create minimal Next.js app for landing page**

```bash
mkdir ~/Personal/thepile-landing
cd ~/Personal/thepile-landing
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

**Step 2: Install minimal dependencies**

```bash
npm install lucide-react
npx shadcn@latest init -d
npx shadcn@latest add button input card
```

**Step 3: Commit**

```bash
git init
git add .
git commit -m "chore: initialize landing page project"
```

---

### Task 0.2: Build Landing Page UI

**Files:**
- Replace: `src/app/page.tsx`
- Replace: `src/app/layout.tsx`
- Create: `src/app/api/waitlist/route.ts`

**Step 1: Update layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'thePile — Your read-later app is a graveyard. This isn\'t.',
  description: 'A personal learning system that transforms passive content consumption into intentional, engaged learning.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Step 2: Create landing page**

Replace `src/app/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, Brain } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Your read-later app is a graveyard.
          <br />
          <span className="text-gray-500">This isn't.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          thePile is a personal learning system that transforms passive content consumption
          into intentional, engaged learning.
        </p>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">The Problem</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-3">📥</div>
              <h3 className="font-semibold mb-2">False Accomplishment</h3>
              <p className="text-gray-600 text-sm">
                Saving feels productive. It isn't. Your inbox grows. The guilt compounds.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-3">🕐</div>
              <h3 className="font-semibold mb-2">Recency Bias</h3>
              <p className="text-gray-600 text-sm">
                You always read the newest thing. Older content gets buried and forgotten forever.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-3">😵</div>
              <h3 className="font-semibold mb-2">Analysis Paralysis</h3>
              <p className="text-gray-600 text-sm">
                Too many items, no clear priority. "What should I read?" becomes a blocker.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Solution */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How thePile Fixes This</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">The app decides what's next</h3>
              <p className="text-gray-600 text-sm">No more decision fatigue. You choose when to engage, not what.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
            <Clock className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Older items rise to the top</h3>
              <p className="text-gray-600 text-sm">Age is weighted heavily. Items from weeks ago surface before today's saves.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
            <Brain className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Every item needs a verdict</h3>
              <p className="text-gray-600 text-sm">Keep, Revisit, or Discard. No limbo states. No infinite backlog.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-md mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Early Access</h2>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg">
            You're on the list! We'll email you when thePile is ready.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-500 text-sm mt-2">Something went wrong. Try again.</p>
        )}

        <p className="text-gray-400 text-sm mt-4">No spam. Just a heads up when we launch.</p>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        thePile — Turn passive reading into active learning
      </footer>
    </main>
  )
}
```

**Step 3: Create waitlist API route**

Create `src/app/api/waitlist/route.ts`:

```typescript
import { NextResponse } from 'next/server'

// For MVP: store in a simple JSON file or use a service like:
// - Buttondown
// - ConvertKit
// - Simple Google Sheet via API
// For now, just log and return success

export async function POST(request: Request) {
  const { email } = await request.json()

  // TODO: Replace with actual email storage
  // Options:
  // 1. Store in database (add Prisma)
  // 2. Send to email service API (Buttondown, ConvertKit)
  // 3. Append to a file (dev only)

  console.log('Waitlist signup:', email)

  // For production, integrate with an email service:
  // const res = await fetch('https://api.buttondown.email/v1/subscribers', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ email }),
  // })

  return NextResponse.json({ success: true })
}
```

**Step 4: Test landing page**

```bash
npm run dev
```
- Visit localhost:3000 → should see landing page
- Enter email → should show success message
- Check console for logged email

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add landing page with waitlist signup"
```

---

### Task 0.3: Deploy Landing Page

**Step 1: Deploy to Vercel**

```bash
npm install -g vercel
vercel
```

**Step 2: Configure custom domain (optional)**

- Add domain in Vercel dashboard
- Update DNS records

**Step 3: Set up email collection service**

Choose one:
- **Buttondown** (simple, free tier)
- **ConvertKit** (more features)
- **Supabase** (if you want a database anyway)

Update the API route with actual email storage.

**Step 4: Share for feedback**

Post to:
- Hacker News: "Show HN: thePile – A read-later app that forces you to actually learn"
- Reddit: r/productivity, r/PKM
- Twitter/X: Thread about the problem

---

## Phase 1: Foundation

### Task 1.1: Initialize Main Project

**Files:**
- Create: Project scaffolding via create-next-app

**Step 1: Create Next.js app**

```bash
mkdir ~/Personal/the-pile
cd ~/Personal/the-pile
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

**Step 2: Verify setup**

```bash
npm run dev
```
Expected: App runs at localhost:3000

**Step 3: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project"
```

---

### Task 1.2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install core dependencies**

```bash
npm install @prisma/client @libsql/client @anthropic-ai/sdk date-fns
npm install -D prisma
npx shadcn@latest init -d
```

**Step 2: Install shadcn components**

```bash
npx shadcn@latest add button card input label tabs badge dialog dropdown-menu textarea select
npm install lucide-react
```

**Step 3: Commit**

```bash
git add .
git commit -m "chore: add Prisma, Anthropic SDK, and shadcn/ui"
```

---

### Task 1.3: Set Up Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local`
- Create: `src/lib/db.ts`

**Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 2: Create .env.local**

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=""
APP_PASSWORD="changeme"
```

**Step 3: Write schema (aligned with Lean V1 design doc)**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Item {
  id                String   @id @default(cuid())

  // Content source
  sourceType        String   // "link" | "text" | "document"
  url               String?  @unique
  content           String?  // extracted/pasted content
  fileId            String?  // for document type
  fileName          String?

  // Metadata
  title             String
  description       String?
  estimatedMinutes  Int?
  tags              String   @default("[]") // JSON array

  // Origin
  sourceId          String?
  source            Source?  @relation(fields: [sourceId], references: [id], onDelete: SetNull)
  savedAt           DateTime @default(now())
  userNote          String?  // note added at save time

  // AI-generated
  aiSummary         String?  // 3-5 bullet summary

  // State
  status            String   @default("queued") // "queued" | "kept" | "revisit" | "discarded"
  priorityScore     Float    @default(0)

  // Engagement
  readAt            DateTime?
  takeaway          String?  // user's own words
  takeawayAt        DateTime?
  verdict           String?  // "keep" | "revisit" | "discard"
  verdictAt         DateTime?

  // Revisit tracking
  revisitCount      Int      @default(0)
  revisitAfter      DateTime?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  followUps         AIFollowUp[]
}

model Source {
  id                  String   @id @default(cuid())

  // Configuration
  type                String   // "blog" | "youtube"
  url                 String   @unique
  name                String

  // Fetch settings
  interval            String   @default("daily") // "hourly" | "daily" | "weekly"
  maxPerFetch         Int      @default(3)
  coldStartWindow     String   @default("30d") // "7d" | "30d" | "90d" | "all"

  // Topic filtering
  topicFilter         String?  // e.g., "AI, machine learning, LLMs"
  topicFilterEnabled  Boolean  @default(false)

  // Auto-tagging
  autoTags            String   @default("[]") // JSON array

  // State
  fetchedItemIds      String   @default("[]") // JSON array of external IDs
  lastFetchedAt       DateTime?
  lastFetchStatus     String?  // "success" | "error" | "pending"
  lastFetchError      String?

  // Statistics
  itemsFetchedTotal   Int      @default(0)
  itemsQueuedTotal    Int      @default(0)
  itemsFilteredTotal  Int      @default(0)

  enabled             Boolean  @default(true)
  createdAt           DateTime @default(now())

  items               Item[]
}

model UserStats {
  id                String   @id @default("singleton")

  // Streak
  currentStreak     Int      @default(0)
  longestStreak     Int      @default(0)
  lastVerdictDate   DateTime?

  // Counts
  totalKept         Int      @default(0)
  totalDiscarded    Int      @default(0)
  totalRevisited    Int      @default(0)

  // This week
  weekStartDate     DateTime?
  weekKept          Int      @default(0)
  weekDiscarded     Int      @default(0)

  updatedAt         DateTime @updatedAt
}

model AIFollowUp {
  id        String   @id @default(cuid())
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  question  String
  answer    String?
  askedAt   DateTime @default(now())
}
```

**Step 4: Create Prisma client helper**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

export const prisma = new PrismaClient({ adapter })
```

**Step 5: Generate Prisma client and migrate**

```bash
npx prisma migrate dev --name init
```

**Step 6: Verify**

```bash
npx prisma studio
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Prisma schema for Item, Source, UserStats, AIFollowUp"
```

---

### Task 1.4: Password Auth Middleware

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/api/auth/route.ts`
- Create: `src/app/login/page.tsx`

**Step 1: Create middleware**

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/api/auth'
  ) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('auth')

  if (authCookie?.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Step 2: Create auth API**

Create `src/app/api/auth/route.ts`:

```typescript
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password === process.env.APP_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('auth')
  return NextResponse.json({ success: true })
}
```

**Step 3: Create login page**

Create `src/app/login/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">thePile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Test auth**

```bash
npm run dev
```
- Visit localhost:3000 → redirect to /login
- Enter wrong password → error
- Enter correct password → redirect to home

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add password authentication"
```

---

### Task 1.5: App Layout Shell

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/sidebar.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/queue/page.tsx`
- Create: `src/app/backlog/page.tsx`
- Create: `src/app/sources/page.tsx`
- Create: `src/app/settings/page.tsx`

**Step 1: Update layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'thePile',
  description: 'Turn passive reading into active learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

**Step 2: Create sidebar**

Create `src/components/sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, ListTodo, Archive, Rss, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/queue', label: 'Queue', icon: ListTodo },
  { href: '/backlog', label: 'Backlog', icon: Archive },
  { href: '/sources', label: 'Sources & Input', icon: Rss },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === '/login') {
    return null
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h1 className="text-xl font-bold mb-8 px-2">thePile</h1>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Step 3: Create placeholder pages**

Create `src/app/page.tsx` (Home):

```tsx
export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">thePile</h1>
      <p className="text-gray-600">Home screen coming soon.</p>
    </div>
  )
}
```

Create `src/app/queue/page.tsx`:

```tsx
export default function QueuePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Queue</h1>
      <p className="text-gray-600">Your queue will appear here.</p>
    </div>
  )
}
```

Create `src/app/backlog/page.tsx`:

```tsx
export default function BacklogPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backlog</h1>
      <p className="text-gray-600">Items you've kept will appear here.</p>
    </div>
  )
}
```

Create `src/app/sources/page.tsx`:

```tsx
export default function SourcesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sources & Input</h1>
      <p className="text-gray-600">Manage sources and add items manually.</p>
    </div>
  )
}
```

Create `src/app/settings/page.tsx`:

```tsx
export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600">App settings will appear here.</p>
    </div>
  )
}
```

**Step 4: Test navigation**

```bash
npm run dev
```
- Verify sidebar on all pages
- Verify navigation works
- Verify active state

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add app layout with sidebar navigation"
```

---

## Phase 2: Item Management & Priority Algorithm

### Task 2.1: Priority Algorithm

**Files:**
- Create: `src/lib/priority.ts`

**Step 1: Implement priority scoring**

Create `src/lib/priority.ts`:

```typescript
import { Item } from '@prisma/client'
import { differenceInDays } from 'date-fns'

interface PriorityFactors {
  age: number           // 0-1: older = higher
  topicDiversity: number // 0-1: avoid same topic repeatedly
  sourceAffinity: number // 0-1: sources user engages with
  estimatedTime: number  // 0-1: match available time
  revisitPenalty: number // 0-1: revisited items score lower
}

const WEIGHTS = {
  age: 0.40,
  topicDiversity: 0.20,
  sourceAffinity: 0.15,
  estimatedTime: 0.10,
  revisitPenalty: 0.15,
}

/**
 * Age score: logarithmic growth
 * 1 day = 0.15, 7 days = 0.50, 30 days = 0.85, 90+ days = 1.0
 */
function ageScore(savedAt: Date): number {
  const daysOld = differenceInDays(new Date(), savedAt)
  return Math.min(1, Math.log10(daysOld + 1) / 2)
}

/**
 * Revisit penalty: each revisit reduces priority
 */
function revisitScore(revisitCount: number): number {
  return Math.max(0, 1 - (revisitCount * 0.2))
}

/**
 * Calculate priority score for an item
 */
export function calculatePriority(
  item: Item,
  recentTags: string[] = [],
  sourceEngagement: Record<string, number> = {}
): number {
  const itemTags = JSON.parse(item.tags || '[]') as string[]

  const factors: PriorityFactors = {
    age: ageScore(item.savedAt),
    topicDiversity: recentTags.length === 0 ? 1 :
      itemTags.some(t => recentTags.includes(t)) ? 0.3 : 1,
    sourceAffinity: item.sourceId
      ? (sourceEngagement[item.sourceId] || 0.5)
      : 0.5,
    estimatedTime: 1, // TODO: implement time preference matching
    revisitPenalty: revisitScore(item.revisitCount),
  }

  return Object.entries(WEIGHTS).reduce(
    (score, [key, weight]) => score + factors[key as keyof PriorityFactors] * weight,
    0
  )
}

/**
 * Recalculate priority scores for all queued items
 */
export async function recalculatePriorities(prisma: any): Promise<void> {
  const items = await prisma.item.findMany({
    where: { status: 'queued' },
  })

  // Get recent verdicts for topic diversity
  const recentVerdicts = await prisma.item.findMany({
    where: {
      verdictAt: { not: null },
      verdictAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    select: { tags: true },
  })

  const recentTags = recentVerdicts.flatMap(
    (v: { tags: string }) => JSON.parse(v.tags || '[]')
  )

  // TODO: Calculate source engagement from past verdicts

  for (const item of items) {
    const score = calculatePriority(item, recentTags)
    await prisma.item.update({
      where: { id: item.id },
      data: { priorityScore: score },
    })
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add priority algorithm with age-weighted scoring"
```

---

### Task 2.2: Add Item Actions

**Files:**
- Create: `src/app/sources/actions.ts`

**Step 1: Create server actions**

Create `src/app/sources/actions.ts`:

```typescript
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { calculatePriority } from '@/lib/priority'

// ============ ITEM ACTIONS ============

export async function addLinkItem(formData: FormData) {
  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const tags = formData.get('tags') as string
  const userNote = formData.get('note') as string

  // Check for duplicate
  const existing = await prisma.item.findUnique({ where: { url } })
  if (existing) {
    throw new Error('Item already exists')
  }

  const item = await prisma.item.create({
    data: {
      sourceType: 'link',
      url,
      title,
      tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : '[]',
      userNote: userNote || null,
      status: 'queued',
    },
  })

  // Calculate and set priority
  const score = calculatePriority(item)
  await prisma.item.update({
    where: { id: item.id },
    data: { priorityScore: score },
  })

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/sources')

  return item
}

export async function addTextItem(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const attribution = formData.get('attribution') as string
  const tags = formData.get('tags') as string

  const item = await prisma.item.create({
    data: {
      sourceType: 'text',
      title,
      content,
      description: attribution || null,
      tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : '[]',
      status: 'queued',
    },
  })

  const score = calculatePriority(item)
  await prisma.item.update({
    where: { id: item.id },
    data: { priorityScore: score },
  })

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/sources')

  return item
}

export async function dismissItem(id: string) {
  await prisma.item.update({
    where: { id },
    data: {
      status: 'discarded',
      verdict: 'discard',
      verdictAt: new Date(),
    },
  })

  // Update stats
  await updateStats('discard')

  revalidatePath('/')
  revalidatePath('/queue')
}

// ============ SOURCE ACTIONS ============

export async function addSource(formData: FormData) {
  const url = formData.get('url') as string
  const name = formData.get('name') as string
  const interval = formData.get('interval') as string || 'daily'
  const topicFilter = formData.get('topicFilter') as string
  const autoTags = formData.get('autoTags') as string

  const type = url.includes('youtube.com') || url.includes('youtu.be')
    ? 'youtube'
    : 'blog'

  await prisma.source.create({
    data: {
      type,
      url,
      name,
      interval,
      topicFilter: topicFilter || null,
      topicFilterEnabled: !!topicFilter,
      autoTags: autoTags ? JSON.stringify(autoTags.split(',').map(t => t.trim())) : '[]',
    },
  })

  revalidatePath('/sources')
}

export async function deleteSource(id: string) {
  await prisma.source.delete({ where: { id } })
  revalidatePath('/sources')
}

export async function toggleSource(id: string, enabled: boolean) {
  await prisma.source.update({
    where: { id },
    data: { enabled },
  })
  revalidatePath('/sources')
}

export async function getSources() {
  return prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

// ============ STATS HELPERS ============

async function updateStats(verdict: 'keep' | 'discard' | 'revisit') {
  const stats = await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDate = stats.lastVerdictDate
  const lastDateNormalized = lastDate
    ? new Date(lastDate.setHours(0, 0, 0, 0))
    : null

  let newStreak = stats.currentStreak

  if (!lastDateNormalized) {
    newStreak = 1
  } else {
    const diff = Math.floor((today.getTime() - lastDateNormalized.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) {
      // Same day, streak unchanged
    } else if (diff === 1) {
      newStreak = stats.currentStreak + 1
    } else {
      newStreak = 1 // Streak broken
    }
  }

  await prisma.userStats.update({
    where: { id: 'singleton' },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastVerdictDate: new Date(),
      totalKept: verdict === 'keep' ? stats.totalKept + 1 : stats.totalKept,
      totalDiscarded: verdict === 'discard' ? stats.totalDiscarded + 1 : stats.totalDiscarded,
      totalRevisited: verdict === 'revisit' ? stats.totalRevisited + 1 : stats.totalRevisited,
    },
  })
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add item and source server actions"
```

---

### Task 2.3: Sources & Input UI

**Files:**
- Modify: `src/app/sources/page.tsx`
- Create: `src/app/sources/add-link-dialog.tsx`
- Create: `src/app/sources/add-text-dialog.tsx`
- Create: `src/app/sources/add-source-dialog.tsx`
- Create: `src/app/sources/source-list.tsx`

**Step 0: Seed Data (Optional)**

Create `prisma/seed.ts` to populate the database with initial data for testing.

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create sources
  const hn = await prisma.source.create({
    data: {
      type: 'blog',
      url: 'https://news.ycombinator.com',
      name: 'Hacker News',
      interval: 'daily',
      topicFilter: 'AI, LLM, programming',
      topicFilterEnabled: true,
    }
  })

  const simon = await prisma.source.create({
    data: {
      type: 'blog',
      url: 'https://simonwillison.net',
      name: 'Simon Willison',
      interval: 'daily',
      autoTags: '["AI", "LLM"]',
    }
  })

  // Create items
  await prisma.item.create({
    data: {
      sourceType: 'link',
      url: 'https://simonwillison.net/2024/Dec/20/anthropic-artifacts/',
      title: 'Anthropic Artifacts',
      sourceId: simon.id,
      status: 'queued',
      priorityScore: 0.8,
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      estimatedMinutes: 5,
      tags: '["AI", "LLM", "Claude"]',
    }
  })

  await prisma.item.create({
    data: {
      sourceType: 'link',
      url: 'https://news.ycombinator.com/item?id=123456',
      title: 'Show HN: thePile - A read-later app that forces you to learn',
      sourceId: hn.id,
      status: 'queued',
      priorityScore: 0.9,
      savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      estimatedMinutes: 10,
      tags: '["Productivity", "Learning"]',
    }
  })

  await prisma.item.create({
    data: {
      sourceType: 'text',
      title: 'Idea for a new project',
      content: 'Build a tool that helps people learn better by forcing them to make a decision about what they read.',
      status: 'queued',
      priorityScore: 0.5,
      savedAt: new Date(),
      tags: '["Idea", "Project"]',
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

**Step 1: Create Add Link Dialog**

Create `src/app/sources/add-link-dialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Link } from 'lucide-react'
import { addLinkItem } from './actions'

export function AddLinkDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addLinkItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Link className="h-4 w-4 mr-2" />
          Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Article title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="AI, Prompting, Claude"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Why are you saving this?"
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full">
            Add to Queue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Create Add Text Dialog**

Create `src/app/sources/add-text-dialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileText } from 'lucide-react'
import { addTextItem } from './actions'

export function AddTextDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addTextItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Text
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Text</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Give this content a title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Paste your content here..."
              rows={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attribution">Attribution (optional)</Label>
            <Input
              id="attribution"
              name="attribution"
              placeholder="Author or source"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="AI, Prompting, Claude"
            />
          </div>
          <Button type="submit" className="w-full">
            Add to Queue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Create Add Source Dialog**

Create `src/app/sources/add-source-dialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { addSource } from './actions'

export function AddSourceDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addSource(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://simonwillison.net or YouTube channel URL"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Simon Willison's Blog"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval">Check Interval</Label>
            <Select name="interval" defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topicFilter">Topic Filter (optional)</Label>
            <Input
              id="topicFilter"
              name="topicFilter"
              placeholder="AI, LLMs, Claude"
            />
            <p className="text-xs text-gray-500">
              Only queue posts about these topics. Leave blank for all posts.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoTags">Auto-apply Tags</Label>
            <Input
              id="autoTags"
              name="autoTags"
              placeholder="AI"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Source
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 4: Create Source List**

Create `src/app/sources/source-list.tsx`:

```tsx
'use client'

import { Source } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { deleteSource, toggleSource } from './actions'

interface SourceListProps {
  sources: Source[]
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <p className="text-gray-500">
        No sources yet. Add a blog or YouTube channel to auto-fetch content.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {source.type === 'youtube' ? '📺' : '🌐'}
                  </span>
                  <h3 className="font-medium">{source.name}</h3>
                  <Badge variant={source.type === 'youtube' ? 'destructive' : 'secondary'}>
                    {source.type}
                  </Badge>
                  {!source.enabled && (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{source.url}</p>

                <div className="text-sm text-gray-500 mt-2">
                  {source.interval} · Max {source.maxPerFetch} per fetch
                  {source.topicFilterEnabled && (
                    <span> · Filter: {source.topicFilter}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  {source.lastFetchStatus === 'success' ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Last: {source.lastFetchedAt?.toLocaleDateString() ?? 'Never'}
                    </span>
                  ) : source.lastFetchStatus === 'error' ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      {source.lastFetchError}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not fetched yet</span>
                  )}

                  <span className="text-gray-400">
                    {source.itemsQueuedTotal} queued · {source.itemsFilteredTotal} filtered
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSource(source.id, !source.enabled)}
                  title={source.enabled ? 'Disable' : 'Enable'}
                >
                  <RefreshCw className={`h-4 w-4 ${source.enabled ? '' : 'text-gray-400'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSource(source.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 5: Update Sources page**

Replace `src/app/sources/page.tsx`:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSources } from './actions'
import { AddLinkDialog } from './add-link-dialog'
import { AddTextDialog } from './add-text-dialog'
import { AddSourceDialog } from './add-source-dialog'
import { SourceList } from './source-list'

export default async function SourcesPage() {
  const sources = await getSources()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sources & Input</h1>

      <Tabs defaultValue="sources">
        <TabsList className="mb-6">
          <TabsTrigger value="sources">Auto Sources</TabsTrigger>
          <TabsTrigger value="manual">Add Manually</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Auto Sources</h2>
            <AddSourceDialog />
          </div>
          <SourceList sources={sources} />
        </TabsContent>

        <TabsContent value="manual">
          <h2 className="text-lg font-medium mb-4">Add to Queue</h2>
          <div className="flex gap-3 max-w-md">
            <AddLinkDialog />
            <AddTextDialog />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Document upload and bulk CSV import coming soon.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 6: Test**

```bash
npm run dev
```
- Add a link → should work
- Add text → should work
- Add a source → should appear in list

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Sources & Input UI with dialogs"
```

---

## Phase 3: Queue & Home Screens

### Task 3.1: Queue Screen

**Files:**
- Modify: `src/app/queue/page.tsx`
- Create: `src/app/queue/queue-list.tsx`
- Create: `src/app/queue/queue-filters.tsx`

**Step 1: Create Queue List**

Create `src/app/queue/queue-list.tsx`:

```tsx
'use client'

import { Item, Source } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Clock, X } from 'lucide-react'
import Link from 'next/link'
import { dismissItem } from '@/app/sources/actions'
import { formatDistanceToNow } from 'date-fns'

type ItemWithSource = Item & { source: Source | null }

interface QueueListProps {
  items: ItemWithSource[]
  whatsNext: ItemWithSource | null
}

export function QueueList({ items, whatsNext }: QueueListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-medium mb-2">Queue clear!</h2>
        <p className="text-gray-500">You've processed everything. Nice work.</p>
        <div className="mt-6 space-x-3">
          <Link href="/sources">
            <Button variant="outline">Add something new</Button>
          </Link>
        </div>
      </div>
    )
  }

  const upNext = items.filter(i => i.id !== whatsNext?.id)

  return (
    <div className="space-y-6">
      {/* What's Next */}
      {whatsNext && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">WHAT'S NEXT</h2>
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">{whatsNext.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {whatsNext.source?.name || whatsNext.sourceType}
                    {whatsNext.estimatedMinutes && ` · ~${whatsNext.estimatedMinutes} min`}
                    {' · saved '}
                    {formatDistanceToNow(whatsNext.savedAt, { addSuffix: true })}
                  </p>
                  <div className="flex gap-1 mb-3">
                    {(JSON.parse(whatsNext.tags || '[]') as string[]).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Why this: Oldest item matching your filters
                  </p>
                </div>
                <Link href={`/review/${whatsNext.id}`}>
                  <Button>Start Review →</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Up Next */}
      {upNext.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            UP NEXT ({upNext.length} more)
          </h2>
          <div className="space-y-2">
            {upNext.map((item) => (
              <Card key={item.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {item.revisitCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Revisit #{item.revisitCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.source?.name || item.sourceType}
                        {item.estimatedMinutes && ` · ~${item.estimatedMinutes} min`}
                        {' · '}
                        {formatDistanceToNow(item.savedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissItem(item.id)}
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create Queue Filters**

Create `src/app/queue/queue-filters.tsx`:

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
import { Badge } from '@/components/ui/badge'

interface QueueFiltersProps {
  allTags: string[]
  allSources: { id: string; name: string }[]
}

export function QueueFilters({ allTags, allSources }: QueueFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTag = searchParams.get('tag') || 'all'
  const currentSource = searchParams.get('source') || 'all'
  const currentTime = searchParams.get('time') || 'all'

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/queue?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 mb-6">
      <Select value={currentTag} onValueChange={(v) => updateParam('tag', v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {allTags.map(tag => (
            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSource} onValueChange={(v) => updateParam('source', v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          {allSources.map(source => (
            <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentTime} onValueChange={(v) => updateParam('time', v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Times</SelectItem>
          <SelectItem value="short">&lt; 15 min</SelectItem>
          <SelectItem value="medium">15-30 min</SelectItem>
          <SelectItem value="long">&gt; 30 min</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Step 3: Update Queue page**

Replace `src/app/queue/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { QueueList } from './queue-list'
import { QueueFilters } from './queue-filters'

interface PageProps {
  searchParams: Promise<{ tag?: string; source?: string; time?: string }>
}

export default async function QueuePage({ searchParams }: PageProps) {
  const params = await searchParams

  // Build where clause
  const where: Record<string, unknown> = { status: 'queued' }

  // Get all items for filtering
  let items = await prisma.item.findMany({
    where,
    include: { source: true },
    orderBy: { priorityScore: 'desc' },
  })

  // Apply filters (view-only, doesn't modify queue)
  if (params.tag && params.tag !== 'all') {
    items = items.filter(item => {
      const tags = JSON.parse(item.tags || '[]') as string[]
      return tags.includes(params.tag!)
    })
  }

  if (params.source && params.source !== 'all') {
    if (params.source === 'manual') {
      items = items.filter(item => !item.sourceId)
    } else {
      items = items.filter(item => item.sourceId === params.source)
    }
  }

  if (params.time && params.time !== 'all') {
    items = items.filter(item => {
      const mins = item.estimatedMinutes || 15
      if (params.time === 'short') return mins < 15
      if (params.time === 'medium') return mins >= 15 && mins <= 30
      if (params.time === 'long') return mins > 30
      return true
    })
  }

  // Get filter options
  const allItems = await prisma.item.findMany({
    where: { status: 'queued' },
    select: { tags: true },
  })
  const allTags = [...new Set(
    allItems.flatMap(item => JSON.parse(item.tags || '[]') as string[])
  )].sort()

  const allSources = await prisma.source.findMany({
    select: { id: true, name: true },
  })

  const whatsNext = items[0] || null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Queue</h1>
      <QueueFilters allTags={allTags} allSources={allSources} />
      <QueueList items={items} whatsNext={whatsNext} />
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Queue screen with filters and What's Next"
```

---

### Task 3.2: Home Screen

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update Home page**

Replace `src/app/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function HomePage() {
  // Get stats
  const stats = await prisma.userStats.findUnique({
    where: { id: 'singleton' },
  })

  // Get What's Next
  const whatsNext = await prisma.item.findFirst({
    where: { status: 'queued' },
    orderBy: { priorityScore: 'desc' },
    include: { source: true },
  })

  // Get counts
  const queueCount = await prisma.item.count({ where: { status: 'queued' } })
  const backlogCount = await prisma.item.count({ where: { status: 'kept' } })

  // This week stats
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const thisWeekKept = await prisma.item.count({
    where: {
      status: 'kept',
      verdictAt: { gte: weekStart },
    },
  })
  const thisWeekDiscarded = await prisma.item.count({
    where: {
      status: 'discarded',
      verdictAt: { gte: weekStart },
    },
  })

  return (
    <div className="p-8 max-w-3xl">
      {/* Header with streak */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">thePile</h1>
        {stats && stats.currentStreak > 0 && (
          <div className="text-lg">
            🔥 {stats.currentStreak} day streak
          </div>
        )}
      </div>

      {/* What's Next */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-3">WHAT'S NEXT</h2>
        {whatsNext ? (
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-1">{whatsNext.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {whatsNext.source?.name || whatsNext.sourceType}
                {whatsNext.estimatedMinutes && ` · ~${whatsNext.estimatedMinutes} min`}
                {' · saved '}
                {formatDistanceToNow(whatsNext.savedAt, { addSuffix: true })}
              </p>
              <Link href={`/review/${whatsNext.id}`}>
                <Button>Start Review →</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Queue is empty! Add some content to get started.
            </CardContent>
          </Card>
        )}
      </div>

      {/* This Week */}
      <div className="mb-8">
        <p className="text-gray-600">
          This week: {thisWeekKept} kept · {thisWeekDiscarded} discarded
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-6 mb-8">
        <Link href="/queue" className="flex-1">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{queueCount}</div>
              <div className="text-sm text-gray-500">Queue</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/backlog" className="flex-1">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{backlogCount}</div>
              <div className="text-sm text-gray-500">Backlog</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/sources">
          <Button variant="outline">+ Add Item</Button>
        </Link>
        <Link href="/backlog">
          <Button variant="outline">📚 Backlog</Button>
        </Link>
        <Link href="/sources">
          <Button variant="outline">📡 Sources</Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline">⚙️ Settings</Button>
        </Link>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Home screen with streak, What's Next, and stats"
```

---

## Phase 4: Review Flow

### Task 4.1: Review Screen Structure

**Files:**
- Create: `src/app/review/[id]/page.tsx`
- Create: `src/app/review/[id]/review-flow.tsx`
- Create: `src/app/review/actions.ts`

**Step 1: Create review actions**

Create `src/app/review/actions.ts`:

```typescript
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function markAsRead(itemId: string) {
  await prisma.item.update({
    where: { id: itemId },
    data: { readAt: new Date() },
  })
  revalidatePath(`/review/${itemId}`)
}

export async function saveTakeaway(itemId: string, takeaway: string) {
  await prisma.item.update({
    where: { id: itemId },
    data: {
      takeaway,
      takeawayAt: new Date(),
    },
  })
  revalidatePath(`/review/${itemId}`)
}

export async function submitVerdict(
  itemId: string,
  verdict: 'keep' | 'revisit' | 'discard'
) {
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Item not found')

  const now = new Date()

  let status: string
  let revisitAfter: Date | null = null
  let revisitCount = item.revisitCount

  switch (verdict) {
    case 'keep':
      status = 'kept'
      break
    case 'revisit':
      status = 'queued' // Back to queue
      revisitCount = item.revisitCount + 1
      revisitAfter = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      break
    case 'discard':
      status = 'discarded'
      break
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      status,
      verdict,
      verdictAt: now,
      revisitCount,
      revisitAfter,
    },
  })

  // Update user stats
  await updateStats(verdict)

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/backlog')

  redirect('/')
}

async function updateStats(verdict: 'keep' | 'discard' | 'revisit') {
  const stats = await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDate = stats.lastVerdictDate
  const lastDateNormalized = lastDate
    ? new Date(new Date(lastDate).setHours(0, 0, 0, 0))
    : null

  let newStreak = stats.currentStreak

  if (!lastDateNormalized) {
    newStreak = 1
  } else {
    const diff = Math.floor(
      (today.getTime() - lastDateNormalized.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 0) {
      // Same day
    } else if (diff === 1) {
      newStreak = stats.currentStreak + 1
    } else {
      newStreak = 1
    }
  }

  await prisma.userStats.update({
    where: { id: 'singleton' },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastVerdictDate: new Date(),
      totalKept: verdict === 'keep' ? stats.totalKept + 1 : stats.totalKept,
      totalDiscarded: verdict === 'discard' ? stats.totalDiscarded + 1 : stats.totalDiscarded,
      totalRevisited: verdict === 'revisit' ? stats.totalRevisited + 1 : stats.totalRevisited,
    },
  })
}

export async function askFollowUp(itemId: string, question: string) {
  // Create follow-up record
  const followUp = await prisma.aIFollowUp.create({
    data: {
      itemId,
      question,
    },
  })

  // TODO: Generate AI answer
  // For now, just return the created record

  revalidatePath(`/review/${itemId}`)
  return followUp
}
```

**Step 2: Create Review Flow component**

Create `src/app/review/[id]/review-flow.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Item, Source, AIFollowUp } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Check, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { markAsRead, saveTakeaway, submitVerdict } from '../actions'

type ItemWithRelations = Item & {
  source: Source | null
  followUps: AIFollowUp[]
}

interface ReviewFlowProps {
  item: ItemWithRelations
}

type Step = 'read' | 'takeaway' | 'verdict'

export function ReviewFlow({ item }: ReviewFlowProps) {
  const [step, setStep] = useState<Step>(
    item.readAt ? (item.takeaway ? 'verdict' : 'takeaway') : 'read'
  )
  const [takeawayText, setTakeawayText] = useState(item.takeaway || '')
  const [saving, setSaving] = useState(false)

  const tags = JSON.parse(item.tags || '[]') as string[]

  async function handleMarkRead() {
    await markAsRead(item.id)
    setStep('takeaway')
  }

  async function handleSaveTakeaway() {
    if (!takeawayText.trim()) return
    setSaving(true)
    await saveTakeaway(item.id, takeawayText)
    setSaving(false)
    setStep('verdict')
  }

  async function handleVerdict(verdict: 'keep' | 'revisit' | 'discard') {
    await submitVerdict(item.id, verdict)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/queue">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => handleVerdict('discard')}
        >
          Discard
        </Button>
      </div>

      {/* Item Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
        <p className="text-gray-500 mb-2">
          {item.source?.name || item.sourceType}
          {item.estimatedMinutes && ` · ~${item.estimatedMinutes} min read`}
        </p>
        <p className="text-sm text-gray-400 mb-3">
          Saved {formatDistanceToNow(item.savedAt, { addSuffix: true })}
        </p>
        {tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={step === 'read' ? 'font-medium' : 'text-green-600'}>
          {item.readAt ? '✓ Read' : '1. Read'}
        </span>
        <span className="text-gray-300">→</span>
        <span className={
          step === 'takeaway' ? 'font-medium' :
          item.takeaway ? 'text-green-600' : 'text-gray-400'
        }>
          {item.takeaway ? '✓ Takeaway' : '2. Takeaway'}
        </span>
        <span className="text-gray-300">→</span>
        <span className={step === 'verdict' ? 'font-medium' : 'text-gray-400'}>
          3. Verdict
        </span>
      </div>

      {/* Step Content */}
      {step === 'read' && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-6">
              Read the content at the source.
              <br />
              Take your time. Come back when you're done.
            </p>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
              >
                <ExternalLink className="h-5 w-5" />
                Open Article
              </a>
            ) : item.content ? (
              <div className="text-left bg-gray-50 p-4 rounded-lg mb-8 max-h-96 overflow-auto">
                <p className="whitespace-pre-wrap">{item.content}</p>
              </div>
            ) : null}
            <div>
              <Button onClick={handleMarkRead}>
                <Check className="h-4 w-4 mr-2" />
                I've read this
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'takeaway' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">What will you remember from this?</h2>
            <p className="text-gray-500">Just 1-3 sentences. No pressure.</p>
          </div>

          <Textarea
            value={takeawayText}
            onChange={(e) => setTakeawayText(e.target.value)}
            placeholder="The key insight was..."
            rows={4}
            className="text-lg"
          />

          <div className="text-center">
            {takeawayText.length > 20 && takeawayText.length < 300 && (
              <p className="text-sm text-green-600 mb-4">Perfect length ✓</p>
            )}
            <Button
              onClick={handleSaveTakeaway}
              disabled={takeawayText.length < 20 || saving}
            >
              {saving ? 'Saving...' : 'Continue →'}
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 font-medium mb-2">💡 Need inspiration?</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• What surprised you?</li>
              <li>• What's the one thing you'd tell someone?</li>
              <li>• What will you do differently now?</li>
            </ul>
          </div>
        </div>
      )}

      {step === 'verdict' && (
        <div className="space-y-6">
          {/* Show user's takeaway */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">YOUR TAKEAWAY</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p>"{item.takeaway || takeawayText}"</p>
            </div>
          </div>

          {/* AI Takeaways placeholder */}
          {item.aiSummary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">AI TAKEAWAYS</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{item.aiSummary}</p>
              </div>
            </div>
          )}

          {/* Verdict buttons */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">VERDICT</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => handleVerdict('keep')}
              >
                <span className="text-2xl">✓</span>
                <span className="font-medium">Keep</span>
                <span className="text-xs text-gray-500">Worth retaining</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300"
                onClick={() => handleVerdict('revisit')}
              >
                <span className="text-2xl">↻</span>
                <span className="font-medium">Revisit</span>
                <span className="text-xs text-gray-500">Try again later</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleVerdict('discard')}
              >
                <span className="text-2xl">✗</span>
                <span className="font-medium">Discard</span>
                <span className="text-xs text-gray-500">Not useful</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create Review page**

Create `src/app/review/[id]/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ReviewFlow } from './review-flow'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      source: true,
      followUps: true,
    },
  })

  if (!item) {
    notFound()
  }

  return <ReviewFlow item={item} />
}
```

**Step 4: Test review flow**

```bash
npm run dev
```
- Add an item
- Go to queue → click "Start Review"
- Mark as read → write takeaway → select verdict
- Verify streak updates

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Review flow with Read → Takeaway → Verdict"
```

---

## Phase 5: Backlog & Remaining Features

### Task 5.1: Backlog Screen

**Files:**
- Modify: `src/app/backlog/page.tsx`

**Step 1: Update Backlog page**

Replace `src/app/backlog/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

export default async function BacklogPage({ searchParams }: PageProps) {
  const params = await searchParams

  let items = await prisma.item.findMany({
    where: { status: 'kept' },
    include: { source: true },
    orderBy: { verdictAt: 'desc' },
  })

  // Search filter
  if (params.q) {
    const q = params.q.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.takeaway?.toLowerCase().includes(q)
    )
  }

  // Tag filter
  if (params.tag) {
    items = items.filter(item => {
      const tags = JSON.parse(item.tags || '[]') as string[]
      return tags.includes(params.tag!)
    })
  }

  // Get all tags for filtering
  const allTags = [...new Set(
    items.flatMap(item => JSON.parse(item.tags || '[]') as string[])
  )].sort()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Backlog</h1>

      {/* Search */}
      <form className="mb-6">
        <Input
          name="q"
          placeholder="Search your knowledge..."
          defaultValue={params.q}
          className="max-w-md"
        />
      </form>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/backlog">
            <Badge variant={!params.tag ? 'default' : 'outline'}>All</Badge>
          </Link>
          {allTags.map(tag => (
            <Link key={tag} href={`/backlog?tag=${tag}`}>
              <Badge variant={params.tag === tag ? 'default' : 'outline'}>
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your backlog is empty</p>
          <p className="text-sm text-gray-400">
            Items you Keep will appear here.
            <br />
            This becomes your personal knowledge base.
          </p>
          <Link href="/queue" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Queue →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{items.length} items kept</p>
          {items.map(item => {
            const tags = JSON.parse(item.tags || '[]') as string[]
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Kept {formatDistanceToNow(item.verdictAt!, { addSuffix: true })}
                    {' · '}
                    {item.source?.name || item.sourceType}
                  </p>
                  {item.takeaway && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-2">
                      "{item.takeaway}"
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex gap-1">
                      {tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Backlog screen with search and tag filtering"
```

---

### Task 5.2: Settings Screen

**Files:**
- Modify: `src/app/settings/page.tsx`

**Step 1: Update Settings page**

Replace `src/app/settings/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
  const stats = await prisma.userStats.findUnique({
    where: { id: 'singleton' },
  })

  const itemCounts = await prisma.item.groupBy({
    by: ['status'],
    _count: true,
  })

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Current streak: {stats?.currentStreak || 0} days</p>
          <p>Longest streak: {stats?.longestStreak || 0} days</p>
          <p>Total kept: {stats?.totalKept || 0}</p>
          <p>Total discarded: {stats?.totalDiscarded || 0}</p>
          <p>Total revisited: {stats?.totalRevisited || 0}</p>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline">Export Data</Button>
            <p className="text-sm text-gray-500 mt-1">
              Download all items, takeaways, and verdicts
            </p>
          </div>
          <div>
            <Button variant="outline" className="text-red-500 hover:text-red-600">
              Clear All Data
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              Permanently delete everything
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/auth" method="DELETE">
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Settings screen with stats and data export"
```

---

## Phase 6: AI Integration

### Task 6.1: AI Summary Generation

**Files:**
- Create: `src/lib/ai.ts`
- Modify: `src/app/sources/actions.ts`

**Step 1: Create AI helper**

Create `src/lib/ai.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateSummary(
  content: string,
  title: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Summarize this content in 3-5 bullet points. Focus on key insights and takeaways.

Title: ${title}

Content (first 4000 chars):
${content.slice(0, 4000)}

Return ONLY the bullet points, no intro text.`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateTags(
  content: string,
  title: string
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 128,
    messages: [{
      role: 'user',
      content: `Suggest 2-5 topic tags for this content. Return ONLY a JSON array of lowercase tags.

Title: ${title}
Content: ${content.slice(0, 2000)}

Example: ["ai", "prompting", "tutorial"]`,
    }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    return JSON.parse(text)
  } catch {
    return []
  }
}

export async function generateFollowUpQuestions(
  content: string,
  title: string,
  userTakeaway: string
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Based on this content and the user's takeaway, suggest 2-3 follow-up questions to deepen understanding.

Title: ${title}
Content summary: ${content.slice(0, 2000)}
User's takeaway: ${userTakeaway}

Return ONLY a JSON array of question strings.`,
    }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    return JSON.parse(text)
  } catch {
    return []
  }
}

export async function answerFollowUp(
  content: string,
  question: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Answer this question based on the content. Be concise (3-5 sentences).

Content: ${content.slice(0, 4000)}

Question: ${question}`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function checkTopicRelevance(
  content: string,
  title: string,
  topicFilter: string
): Promise<boolean> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 32,
    messages: [{
      role: 'user',
      content: `Is this content about any of these topics: ${topicFilter}?

Title: ${title}
Content: ${content.slice(0, 1000)}

Reply with only "yes" or "no".`,
    }],
  })

  const answer = response.content[0].type === 'text'
    ? response.content[0].text.toLowerCase().trim()
    : 'no'
  return answer.includes('yes')
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add AI integration for summaries, tags, and follow-ups"
```

---

## Summary

**Lean V1 Implementation Complete! thePile includes:**

1. **Landing Page** - Waitlist signup for demand validation
2. **Authentication** - Password-protected access
3. **Core Data Model** - Item, Source, UserStats, AIFollowUp
4. **Priority Algorithm** - Age-weighted scoring (older items rise)
5. **Sources & Input** - Add links, text, manage auto-fetch sources
6. **Queue Screen** - What's Next, filters (tag, source, time)
7. **Home Screen** - Streak, stats, quick actions
8. **Review Flow** - Read → Takeaway → AI → Verdict
9. **Verdict System** - Keep (→ Backlog), Revisit (→ re-queue), Discard (→ gone)
10. **Backlog Screen** - Search and browse kept items
11. **Settings** - Stats, data export
12. **AI Integration** - Summaries, tags, follow-up Q&A

**Design Philosophy Enforced:**
- Saving ≠ Learning (Verdict required)
- The App Decides What's Next (priority algorithm)
- Older Items Rise (age-weighted)
- Forced Closure (no limbo states)
- Think First, AI Second (takeaway before AI insights)

**Next Steps (Post-V1):**
- Source auto-fetching (blog RSS + AI agent, YouTube API)
- Browser extension for quick-add
- Mobile share sheet
- Spaced resurfacing of kept items

---

*End of Lean V1 Implementation Plan*
