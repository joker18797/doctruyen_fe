'use client'

import { Button } from 'antd'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'
import { useRouter } from 'next/navigation'

const dummyStories = [
  { id: 1, title: 'Truyện Kiếm Hiệp', cover: '/cover1.jpg', hasAudio: true },
  { id: 2, title: 'Truyện Ngôn Tình', cover: '/cover2.jpg', hasAudio: false },
  { id: 3, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
]

const popularStories = [
  { id: 4, title: 'Truyện Hành Động Hot', cover: '/cover4.jpg', hasAudio: true },
  { id: 5, title: 'Truyện Kinh Dị Yêu Thích', cover: '/cover5.jpg', hasAudio: false },
]

const latestStories = [
  { id: 6, title: 'Truyện Mới 1', cover: '/cover6.jpg', hasAudio: false },
  { id: 7, title: 'Truyện Mới 2', cover: '/cover7.jpg', hasAudio: true },
]

function StorySection({ title, stories }) {
  const router = useRouter()
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer"
             onClick={() => router.push('/story/1')} 
          >
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-4 flex flex-col justify-between h-40">
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{story.title}</h2>
              <div className="flex justify-between items-center mt-4">
                <Link href={`/story/1`}>
                  <Button type="primary" size="small">Đọc</Button>
                </Link>
                {story.hasAudio && <span className="text-xl">🔊</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📖 Danh sách truyện</h1>
        <StorySection title="🔥 Truyện phổ biến" stories={popularStories} />
        <StorySection title="💖 Được yêu thích nhất" stories={dummyStories} />
        <StorySection title="🆕 Mới cập nhật" stories={latestStories} />
      </div>
    </div>
  )
}
