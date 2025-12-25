import { describe, it, expect } from 'vitest'
import { getQuickItem } from '../quick'
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

describe('getQuickItem', () => {
  it('returns null for empty array', () => {
    expect(getQuickItem([])).toBeNull()
  })

  it('returns the shortest item by estimatedMinutes', () => {
    const shortest = createMockItem({ id: 'short', estimatedMinutes: 4 })
    const medium = createMockItem({ id: 'medium', estimatedMinutes: 15 })
    const longest = createMockItem({ id: 'long', estimatedMinutes: 30 })

    const result = getQuickItem([longest, shortest, medium])
    expect(result?.id).toBe('short')
  })

  it('excludes specified item IDs', () => {
    const shortest = createMockItem({ id: 'short', estimatedMinutes: 4 })
    const medium = createMockItem({ id: 'medium', estimatedMinutes: 15 })

    const result = getQuickItem([shortest, medium], ['short'])
    expect(result?.id).toBe('medium')
  })

  it('treats null estimatedMinutes as infinity', () => {
    const withTime = createMockItem({ id: 'timed', estimatedMinutes: 30 })
    const noTime = createMockItem({ id: 'no-time', estimatedMinutes: null })

    const result = getQuickItem([noTime, withTime])
    expect(result?.id).toBe('timed')
  })
})
