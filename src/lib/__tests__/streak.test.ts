import { describe, it, expect } from 'vitest'
import { updateStreak } from '../streak'

describe('updateStreak', () => {
  it('starts a new streak on first verdict', () => {
    const result = updateStreak(
      { current: 0, longest: 0, lastVerdictDate: null },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(1)
    expect(result.longest).toBe(1)
  })

  it('maintains streak for same day verdict', () => {
    const result = updateStreak(
      { current: 5, longest: 10, lastVerdictDate: new Date('2024-12-15T10:00:00') },
      new Date('2024-12-15T18:00:00')
    )
    expect(result.current).toBe(5) // No change
    expect(result.longest).toBe(10)
  })

  it('increments streak for consecutive day', () => {
    const result = updateStreak(
      { current: 5, longest: 10, lastVerdictDate: new Date('2024-12-14') },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(6)
    expect(result.longest).toBe(10) // Doesn't beat record
  })

  it('updates longest when current exceeds it', () => {
    const result = updateStreak(
      { current: 10, longest: 10, lastVerdictDate: new Date('2024-12-14') },
      new Date('2024-12-15')
    )
    expect(result.current).toBe(11)
    expect(result.longest).toBe(11)
  })

  it('resets streak after gap', () => {
    const result = updateStreak(
      { current: 10, longest: 15, lastVerdictDate: new Date('2024-12-10') },
      new Date('2024-12-15') // 5 days later
    )
    expect(result.current).toBe(1)
    expect(result.longest).toBe(15) // Preserved
  })
})
