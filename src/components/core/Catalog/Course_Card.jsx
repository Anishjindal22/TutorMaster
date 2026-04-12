import React, { useEffect, useState } from 'react'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating';
import { Link } from 'react-router-dom';

const CourseCard = ({course, Height}) => {


    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(()=> {
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgReviewCount(count);
    },[course])


    
  return (
    <div className='w-full'>
        <Link to={`/courses/${course._id}`}>
            <div className='bg-surface-dim/40 border border-surface-border rounded-xl overflow-hidden hover:shadow-glow-cyan transition-all duration-300'>
                <div className="rounded-t-xl overflow-hidden relative group">
                    <img 
                        src={course?.thumbnail}
                        alt='course thumbnail'
                        className={`${Height} w-full object-cover group-hover:scale-105 transition-transform duration-500`}
                    />
                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col gap-3 p-5">
                    <p className="text-xl font-bold text-white line-clamp-1 group-hover:text-brand-secondary transition-colors duration-200">{course?.courseName}</p>
                    <p className="text-sm font-medium text-text-muted">{course?.instructor?.firstName} {course?.instructor?.lastName} </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-secondary font-bold">{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount} />
                        <span className="text-xs text-text-faint">{course?.ratingAndReviews?.length || 0} Ratings</span>
                    </div>
                    <p className="text-xl font-extrabold text-white mt-2">₹{course?.price}</p>
                </div>
            </div>
        </Link>
    </div>
  )
}

export default CourseCard
