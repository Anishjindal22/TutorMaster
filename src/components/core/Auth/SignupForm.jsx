import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Tab from "../../common/Tab"

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return
    }
    const signupData = {
      ...formData,
      accountType,
    }

    dispatch(setSignupData(signupData))
    dispatch(sendOtp(formData.email, navigate))

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setAccountType(ACCOUNT_TYPE.STUDENT)
  }

  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ]

  return (
    <div className="mt-8">
      <div className="mb-6">
        <Tab tabData={tabData} field={accountType} setField={setAccountType} />
      </div>
      
      <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-5">
        <div className="flex gap-x-4">
          <label className="w-1/2">
            <p className="mb-2 text-sm font-medium text-text-main">
              First Name <sup className="text-brand-accent text-lg">*</sup>
            </p>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              placeholder="First name"
              className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 focus:shadow-glow"
            />
          </label>
          <label className="w-1/2">
            <p className="mb-2 text-sm font-medium text-text-main">
              Last Name <sup className="text-brand-accent text-lg">*</sup>
            </p>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              placeholder="Last name"
              className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 focus:shadow-glow"
            />
          </label>
        </div>
        <label className="w-full">
          <p className="mb-2 text-sm font-medium text-text-main">
            Email Address <sup className="text-brand-accent text-lg">*</sup>
          </p>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 focus:shadow-glow"
          />
        </label>
        <div className="flex flex-col md:flex-row gap-4">
          <label className="relative w-full md:w-1/2">
            <p className="mb-2 text-sm font-medium text-text-main">
              Create Password <sup className="text-brand-accent text-lg">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Password"
              className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 pr-10 focus:shadow-glow"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[40px] z-[10] cursor-pointer text-text-muted hover:text-white transition-colors"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={22} />
              ) : (
                <AiOutlineEye fontSize={22} />
              )}
            </span>
          </label>
          <label className="relative w-full md:w-1/2">
            <p className="mb-2 text-sm font-medium text-text-main">
              Confirm Password <sup className="text-brand-accent text-lg">*</sup>
            </p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleOnChange}
              placeholder="Confirm"
              className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 pr-10 focus:shadow-glow"
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[40px] z-[10] cursor-pointer text-text-muted hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={22} />
              ) : (
                <AiOutlineEye fontSize={22} />
              )}
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-6 rounded-xl bg-brand-primary py-3.5 px-4 font-bold text-black hover:opacity-90 hover:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Create Account
        </button>
      </form>
    </div>
  )
}

export default SignupForm