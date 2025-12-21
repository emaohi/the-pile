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