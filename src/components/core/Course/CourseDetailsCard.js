import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { toast } from 'react-hot-toast';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { addToCart } from '../../../slices/cartSlice';
import { BiSolidRightArrow } from 'react-icons/bi';
const CourseDetailsCard = ({course, setConfirmationModal, handleBuyCourse}) => {
    const {user} = useSelector((state)=>state.profile);
    const {token} = useSelector((state)=>state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        thumbnail: ThumbnailImage,
        price: CurrentPrice,

    } = course;
    
    const handleAddToCart = () => {
        if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("Instructor cannot buy the course")
            return
        }
        if (token) {
            dispatch(addToCart(course));
            return;
        }
        setConfirmationModal({
            text1:"you are not logged in",
            text2:"Please login to add to cart",
            btn1text:"login",
            btn2Text:"cancel",
            btn1Handler:()=>navigate("/login"),
            btn2Handler: ()=> setConfirmationModal(null),
        })
    }
    
    const handleShare = () => {
        copy(window.location.href);
        toast.success("Link Copied to Clipboard")
    }

    return (
        <div className='flex flex-col gap-4 rounded-xl bg-surface-dim border border-surface-border p-4 text-white'>
        <img 
            src={ThumbnailImage}
            alt='Course thumbnail'
            className='max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full'
        />
        <div className='px-4'>
        <div className='space-x-3 pb-4 text-3xl font-semibold'>
            Rs. {CurrentPrice}
        </div>
        <div className='flex flex-col gap-y-6'>
            <button className='w-full py-3 rounded-lg bg-brand-primary text-white font-semibold hover:opacity-90 transition-all'
                onClick={
                    user && course?.studentsEnrolled.includes(user?._id)
                    ? ()=> navigate("/dashboard/enrolled-courses")
                    : handleBuyCourse
                }
            >
                {
                    user && course?.studentsEnrolled.includes(user?._id) ? "Go to Course ": "Buy Now"
                }
            </button>

        {
            (!course?.studentsEnrolled.includes(user?._id)) && (
                <button onClick={handleAddToCart} className='w-full py-3 rounded-lg bg-surface-light border border-surface-border text-white font-semibold hover:bg-surface-dim transition-all'>
                    Add to Cart
                </button>
            )
        }
        </div>

        <div>
            <p className='pb-3 pt-6 text-center text-sm text-text-muted'>
                30-Day Money-Back Guarantee
            </p> 
        </div>
        <div>
            <p className='my-2 text-xl font-semibold '>
                This Course Includes:
            </p>
            <div className='flex flex-col gap-3 text-sm text-brand-secondary'>
                {
                    JSON.parse(course?.instructions).map((item, index)=> (
                        <p key={index} className='flex gap-2'>
                           <BiSolidRightArrow/>
                            <span>{item}</span>
                        </p>
                    ))
                }
            </div>
        </div>
        <div className='text-center'>
            <button
            className='mx-auto flex items-center gap-2 py-6 text-brand-secondary '
            onClick={handleShare}
            >
                Share
            </button>
        </div>
        </div>
    </div>
  )
}

export default CourseDetailsCard