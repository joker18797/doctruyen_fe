// app/story/[id]/page.tsx
import StoryInfoPage from '@/components/StoryInfoPage'
import API from '@/Service/API'

export async function generateMetadata({ params }) {
  const { id } = await params 
  const story = await API.Story.detail(id)
  const s = story?.data

  if (!s) {
    return {
      title: 'Không tìm thấy truyện',
      description: 'Truyện bạn tìm không tồn tại hoặc đã bị xóa.',
    }
  }

  return {
    title: s.title,
    description: s.description?.slice(0, 150),
    openGraph: {
      type: 'article',
      url: `https://ocuadua.com/story/${id}`,
      title: s.title,
      description: s.description?.slice(0, 150),
      siteName: 'ocuadua.com',
      images: [
        {
          url: s.coverImage,
          width: 1200,
          height: 630,
          alt: s.title,
        },
      ],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.title,
      description: s.description?.slice(0, 150),
      images: [s.coverImage],
    },
  }
}

export default async function Page({ params }) {
  const { id } =await params
  const story = await API.Story.detail(id)
  return <StoryInfoPage id={id} story={story?.data} />
}
