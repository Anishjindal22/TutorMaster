import React from 'react'
import Quote from '../components/core/AboutPage/Quote'
import StatsComponent from '../components/core/AboutPage/Stats'
import LearningGrid from '../components/core/AboutPage/LearningGrid'
import ContactFormSection from '../components/core/AboutPage/ContactFormSection'
import Footer from '../components/common/Footer'
import ReviewSlider from "../components/common/ReviewSlider"

const About = () => {
  return (
    <div className='bg-surface-dark min-h-screen text-text-main font-inter'>
      <section className='border-b border-surface-border bg-surface-dim/40'>
        <div className='mx-auto flex w-11/12 max-w-maxContent flex-col gap-8 py-24 text-white'>
            <header className='text-4xl lg:text-5xl font-bold tracking-tight'>
                About Tutor Master
            </header>
            <p className='text-lg text-text-muted leading-relaxed max-w-4xl'>
              Tutor Master helps learners build practical software skills through structured courses, real projects, and consistent feedback. Our focus is clarity, simplicity, and outcomes.
            </p>
        </div>
      </section>

      {/* section 2 */}

      <section className='border-b border-surface-border bg-surface-dark py-6'>
        <div className='mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-text-muted'>   
            <Quote/>
        </div>
      </section>


      {/* section 3 */}

      <section>
        <div className='mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-12 text-text-muted mt-16 lg:mt-20 pb-12'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                <div className='flex flex-col gap-4'>
                    <h2 className='text-3xl font-semibold text-white'>Our Vision</h2>
                    <p className='text-base leading-relaxed'>To make quality technical education accessible and understandable for every learner, regardless of background.</p>
                </div>
                <div className='flex flex-col gap-4'>
                    <h2 className='text-3xl font-semibold text-white'>Our Mission</h2>
                    <p className='text-base leading-relaxed'>Provide practical learning paths, mentor-backed support, and a focused platform where learners can build confidence through real work.</p>
                </div>
            </div>
        </div>
      </section>  

      <div className="border-t border-b border-surface-border bg-surface-dim/30">
        <StatsComponent/>  
      </div>
      
      <section className='mx-auto mt-24 mb-16 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white'>
        <LearningGrid />
        <ContactFormSection />
      </section>

      <div className="mx-auto my-24 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-surface-dark text-white p-12 rounded-3xl border border-surface-border">
        <h1 className="text-center text-4xl font-extrabold mt-8">
          Reviews from other learners
        </h1>
        <div className="w-full">
            <ReviewSlider />
        </div>
      </div>
      <Footer />

    </div>
  )
}

export default About
