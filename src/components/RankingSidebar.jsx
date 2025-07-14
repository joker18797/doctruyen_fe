'use client'

import { useEffect, useState } from 'react'
import API from '@/Service/API'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

const tabs = [
  { label: 'Ngày', value: 'daily' },
  { label: 'Tuần', value: 'weekly' },
  { label: 'Tháng', value: 'monthly' },
  { label: 'Năm', value: 'yearly' },
]

export default function RankingSidebar() {
  const [activeTab, setActiveTab] = useState('weekly')
  const [ranking, setRanking] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await API.Story.list({ filter: activeTab })
        setRanking(res.data?.data || [])
      } catch (err) {
        console.error('Không thể lấy bảng xếp hạng:', err)
      }
    }
    fetchRanking()
  }, [activeTab])

  const getViewCountText = (story) => {
    switch (activeTab) {
      case 'daily':
        return `${story.dailyReadCount || 0} lượt xem`
      case 'weekly':
        return `${story.weeklyReadCount || 0} lượt xem`
      case 'monthly':
        return `${story.monthlyReadCount || 0} lượt xem`
      case 'yearly':
        return `${story.yearlyReadCount || 0} lượt xem`
      default:
        return `${story.totalRead || 0} lượt xem`
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="text-lg font-bold text-gray-800 mb-2">🏆 Bảng xếp hạng</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.value}
            className={clsx(
              'text-sm px-3 py-1 rounded-full',
              activeTab === tab.value
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách xếp hạng */}
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
            <div className="text-xs text-gray-500">{getViewCountText(story)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
