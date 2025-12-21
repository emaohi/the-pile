'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
// import { calculatePriority } from '@/lib/priority'

// ============ ITEM ACTIONS ============

export async function addLinkItem(formData: FormData) {
  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const tags = formData.get('tags') as string
  const userNote = formData.get('note') as string

  // Check for duplicate
  // Note: url is not unique in the schema anymore, so we might need to adjust this check
  // For now, we'll skip the unique check or implement it differently if needed
  // const existing = await prisma.item.findUnique({ where: { url } })
  // if (existing) {
  //   throw new Error('Item already exists')
  // }

  const item = await prisma.item.create({
    data: {
      sourceType: 'link',
      sourceData: JSON.stringify({ type: 'link', url }),
      title,
      // tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : '[]',
      userNote: userNote || null,
      status: 'queued',
    },
  })

  // Calculate and set priority
  // const score = calculatePriority(item)
  // await prisma.item.update({
  //   where: { id: item.id },
  //   data: { priorityScore: score },
  // })

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/sources')

  return item
}

export async function addTextItem(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const attribution = formData.get('attribution') as string
  const tags = formData.get('tags') as string

  const item = await prisma.item.create({
    data: {
      sourceType: 'text',
      sourceData: JSON.stringify({ type: 'text', content, attribution }),
      title,
      description: attribution || null,
      // tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : '[]',
      status: 'queued',
    },
  })

  // const score = calculatePriority(item)
  // await prisma.item.update({
  //   where: { id: item.id },
  //   data: { priorityScore: score },
  // })

  revalidatePath('/')
  revalidatePath('/queue')
  revalidatePath('/sources')

  return item
}

export async function dismissItem(id: string) {
  await prisma.item.update({
    where: { id },
    data: {
      status: 'discarded',
      verdict: 'discard',
      verdictAt: new Date(),
    },
  })

  // Update stats
  await updateStats('discard')

  revalidatePath('/')
  revalidatePath('/queue')
}

// ============ SOURCE ACTIONS ============

export async function addSource(formData: FormData) {
  const url = formData.get('url') as string
  const name = formData.get('name') as string
  const interval = formData.get('interval') as string || 'daily'
  const topicFilter = formData.get('topicFilter') as string
  const autoTags = formData.get('autoTags') as string

  const type = url.includes('youtube.com') || url.includes('youtu.be')
    ? 'youtube'
    : 'blog'

  await prisma.source.create({
    data: {
      type,
      url,
      name,
      interval,
      topicFilter: topicFilter || null,
      topicFilterEnabled: !!topicFilter,
      autoTags: autoTags ? JSON.stringify(autoTags.split(',').map(t => t.trim())) : '[]',
    },
  })

  revalidatePath('/sources')
}

export async function deleteSource(id: string) {
  await prisma.source.delete({ where: { id } })
  revalidatePath('/sources')
}

export async function toggleSource(id: string, enabled: boolean) {
  await prisma.source.update({
    where: { id },
    data: { enabled },
  })
  revalidatePath('/sources')
}

export async function getSources() {
  return prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

// ============ STATS HELPERS ============

async function updateStats(verdict: 'keep' | 'discard' | 'revisit') {
  const stats = await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastDate = stats.lastVerdictDate
  const lastDateNormalized = lastDate
    ? new Date(lastDate.setHours(0, 0, 0, 0))
    : null

  let newStreak = stats.currentStreak

  if (!lastDateNormalized) {
    newStreak = 1
  } else {
    const diff = Math.floor((today.getTime() - lastDateNormalized.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) {
      // Same day, streak unchanged
    } else if (diff === 1) {
      newStreak = stats.currentStreak + 1
    } else {
      newStreak = 1 // Streak broken
    }
  }

  await prisma.userStats.update({
    where: { id: 'singleton' },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastVerdictDate: new Date(),
      totalKept: verdict === 'keep' ? stats.totalKept + 1 : stats.totalKept,
      totalDiscarded: verdict === 'discard' ? stats.totalDiscarded + 1 : stats.totalDiscarded,
      totalRevisited: verdict === 'revisit' ? stats.totalRevisited + 1 : stats.totalRevisited,
    },
  })
}