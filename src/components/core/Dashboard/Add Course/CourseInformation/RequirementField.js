import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useState } from 'react'
const RequirementField = ({
    name,
    label,
    register,
    setValue,
    errors,
    getValues,
}) => {
    const {course, editCourse} = useSelector((state)=> state.course)
    const [requirement, setRequirement] = useState("")
    const [requirementsList, setRequirementsList] = useState([]) 

    useEffect(() => { 
      if(editCourse){
        setRequirementsList(JSON.parse(course?.instructions));
      }
      register(name, {required:true, validate: (value)=> value.length > 0 })
      
    }, [course?.instructions, editCourse, name, register])

    useEffect(() => {
        setValue(name, requirementsList)
    }, [name, requirementsList, setValue])
    
    const handleAddRequirement = () => {
        if(requirement){
            setRequirementsList([...requirementsList,requirement])
            setRequirement("")
        }
    }

    const handleRemoveRequirement = (index) => {
        const updatedRequirements = [...requirementsList]
        updatedRequirements.splice(index, 1)
        setRequirementsList(updatedRequirements)
    }

  return (
    <div className="flex flex-col space-y-2">
      <label className="add-course-label" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="add-course-input w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          className="rounded-lg border border-[#a06e50] px-3 py-1.5 text-sm font-semibold text-[#ffbc87] transition hover:bg-[#2f1f19]"
        >
          Add
        </button>
      </div>
      
      
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc rounded-xl border border-[#5c3a2d] bg-[#201713] p-4">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-[#f5dfcc]">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs uppercase tracking-wide text-[#d8b39c]"
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}

export default RequirementField