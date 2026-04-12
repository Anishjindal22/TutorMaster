import { useSelector } from "react-redux"

import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ title, description1, description2, formType }) {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-20 bg-surface-dark">

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto flex w-11/12 max-w-maxContent items-center justify-center">
          
          <div className="w-full max-w-[520px] p-8 rounded-2xl bg-surface-light border border-surface-border">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
            <p className="mt-4 text-base font-inter">
              <span className="text-text-muted block">{description1}</span>{" "}
              <span className="font-display font-medium text-text-main block mt-1">
                {description2}
              </span>
            </p>
            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </div>
          
        </div>
      )}
    </div>
  )
}

export default Template