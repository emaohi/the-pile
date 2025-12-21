import { db } from '@/lib/db'
import type { ItemWithRelations, ItemSourceData, Verdict } from '@/types'

export async function getQueuedItems(): Promise<ItemWithRelations[]> {
  const items = await db.item.findMany({
    where: {
      status: 'queued',
      OR: [
        { revisitAfter: null },
        { revisitAfter: { lte: new Date() } },
      ],
    },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    } as any,
    orderBy: { savedAt: 'asc' },
  })
  return items as unknown as ItemWithRelations[]
}

export async function getBacklogItems(): Promise<ItemWithRelations[]> {
  const items = await db.item.findMany({
    where: { status: 'kept' },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    } as any,
    orderBy: { verdictAt: 'desc' },
  })
  return items as unknown as ItemWithRelations[]
}

export async function getItemById(id: string): Promise<ItemWithRelations | null> {
  const item = await db.item.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    } as any,
  })
  return item as unknown as ItemWithRelations | null
}

export async function getRecentVerdictTags(limit = 3): Promise<string[]> {
  const recentItems = await db.item.findMany({
    where: { verdict: { not: null } },
    orderBy: { verdictAt: 'desc' },
    take: limit,
    include: { tags: { include: { tag: true } } } as any,
  })

  return recentItems.flatMap((item) => item.tags.map((t) => t.tag.name))
}

export async function createItem(data: {
  sourceType: string
  sourceData: ItemSourceData
  title: string
  description?: string
  estimatedMinutes?: number
  tags: string[]
  userNote?: string
  aiSummary?: string
  sourceId?: string
}): Promise<ItemWithRelations> {
  const { tags, sourceData, ...rest } = data

  const item = await db.item.create({
    data: {
      ...rest,
      sourceData: JSON.stringify(sourceData),
      tags: {
        create: tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    } as any,
  })
  return item as unknown as ItemWithRelations
}

export async function markItemRead(id: string): Promise<void> {
  await db.item.update({
    where: { id },
    data: { readAt: new Date() },
  })
}

export async function saveTakeaway(id: string, takeaway: string): Promise<void> {
  await db.item.update({
    where: { id },
    data: {
      takeaway,
      takeawayAt: new Date(),
    },
  })
}

export async function recordVerdict(
  id: string,
  verdict: Verdict
): Promise<ItemWithRelations> {
  const statusMap: Record<Verdict, string> = {
    keep: 'kept',
    revisit: 'revisit',
    discard: 'discarded',
  }

  const item = await db.item.findUnique({ where: { id } })
  if (!item) throw new Error('Item not found')

  const updateData: Record<string, unknown> = {
    verdict,
    verdictAt: new Date(),
    status: statusMap[verdict],
  }

  if (verdict === 'revisit') {
    updateData.revisitCount = item.revisitCount + 1
    updateData.revisitAfter = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  const updatedItem = await db.item.update({
    where: { id },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
      followUps: true,
      source: true,
    } as any,
  })
  return updatedItem as unknown as ItemWithRelations
}

export async function deleteItem(id: string): Promise<void> {
  await db.item.delete({ where: { id } })
}