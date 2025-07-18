'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import API from '@/Service/API'
import LayoutHeader from '@/components/LayoutHeader'
import { Button } from 'antd'

export default function StoryAudioPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const chapterId = searchParams.get('chapter')
  const [story, setStory] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedChapters')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [ads, setAds] = useState([])

  const hasLockedChapters = useMemo(() => {
    if (!story?.chapters?.length || !unlockedChapters.length) return false
    const unlockedSet = new Set(unlockedChapters)
    return story.chapters.some((cid) => !unlockedSet.has(cid))
  }, [story?.chapters, unlockedChapters])

  const showAdIfNeeded = (index, chapterId) => {
    const adIndexes = [1, story?.chapters?.length - 2]
    const adKey = `hasShownAd_audio_${id}_${chapterId}`

    if (adIndexes.includes(index) && ads.length > 0 && !localStorage.getItem(adKey)) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      window.open(randomAd.url, '_blank')
      localStorage.setItem(adKey, 'true')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.Story.detail(id)
        if (res.status === 200) {
          const storyData = res.data
          setStory(storyData)

          const index = storyData.chapters.findIndex((cid) => cid === chapterId)
          setCurrentIndex(index)

          const chapterRes = await API.Chapter.detail(chapterId)
          setAudioUrl(chapterRes.data?.audio || '')

          const adRes = await API.AdminAds.list()
          const activeAds = adRes.data?.filter((a) => a.active) || []
          setAds(activeAds)

          showAdIfNeeded(index, chapterId)

          if (!unlockedChapters.includes(chapterId)) {
            const updated = [...unlockedChapters, chapterId]
            setUnlockedChapters(updated)
            localStorage.setItem('unlockedChapters', JSON.stringify(updated))
          }
        }
      } catch (err) {
        console.error('Lỗi tải truyện/audio:', err)
      }
    }

    if (id && chapterId) fetchData()
  }, [id, chapterId])

  const handleChangeChapter = (offset) => {
    if (!story) return
    const nextIndex = currentIndex + offset
    if (nextIndex < 0 || nextIndex >= story.chapters.length) return

    const nextId = story.chapters[nextIndex]
    const isUnlocked = unlockedChapters.includes(nextId)

    if (!isUnlocked) {
      showAdIfNeeded(nextIndex, nextId)
      const updated = [...unlockedChapters, nextId]
      setUnlockedChapters(updated)
      localStorage.setItem('unlockedChapters', JSON.stringify(updated))
    }

    router.push(`/story/${id}/audio?chapter=${nextId}`)
  }

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white max-w-2xl w-full p-6 rounded-xl shadow-lg text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🎧 {story?.title} - Chương {currentIndex + 1}
          </h1>

          {audioUrl ? (
            <audio controls className="w-full" autoPlay key={chapterId}>
              <source src={audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
          ) : (
            <div className="text-gray-500">Đang tải audio...</div>
          )}

          <div className="flex justify-between">
            <Button disabled={currentIndex <= 0} onClick={() => handleChangeChapter(-1)}>
              ◀ Chương trước
            </Button>
            <Button
              disabled={currentIndex >= story?.chapters.length - 1}
              onClick={() => handleChangeChapter(1)}
            >
              {hasLockedChapters ? '👉 Click để hiển thị' : 'Chương sau ▶'}
            </Button>
          </div>

          {hasLockedChapters && (
            <div className="mt-6 bg-[#FFEBCB] border border-yellow-300 rounded-xl p-6 shadow text-center">
              <p className="text-base text-gray-700">
                Mời đọc giả click vào nút <strong>"👉 Click để hiển thị"</strong> để mở khóa chương tiếp theo và tiếp tục nghe.
              </p>
              <p className="text-sm mt-2 text-gray-500 italic">
                (*) Bạn có thể được yêu cầu xem quảng cáo để mở khóa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
