'use client'

import { useParams } from 'next/navigation'
import LayoutHeader from '@/components/LayoutHeader'
import { AuthorStoriesSection } from '@/components/AuthorStoriesSection'

export default function AuthorStoriesPage() {
    const { id } = useParams()
    return (
        <div className="min-h-screen bg-gray-100">
            <LayoutHeader />
            <div className="max-w-4xl mx-auto py-10 px-4">
                {id && <AuthorStoriesSection authorId={id} />}
            </div>
        </div>
    )
}
