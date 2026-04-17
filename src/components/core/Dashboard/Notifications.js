import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../../services/operations/notificationAPI'
import { formatDate } from '../../../services/formatDate'

const Notifications = () => {
    const { token } = useSelector((state) => state.auth)
    const { notifications, loading } = useSelector((state) => state.notification)
    const dispatch = useDispatch()
    const [page] = useState(1);

    useEffect(() => {
        dispatch(fetchNotifications(token, page))
    }, [dispatch, token, page])

    const handleMarkAllRead = () => {
        dispatch(markAllNotificationsRead(token))
    }

    const handleMarkAsRead = (id) => {
        dispatch(markNotificationRead(token, id))
    }

    return (
        <div>
            <div className="mb-14 flex items-center justify-between">
                <h1 className="text-3xl font-medium text-text-main">Notifications</h1>
                <button 
                    onClick={handleMarkAllRead}
                    className="text-sm font-medium text-brand-primary hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-surface-light border border-transparent hover:border-surface-border"
                >
                    Mark all as read
                </button>
            </div>

            {loading && page === 1 ? (
                 <div className="grid min-h-[200px] place-items-center">
                    <div className="spinner"></div>
                 </div>
            ) : notifications?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-surface-dim/30 border border-surface-border rounded-2xl">
                    <p className="text-xl text-text-muted">You have no notifications.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {notifications?.map((notif) => (
                        <div 
                            key={notif._id}
                            onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${notif.read ? 'bg-surface-dim/30 border-surface-border/50 hover:bg-surface-dim' : 'bg-surface-dim border-brand-primary/30 shadow-[0_4px_24px_-8px_rgba(255,214,10,0.15)] cursor-pointer hover:-translate-y-1'}`}
                        >
                             <div className="flex-shrink-0">
                                {notif.sender?.image ? (
                                    <img src={notif.sender.image} alt={notif.sender.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-surface-border" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-surface-border flex items-center justify-center text-xl font-bold font-inter text-text-muted">
                                        {notif.type === 'admin_broadcast' ? 'A' : 'S'}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                     <h3 className={`text-lg font-semibold truncate ${notif.read ? 'text-text-main' : 'text-white'}`}>{notif.title}</h3>
                                     <span className="text-xs text-text-muted whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                                </div>
                                <p className={`text-sm ${notif.read ? 'text-text-muted' : 'text-text-light'} leading-relaxed`}>{notif.message}</p>
                                {notif.courseId && (
                                     <p className="text-xs text-brand-primary mt-2 inline-block px-2 py-1 bg-brand-primary/10 rounded-md">Course: {notif.courseId.courseName}</p>
                                )}
                            </div>
                            
                            {!notif.read && (
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-4">
                                     <div className="w-3 h-3 bg-brand-primary rounded-full shadow-[0_0_12px_rgba(255,214,10,0.8)] animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Add pagination controls here if desired for > 10 */}
                </div>
            )}
        </div>
    )
}

export default Notifications
