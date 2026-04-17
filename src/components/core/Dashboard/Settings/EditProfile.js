import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/SettingsAPI"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitProfileForm)}>
        <div className="my-10 flex flex-col gap-y-6 rounded-2xl border border-surface-border bg-surface-dim/40 p-8 px-12">
          <h2 className="text-xl font-bold text-white mb-4">
            Profile Information
          </h2>
          
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="firstName" className="text-sm font-medium text-text-light">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter first name"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("firstName", { required: true })}
                defaultValue={user?.firstName}
              />
              {errors.firstName && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your first name.</span>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="lastName" className="text-sm font-medium text-text-light">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter last name"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("lastName", { required: true })}
                defaultValue={user?.lastName}
              />
              {errors.lastName && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your last name.</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-text-light">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("dateOfBirth", {
                  required: { value: true, message: "Please enter your Date of Birth." },
                  max: { value: new Date().toISOString().split("T")[0], message: "Date of Birth cannot be in the future." },
                })}
                defaultValue={user?.additionalDetails?.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <span className="-mt-1 text-[12px] text-brand-primary">{errors.dateOfBirth.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="gender" className="text-sm font-medium text-text-light">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("gender", { required: true })}
                defaultValue={user?.additionalDetails?.gender}
              >
                {genders.map((ele, i) => (
                    <option key={i} value={ele}>{ele}</option>
                ))}
              </select>
              {errors.gender && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your gender.</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="contactNumber" className="text-sm font-medium text-text-light">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                placeholder="Enter Contact Number"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("contactNumber", {
                  required: { value: true, message: "Please enter your Contact Number." },
                  maxLength: { value: 12, message: "Invalid Contact Number" },
                  minLength: { value: 10, message: "Invalid Contact Number" },
                })}
                defaultValue={user?.additionalDetails?.contactNumber}
              />
              {errors.contactNumber && (
                <span className="-mt-1 text-[12px] text-brand-primary">{errors.contactNumber.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="about" className="text-sm font-medium text-text-light">
                About
              </label>
              <input
                type="text"
                name="about"
                id="about"
                placeholder="Enter Bio Details"
                className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                {...register("about", { required: true })}
                defaultValue={user?.additionalDetails?.about}
              />
              {errors.about && (
                <span className="-mt-1 text-[12px] text-brand-primary">Please enter your About.</span>
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
            Save Changes
          </button>
        </div>
      </form>
    </>
  )
}