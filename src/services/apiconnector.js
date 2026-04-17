import axios from "axios"

export const axiosInstance = axios.create({
  withCredentials: true,
})

let interceptorRegistered = false

function registerAuthInterceptorOnce() {
  if (interceptorRegistered) return
  interceptorRegistered = true

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      if (status === 401) {
        // If auth expires or becomes invalid, force a clean login.
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        const currentPath = window.location?.pathname || ""
        if (currentPath.startsWith("/dashboard")) {
          window.location.href = "/login"
        }
      }

      return Promise.reject(error)
    }
  )
}

registerAuthInterceptorOnce()

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : {},
    params: params ? params : null,
  })
}
