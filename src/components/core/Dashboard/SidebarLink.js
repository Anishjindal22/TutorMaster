import React from 'react'
import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"

const SidebarLink = ({link, iconName}) => {
    const Icon = Icons[iconName];
    const location = useLocation();
    const dispatch = useDispatch();

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
      }
      
    const isActive = matchRoute(link.path);

  return (
    <NavLink
    to={link.path}
    onClick={() => dispatch(resetCourseState())} 
    className={`group relative flex items-center gap-x-3 px-6 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden border ${
      isActive
        ? "bg-surface-light border-surface-border text-white"
        : "bg-transparent border-transparent text-text-muted hover:bg-surface-dim hover:text-white"
    }`}
  > 
    {/* Active indicator bar */}
    <span
      className={`absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-[3px] rounded-r-full bg-text-main transition-all duration-300 origin-left ${
        isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 group-hover:scale-y-50 group-hover:opacity-50"
      }`}
    ></span>

    <div className="relative z-10 flex items-center gap-x-3">
        <Icon className={`text-xl transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`} />
        <span className="tracking-wide font-inter">{link.name}</span>
    </div>
  </NavLink>
  )
}

export default SidebarLink
