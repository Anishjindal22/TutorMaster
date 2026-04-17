import React, { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { NavbarLinks } from "../../data/navbar-links";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import NotificationBell from "./NotificationBell";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { IoIosArrowDown } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import "./loader.css";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const fetchSublinks = async () => {
    try {
      const result = await apiConnector("GET", categories.CATEGORIES_API);
      const data = result?.data?.data || [];
      setSubLinks(data);
    } catch (error) {
      console.log("Could not fetch the category list", error);
      setSubLinks([]);
    }
  };

  useEffect(() => {
    fetchSublinks();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 flex justify-center ${scrolled ? "py-2" : "py-6"}`}>
      <div className={`flex items-center justify-between w-11/12 max-w-maxContent transition-all duration-300 rounded-2xl px-6 py-3 ${scrolled ? "bg-surface-light/80 backdrop-blur-md border border-surface-border" : "bg-transparent border border-transparent"}`}>
        
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <span className="h-8 w-8 rounded-full border border-text-main text-text-main grid place-items-center font-semibold text-sm">TM</span>
          <span className="text-xl font-semibold tracking-tight text-white">Tutor Master</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-8 text-text-muted font-medium text-sm tracking-wide">
            {NavbarLinks.map((link, index) => (
              <li key={index} className="relative group">
                {link.title === "Catalog" ? (
                  <div className="flex items-center gap-1 cursor-pointer transition-colors hover:text-brand-secondary">
                    <p>{link.title}</p>
                    <IoIosArrowDown className="transition-transform duration-300 group-hover:-rotate-180" />

                    <div className="absolute top-full right-1/2 translate-x-1/2 pt-5 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50">
                      <div className="relative flex flex-col rounded-xl bg-surface-dim border border-surface-border shadow-2xl p-2 w-[280px] overflow-hidden">
                        
                        {subLinks && subLinks.length > 0 ? (
                          subLinks.map((subLink, index) => (
                            <Link
                              className="relative overflow-hidden rounded-lg px-4 py-3 text-text-main transition-all hover:bg-surface-light group/link"
                              to={`catalog/${subLink.name}`}
                              key={index}
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-text-muted opacity-0 group-hover/link:opacity-100 transition-opacity"></span>
                                {subLink.name}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <div className="flex justify-center p-4"><span className="loader"></span></div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path} className="relative py-1 flex flex-col">
                    <p className={`transition-colors duration-300 hover:text-text-main ${matchRoute(link?.path) ? "text-text-main" : ""}`}>
                      {link.title}
                    </p>
                    {/* Active Route Indicator */}
                    <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full bg-brand-secondary transition-transform duration-300 origin-left ${matchRoute(link?.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 opacity-50"}`}></span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login/SignUp/Dashboard */}
        <div className="hidden md:flex gap-x-4 items-center">
          {user && user?.accountType !== "Instructor" && (
            <Link to="/dashboard/cart" className="relative group p-2">
              <AiOutlineShoppingCart className="text-2xl text-text-muted group-hover:text-brand-secondary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-brand-accent text-xs font-bold text-white shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {token === null && (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="px-5 py-2 text-sm font-medium text-text-main hover:text-brand-secondary transition-colors">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-5 py-2 text-sm font-medium text-white bg-surface-light rounded-lg border border-surface-border hover:bg-surface-dim transition-colors">
                  Sign Up
                </button>
              </Link>
            </div>
          )}

          {token !== null && <NotificationBell />}
          {token !== null && <ProfileDropDown />}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-text-main text-2xl hover:text-brand-secondary transition-colors">
          <RxHamburgerMenu />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
