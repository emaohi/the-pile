import { Item } from '@prisma/client'
import { differenceInDays } from 'date-fns'

interface PriorityFactors {
  age: number           // 0-1: older = higher
  topicDiversity: number // 0-1: avoid same topic repeatedly
  sourceAffinity: number // 0-1: sources user engages with
  estimatedTime: number  // 0-1: match available time
  revisitPenalty: number // 0-1: revisited items score lower
}

const WEIGHTS = {
  age: 0.40,
  topicDiversity: 0.20,
  sourceAffinity: 0.15,
  estimatedTime: 0.10,
  revisitPenalty: 0.15,
}

/**
 * Age score: logarithmic growth
 * 1 day = 0.15, 7 days = 0.50, 30 days = 0.85, 90+ days = 1.0
 */
function ageScore(savedAt: Date): number {
  const daysOld = differenceInDays(new Date(), savedAt)
  return Math.min(1, Math.log10(daysOld + 1) / 2)
}

/**
 * Revisit penalty: each revisit reduces priority
 */
function revisitScore(revisitCount: number): number {
  return Math.max(0, 1 - (revisitCount * 0.2))
}

/**
 * Calculate priority score for an item
 */
export function calculatePriority(
  item: Item,
  recentTags: string[] = [],
  sourceEngagement: Record<string, number> = {}
): number {
  const itemTags = JSON.parse(item.tags || '[]') as string[]

  const factors: PriorityFactors = {
    age: ageScore(item.savedAt),
    topicDiversity: recentTags.length === 0 ? 1 :
      itemTags.some(t => recentTags.includes(t)) ? 0.3 : 1,
    sourceAffinity: item.sourceId
      ? (sourceEngagement[item.sourceId] || 0.5)
      : 0.5,
    estimatedTime: 1, // TODO: implement time preference matching
    revisitPenalty: revisitScore(item.revisitCount),
  }

  return Object.entries(WEIGHTS).reduce(
    (score, [key, weight]) => score + factors[key as keyof PriorityFactors] * weight,
    0
  )
}

/**
 * Recalculate priority scores for all queued items
 */
import { PrismaClient } from '@prisma/client'

export async function recalculatePriorities(prisma: PrismaClient): Promise<void> {
  const items = await prisma.item.findMany({
    where: { status: 'queued' },
  })

  // Get recent verdicts for topic diversity
  const recentVerdicts = await prisma.item.findMany({
    where: {
      verdictAt: {
        not: null,
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    select: { tags: true },
  })

  const recentTags = recentVerdicts.flatMap(
    (v: { tags: string }) => JSON.parse(v.tags || '[]')
  )

  // TODO: Calculate source engagement from past verdicts

  for (const item of items) {
    const score = calculatePriority(item, recentTags)
    await prisma.item.update({
      where: { id: item.id },
      data: { priorityScore: score },
    })
  }
}