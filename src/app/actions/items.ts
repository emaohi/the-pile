'use server'

import { revalidatePath } from 'next/cache'
import {
  getItemById,
  createItem,
  markItemRead,
  saveTakeaway,
  recordVerdict,
  deleteItem,
} from '@/lib/data/items'
import { recordVerdictStats } from '@/lib/data/stats'
import type { ItemSourceData, Verdict, ItemWithRelations } from '@/types'

export async function fetchItem(id: string): Promise<ItemWithRelations | null> {
  return getItemById(id)
}

export async function addItem(data: {
  sourceType: string
  sourceData: ItemSourceData
  title: string
  description?: string
  estimatedMinutes?: number
  tags: string[]
  userNote?: string
}): Promise<ItemWithRelations> {
  const item = await createItem(data)
  revalidatePath('/')
  return item
}

export async function markRead(id: string): Promise<void> {
  await markItemRead(id)
  revalidatePath(`/review/${id}`)
}

export async function submitTakeaway(id: string, takeaway: string): Promise<void> {
  await saveTakeaway(id, takeaway)
  revalidatePath(`/review/${id}`)
}

export async function submitVerdict(
  id: string,
  verdict: Verdict
): Promise<ItemWithRelations> {
  const [item] = await Promise.all([
    recordVerdict(id, verdict),
    recordVerdictStats(verdict),
  ])

  revalidatePath('/')
  revalidatePath('/backlog')
  return item
}

export async function discardItem(id: string): Promise<void> {
  await recordVerdict(id, 'discard')
  await recordVerdictStats('discard')
  revalidatePath('/')
}

export async function removeItem(id: string): Promise<void> {
  await deleteItem(id)
  revalidatePath('/')
}
