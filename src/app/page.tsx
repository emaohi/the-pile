import { Suspense } from 'react'
import { fetchMultiQueue, fetchFilteredQueue } from '@/app/actions/queue'
import { getAllTags } from '@/lib/data/tags'
import { QueueCard } from '@/components/queue/queue-card'
import { TagFilter } from '@/components/queue/tag-filter'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50" />
          <div className="relative bg-card rounded-3xl border-2 border-border p-12 text-center shadow-xl">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="font-serif text-2xl font-medium mb-3">Queue clear!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You've processed everything in your pile. Time to discover something new.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/sources">
                <Sparkles className="w-4 h-4" />
                Add something new
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between pb-2 border-b border-border/50">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Your Learning Queue
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">
            What's Next
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TagFilter tags={tags} />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">{queue.totalQueued} waiting</span>
          </div>
        </div>
      </div>

      {/* Queue Cards with Vertical Dividers */}
      {(() => {
        const queues = [
          { key: 'oldest', data: queue.oldest, delay: '0ms' },
          { key: 'mixUp', data: queue.mixUp, delay: '100ms' },
          { key: 'quick', data: queue.quick, delay: '200ms' },
        ].filter(q => q.data)

        return (
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 py-6">
            {queues.map((q, idx) => (
              <div key={q.key} className="flex-1 flex md:flex-row">
                {idx > 0 && (
                  <div className="hidden md:block w-px mx-6 bg-gradient-to-b from-transparent via-stone-300 to-transparent self-stretch" />
                )}
                <div
                  className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: q.delay }}
                >
                  <QueueCard queueItem={q.data!} queueDepth={queue.totalQueued} className="h-full" />
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Decorative Footer */}
      <div className="flex items-center justify-center gap-3 pt-4 text-xs text-muted-foreground">
        <span className="w-8 h-px bg-border" />
        <span className="uppercase tracking-widest">Pick one and dive in</span>
        <span className="w-8 h-px bg-border" />
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
      <div className="space-y-8">
        <div className="flex items-end justify-between pb-2 border-b border-border/50">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
              Filtered by tag
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium">
              {tag}
            </h1>
          </div>
          <TagFilter tags={tags} currentFilter={tag} />
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-card rounded-2xl border-2 border-dashed border-border p-8 text-center max-w-md">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground">
              No items found with the tag <span className="font-semibold text-foreground">{tag}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between pb-2 border-b border-border/50">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Filtered by tag
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">
            {tag}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TagFilter tags={tags} currentFilter={tag} />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <span className="text-sm font-medium">{result.filteredCount} of {result.total}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
        {/* Main Card */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <QueueCard
              queueItem={{
                type: 'oldest',
                item: result.current,
                reason: `Oldest item tagged ${tag}`,
              }}
            />
          </div>
        </div>

        {/* Upcoming Sidebar */}
        {result.upcoming.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: '150ms' }}>
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Up next ({result.upcoming.length} more)
            </h3>
            <div className="space-y-3">
              {result.upcoming.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-300"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <p className="font-medium text-sm line-clamp-2 mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.estimatedMinutes
                      ? `${item.estimatedMinutes} min read`
                      : 'Time unknown'}
                  </p>
                </div>
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
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-6 md:px-8 py-8 md:py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        }>
          {tag ? <FilteredQueueView tag={tag} /> : <MultiQueueView />}
        </Suspense>
      </div>
    </div>
  )
}
