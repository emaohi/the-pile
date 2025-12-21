'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  currentFilter?: string
}

export function TagFilter({ tags, currentFilter }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('tag')
    } else {
      params.set('tag', value)
    }
    router.push(`/?${params.toString()}`)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    router.push(`/?${params.toString()}`)
  }

  if (currentFilter) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtering:</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={clearFilter}
          className="gap-1"
        >
          {currentFilter}
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Select onValueChange={handleFilterChange} defaultValue="all">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}