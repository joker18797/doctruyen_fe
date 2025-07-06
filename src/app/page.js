'use client'

import { Button, Popconfirm, message, Pagination } from 'antd'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import { useSelector } from 'react-redux'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import FeaturedSlider from '@/components/FeaturedSlider'

function RandomBanner() {
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await API.AdminBanner.list()
        const banners = res.data || []
        const random = banners[Math.floor(Math.random() * banners.length)]
        setBanner(random)
      } catch (err) {
        console.error('Không thể lấy banner:', err)
      }
    }
    fetchBanner()
  }, [])

  if (!banner) return null

  return (
    <div className="mb-6">
      <a href={banner.url} target="_blank" rel="noopener noreferrer">
        <img
          src={process.env.NEXT_PUBLIC_URL_API + banner.image}
          alt="banner quảng cáo"
          className="w-full max-h-60 object-cover rounded-lg shadow"
        />
      </a>
    </div>
  )
}

function StorySection({ title, filter }) {
  const router = useRouter()
  const user = useSelector((state) => state.user.currentUser)
  const [clickedStories, setClickedStories] = useState([])
  const [ads, setAds] = useState([])
  const [storyList, setStoryList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 6

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await API.Story.list({ filter })
        setStoryList(res.data?.data || [])
      } catch (err) {
        console.error('Không thể lấy truyện:', err)
      }
    }
    fetchStories()
  }, [filter])

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await API.AdminAds.list()
        const activeAds = (res.data || []).filter((ad) => ad.active)
        setAds(activeAds)
      } catch (err) {
        console.error('Không thể lấy ads:', err)
      }
    }
    fetchAds()
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
    const updated = storyList.filter((s) => s._id !== id)
    setStoryList(updated)
    toast.success('Đã xóa truyện!')
    if ((currentPage - 1) * pageSize >= updated.length) {
      setCurrentPage(Math.max(1, currentPage - 1))
    }
  }

  const currentStories = storyList?.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentStories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer relative"
            onClick={() => handleStoryClick(story._id)}
          >
            <img
              src={process.env.NEXT_PUBLIC_URL_API + story.coverImage}
              alt={story.title}
              className="w-full h-52 object-cover"
            />

            <div className="p-4 flex flex-col justify-between h-52">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{story.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.description}</p>
              </div>

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
                onConfirm={() => handleDeleteStory(story._id)}
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
        <FeaturedSlider />
        <RandomBanner />

        <h1 className="text-2xl font-bold text-gray-800 mb-4">📖 Danh sách truyện</h1>
        <StorySection title="🔥 Truyện phổ biến" filter="popular" />
        <StorySection title="💖 Được yêu thích nhất" filter="favorite" />
        <StorySection title="🆕 Mới cập nhật" filter="recent" />
      </div>
      <Footer />
    </div>
  )
}