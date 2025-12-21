import { db } from '@/lib/db'
import { updateStreak, type Streak } from '@/lib/streak'
import type { UserStats, Verdict } from '@/types'

export async function getUserStats(): Promise<UserStats> {
  let stats = await db.userStats.findUnique({
    where: { id: 'singleton' },
  })

  if (!stats) {
    stats = await db.userStats.create({
      data: { id: 'singleton' },
    })
  }

  return stats
}

export async function recordVerdictStats(verdict: Verdict): Promise<UserStats> {
  const stats = await getUserStats()
  const now = new Date()

  // Update streak
  const currentStreak: Streak = {
    current: stats.currentStreak,
    longest: stats.longestStreak,
    lastVerdictDate: stats.lastVerdictDate,
  }
  const newStreak = updateStreak(currentStreak, now)

  // Prepare update data
  const updateData: Record<string, unknown> = {
    currentStreak: newStreak.current,
    longestStreak: newStreak.longest,
    lastVerdictDate: newStreak.lastVerdictDate,
  }

  // Update counts
  switch (verdict) {
    case 'keep':
      updateData.totalKept = stats.totalKept + 1
      updateData.weeklyKept = stats.weeklyKept + 1
      break
    case 'discard':
      updateData.totalDiscarded = stats.totalDiscarded + 1
      updateData.weeklyDiscarded = stats.weeklyDiscarded + 1
      break
    case 'revisit':
      updateData.totalRevisited = stats.totalRevisited + 1
      break
  }

  return db.userStats.update({
    where: { id: 'singleton' },
    data: updateData,
  })
}