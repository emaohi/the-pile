import { describe, it, expect } from 'vitest'
import { getMultiQueueItems } from '../index'
import type { ItemWithRelations } from '@/types'
import type { Tag } from '@prisma/client'

const createTag = (name: string): { tag: Tag } => ({
  tag: { id: name, name },
})

const createMockItem = (
  id: string,
  savedAt: Date,
  estimatedMinutes: number,
  tagNames: string[] = []
): ItemWithRelations => ({
  id,
  sourceType: 'link',
  sourceData: '{}',
  title: `Item ${id}`,
  description: null,
  estimatedMinutes,
  sourceId: null,
  savedAt,
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
  tags: tagNames.map(createTag),
  followUps: [],
  source: null,
})

describe('getMultiQueueItems', () => {
  it('returns null for all queues when empty', () => {
    const result = getMultiQueueItems([], [])
    expect(result.oldest).toBeNull()
    expect(result.mixUp).toBeNull()
    expect(result.quick).toBeNull()
    expect(result.totalQueued).toBe(0)
  })

  it('deduplicates across queues - each item appears only once', () => {
    // This item is oldest AND quickest AND most diverse
    const superItem = createMockItem(
      'super',
      new Date('2024-01-01'),
      2,
      ['Rare']
    )
    const normalItem = createMockItem(
      'normal',
      new Date('2024-06-01'),
      15,
      ['AI']
    )

    const result = getMultiQueueItems([superItem, normalItem], ['AI'])

    // Super item wins oldest (first priority)
    expect(result.oldest?.item.id).toBe('super')
    // Normal item gets mixUp (excluded from quick)
    expect(result.mixUp?.item.id).toBe('normal')
    // Quick is null - no items left after deduplication
    expect(result.quick).toBeNull()
  })

  it('fills three different items when possible', () => {
    const oldest = createMockItem('oldest', new Date('2024-01-01'), 30, ['AI'])
    const diverse = createMockItem('diverse', new Date('2024-06-01'), 20, ['DevOps'])
    const quick = createMockItem('quick', new Date('2024-12-01'), 5, ['AI'])

    const result = getMultiQueueItems([oldest, diverse, quick], ['AI'])

    expect(result.oldest?.item.id).toBe('oldest')
    expect(result.mixUp?.item.id).toBe('diverse') // Zero AI overlap
    expect(result.quick?.item.id).toBe('quick')
  })
})
