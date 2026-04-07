'use client'

import { useEffect, useState } from 'react'
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
  const [ads, setAds] = useState([])
  // thay đổi: chỉ cần 1 flag unlock cho toàn bộ truyện
  const [isStoryUnlocked, setIsStoryUnlocked] = useState(true)

  // Helper function để check unlock status với expiry
  const checkUnlocked = (storyId) => {
    const unlockedData = localStorage.getItem(`unlockedStory_${storyId}`)
    if (!unlockedData) return false

    try {
      const parsed = JSON.parse(unlockedData)
      // Chỉ chấp nhận nếu có expiry và còn trong thời gian hiệu lực
      if (parsed.unlocked && parsed.expiry && Date.now() < parsed.expiry) {
        return true
      } else {
        // Không có expiry hoặc đã hết hạn, xóa key
        localStorage.removeItem(`unlockedStory_${storyId}`)
        return false
      }
    } catch {
      // Format cũ không có expiry, xóa và coi là hết hạn
      localStorage.removeItem(`unlockedStory_${storyId}`)
      return false
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.Story.detail(id)
        if (res?.status === 200) {
          const storyData = res.data
          setStory(storyData)

          const index = storyData.chapters.findIndex((cid) => cid === chapterId)
          setCurrentIndex(index >= 0 ? index : 0)

          const chapterRes = await API.Chapter.detail(chapterId)
          setAudioUrl(chapterRes?.data?.audio || '')

          const adRes = await API.AdminAds.listPublic()
          const activeAds = (adRes?.data || []).filter(a => a.active)?.filter((ad) => ad.url?.toLowerCase().includes("shopee"))
          setAds(activeAds)
        }
      } catch (err) {
        console.error('Lỗi tải truyện/audio:', err)
      }
    }

    if (id && chapterId) {
      // kiểm tra key unlock cho toàn truyện (một lần) với expiry
      // try {
      //   const unlocked = checkUnlocked(id)
      //   setIsStoryUnlocked(unlocked)
      // } catch (e) {
      //   setIsStoryUnlocked(false)
      // }

      fetchData()
    }
  }, [id, chapterId])

  const unlockStory = () => {
    // mở ad (nếu có) rồi đánh dấu unlock cho toàn truyện với expiry 1 giờ
    if (ads.length > 0) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      try {
        window.open(randomAd.url, '_blank')
        // Track click (chạy ngầm)
        API.AdminAds.trackClick(randomAd._id).catch(err => console.error('Lỗi track click:', err))
      } catch (e) {
        console.warn('Không thể mở ad:', e)
      }
    }

    // Unlock với thời gian hết hạn 1 giờ
    const expiryTime = Date.now() + (10 * 60 * 1000) // 1 giờ = 60 phút * 60 giây * 1000ms
    const unlockedKey = `unlockedStory_${id}`
    localStorage.setItem(unlockedKey, JSON.stringify({
      unlocked: true,
      expiry: expiryTime
    }))
    setIsStoryUnlocked(true)
  }

  const handleChangeChapter = (offset) => {
    if (!story) return
    const nextIndex = currentIndex + offset
    if (nextIndex < 0 || nextIndex >= story.chapters.length) return

    const nextId = story.chapters[nextIndex]
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

          {/* nếu đã unlock cho truyện thì hiện audio, ngược lại show block unlock */}
          {currentIndex === 0 || isStoryUnlocked ? (
            audioUrl ? (
              <audio controls className="w-full" autoPlay key={chapterId}>
                <source src={audioUrl} type="audio/mpeg" />
                Trình duyệt không hỗ trợ audio.
              </audio>
            ) : (
              <div className="text-gray-500">Đang tải audio...</div>
            )
          ) : (
            <div className="text-center">
              <p className="text-base font-bold mb-3">
                MỜI ẤN VÀO LINK HOẶC ẢNH BÊN DƯỚI <br />
                <span className="text-orange-600">MỞ ỨNG DỤNG SHOPEE</span> ĐỂ TIẾP TỤC NGHE TOÀN BỘ TRUYỆN
              </p>

              <div onClick={unlockStory} className="cursor-pointer">
                <div className="bg-[#00B2FF] rounded-xl shadow-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                  <div className="bg-white border-2 border-orange-400 rounded-xl mx-4 my-4 p-10 text-center relative w-full">
                    <p className="text-lg font-semibold text-gray-700 mb-2">ẤN VÀO ĐÂY</p>
                    <p className="text-2xl font-bold text-gray-900 mb-3">
                      ĐỂ NGHE TOÀN BỘ AUDIO
                    </p>
                    <p className="text-sm text-gray-600">
                      HÀNH ĐỘNG NÀY CHỈ THỰC HIỆN MỘT LẦN. <br /> MONG CÁC CẬU ỦNG HỘ CHÚNG MÌNH NHA.
                    </p>
                    <div className="absolute bottom-3 right-3">
                      <span className="text-4xl">👉</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button disabled={currentIndex <= 0} onClick={() => handleChangeChapter(-1)}>
              ◀ Chương trước
            </Button>
            <Button
              disabled={currentIndex >= story?.chapters.length - 1}
              onClick={() => handleChangeChapter(1)}
            >
              Chương sau ▶
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
