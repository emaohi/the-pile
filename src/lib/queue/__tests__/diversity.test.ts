import { describe, it, expect } from 'vitest'
import { getMixUpItem, countTagOverlap } from '../diversity'
import type { ItemWithRelations } from '@/types'
import type { Tag } from '@prisma/client'

const createTag = (name: string): { tag: Tag } => ({
  tag: { id: name, name },
})

const createMockItem = (
  id: string,
  tagNames: string[]
): ItemWithRelations => ({
  id,
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
  tags: tagNames.map(createTag),
  followUps: [],
  source: null,
})

describe('countTagOverlap', () => {
  it('returns 0 for no overlap', () => {
    const itemTags = ['AI', 'ML']
    const recentTags = ['DevOps', 'Security']
    expect(countTagOverlap(itemTags, recentTags)).toBe(0)
  })

  it('counts overlapping tags', () => {
    const itemTags = ['AI', 'ML', 'Prompting']
    const recentTags = ['AI', 'Prompting', 'RAG']
    expect(countTagOverlap(itemTags, recentTags)).toBe(2)
  })
})

describe('getMixUpItem', () => {
  it('returns null for empty array', () => {
    expect(getMixUpItem([], [])).toBeNull()
  })

  it('returns item with least tag overlap', () => {
    const aiItem = createMockItem('ai-item', ['AI', 'ML'])
    const devOpsItem = createMockItem('devops-item', ['DevOps', 'K8s'])
    const mixedItem = createMockItem('mixed', ['AI', 'DevOps'])

    const recentTags = ['AI', 'ML', 'Prompting'] // Recent focus on AI

    const result = getMixUpItem([aiItem, devOpsItem, mixedItem], recentTags)
    expect(result?.id).toBe('devops-item') // Zero overlap with recent
  })

  it('excludes specified item IDs', () => {
    const devOpsItem = createMockItem('devops-item', ['DevOps'])
    const aiItem = createMockItem('ai-item', ['AI'])

    const result = getMixUpItem([devOpsItem, aiItem], ['AI'], ['devops-item'])
    expect(result?.id).toBe('ai-item')
  })
})
