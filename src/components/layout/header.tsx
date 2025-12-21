import Link from 'next/link'
import { getUserStats } from '@/lib/data/stats'

export async function Header() {
  const stats = await getUserStats()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          thePile
        </Link>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-sm text-orange-500">
            <span>🔥</span>
            <span>{stats.currentStreak} day streak</span>
          </div>
        )}
      </div>
    </header>
  )
}