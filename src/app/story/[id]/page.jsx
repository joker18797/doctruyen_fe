// app/story/[id]/page.tsx

import API from '@/Service/API'
import StoryInfoPage from '@/components/StoryInfoPage' // move UI vào component riêng

export async function generateMetadata({ params }) {
  const story = await API.Story.detail(params?.id)
  const s = story.data

  return {
    title: s?.title,
    description: s?.description?.slice(0, 150),
    openGraph: {
      type: 'article', // hoặc 'website' nếu không phải bài viết
      url: `https://ocuadua.com/story/${params?.id}`,
      title: s?.title,
      description: s?.description?.slice(0, 150),
      siteName: 'Tên website của bạn',
      images: [
        {
          url: s?.coverImage,
          width: 1200,
          height: 630,
          alt: s?.title,
        },
      ],
      locale: 'vi_VN', // hoặc 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: s?.title,
      description: s?.description?.slice(0, 150),
      images: [s?.coverImage],
    },
  }
}

export default function Page({ params }) {
  return <StoryInfoPage id={params.id} />
}
