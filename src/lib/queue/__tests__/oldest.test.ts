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
