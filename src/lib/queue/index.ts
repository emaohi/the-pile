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