import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RiEditBoxLine } from "react-icons/ri"
import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"
const MyProfile = () => {
    const {user} = useSelector((state)=> state.profile)
    const navigate = useNavigate();
    
  return (
    <div className="animate-fade-in">
    <h1 className="mb-10 text-4xl font-extrabold text-white tracking-tight">
      My Profile
    </h1>
    
    {/* Profile Header Card */}
    <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-dim p-8 sm:px-12 mb-10 transition-all duration-300">
      <div className="flex items-center gap-x-6">
        <div className="relative">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[80px] sm:w-[100px] rounded-full object-cover border-2 border-surface-border"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-white">
            {user?.firstName + " " + user?.lastName}
          </p>
          <p className="text-sm font-medium text-text-muted">{user?.email}</p>
        </div>
      </div>
      <div>
        <IconBtn
          text="Edit Profile"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
          customClasses="hidden sm:flex bg-surface-light border border-surface-border"
        >
          <RiEditBoxLine className="text-lg" />
        </IconBtn>
      </div>
    </div>

    {/* About Card */}
    <div className="flex flex-col gap-y-6 rounded-2xl border border-surface-border bg-surface-dim p-8 sm:px-12 mb-10">
      <div className="flex w-full items-center justify-between">
        <p className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-text-main"></span>
          Biography
        </p>
        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
          customClasses="bg-surface-light border border-surface-border"
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>
      <p
        className={`${
          user?.additionalDetails?.about
            ? "text-text-main"
            : "text-text-muted italic"
        } text-base font-light leading-relaxed max-w-3xl`}
      >
        {user?.additionalDetails?.about ?? "No biography set. Write something about your journey."}
      </p>
    </div>

    {/* Personal Details Card */}
    <div className="flex flex-col gap-y-8 rounded-2xl border border-surface-border bg-surface-dim p-8 sm:px-12 mb-10">
      <div className="flex w-full items-center justify-between border-b border-surface-border pb-6">
        <p className="text-xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-text-main"></span>
          Personal Intel
        </p>
        <IconBtn
          text="Edit"
          onclick={() => {
            navigate("/dashboard/settings")
          }}
          customClasses="bg-surface-light border border-surface-border"
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 max-w-[800px]">
        {/* Left Column */}
        <div className="flex flex-col gap-y-8">
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-secondary transition-colors">First Name</p>
            <p className="text-base font-medium text-white">
              {user?.firstName}
            </p>
          </div>
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-secondary transition-colors">Email Address</p>
            <p className="text-base font-medium text-white break-all">
              {user?.email}
            </p>
          </div>
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-secondary transition-colors">Gender</p>
            <p className="text-base font-medium text-white">
              {user?.additionalDetails?.gender ?? "Unspecified"}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-y-8">
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-primary transition-colors">Last Name</p>
            <p className="text-base font-medium text-white">
              {user?.lastName}
            </p>
          </div>
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-primary transition-colors">Phone Number</p>
            <p className="text-base font-medium text-white">
              {user?.additionalDetails?.contactNumber ?? "Unspecified"}
            </p>
          </div>
          <div className="group/item">
            <p className="mb-1 text-xs uppercase tracking-wider font-semibold text-text-muted group-hover/item:text-brand-primary transition-colors">Date Of Birth</p>
            <p className="text-base font-medium text-white">
              {formattedDate(user?.additionalDetails?.dateOfBirth) ??
                "Unspecified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default MyProfile