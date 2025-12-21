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