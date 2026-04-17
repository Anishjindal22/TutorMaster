import { useEffect, useRef, useState } from "react";
import { VscBell } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchNotifications, fetchUnreadCount, markNotificationRead } from "../../services/operations/notificationAPI";
import useOnClickOutside from "../../hooks/useOnClickOutside";

export default function NotificationBell() {
    const { token } = useSelector((state) => state.auth);
    const { unreadCount, notifications } = useSelector((state) => state.notification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useOnClickOutside(ref, () => setOpen(false));

    useEffect(() => {
        if (token) {
            dispatch(fetchUnreadCount(token));
            dispatch(fetchNotifications(token, 1));
            
            // Poll for new notifications every 60 seconds
            const interval = setInterval(() => {
               dispatch(fetchUnreadCount(token));
               // Only fetch full list if open or we want to silently update
               // dispatch(fetchNotifications(token, 1)); 
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [token, dispatch]);

    const handleBellClick = () => {
        setOpen(!open);
        if (!open) {
            dispatch(fetchNotifications(token, 1));
        }
    };

    const handleNotificationClick = (id, read) => {
        if(!read) {
            dispatch(markNotificationRead(token, id));
        }
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleBellClick}
                className="relative flex items-center justify-center text-text-muted hover:text-white transition-colors duration-200 p-2"
            >
                <VscBell className="text-2xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[0.4rem] py-[0.1rem] text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-primary rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] bg-surface-dim border border-surface-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-dark/50">
                        <h3 className="font-semibold text-text-main text-lg">Notifications</h3>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {notifications?.length > 0 ? (
                            notifications.slice(0, 5).map((notif) => (
                                <Link 
                                    to="/dashboard/notifications" 
                                    key={notif._id} 
                                    onClick={() => handleNotificationClick(notif._id, notif.read)}
                                    className={`block p-4 border-b border-surface-border last:border-0 hover:bg-surface-light transition-colors ${!notif.read ? 'bg-brand-primary/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                         {notif.sender?.image && (
                                              <img src={notif.sender.image} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                         )}
                                         <div>
                                            <p className="text-sm font-medium text-text-main mb-1 line-clamp-1">{notif.title}</p>
                                            <p className="text-xs text-text-muted line-clamp-2">{notif.message}</p>
                                         </div>
                                    </div>
                                   {!notif.read && <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full bg-brand-primary -translate-y-1/2 shadow-[0_0_8px_rgba(255,214,10,0.5)]"></div>}
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-text-muted">
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                    
                    <Link 
                        to="/dashboard/notifications" 
                        onClick={() => setOpen(false)}
                        className="p-3 text-center text-sm text-brand-primary hover:text-white hover:bg-brand-primary/20 transition-all font-medium border-t border-surface-border bg-surface-dark/50"
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
}
