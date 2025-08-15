"use client"

import { Button, Popconfirm, Pagination } from "antd"
import Link from "next/link"
import LayoutHeader from "@/components/LayoutHeader"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Footer from "@/components/Footer"
import { useSelector } from "react-redux"
import API from "@/Service/API"
import { toast } from "react-toastify"
import FeaturedSlider from "@/components/FeaturedSlider"
import { EyeOutlined } from "@ant-design/icons"
import RankingSidebar from "@/components/RankingSidebar"

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
        console.error("Không thể lấy banner:", err)
      }
    }
    fetchBanner()
  }, [])

  if (!banner) return null

  return (
    <div className="mb-6">
      <a href={banner.url} target="_blank" rel="noopener noreferrer">
        <img
          src={banner.image}
          alt="banner quảng cáo"
          className="w-full max-h-60 object-cover rounded-lg shadow"
          loading="lazy"
        />
      </a>
    </div>
  )
}

function StorySection({ title, filter, pin = false }) {
  const router = useRouter()
  const user = useSelector((state) => state.user.currentUser)
  const [clickedStories, setClickedStories] = useState([])
  const [ads, setAds] = useState([])
  const [storyList, setStoryList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 10

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const params = { filter }
        if (pin) params.pin = true
        const res = await API.Story.list(params)
        setStoryList(res.data?.data || [])
      } catch (err) {
        console.error("Không thể lấy truyện:", err)
      }
    }
    fetchStories()
  }, [filter, pin])

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await API.AdminAds.list()
        const activeAds = (res.data || [])?.filter((ad) => ad.active)
        setAds(activeAds)
      } catch (err) {
        console.error("Không thể lấy ads:", err)
      }
    }
    fetchAds()
  }, [])

  const handleStoryClick = (storyId) => {
    const alreadyClicked = clickedStories.includes(storyId)
    const story = storyList.find((s) => s._id === storyId)

    if (!alreadyClicked && story) {
      const relatedAds = ads.filter((ad) => ad.created_by === story.author._id)
      if (relatedAds.length > 0) {
        const randomAd = relatedAds[Math.floor(Math.random() * relatedAds.length)]
        window.open(randomAd.url, "_blank")
        setClickedStories((prev) => [...prev, storyId])
        return
      }
    }
    router.push(`/story/${storyId}`)
  }

  const handleDeleteStory = async (id) => {
    try {
      await API.Story.delete(id)
      const updated = storyList.filter((s) => s._id !== id)
      setStoryList(updated)
      toast.success("Đã xóa truyện!")
      if ((currentPage - 1) * pageSize >= updated.length) {
        setCurrentPage(Math.max(1, currentPage - 1))
      }
    } catch (err) {
      toast.error("Xóa thất bại!")
    }
  }

  const currentStories = storyList?.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
        {currentStories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden hover:scale-[1.05] cursor-pointer relative"
            onClick={() => handleStoryClick(story._id)}
          >
            <div className="relative">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              {story.isCompleted && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded shadow">
                  ✅ Hoàn thành
                </span>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1 px-2">
                <EyeOutlined /> {story.totalRead || 0}
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-[16px] font-semibold text-gray-800">{story.title}</h2>
            </div>
            {user?.role === "admin" && (
              <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                <Popconfirm
                  title="Bạn có chắc muốn xóa truyện này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteStory(story._id)}
                >
                  <Button danger size="small" onClick={(e) => e.stopPropagation()}>
                    Xóa
                  </Button>
                </Popconfirm>
              </div>
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
      <div className="p-6 max-w-[1400px] mx-auto">
        <FeaturedSlider />
        <RandomBanner />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">📖 Danh sách truyện</h1>
            <StorySection title="🔥 Truyện hot" filter="popular" />
            <StorySection title="🆕 Mới cập nhật" filter="recent" />
            <StorySection title="💖 Được yêu thích nhất" filter="favorite" />
          </div>
          <div className="w-full lg:w-[300px] shrink-0">
            <RankingSidebar />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}