import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { QueueItem } from '@/types'
import { Clock, Calendar, ArrowRight, FileText, Video, Link as LinkIcon, Rss, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const queueConfig: Record<string, { icon: string; label: string; stackColor: string }> = {
  oldest: { icon: '🕰️', label: 'OLDEST', stackColor: 'bg-amber-100/80' },
  mixUp: { icon: '🎲', label: 'MIX IT UP', stackColor: 'bg-emerald-100/80' },
  quick: { icon: '⚡', label: 'QUICK WIN', stackColor: 'bg-violet-100/80' },
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

interface QueueCardProps {
  queueItem: QueueItem
  className?: string
  queueDepth?: number // Number of items in this queue (for stack visualization)
}

function getDomain(url: string | undefined): string {
  if (!url) return 'Manual'
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'Link'
  }
}

function isYouTubeUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname.includes('youtube.com') || hostname.includes('youtu.be')
  } catch {
    return false
  }
}

function parseSourceData(data: string | null | undefined): { url?: string } {
  try {
    return JSON.parse(data || '{}')
  } catch {
    return {}
  }
}

export function QueueCard({ queueItem, className, queueDepth = 3 }: QueueCardProps) {
  const { type, item, reason } = queueItem
  const sourceData = parseSourceData(item.sourceData)
  const domain = getDomain(sourceData.url)
  const config = queueConfig[type] || queueConfig.oldest
  const isYouTube = item.source?.type === 'youtube' || isYouTubeUrl(sourceData.url)

  let SourceIcon = LinkIcon
  if (isYouTube) SourceIcon = Video
  else if (item.source?.type === 'blog') SourceIcon = Rss
  else if (item.sourceType === 'text') SourceIcon = AlignLeft
  else if (item.sourceType === 'document') SourceIcon = FileText

  // Show max 3 stack cards behind
  const stackCount = Math.min(queueDepth - 1, 2)

  return (
    <div className={cn("relative group", className)}>
      {/* Stack cards behind - the "queue" effect */}
      {stackCount >= 2 && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 border-stone-300/60 transition-all duration-500",
            config.stackColor,
            "translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4"
          )}
          aria-hidden="true"
        />
      )}
      {stackCount >= 1 && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 border-stone-300/80 transition-all duration-500",
            config.stackColor,
            "translate-x-1.5 translate-y-1.5 group-hover:translate-x-2 group-hover:translate-y-2"
          )}
          aria-hidden="true"
        />
      )}

      {/* Main card */}
      <div className={cn(
        "relative h-full flex flex-col rounded-2xl transition-all duration-300",
        "bg-[#FAF8F5] border-[3px] border-stone-400/70",
        "shadow-[4px_4px_0_0_rgba(120,113,108,0.25)]",
        "group-hover:shadow-[6px_6px_0_0_rgba(120,113,108,0.3)]",
        "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
      )}>
        {/* Header with queue type */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{config.icon}</span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 uppercase">
              {config.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4 px-6 pb-6">
          {/* Title */}
          <h3 className="font-serif text-xl font-medium leading-snug line-clamp-3 text-stone-800 group-hover:text-primary transition-colors min-h-[3.75rem]">
            {item.title}
          </h3>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5 text-stone-600">
              <SourceIcon className="h-3.5 w-3.5" />
              {domain}
            </span>
            {item.estimatedMinutes && (
              <>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.estimatedMinutes} min
                </span>
              </>
            )}
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatTimeAgo(item.savedAt)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px] px-2.5 py-0.5 bg-stone-200/70 text-stone-600 border border-stone-300/50 hover:bg-stone-200"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Reason callout for non-oldest queues */}
          {reason && type !== 'oldest' && (
            <div className="mt-1 px-3 py-2 rounded-lg bg-stone-100 text-xs text-stone-500 italic border border-stone-200/80">
              "{reason}"
            </div>
          )}

          {/* Action button - pushed to bottom */}
          <div className="mt-auto pt-4">
            <Link
              href={`/review/${item.id}`}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl",
                "bg-primary text-primary-foreground font-semibold text-sm",
                "border-2 border-primary-foreground/10",
                "shadow-[3px_3px_0_0_rgba(120,113,108,0.4)]",
                "transition-all duration-200",
                "hover:shadow-[1px_1px_0_0_rgba(120,113,108,0.4)]",
                "hover:translate-x-0.5 hover:translate-y-0.5",
                "active:shadow-none active:translate-x-1 active:translate-y-1"
              )}
            >
              Start Review
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
