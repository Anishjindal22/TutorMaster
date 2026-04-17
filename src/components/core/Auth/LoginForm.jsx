import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import {login} from "../../../services/operations/authAPI"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <form
      onSubmit={handleOnSubmit}
      className="mt-8 flex w-full flex-col gap-y-5 flex-grow"
    >
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
      <label className="relative">
        <p className="mb-2 text-sm font-medium text-text-main">
          Password <sup className="text-brand-accent text-lg">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter Password"
          className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all placeholder-text-faint text-white p-3.5 pr-12 focus:shadow-glow"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-[40px] z-[10] cursor-pointer text-text-muted hover:text-white transition-colors"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible fontSize={22} />
          ) : (
            <AiOutlineEye fontSize={22} />
          )}
        </span>
        <Link to="/forgot-password">
          <p className="mt-2 ml-auto max-w-max text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors">
            Forgot Password?
          </p>
        </Link>
      </label>
      <button
        type="submit"
        className="mt-4 rounded-xl bg-brand-primary py-3.5 px-4 font-bold text-black hover:opacity-90 hover:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
      >
        Sign In
      </button>
    </form>
  )
}

export default LoginForm