import React from 'react'
import Hero from '@/app/component/About/Hero'
import Story from '@/app/component/About/Story'
import MissionValues from '@/app/component/About/MissionValues'
import OurApproach from '@/app/component/About/OurApproach'
import Journey from '@/app/component/About/Journey'

const page = () => {
  return (
    <div className='bg-white'>
      <Hero />
      <Story />
      <MissionValues />
      <OurApproach/>
      <Journey />
    </div>
  )
}

export default page
