'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import Image from 'next/image'
import API from '@/Service/API'

export default function FeaturedSlider() {
  const [stories, setStories] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const timeoutRef = useRef(null)
  const router = useRouter()
  const thumbContainerRef = useRef(null)
  const thumbRefs = useRef([])
  const delay = 5000 // 5 giây
  useEffect(() => {
    const target = thumbRefs.current[currentSlide]
    const container = thumbContainerRef.current

    if (target && container) {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      if (
        targetRect.left < containerRect.left ||
        targetRect.right > containerRect.right
      ) {
        target.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [currentSlide])

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const res = await API.Story.list({ pin: true })
        setStories(res.data?.data || [])
      } catch (err) {
        console.error('Lỗi khi lấy featured stories:', err)
      }
    }
    fetchFeaturedStories()
  }, [])

  useEffect(() => {
    if (stories.length === 0) return
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
    }, delay)

    return () => resetTimeout()
  }, [currentSlide, stories])

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? stories.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
  }

  if (stories.length === 0) return null
  const currentStory = stories[currentSlide]

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow mb-10">
      {/* Background blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105 z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${currentStory.coverImage})`
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center lg:items-stretch px-4 md:px-8 py-6 gap-6 w-full">
        {/* Cột trái: Ảnh chính */}
        <div
          className="relative w-full lg:w-1/2 h-[300px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-white/20 cursor-pointer"
          onClick={() => router.push(`/story/${currentStory._id}`)}
        >
          <img
            src={currentStory.coverImage}
            alt={currentStory.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Cột phải */}
        <div className="flex flex-col justify-between text-white w-full lg:w-1/2 gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold mb-3 italic text-center lg:text-left">
              {currentStory.title}
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-center lg:text-left line-clamp-5">
              {currentStory.description}
            </p>
          </div>

          {/* Mini ảnh */}
          <div
            className="flex flex-row gap-2 overflow-x-auto scrollbar-hide mt-4"
            ref={thumbContainerRef}
          >
            {stories.map((story, index) => (
              <div
                key={story._id}
                ref={(el) => (thumbRefs.current[index] = el)}
                className={`relative h-16 w-24 rounded-md cursor-pointer overflow-hidden transition-all duration-300 ${index === currentSlide ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'
                  }`}
                onClick={() => setCurrentSlide(index)}
              >
                <img
                  src={story.coverImage}
                  alt={story.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="96px"
                />
              </div>
            ))}
          </div>

          {/* Nút điều hướng */}
          <div className="flex justify-center lg:justify-start gap-4 mt-4">
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
      </div>
    </div>
  )
}
