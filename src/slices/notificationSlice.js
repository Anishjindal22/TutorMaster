import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    markSingleAsReadRedux: (state, action) => {
       const id = action.payload;
       state.notifications = state.notifications.map(notif => 
           notif._id === id ? { ...notif, read: true } : notif
       );
       state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAllAsReadRedux: (state) => {
        state.notifications = state.notifications.map(notif => ({ ...notif, read: true }));
        state.unreadCount = 0;
    }
  },
});

export const { setNotifications, setUnreadCount, setLoading, markSingleAsReadRedux, markAllAsReadRedux } = notificationSlice.actions;
export default notificationSlice.reducer;
