'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, ListTodo, Archive, Rss, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/queue', label: 'Queue', icon: ListTodo },
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
    <aside className="w-60 bg-[#FAF9F7] border-r border-[#E8E4DF] flex flex-col">
      {/* Brand */}
      <div className="p-6 pb-8">
        <Link href="/" className="block">
          <h1
            className="text-xl tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
          >
            thePile
          </h1>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#B5B0A9] mt-0.5">
            Learning System
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li
                key={item.href}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-[#5C5752] hover:bg-[#EFEBE6] hover:text-[#1A1A1A]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )}
                    strokeWidth={1.5}
                  />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer decoration */}
      <div className="p-6 pt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent" />
        <p className="text-[9px] tracking-[0.1em] uppercase text-[#C5C0B9] mt-4 text-center">
          Read · Reflect · Retain
        </p>
      </div>
    </aside>
  )
}
