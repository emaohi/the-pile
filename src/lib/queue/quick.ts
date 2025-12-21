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