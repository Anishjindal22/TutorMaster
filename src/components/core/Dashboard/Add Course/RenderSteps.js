import React, { Fragment } from "react"
import { useSelector } from "react-redux"
import { FaCheck } from "react-icons/fa"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm.js"
import PublishCourse from "./PublishCourse"

const RenderSteps = () => {
  const { step } = useSelector((state) => state.course)

  const steps = [
    { id: 1, title: "Course Information" },
    { id: 2, title: "Course Builder" },
    { id: 3, title: "Publish" },
  ]

  return (
    <div className="w-full">
      <div className="mb-6 flex w-full items-center justify-between gap-2">
        {steps.map((item) => {
          const isCurrent = step === item.id
          const isCompleted = step > item.id

          return (
            <Fragment key={item.id}>
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors " +
                    (isCompleted
                      ? "border-brand-primary bg-brand-primary text-black"
                      : isCurrent
                        ? "border-brand-primary bg-surface-dark text-text-main"
                        : "border-surface-border bg-surface-dark text-text-muted")
                  }
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <FaCheck className="text-sm" /> : item.id}
                </div>
                <p
                  className={
                    "mt-3 hidden text-center text-xs font-medium sm:block " +
                    (step >= item.id ? "text-text-main" : "text-text-muted")
                  }
                >
                  {item.title}
                </p>
              </div>

              {item.id !== steps.length && (
                <div
                  className={
                    "h-px flex-[2] bg-surface-border transition-colors " +
                    (step > item.id ? "bg-brand-primary" : "bg-surface-border")
                  }
                  aria-hidden="true"
                />
              )}
            </Fragment>
          )
        })}
      </div>

      <div className="mt-8">
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuilderForm />}
        {step === 3 && <PublishCourse />}
      </div>
    </div>
  )
}

export default RenderSteps
