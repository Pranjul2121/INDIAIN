import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Chatbot from "./Chatbot";

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Dont show top nav/chatbot on public pages
  const publicPages = ["/", "/signup"];
  if (publicPages.includes(location.pathname)) {
    return children;
  }

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Roadmap", path: "/career-roadmap", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { name: "Authenticity", path: "/profile", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { name: "Skill Gap", path: "/role-analysis", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "Placement Score", path: "/readiness-dashboard", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" },
  ];

  const isDarkMode = location.pathname.includes("readiness");

  return (
    <div className={`min-h-screen relative font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-500 ${theme === 'dark' ? 'bg-[#11131c] text-slate-200' : 'bg-[#fafcff] text-slate-800'}`}>

      {/* 🔮 ULTRA PREMIUM FLOATING NAVIGATION */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'} px-4 sm:px-6`}>
        <div className={`max-w-6xl mx-auto rounded-full border transition-all duration-500 flex items-center justify-between px-6 sm:px-8 py-3 ${scrolled ? (theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl' : 'bg-white/70 border-white/40 backdrop-blur-xl shadow-xl') : 'bg-transparent border-transparent'}`}>

          {/* Logo Mark - Dual Tone */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-indigo-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-orange-500/50 group-hover:scale-105 transition-all">
              {/* Dual Tone Sparkle Icon */}
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className={`text-2xl font-black tracking-tight hidden sm:block ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              INDIA<span className="text-orange-500">IN</span>
            </span>
          </Link>

          {/* Core Routes Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 overflow-hidden group ${isActive ? (theme === 'dark' ? 'text-white' : 'text-indigo-600') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-indigo-500/10 dark:bg-white/10 rounded-full" />
                  )}
                  <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} /></svg>
                  <span className="relative z-10">{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'}`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:text-white hover:bg-rose-600' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
            >
              Sign Out
              <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* FIXED: Prevent children components from slipping underneath navbar */}
      <main className="w-full h-full relative z-0 pt-28 px-4 sm:px-6 lg:px-10">
        {children}
      </main>

      {/* Persistent floating chatbot - available on all pages */}
      <Chatbot />

    </div>
  );
}
