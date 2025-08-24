import API from "@/Service/API"
import StoryReadPage from "@/components/StoryReadPage"

export default async function StoryReadSSR({ params, searchParams }) {
  const { id } =await params

  let story = null
  let ads = []

  try {
    const [storyRes, adsRes] = await Promise.all([
      API.Story.detail(id),
      API.AdminAds.list(),
    ])

    if (storyRes?.status === 200) story = storyRes.data
    if (adsRes?.status === 200) ads = (adsRes.data || []).filter((ad) => ad.active)
  } catch (err) {
    console.error("SSR fetch error:", err)
  }
  return (
    <StoryReadPage
      id={id}
      story={story}
      ads={ads}
    />
  )
}
