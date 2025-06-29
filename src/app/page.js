'use client'

import { Button } from 'antd'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Footer from '@/components/Footer';
import { useSelector } from 'react-redux'
import { Popconfirm, message, Pagination  } from 'antd'

const dummyStories = [
  { id: 1, title: 'Truyện Kiếm Hiệp', cover: '/cover1.jpg', hasAudio: true },
  { id: 2, title: 'Truyện Ngôn Tình', cover: '/cover2.jpg', hasAudio: false },
  { id: 3, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
  { id: 4, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
  { id: 5, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
  { id: 6, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
  { id: 7, title: 'Truyện Hài Hước', cover: '/cover3.jpg', hasAudio: true },
]

const popularStories = [
  { id: 4, title: 'Truyện Hành Động Hot', cover: '/cover4.jpg', hasAudio: true },
  { id: 5, title: 'Truyện Kinh Dị Yêu Thích', cover: '/cover5.jpg', hasAudio: false },
]

const latestStories = [
  { id: 6, title: 'Truyện Mới 1', cover: '/cover6.jpg', hasAudio: false },
  { id: 7, title: 'Truyện Mới 2', cover: '/cover7.jpg', hasAudio: true },
]
const FAKE_ADS = [
  { id: 1, url: 'https://shopee.vn', active: true },
  { id: 2, url: 'https://lazada.vn', active: true },
]

const FAKE_BANNERS = [
  { id: 1, image: '/banner1.jpg', url: 'https://shopee.vn' },
  { id: 2, image: '/banner2.jpg', url: 'https://lazada.vn' },
]
function RandomBanner() {
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    const random = FAKE_BANNERS[Math.floor(Math.random() * FAKE_BANNERS.length)]
    setBanner(random)
  }, [])

  if (!banner) return null

  return (
    <div className="mb-6">
      <a href={banner.url} target="_blank" rel="noopener noreferrer">
        <img
          src={banner.image}
          alt="banner quảng cáo"
          className="w-full max-h-60 object-cover rounded-lg shadow"
        />
      </a>
    </div>
  )
}

 function StorySection({ title, stories }) {
  const router = useRouter()
  const user = useSelector((state) => state.user.currentUser)
  const [clickedStories, setClickedStories] = useState([])
  const [ads, setAds] = useState([])
  const [storyList, setStoryList] = useState(stories)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 6
  const totalPages = Math.ceil(storyList.length / pageSize)

  useEffect(() => {
    setAds(FAKE_ADS.filter(ad => ad.active))
  }, [])

  const handleStoryClick = (storyId) => {
    const alreadyClicked = clickedStories.includes(storyId)
    if (!alreadyClicked && ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      window.open(randomAd.url, '_blank')
      setClickedStories([...clickedStories, storyId])
    } else {
      router.push(`/story/${storyId}`)
    }
  }

  const handleDeleteStory = (id) => {
    const updated = storyList.filter((s) => s.id !== id)
    setStoryList(updated)
    message.success('Đã xóa truyện!')
    if ((currentPage - 1) * pageSize >= updated.length) {
      setCurrentPage(Math.max(1, currentPage - 1)) // Lùi về trang trước nếu hết truyện
    }
  }

  const currentStories = storyList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentStories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer relative"
            onClick={() => handleStoryClick(story.id)}
          >
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-4 flex flex-col justify-between h-40">
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{story.title}</h2>
              <div className="flex justify-between items-center mt-4">
                <Button type="primary" size="small">Đọc</Button>
                {story.hasAudio && <span className="text-xl">🔊</span>}
              </div>
            </div>

            {user?.role === 'admin' && (
              <Popconfirm
                title="Bạn có chắc muốn xóa truyện này?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => handleDeleteStory(story.id)}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  danger
                  size="small"
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </div>
        ))}
      </div>

      {storyList.length > pageSize && (
        <div className="mt-6 text-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={storyList.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />
      <div className="p-6 max-w-6xl mx-auto">
        <RandomBanner />

        <h1 className="text-2xl font-bold text-gray-800 mb-4">📖 Danh sách truyện</h1>
        <StorySection title="🔥 Truyện phổ biến" stories={popularStories} />
        <StorySection title="💖 Được yêu thích nhất" stories={dummyStories} />
        <StorySection title="🆕 Mới cập nhật" stories={latestStories} />
      </div>
      <Footer />
    </div>
  )
}
