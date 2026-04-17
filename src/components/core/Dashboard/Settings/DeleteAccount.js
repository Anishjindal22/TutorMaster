import { FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { deleteProfile } from "../../../../services/operations/SettingsAPI"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleDeleteAccount() {
    try {
      dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <div className="my-10 flex flex-col sm:flex-row gap-6 items-start rounded-2xl border border-red-900/50 bg-red-950/20 p-8 px-12">
        <div className="flex shrink-0 h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
          <FiTrash2 className="text-3xl text-red-500" />
        </div>
        <div className="flex flex-col space-y-3 flex-1">
          <h2 className="text-xl font-bold text-white">
            Delete Account
          </h2>
          <div className="text-text-muted space-y-1">
            <p>Would you like to delete your account?</p>
            <p className="text-sm">
              This account may contain Paid Courses. Deleting your account is
              permanent and will remove all the content associated with it.
            </p>
          </div>
          <button
            type="button"
            className="w-fit cursor-pointer font-semibold text-red-500 hover:text-red-400 transition-colors mt-2"
            onClick={handleDeleteAccount}
          >
            I want to delete my account.
          </button>
        </div>
      </div>
    </>
  )
}