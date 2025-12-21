'use client'

import { Source } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw, CheckCircle, XCircle, Globe, Youtube } from 'lucide-react'
import { deleteSource, toggleSource } from './actions'
import { cn } from '@/lib/utils'

interface SourceListProps {
  sources: Source[]
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-sm bg-stone-50/50">
        <p className="text-stone-500 font-serif text-lg italic">
          No sources configured yet.
        </p>
        <p className="text-stone-400 text-sm mt-2">
          Add a blog or YouTube channel to start your collection.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {sources.map((source) => (
        <Card key={source.id} className={cn(
          "group transition-all duration-200 border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300",
          !source.enabled && "opacity-60 bg-stone-50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-full",
                    source.type === 'youtube' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {source.type === 'youtube' ? <Youtube className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 truncate">
                    {source.name}
                  </h3>
                  {!source.enabled && (
                    <Badge variant="outline" className="text-stone-400 border-stone-200">Paused</Badge>
                  )}
                </div>
                
                <p className="text-sm text-stone-500 font-mono truncate mb-4 pl-11">
                  {source.url}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600 pl-11">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Schedule:</span>
                    <span className="capitalize">{source.interval}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Limit:</span>
                    <span>{source.maxPerFetch} items</span>
                  </div>

                  {source.topicFilterEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Filter:</span>
                      <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200">
                        {source.topicFilter}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 text-xs pl-11">
                  {source.lastFetchStatus === 'success' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Last fetched: {source.lastFetchedAt?.toLocaleDateString() ?? 'Never'}
                    </span>
                  ) : source.lastFetchStatus === 'error' ? (
                    <span className="flex items-center gap-1.5 text-red-600 font-medium">
                      <XCircle className="h-3.5 w-3.5" />
                      Error: {source.lastFetchError}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic">Pending first fetch...</span>
                  )}

                  <span className="text-stone-400">
                    • {source.itemsQueuedTotal} queued
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSource(source.id, !source.enabled)}
                  title={source.enabled ? 'Pause' : 'Resume'}
                  className="hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                >
                  <RefreshCw className={cn("h-4 w-4", !source.enabled && "text-stone-300")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSource(source.id)}
                  title="Delete Source"
                  className="hover:bg-red-50 text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}