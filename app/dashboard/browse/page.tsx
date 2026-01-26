'use client'

import { CourtSearch } from '@/components/court-search'

export default function BrowseCourtPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courts</h1>
        <p className="text-gray-600">Find and book your perfect badminton court</p>
      </div>

      <CourtSearch />
    </div>
  )
}
