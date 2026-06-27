import React from 'react'
import { Suspense } from 'react'
import ExplorePage from '@/app/component/matches/ExplorePage'
import { Loader2 } from 'lucide-react'

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 size={48} className="animate-spin" /></div>}>
        <ExplorePage/>
      </Suspense>
    </div>
  )
}

export default Page
