import { Suspense } from 'react'
import SearchPageClient from './SearchPageClient'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
      <SearchPageClient />
    </Suspense>
  )
}
