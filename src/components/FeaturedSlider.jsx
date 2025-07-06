'use client'

import { useEffect, useRef, useState } from 'react'
import API from '@/Service/API'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
export default function FeaturedSlider() {
  const [stories, setStories] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const timeoutRef = useRef(null)
const router = useRouter()
  const delay = 5000 // 5 giây

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const res = await API.Story.list({ filter: 'featured' })
        setStories(res.data?.data || [])
      } catch (err) {
        console.error('Lỗi khi lấy featured stories:', err)
      }
    }
    fetchFeaturedStories()
  }, [])

  // Tự động chuyển slide
  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prevIndex) =>
        prevIndex === stories.length - 1 ? 0 : prevIndex + 1
      )
    }, delay)

    return () => resetTimeout()
  }, [currentSlide, stories])

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? stories.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
  }

  if (stories.length === 0) return null

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow mb-10">
      {/* Nền mờ */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105 z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_URL_API + stories[currentSlide]?.coverImage})`
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />

      {/* Nội dung chính */}
      <div className="relative z-20 flex h-full items-center justify-between px-8 transition-all duration-700">
        {/* Ảnh chính */}
        <div  onClick={() => router.push(`/story/${stories[currentSlide]?._id}`)} className="flex-shrink-0 w-[250px] h-[350px] rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-700 cursor-pointer">
          <img
            src={process.env.NEXT_PUBLIC_URL_API + stories[currentSlide]?.coverImage}
            alt={stories[currentSlide]?.title}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Văn bản */}
        <div className="ml-10 max-w-[50%] text-white transition-opacity duration-700">
          <h2 className="text-3xl font-bold mb-4 italic">{stories[currentSlide]?.title}</h2>
          <p className="line-clamp-5 text-sm leading-relaxed">{stories[currentSlide]?.description}</p>
        </div>

        {/* Mini ảnh */}
        <div className="flex flex-col gap-2 ml-auto mr-4 w-[100px]">
          {stories.map((story, index) => (
            <img
              key={story._id}
              src={process.env.NEXT_PUBLIC_URL_API + story.coverImage}
              alt={story.title}
              className={`w-full h-16 object-cover rounded-md transition-all duration-300 cursor-pointer ${
                index === currentSlide ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Nút điều hướng */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        <button
          onClick={handlePrev}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 text-white"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={handleNext}
          className="bg-white/20 p-2 rounded-full hover:bg-white/40 text-white"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  )
}
