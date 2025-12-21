import { describe, it, expect } from 'vitest'
import { calculatePriority } from './priority'
import { Item } from '@prisma/client'

describe('calculatePriority', () => {
  const baseItem: Item = {
    id: '1',
    sourceType: 'link',
    url: 'https://example.com',
    content: null,
    fileId: null,
    fileName: null,
    title: 'Test Item',
    description: null,
    estimatedMinutes: 5,
    tags: '[]',
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
  }

  it('should prioritize older items', () => {
    const now = new Date()
    const oldDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    const newItem = { ...baseItem, savedAt: now }
    const oldItem = { ...baseItem, savedAt: oldDate }

    const newScore = calculatePriority(newItem)
    const oldScore = calculatePriority(oldItem)

    expect(oldScore).toBeGreaterThan(newScore)
  })

  it('should penalize revisited items', () => {
    const freshItem = { ...baseItem, revisitCount: 0 }
    const revisitedItem = { ...baseItem, revisitCount: 2 }

    const freshScore = calculatePriority(freshItem)
    const revisitedScore = calculatePriority(revisitedItem)

    expect(freshScore).toBeGreaterThan(revisitedScore)
  })

  it('should penalize items with recently viewed tags', () => {
    const itemWithTag = { ...baseItem, tags: JSON.stringify(['ai']) }
    
    const scoreWithDiversity = calculatePriority(itemWithTag, [])
    const scoreWithoutDiversity = calculatePriority(itemWithTag, ['ai'])

    expect(scoreWithDiversity).toBeGreaterThan(scoreWithoutDiversity)
  })

  it('should boost items from preferred sources', () => {
    const itemWithSource = { ...baseItem, sourceId: 'source-1' }
    
    const scoreHighAffinity = calculatePriority(itemWithSource, [], { 'source-1': 0.9 })
    const scoreLowAffinity = calculatePriority(itemWithSource, [], { 'source-1': 0.1 })

    expect(scoreHighAffinity).toBeGreaterThan(scoreLowAffinity)
  })
})