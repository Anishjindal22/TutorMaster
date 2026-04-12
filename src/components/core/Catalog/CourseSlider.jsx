import React from 'react'

import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import 'swiper/css/navigation';
import { Autoplay,FreeMode,Navigation, Pagination}  from 'swiper/modules'

import CourseCard from './Course_Card'

const CourseSlider = ({Courses}) => {
  return (
    <>
        {
            Courses?.length ? (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={30}
                    loop={true}
                    navigation={true} 
                    pagination={{ clickable: true, dynamicBullets: true }}
                    modules={[FreeMode, Pagination, Navigation, Autoplay]}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        }
                    }}
                    className="pb-12 pt-4 px-2 custom-swiper-nav"
                >
                    {
                        Courses?.map((course, index)=> (
                            <SwiperSlide key={index} className="h-auto md:h-full">
                                <CourseCard course={course} Height={"h-[250px]"} />
                            </SwiperSlide>
                        ))
                    }   
                </Swiper>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-16 h-16 rounded-full bg-surface-dim flex items-center justify-center border border-surface-border">
                        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-xl font-semibold text-text-muted">No Courses Found in this Category</p>
                </div>
            )

        }
    </>
  )
}

export default CourseSlider
