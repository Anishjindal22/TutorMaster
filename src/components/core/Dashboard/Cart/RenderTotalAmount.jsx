import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom"
import IconBtn from '../../../common/IconBtn';
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI"

const RenderTotalAmount = () => {

    const {total, cart} = useSelector((state) => state.cart);
    
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleBuyCourse = () => {
        const courses = cart.map((course) => course._id);
        buyCourse(token, courses, user, navigate, dispatch)
    }
  return (
    <div className="min-w-[280px] rounded-xl border border-surface-border bg-surface-dim p-6">
      <p className="mb-1 text-sm font-medium text-text-muted">Total:</p>
      <p className="mb-6 text-3xl font-medium text-brand-secondary">₹ {total}</p>
      <IconBtn
        text="Buy Now"
        onclick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  )
}

export default RenderTotalAmount
