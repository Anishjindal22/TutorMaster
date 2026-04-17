import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { getInstructorData } from '../../../services/operations/profileAPI'
import { sendBroadcastNotification, sendCourseNotification } from '../../../services/operations/notificationAPI'
import IconBtn from '../../common/IconBtn'

const SendNotification = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Add targeted users state later if needed. For now we just implement Broadcast for Admin and Course for Instructor.

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm()

    useEffect(() => {
        const fetchCourses = async () => {
             if (user?.accountType === "Instructor") {
                 setLoading(true);
                 const res = await getInstructorData(token);
                 if (res) {
                     setCourses(res);
                 }
                 setLoading(false);
             }
        }
        fetchCourses();
    }, [user, token])

    const onSubmit = async (data) => {
        if(user?.accountType === "Instructor") {
             const res = await sendCourseNotification({
                 courseId: data.courseId,
                 title: data.title,
                 message: data.message
             }, token);
             
             if(res) reset();
        } else if (user?.accountType === "Admin") {
              const res = await sendBroadcastNotification({
                 title: data.title,
                 message: data.message
             }, token);
             
             if(res) reset();
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
             <h1 className="text-3xl font-medium text-text-main mb-8">Send Notification</h1>

             {loading ? (
                    <div className="spinner"></div>
             ) : (
                 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-surface-dim/40 p-8 rounded-2xl border border-surface-border">
                    {user?.accountType === "Instructor" && (
                         <div className="flex flex-col gap-2">
                             <label htmlFor="courseId" className="text-sm font-medium text-text-light">Select Course <sup className="text-brand-primary">*</sup></label>
                             <select
                                 id="courseId"
                                 className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                                 {...register("courseId", { required: true })}
                             >
                                 <option value="" disabled selected>Choose a course</option>
                                 {courses?.map((course) => (
                                     <option key={course._id} value={course._id}>{course.courseName}</option>
                                 ))}
                             </select>
                             {errors.courseId && <span className="ml-2 text-xs tracking-wide text-[#ff0000]">Course is required</span>}
                         </div>
                    )}

                    <div className="flex flex-col gap-2">
                         <label htmlFor="title" className="text-sm font-medium text-text-light">Notification Title <sup className="text-brand-primary">*</sup></label>
                         <input
                             id="title"
                             placeholder="Enter title"
                             className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                             {...register("title", { required: true })}
                         />
                         {errors.title && <span className="ml-2 text-xs tracking-wide text-[#ff0000]">Title is required</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                         <label htmlFor="message" className="text-sm font-medium text-text-light">Message <sup className="text-brand-primary">*</sup></label>
                         <textarea
                             id="message"
                             rows={5}
                             placeholder="Type your notification message here..."
                             className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200 resize-y"
                             {...register("message", { required: true })}
                         />
                         {errors.message && <span className="ml-2 text-xs tracking-wide text-[#ff0000]">Message is required</span>}
                    </div>

                    <div className="flex justify-end mt-4">
                        <IconBtn 
                            type="submit" 
                            text={user?.accountType === "Admin" ? "Broadcast to All Users" : "Send to Enrolled Students"}
                            customClasses="px-8 py-3 text-lg font-semibold bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 transition-colors"
                        />
                    </div>
                </form>
             )}
        </div>
    )
}

export default SendNotification
