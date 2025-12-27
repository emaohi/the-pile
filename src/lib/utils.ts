import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseSourceData(data: string | null | undefined): { url?: string } {
  try {
    return JSON.parse(data || '{}')
  } catch {
    return {}
  }
}

export function getDomain(url: string | undefined): string {
  if (!url) return 'Manual entry'
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'Link'
  }
}

export function isYouTubeUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname.includes('youtube.com') || hostname.includes('youtu.be')
  } catch {
    return false
  }
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}
