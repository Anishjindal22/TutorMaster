import { toast } from "react-hot-toast"
import { apiConnector } from "../apiconnector"
import { notificationEndpoints } from "../apis"
import { setLoading, setNotifications, setUnreadCount, markSingleAsReadRedux, markAllAsReadRedux } from "../../slices/notificationSlice"

const {
    SEND_COURSE_NOTIFICATION_API,
    SEND_BROADCAST_NOTIFICATION_API,
    SEND_TARGETED_NOTIFICATION_API,
    GET_MY_NOTIFICATIONS_API,
    MARK_NOTIFICATION_READ_API,
    MARK_ALL_NOTIFICATIONS_READ_API,
    GET_UNREAD_COUNT_API
} = notificationEndpoints;

export const sendCourseNotification = async (data, token) => {
    const toastId = toast.loading("Sending notification...")
    let result = false;
    try {
        const response = await apiConnector("POST", SEND_COURSE_NOTIFICATION_API, data, {
            Authorization: `Bearer ${token}`
        })
        if (!response.data.success) {
            throw new Error(response.data.message)
        }
        toast.success("Notification sent successfully")
        result = true;
    } catch (error) {
        console.log("SEND_COURSE_NOTIFICATION_API ERROR............", error)
        toast.error("Could not send notification")
    }
    toast.dismiss(toastId)
    return result;
}

export const sendBroadcastNotification = async (data, token) => {
     const toastId = toast.loading("Sending broadcast...")
    let result = false;
    try {
        const response = await apiConnector("POST", SEND_BROADCAST_NOTIFICATION_API, data, {
            Authorization: `Bearer ${token}`
        })
        if (!response.data.success) {
            throw new Error(response.data.message)
        }
        toast.success("Broadcast sent successfully")
        result = true;
    } catch (error) {
        console.log("SEND_BROADCAST_NOTIFICATION_API ERROR............", error)
        toast.error("Could not send broadcast")
    }
    toast.dismiss(toastId)
    return result;
}

export const sendTargetedNotification = async (data, token) => {
     const toastId = toast.loading("Sending notification...")
    let result = false;
    try {
        const response = await apiConnector("POST", SEND_TARGETED_NOTIFICATION_API, data, {
            Authorization: `Bearer ${token}`
        })
        if (!response.data.success) {
            throw new Error(response.data.message)
        }
        toast.success("Notification sent successfully")
        result = true;
    } catch (error) {
        console.log("SEND_TARGETED_NOTIFICATION_API ERROR............", error)
        toast.error("Could not send targeted notification")
    }
    toast.dismiss(toastId)
    return result;
}

export function fetchNotifications(token, page = 1) {
    return async (dispatch) => {
        dispatch(setLoading(true))
        try {
            const response = await apiConnector("GET", `${GET_MY_NOTIFICATIONS_API}?page=${page}`, null, {
                Authorization: `Bearer ${token}`
            })
            if (!response.data.success) {
                throw new Error(response.data.message)
            }
            dispatch(setNotifications(response.data.data))
        } catch (error) {
            console.log("GET_MY_NOTIFICATIONS_API ERROR............", error)
            toast.error("Could not fetch notifications")
        }
        dispatch(setLoading(false))
    }
}

export function fetchUnreadCount(token) {
     return async (dispatch) => {
        try {
            const response = await apiConnector("GET", GET_UNREAD_COUNT_API, null, {
                Authorization: `Bearer ${token}`
            })
            if (!response.data.success) {
                throw new Error(response.data.message)
            }
            dispatch(setUnreadCount(response.data.count))
        } catch (error) {
            console.log("GET_UNREAD_COUNT_API ERROR............", error)
        }
    }
}

export function markNotificationRead(token, notificationId) {
     return async (dispatch) => {
        try {
            const response = await apiConnector("PUT", `${MARK_NOTIFICATION_READ_API}/${notificationId}`, null, {
                Authorization: `Bearer ${token}`
            })
             if (!response.data.success) {
                throw new Error(response.data.message)
            }
            dispatch(markSingleAsReadRedux(notificationId))
        } catch(error) {
             console.log("MARK_NOTIFICATION_READ_API ERROR............", error)
        }
    }
}

export function markAllNotificationsRead(token) {
     return async (dispatch) => {
         try {
            const response = await apiConnector("PUT", MARK_ALL_NOTIFICATIONS_READ_API, null, {
                Authorization: `Bearer ${token}`
            })
             if (!response.data.success) {
                throw new Error(response.data.message)
            }
            dispatch(markAllAsReadRedux())
            toast.success("Marked all as read")
        } catch(error) {
             console.log("MARK_ALL_NOTIFICATIONS_READ_API ERROR............", error)
        }
    }
}
