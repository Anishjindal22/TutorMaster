import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { VscSignOut } from "react-icons/vsc"
import SidebarLink from './SidebarLink'
import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from '../../common/ConfirmationModal'
import { useState } from 'react'
const Sidebar = () => {

    const { user, loading: profileLoading } = useSelector(
        (state) => state.profile
      )
      const { loading: authLoading } = useSelector((state) => state.auth)
      const dispatch = useDispatch()
      const navigate = useNavigate()
      // to keep track of confirmation modal
      const [confirmationModal, setConfirmationModal] = useState(null)

      if (profileLoading || authLoading) {
        return (
          <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-surface-border bg-surface-dim/50 backdrop-blur-md">
            <div className="spinner"></div>
          </div>
        )
      }

  return (
    <>
        <div className='flex h-[calc(100vh-3.5rem)] min-w-[240px] flex-col border-r border-surface-border bg-surface-dim py-10 z-20 overflow-y-auto custom-scrollbar sticky top-14 left-0'>
            <div className='flex flex-col gap-2 px-4'>
                {sidebarLinks.map((link)=>{
                        if (link.type && user?.accountType !== link.type) return null;
                        return <SidebarLink key={link.id} link={link} iconName = {link.icon}/>
                        })}
            </div>

            <div className="mx-auto my-8 h-[1px] w-10/12 bg-surface-border" />

            <div className='flex flex-col gap-2 px-4'>
                <SidebarLink link={{name:"Settings", path:"/dashboard/settings"}} iconName="VscSettingsGear" />
                <button onClick={()=> {
                    setConfirmationModal({
                        text1: "Sign Out",
                        text2: "Are you sure you want to exit your workspace?",
                        btn1Text: "Logout",
                        btn2Text: "Cancel",
                        btn1Handler: ()=> dispatch(logout(navigate)),
                        btn2Handler: ()=> setConfirmationModal(null),
                    })
                }}
                className="group relative flex items-center gap-x-3 px-6 py-3 text-sm font-medium text-text-muted transition-all duration-300 hover:text-white rounded-xl hover:bg-surface-light border border-transparent hover:border-surface-border overflow-hidden">
                  <VscSignOut className="text-xl" />
                  <span className="tracking-wide font-inter">Logout</span>
                </button>
            </div>
        </div>
        {confirmationModal && <ConfirmationModal modalData={confirmationModal}/>}
    </>
  )
}

export default Sidebar