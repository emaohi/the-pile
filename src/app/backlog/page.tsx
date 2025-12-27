import { Suspense } from 'react'
import { getBacklogItems } from '@/lib/data/items'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, BookOpen, ExternalLink, Sparkles } from 'lucide-react'
import { parseSourceData, getDomain, formatDate } from '@/lib/utils'

async function BacklogContent() {
  const items = await getBacklogItems()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 blur-3xl opacity-60" />
          <div className="relative bg-card rounded-3xl border-2 border-border p-12 text-center shadow-xl max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-6">
              <BookOpen className="w-9 h-9 text-amber-600" />
            </div>
            <h3 className="font-serif text-2xl font-medium mb-3">Your shelf awaits</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Items you decide to <span className="font-medium text-foreground">Keep</span> will build your personal knowledge library here.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Sparkles className="w-4 h-4" />
                Start reviewing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Your Knowledge Library
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">
            Backlog
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              placeholder="Search coming soon..."
              disabled
              className="pl-10 w-64 bg-secondary/50 border-border/50 cursor-not-allowed opacity-60"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium">{items.length} kept</span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const sourceData = parseSourceData(item.sourceData)
          const domain = getDomain(sourceData.url)

          return (
            <div
              key={item.id}
              className="group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <div className="relative h-full flex flex-col rounded-2xl transition-all duration-300 bg-[#FAF8F5] border-[3px] border-stone-400/70 shadow-[4px_4px_0_0_rgba(120,113,108,0.25)] group-hover:shadow-[6px_6px_0_0_rgba(120,113,108,0.3)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                <div className="flex-1 flex flex-col gap-4 p-6">
                  {/* Title and metadata */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-medium leading-snug line-clamp-2 text-stone-800 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-500 font-medium">
                      <span className="text-stone-600">{domain}</span>
                      <span className="text-stone-300">•</span>
                      <span>Kept {formatDate(item.verdictAt)}</span>
                    </div>
                  </div>

                  {/* Takeaway quote */}
                  {item.takeaway && (
                    <div className="px-3 py-2 rounded-lg bg-stone-100 text-xs text-stone-500 italic border border-stone-200/80">
                      &ldquo;{item.takeaway}&rdquo;
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map(({ tag }) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-[10px] px-2.5 py-0.5 bg-stone-200/70 text-stone-600 border border-stone-300/50 hover:bg-stone-200"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2.5 py-0.5 text-stone-500"
                        >
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action link */}
                  {sourceData.url && (
                    <div className="mt-auto pt-3 border-t border-stone-200/80">
                      <a
                        href={sourceData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Revisit source
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Decorative Footer */}
      <div className="flex items-center justify-center gap-3 pt-8 text-xs text-muted-foreground">
        <span className="w-8 h-px bg-border" />
        <span className="uppercase tracking-widest">Your curated knowledge</span>
        <span className="w-8 h-px bg-border" />
      </div>
    </div>
  )
}

export default function BacklogPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-6 md:px-8 py-8 md:py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          }
        >
          <BacklogContent />
        </Suspense>
      </div>
    </div>
  )
}
