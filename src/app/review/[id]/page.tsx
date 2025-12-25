import { notFound } from 'next/navigation'
import { fetchItem } from '@/app/actions/items'
import { ReviewFlow } from './review-flow'

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const item = await fetchItem(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <ReviewFlow item={item} />
    </div>
  )
}
