"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button, Select } from "antd"
import { DownOutlined, UpOutlined } from "@ant-design/icons"
import LayoutHeader from "@/components/LayoutHeader"
import API from "@/Service/API"
import RelatedStories from "@/components/RelatedStories"
import { sanitizeText } from "@/Helper/helpFunction"

const { Option } = Select

export default function StoryReadPage({ id, story, ads }) {
  const contentRef = useRef(null)
  const fakeBottomRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const extractId = (item) =>
    item && typeof item === "object" ? (item._id || item.id || item.chapterId) : item

  const chapterIds = useMemo(
    () => (story?.chapters ? story.chapters.map(extractId) : []),
    [story]
  )

  // lấy từ URL hoặc fallback về chapter đầu
  const chapterParam = searchParams.get("chapter")
  const firstChapterId = chapterIds.length > 0 ? chapterIds[0] : null
  const [selectedChapterId, setSelectedChapterId] = useState(chapterParam || firstChapterId)

  const [chapterContent, setChapterContent] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterAudio, setChapterAudio] = useState("")
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [adsList] = useState(ads || [])
  const [hasLockedChapters, setHasLockedChapters] = useState(false)

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("unlockedChapters")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Fetch nội dung chapter
  useEffect(() => {
    if (!selectedChapterId) return
    const fetchChapter = async () => {
      try {
        const res = await API.Chapter.detail(selectedChapterId)
        if (res?.status === 200) {
          setChapterContent(sanitizeText(res.data?.content || ""))
          setChapterTitle(res?.data?.title || "")
          setChapterAudio(res?.data?.audio ?? "")

          // unlock auto
          setUnlockedChapters((prev) => {
            if (!prev.includes(selectedChapterId)) {
              const updated = [...prev, selectedChapterId]
              localStorage.setItem("unlockedChapters", JSON.stringify(updated))
              return updated
            }
            return prev
          })

          // Ads gần cuối truyện
          const idx = chapterIds.findIndex((cid) => cid === selectedChapterId)
          const isNearEnd = chapterIds.length > 1 && idx === chapterIds.length - 2
          const hasShownAdKey = `hasShownAd_read_${id}_${selectedChapterId}`

          if (isNearEnd && adsList.length > 0 && !localStorage.getItem(hasShownAdKey)) {
            const randomAd = adsList[Math.floor(Math.random() * adsList.length)]
            window.open(randomAd.url, "_blank")
            localStorage.setItem(hasShownAdKey, "true")
          }
        }
      } catch (err) {
        console.error("Lỗi tải chương:", err)
      }
    }
    fetchChapter()
  }, [selectedChapterId, chapterIds, id, adsList])

  // đồng bộ state khi đổi URL ?chapter
  useEffect(() => {
    if (chapterParam && chapterParam !== selectedChapterId) {
      setSelectedChapterId(chapterParam)
    }
  }, [chapterParam])

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const docH = document.documentElement.scrollHeight
      setIsAtBottom(scrollY + windowHeight >= docH - 100)
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // disable copy / right click
  useEffect(() => {
    const disable = (e) => e.preventDefault()
    document.addEventListener("contextmenu", disable)
    document.addEventListener("copy", disable)
    document.addEventListener("selectstart", disable)
    return () => {
      document.removeEventListener("contextmenu", disable)
      document.removeEventListener("copy", disable)
      document.removeEventListener("selectstart", disable)
    }
  }, [])

  useEffect(() => {
    if (chapterIds.length) {
      const locked = chapterIds.some((cid) => !unlockedChapters.includes(cid))
      setHasLockedChapters(locked)
    }
  }, [chapterIds, unlockedChapters])

  const handleChangeChapter = (chapterId) => {
    setSelectedChapterId(chapterId)
    router.push(`/story/${id}/read?chapter=${chapterId}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const unlockAndChangeChapter = (chapterId) => {
    if (adsList.length > 0) {
      const randomAd = adsList[Math.floor(Math.random() * adsList.length)]
      window.open(randomAd.url, "_blank")
    }
    localStorage.setItem("unlockedChapters", JSON.stringify(chapterIds))
    setUnlockedChapters(chapterIds)
    setTimeout(() => handleChangeChapter(chapterId), 500)
  }

  const ChapterNavigator = ({ position = "top", floating = false }) => {
    const index = chapterIds.findIndex((cid) => cid === selectedChapterId)

    const renderButton = (label, chapterIndexOffset) => {
      if (index === -1) return null
      const targetIndex = index + chapterIndexOffset
      if (targetIndex < 0 || targetIndex >= chapterIds.length) return null
      const targetId = chapterIds[targetIndex]
      const isUnlocked = unlockedChapters.includes(targetId)

      if (isUnlocked || unlockedChapters.length < 2) {
        return <Button onClick={() => handleChangeChapter(targetId)}>{label}</Button>
      }
      return (
        <Button type="dashed" danger onClick={() => unlockAndChangeChapter(targetId)}>
          👉 Click để hiển thị
        </Button>
      )
    }

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 bg-gray-100 px-3 py-2 sm:px-4 sm:py-4 rounded text-xl
        ${position === "bottom" ? "mt-8" : "mb-4"}
        ${floating ? "fixed bottom-0 left-0 right-0 z-30 border-t shadow-md" : ""}`}
      >
        <div className="flex-1 flex justify-start">
          {renderButton(
            <>
              ◀ <span className="hidden sm:inline ml-1 text-lg">Chương trước</span>
            </>,
            -1
          )}
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className="hidden sm:inline">Chuyển tới chương:</span>
          <Select
            value={selectedChapterId}
            onChange={handleChangeChapter}
            className="min-w-[150px]"
            size="large"
            showSearch
            optionLabelProp="label"
          >
            {chapterIds.map((cid, idx) => (
              <Option key={cid} value={cid} label={`Chương ${idx + 1}`}>
                Chương {idx + 1}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex-1 flex justify-end">
          {renderButton(
            <>
              <span className="hidden sm:inline mr-1 text-lg">Chương sau</span> ▶
            </>,
            1
          )}
        </div>
      </div>
    )
  }

  if (!story || !selectedChapterId) {
    return <div className="text-center py-20 text-gray-600">Đang tải truyện...</div>
  }

  const currentIndex = chapterIds.findIndex((cid) => cid === selectedChapterId)
  const isLastChapter = currentIndex !== -1 && currentIndex === chapterIds.length - 1

  return (
    <div className="pb-[90px]">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">
          <div className="fixed bottom-20 right-6 z-40">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isAtBottom ? <UpOutlined /> : <DownOutlined />}
              onClick={() => {
                if (isAtBottom) {
                  window.scrollTo({ top: 0, behavior: "smooth" })
                } else {
                  fakeBottomRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              }}
            />
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h1>
            <Select
              showSearch
              placeholder="Chọn chương"
              value={selectedChapterId}
              onChange={handleChangeChapter}
              className="w-60"
              optionLabelProp="label"
            >
              {chapterIds.map((cid, index) => (
                <Option key={cid} value={cid} label={`Chương ${index + 1}`}>
                  Chương {index + 1}
                </Option>
              ))}
            </Select>
          </div>

          {chapterAudio && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">🎧 Nghe Audio</h3>
              <Button
                type="primary"
                onClick={() => {
                  if (adsList.length > 0) {
                    const randomAd = adsList[Math.floor(Math.random() * adsList.length)]
                    window.open(randomAd.url, "_blank")
                  }
                  router.push(`/story/${id}/audio?chapter=${selectedChapterId}`)
                }}
              >
                ▶ Nghe chương {currentIndex + 1}
              </Button>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <ChapterNavigator position="top" />
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {`Chương ${currentIndex + 1}: ${chapterTitle}`}
            </h2>
            <div
              className="text-gray-800 whitespace-pre-line leading-loose mb-6 select-none text-[20px]"
              ref={contentRef}
            >
              {chapterContent || "Đang tải nội dung..."}
            </div>
          </div>
        </div>

        {isLastChapter && (
          <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-lg">
            <p className="text-center text-gray-600 mb-2">
              🎉 Bạn đã đọc đến chương cuối cùng hiện có của truyện này.
            </p>
            <RelatedStories storyId={story?._id} limit={12} />
          </div>
        )}

        {hasLockedChapters && (
          <div className="max-w-4xl mx-auto mt-6 bg-[#FFEBCB] border border-yellow-300 rounded-xl p-6 shadow text-center">
            <p className="text-base text-gray-700">
              Mời đọc giả click vào nút <strong>"👉 Click để hiển thị"</strong> để mở
              khóa chương tiếp theo và tiếp tục đọc truyện.
            </p>
            <p className="text-sm mt-2 text-gray-500 italic">
              (*) Bạn có thể được yêu cầu xem quảng cáo để mở khóa.
            </p>
          </div>
        )}
      </div>

      <div ref={fakeBottomRef} className="h-4" />
      <ChapterNavigator position="bottom" floating />
    </div>
  )
}
