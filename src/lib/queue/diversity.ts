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