'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeOutlined } from '@ant-design/icons'
import API from '@/Service/API'

export default function RelatedStories({ storyId, limit = 6, title = '🔥 Truyện hay cùng biên tập' }) {
  const router = useRouter()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!storyId) return
    let ignore = false

    const fetchRelated = async () => {
      try {
        setLoading(true)
        const res = await API.Story.related(storyId, { limit })
        if (!ignore) setStories(res?.data?.data || [])
      } catch (err) {
        if (!ignore) setStories([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchRelated()
    return () => {
      ignore = true
    }
  }, [storyId, limit])

  if (loading || stories.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div
            key={story._id}
            className="flex gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-3 hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`/story/${story.slug || story._id}`)}
          >
            <div className="relative shrink-0">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-[80px] h-[110px] object-cover rounded-lg"
              />
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                <EyeOutlined /> {Number(story.totalRead || 0).toLocaleString('en-US')}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded text-white ${
                    story.sameAuthor ? 'bg-blue-600' : 'bg-purple-600'
                  }`}
                >
                  {story.sameAuthor ? 'Cùng biên tập' : 'Cùng thể loại'}
                </span>
                {story.isCompleted && (
                  <span className="text-[10px] text-green-600 dark:text-green-400">✅ Hoàn thành</span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                {story.title}
              </h3>

              {story.excerpt ? (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                  {story.excerpt}
                </p>
              ) : (
                story.genres?.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {story.genres.join(', ')}
                  </p>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
