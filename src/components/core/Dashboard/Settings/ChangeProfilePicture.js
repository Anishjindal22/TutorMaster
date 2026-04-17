import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture } from "../../../../services/operations/SettingsAPI"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      previewFile(file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      dispatch(updateDisplayPicture(token, formData)).then(() => {
        setLoading(false)
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-dim/40 p-8 px-12 mt-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
          <img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-24 rounded-full object-cover border-4 border-surface-dark"
          />
          <div className="flex flex-col items-center sm:items-start gap-3">
            <p className="text-xl font-bold text-white">Change Profile Picture</p>
            <div className="flex flex-row gap-4 mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/gif, image/jpeg"
              />
              <button
                onClick={handleClick}
                disabled={loading}
                className="cursor-pointer rounded-lg bg-surface-light border border-surface-border py-2 px-6 font-semibold text-text-main hover:bg-surface-dim hover:text-white transition-colors"
                type="button"
              >
                Select Image
              </button>
              <button
                disabled={loading}
                className="cursor-pointer rounded-lg bg-brand-primary text-black py-2 px-6 font-semibold hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
                onClick={handleFileUpload}
                type="button"
              >
                {loading ? "Uploading..." : (
                  <>
                    <span>Upload</span>
                    <FiUpload className="text-lg" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}