import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { QueueItem } from '@/types'
import { Clock, Calendar, ArrowRight, FileText, Youtube, Link as LinkIcon, Rss, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const queueIcons: Record<string, string> = {
  oldest: '🕰️',
  mixUp: '🎲',
  quick: '⚡',
}

const queueLabels: Record<string, string> = {
  oldest: 'OLDEST',
  mixUp: 'MIX IT UP',
  quick: 'QUICK WIN',
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
}

export function QueueCard({ queueItem, className }: QueueCardProps) {
  const { type, item, reason } = queueItem
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sourceData = JSON.parse((item as any).sourceData || '{}')
  const domain = sourceData.url
    ? new URL(sourceData.url).hostname.replace('www.', '')
    : 'Manual'

  let SourceIcon = LinkIcon
  if (item.source?.type === 'youtube') SourceIcon = Youtube
  else if (item.source?.type === 'blog') SourceIcon = Rss
  else if (item.sourceType === 'text') SourceIcon = AlignLeft
  else if (item.sourceType === 'document') SourceIcon = FileText

  return (
    <Card className={cn(
      "h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-border bg-white dark:bg-card group",
      className
    )}>
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <span className="text-lg">{queueIcons[type]}</span>
          <span>{queueLabels[type]}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 px-6 pb-6">
        <h3 className="font-serif text-xl font-medium leading-snug line-clamp-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 text-foreground/80">
            <SourceIcon className="h-3 w-3" />
            {domain}
          </span>
          {item.estimatedMinutes && (
            <>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.estimatedMinutes} min
              </span>
            </>
          )}
          <span className="text-border">•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatTimeAgo(item.savedAt)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/50 hover:bg-secondary">
              {tag.name}
            </Badge>
          ))}
        </div>

        {reason && type !== 'oldest' && (
          <div className="mt-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground italic border border-border/30">
            "{reason}"
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button asChild className="w-full group/btn" size="lg">
            <Link href={`/review/${item.id}`}>
              Start Review
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}