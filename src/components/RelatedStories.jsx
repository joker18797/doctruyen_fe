'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeOutlined } from '@ant-design/icons'
import API from '@/Service/API'

export default function RelatedStories({ storyId, limit = 12 }) {
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
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">🔥 Truyện hay cùng biên tập</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {stories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer"
            onClick={() => router.push(`/story/${story.slug || story._id}`)}
          >
            <div className="relative">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-44 object-cover"
              />
              {story.sameAuthor ? (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
                  Cùng biên tập
                </span>
              ) : (
                <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
                  Cùng thể loại
                </span>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <EyeOutlined /> {Number(story.totalRead || 0).toLocaleString('en-US')}
              </span>
            </div>

            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{story.title}</h3>
              {story.authorName && story.authorName !== 'undefined' && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{story.authorName}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
