import { Suspense } from 'react'
import { fetchMultiQueue, fetchFilteredQueue } from '@/app/actions/queue'
import { getAllTags } from '@/lib/data/tags'
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

        <div className="grid gap-6 md:grid-cols-3 items-stretch relative">
          {/* Vertical dividers for desktop */}
          <div className="hidden md:block absolute top-4 bottom-4 left-1/3 w-px bg-border/50" />
          <div className="hidden md:block absolute top-4 bottom-4 right-1/3 w-px bg-border/50" />
          
          {queue.oldest && (
            <div className="relative">
              <QueueCard queueItem={queue.oldest} className="border-none shadow-none bg-transparent hover:shadow-none hover:-translate-y-0" />
            </div>
          )}
          {queue.mixUp && (
            <div className="relative">
              <QueueCard queueItem={queue.mixUp} className="border-none shadow-none bg-transparent hover:shadow-none hover:-translate-y-0" />
            </div>
          )}
          {queue.quick && (
            <div className="relative">
              <QueueCard queueItem={queue.quick} className="border-none shadow-none bg-transparent hover:shadow-none hover:-translate-y-0" />
            </div>
          )}
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
