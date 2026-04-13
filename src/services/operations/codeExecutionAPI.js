import { toast } from "react-hot-toast"
import { apiConnector } from "../apiconnector"
import { codeEndpoints } from "../apis"
import {
  setCode,
  setCodeError,
  setExecutionLoading,
  setGenerateLoading,
  setOutput,
} from "../../slices/codeExecutorSlice"

const { EXECUTE_CODE_API, GENERATE_CODE_API } = codeEndpoints

function getAuthHeaders(getState) {
  const stateToken = getState()?.auth?.token
  const storageToken = JSON.parse(localStorage.getItem("token") || "null")
  const token = (stateToken || storageToken || "").toString().replace(/^"|"$/g, "").trim()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function runCode(language, code, stdin) {
  return async (dispatch, getState) => {
    const toastId = toast.loading("Running code...")
    dispatch(setExecutionLoading(true))
    dispatch(setCodeError(null))

    try {
      const headers = getAuthHeaders(getState)

      const response = await apiConnector(
        "POST",
        EXECUTE_CODE_API,
        { language, code, stdin },
        headers
      )

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Code execution failed")
      }

      const result = response.data.result || {}
      const output =
        result.stdout || result.compileOutput || result.stderr || result.message || "No output"

      dispatch(setOutput(output))
      toast.success("Execution complete")
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Unable to execute code"
      dispatch(setCodeError(errorMessage))
      dispatch(setOutput(errorMessage))
      toast.error(errorMessage)
    } finally {
      dispatch(setExecutionLoading(false))
      toast.dismiss(toastId)
    }
  }
}

export function generateCode(language, prompt) {
  return async (dispatch, getState) => {
    const toastId = toast.loading("Generating starter code...")
    dispatch(setGenerateLoading(true))
    dispatch(setCodeError(null))

    try {
      const headers = getAuthHeaders(getState)

      const response = await apiConnector(
        "POST",
        GENERATE_CODE_API,
        { language, prompt },
        headers
      )

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Code generation failed")
      }

      dispatch(setCode(response.data.code || ""))
      toast.success("Starter code generated")
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Unable to generate code"
      dispatch(setCodeError(errorMessage))
      toast.error(errorMessage)
    } finally {
      dispatch(setGenerateLoading(false))
      toast.dismiss(toastId)
    }
  }
}
