export interface Streak {
  current: number
  longest: number
  lastVerdictDate: Date | null
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function differenceInDays(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1)
  const d2 = startOfDay(date2)
  const diffMs = d1.getTime() - d2.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

export function updateStreak(streak: Streak, verdictDate: Date): Streak {
  const today = startOfDay(verdictDate)
  const lastDate = streak.lastVerdictDate
    ? startOfDay(streak.lastVerdictDate)
    : null

  if (!lastDate) {
    // First verdict ever
    return { current: 1, longest: 1, lastVerdictDate: verdictDate }
  }

  const daysDiff = differenceInDays(today, lastDate)

  if (daysDiff === 0) {
    // Same day
    return { ...streak, lastVerdictDate: verdictDate }
  }

  if (daysDiff === 1) {
    // Consecutive day
    const newCurrent = streak.current + 1
    return {
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastVerdictDate: verdictDate,
    }
  }

  // Streak broken
  return {
    current: 1,
    longest: streak.longest,
    lastVerdictDate: verdictDate,
  }
}