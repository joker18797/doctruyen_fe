'use client'

import { useParams } from 'next/navigation'
import AuthorStoriesSection from '@/components/AuthorStoriesSection'

export default function AuthorStoriesPage() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {id && <AuthorStoriesSection authorId={id } />}
    </div>
  )
}
