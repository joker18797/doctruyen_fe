// components/RankingSidebar.tsx
'use client'

import { useEffect, useState } from 'react'
import API from '@/Service/API'
import { useRouter } from 'next/navigation'

export default function RankingSidebar() {
  const [ranking, setRanking] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await API.Story.list({ filter: 'top' }) // Đảm bảo backend có filter này
        setRanking(res.data?.data || [])
      } catch (err) {
        console.error('Không thể lấy bảng xếp hạng:', err)
      }
    }
    fetchRanking()
  }, [])

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="text-lg font-bold text-gray-800 mb-2">🏆 Bảng xếp hạng</h3>
      {ranking.map((story, index) => (
        <div
          key={story._id}
          className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => router.push(`/story/${story._id}`)}
        >
          <div className="text-xl font-bold text-violet-600 w-5">{index + 1}</div>
          <img
            src={story.coverImage || '/no-image.jpg'}
            alt={story.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700 line-clamp-1">{story.title}</div>
            <div className="text-xs text-gray-500">{story.totalRead || 0} lượt xem</div>
          </div>
        </div>
      ))}
    </div>
  )
}
