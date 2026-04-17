import React from 'react'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import IconBtn from "../../../../common/IconBtn"

const PublishCourse = () => {
  const {register, handleSubmit, setValue, getValues} = useForm()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {token} = useSelector((state)=> state.auth)
  const {course} = useSelector((state)=> state.course)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if(course?.status=== COURSE_STATUS.PUBLISHED){
      setValue("public", true)
    }
  }, [course?.status, setValue])
  
  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCoursePublish = async ()=> {
    if(
      (course?.status === COURSE_STATUS.PUBLISHED && getValues("public") === true) ||
      (course?.status === COURSE_STATUS.DRAFT && getValues("public")===false) 
    ){
      goToCourses();
      return
    }

    const formData = new FormData()
    formData.append("courseId", course._id)
    const courseStatus = getValues("public")
      ? COURSE_STATUS.PUBLISHED
      : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)
    setLoading(true)
    const result = await editCourseDetails(formData, token)
    if (result) {
      goToCourses()
    }
    setLoading(false)
  }

  const onSubmit = () => {
    handleCoursePublish()
  }
  return (
    <div className="add-course-panel p-6 sm:p-8">
      <p className="add-course-section-title">
        Publish Settings
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-6 mb-8 rounded-xl border border-[#654334] bg-[#1f1613] p-4">
          <label htmlFor="public" className="inline-flex items-center text-lg text-[#fce4cf]">
            <input
              type="checkbox"
              id="public"
              {...register("public")}
              className="h-4 w-4 rounded border border-[#9a664a] bg-[#2f211a] text-[#f6ab6a] focus:ring-2 focus:ring-[#ffb67f]"
            />
            <span className="ml-2 text-[#e7c7ae]">
              Make this course as public
            </span>
          </label>
        </div>

        <div className="ml-auto flex max-w-max items-center gap-x-4">
          <button
            disabled={loading}
            type="button"
            onClick={goBack}
            className="add-course-secondary-btn flex cursor-pointer items-center gap-x-2 rounded-xl px-[20px] py-[8px] font-semibold"
          >
            Back
          </button>
          <IconBtn disabled={loading} text="Save Changes" />
        </div>
      </form>
    </div>
  )
}

export default PublishCourse