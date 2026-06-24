import React from 'react'
import Hero from '@/app/component/Contact/Hero'
import FeatureCards from '@/app/component/Contact/FeatureCards'
import ContactSection from '@/app/component/Contact/ContactSection'
import VisitSection from '@/app/component/Contact/VisitSection'
import OurOffice from '@/app/component/Contact/OurOffice'
import Message from '@/app/component/Contact/Message'

const page = () => {
  return (
    <div className='w-full'>
      <Hero />
      <FeatureCards />
      <ContactSection/>
      <VisitSection />
      <OurOffice />
      <Message />
    </div>
  )
}

export default page
