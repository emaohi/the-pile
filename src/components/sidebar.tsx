'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, ListTodo, Archive, Rss, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/backlog', label: 'Backlog', icon: Archive },
  { href: '/sources', label: 'Sources & Input', icon: Rss },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === '/login') {
    return null
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-8 pb-10">
        <Link href="/" className="block group">
          <h1 className="text-2xl font-serif tracking-tight text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
            thePile
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-1 font-medium">
            Learning System
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li
                key={item.href}
                style={{ animationDelay: `${index * 75}ms` }}
                className="animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-backwards"
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all duration-300 group relative overflow-hidden',
                    isActive
                      ? 'text-primary-foreground bg-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-300',
                      !isActive && 'group-hover:scale-110 group-hover:rotate-3'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={cn("tracking-wide font-medium", isActive ? "font-semibold" : "")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer decoration */}
      <div className="p-8">
        <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent mb-6" />
        <div className="flex justify-center gap-4 text-muted-foreground/50">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/70 mt-4 text-center font-medium">
          Read · Reflect · Retain
        </p>
      </div>
    </aside>
  )
}
