import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { changePassword } from "../../../../services/operations/SettingsAPI"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitPasswordForm)}>
        <div className="my-10 flex flex-col gap-y-6 rounded-2xl border border-surface-border bg-surface-dim/40 p-8 px-12">
          <h2 className="text-xl font-bold text-white mb-4">Password</h2>
          
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="oldPassword" className="text-sm font-medium text-text-light">
                Current Password
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                id="oldPassword"
                placeholder="Enter Current Password"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("oldPassword", { required: true })}
              />
              <span
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showOldPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} className="text-text-muted" />
                ) : (
                  <AiOutlineEye fontSize={24} className="text-text-muted" />
                )}
              </span>
              {errors.oldPassword && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your Current Password.</span>
              )}
            </div>
            
            <div className="relative flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="newPassword" className="text-sm font-medium text-text-light">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                placeholder="Enter New Password"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("newPassword", { required: true })}
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showNewPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} className="text-text-muted" />
                ) : (
                  <AiOutlineEye fontSize={24} className="text-text-muted" />
                )}
              </span>
              {errors.newPassword && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your New Password.</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/my-profile")}
            className="cursor-pointer rounded-lg bg-surface-light border border-surface-border py-3 px-6 font-semibold text-text-main hover:bg-surface-dim hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button type="submit" className="px-8 py-3 text-lg font-semibold bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 transition-colors">
            Update Password
          </button>
        </div>
      </form>
    </>
  )
}