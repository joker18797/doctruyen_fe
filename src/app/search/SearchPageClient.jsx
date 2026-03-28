'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import API from '@/Service/API'
import { Empty, Spin } from 'antd'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const genre = searchParams.get('genre') || ''
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (keyword.trim() || genre.trim()) {
      fetchStories()
    }
  }, [keyword, genre])

  const fetchStories = async () => {
    setLoading(true)
    try {
      const query = {}
      if (keyword.trim()) query.search = keyword
      if (genre.trim()) query.genre = genre

      const res = await API.Story.list(query)
      setStories(res.data?.data || [])
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err)
    } finally {
      setLoading(false)
    }
  }

  const heading = genre
    ? `📚 Thể loại: "${genre}"`
    : keyword
    ? `🔍 Kết quả tìm kiếm cho: "${keyword}"`
    : 'Kết quả tìm kiếm'

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold mb-4">{heading}</h1>
        {loading ? (
          <Spin />
        ) : stories.length === 0 ? (
          <Empty description="Không tìm thấy truyện nào." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {stories.map((story) => (
              <Link
                href={`/story/${story.slug || story._id}`}
                key={story._id}
                className="bg-white p-4 rounded shadow hover:shadow-lg transition block"
              >
                <img
                  src={story.coverImage}
                  className="w-full h-40 object-cover rounded mb-3"
                  alt={story.title}
                />
                <h3 className="font-semibold text-lg">{story.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{story.description}</p>

                {story.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {story.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="bg-violet-100 text-violet-600 text-xs px-2 py-0.5 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                    {story.genres.length > 4 && (
                      <span className="text-xs text-gray-400">+{story.genres.length - 4}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
