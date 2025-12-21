import type { ItemWithRelations } from '@/types'

export function getOldestItem(items: ItemWithRelations[]): ItemWithRelations | null {
  const queued = items.filter((item) => item.status === 'queued')

  if (queued.length === 0) return null

  return queued.reduce((oldest, current) => {
    return current.savedAt < oldest.savedAt ? current : oldest
  })
}