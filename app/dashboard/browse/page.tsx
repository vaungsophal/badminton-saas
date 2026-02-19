'use client'

import { CourtSearch } from '@/components/court-search'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BrowseCourtPage() {
  return (
    <div className="pb-20 space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Find Courts</h1>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-500 font-medium text-sm sm:text-base">Discover and book your perfect badminton venue</p>
        </div>
      </div>

      <Link href="/dashboard/browse" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 sm:p-6 text-white shadow-lg shadow-emerald-200 cursor-pointer hover:shadow-xl transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Limited Offer</p>
              <h3 className="text-lg sm:text-xl font-bold">Get 20% Off Your First Booking</h3>
              <p className="text-xs opacity-90">At partner premium clubs</p>
            </div>
            <div className="hidden sm:flex w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute top-[-30%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-[-30%] left-[30%] w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>
      </Link>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <CourtSearch />
      </div>
    </div>
  )
}
