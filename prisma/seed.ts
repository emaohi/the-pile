import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'AI' },
      update: {},
      create: { name: 'AI' },
    }),
    prisma.tag.upsert({
      where: { name: 'Prompting' },
      update: {},
      create: { name: 'Prompting' },
    }),
    prisma.tag.upsert({
      where: { name: 'DevOps' },
      update: {},
      create: { name: 'DevOps' },
    }),
    prisma.tag.upsert({
      where: { name: 'Security' },
      update: {},
      create: { name: 'Security' },
    }),
  ])

  // Create sample items
  const items = [
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://simonwillison.net/2024/Dec/19/context-engineering/',
      }),
      title: 'Context Engineering for AI Agents',
      description: 'How to design effective context for LLM-based agents',
      estimatedMinutes: 15,
      savedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      tags: ['AI', 'Prompting'],
    },
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://youtube.com/watch?v=example',
      }),
      title: 'Kubernetes Security Best Practices',
      description: 'Deep dive into K8s security',
      estimatedMinutes: 22,
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      tags: ['DevOps', 'Security'],
    },
    {
      sourceType: 'link',
      sourceData: JSON.stringify({
        type: 'link',
        url: 'https://anthropic.com/news/prompt-caching',
      }),
      title: 'Prompt Caching Explained',
      description: 'How prompt caching reduces latency and cost',
      estimatedMinutes: 4,
      savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      tags: ['AI'],
    },
  ]

  for (const itemData of items) {
    const { tags: tagNames, ...data } = itemData
    const item = await prisma.item.create({
      data: {
        ...data,
        tags: {
          create: tagNames.map((name) => ({
            tag: {
              connect: { name },
            },
          })),
        },
      },
    })
    console.log(`Created item: ${item.title}`)
  }

  // Create user stats singleton
  await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      currentStreak: 0,
      longestStreak: 0,
    },
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })