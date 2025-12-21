import { db } from '@/lib/db'

export async function getAllTags(): Promise<string[]> {
  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
  })
  return tags.map((t) => t.name)
}