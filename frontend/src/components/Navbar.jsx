import React, { useState, useEffect, useRef } from "react";
import Logo from '../assets/logo/logo.png';
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


function Navbar({ setView, setIsLoggedIn, user }) {
  // State management
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("teams");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen, mobileMenuOpen]);

  // Handle navigation click
  const handleNavClick = (view) => {
    setView(view);
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const role = user?.rol?.toLowerCase();

  // Navigation items
  const navItems = [
    {
      id: 'teams',
      label: 'Equipos',
      visible: ['admin', 'engineer'].includes(role)
    },
    {
      id: 'drivers',
      label: 'Conductores',
      visible: role === 'admin'
    },
    {
      id: 'sponsors',
      label: 'Patrocinadores',
      visible: ['admin', 'engineer'].includes(role)
    },
    {
      id: 'parts',
      label: 'Partes',
      visible: ['admin', 'engineer'].includes(role)
    },
    {
      id: 'inventory',
      label: 'Inventario',
      visible: ['admin', 'engineer'].includes(role)
    },
    {
      id: 'setup',
      label: 'Armado',
      visible: ['admin', 'engineer'].includes(role)
    }
  ].filter(item => item.visible);

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setIsLoggedIn(false);
      navigate('/login');
    }

    catch (e) {
      console.error('Error during logout:', e);
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const SimulationButton = ({ isMobile }) => (
    <button
      onClick={() => {
        navigate('/simulation');
        if (isMobile) setMobileMenuOpen(false);
      }}
      className={`group relative flex items-center justify-center transition-all duration-1000 bg-transparent
        ${isMobile ? "w-full px-6 py-3 text-left" : ""}`}
    >
      <style>
        {`
          @keyframes lineBreath {
            0%, 100% { width: 30%; opacity: 0.1; }
            50% { width: 80%; opacity: 0.4; }
          }
          .animate-line-breath {
            animation: lineBreath 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}
      </style>

      <span className={`relative z-10 flex items-center tracking-[-0.08em] uppercase italic
        ${isMobile 
          ? "text-xs font-medium tracking-widest uppercase" 
          : "text-[1.5rem] font-[1000]"}`}>
        
        <span className="relative inline-block overflow-visible">
          <span className="text-slate-300 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-[#E10600] group-hover:drop-shadow-[0_0_15px_rgba(225,6,0,0.5)]">
            Simulación
          </span>

          {!isMobile && (
            <span className="absolute inset-0 text-[#E10600] opacity-0 group-hover:opacity-20 translate-x-0 translate-y-0 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-all duration-[1.2s] ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none">
              Simulación
            </span>
          )}

          {!isMobile && (
            <div className="absolute -bottom-1 left-0 w-full h-[1px] flex justify-center items-center">
              <div className="h-full bg-gradient-to-r from-transparent via-red-600 to-transparent animate-line-breath group-hover:opacity-0 transition-opacity duration-500"></div>
              
              <div className="absolute inset-0 flex justify-center">
                <div className="w-0 group-hover:w-full h-full bg-gradient-to-r from-transparent via-[#E10600] to-transparent transition-all duration-[1.1s] ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
              </div>
            </div>
          )}
        </span>

        <div className="relative ml-3 flex items-center">
          <svg 
            className={`transition-all duration-[1s] ease-[cubic-bezier(0.23,1,0.32,1)]
              ${isMobile 
                ? "w-9 h-9 text-[#E10600]" 
                : "w-11 h-11 text-slate-500 group-hover:text-[#E10600] group-hover:scale-110 group-hover:rotate-[10deg]"}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          
          {!isMobile && (
            <div className="absolute top-0 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-700 shadow-[0_0_10px_#fff]"></div>
          )}
        </div>
      </span>
    </button>
  );

  return (
    <nav className="relative">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/20 backdrop-blur-xl"></div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        
        {/* Mobile Layout */}
        <div className="min-[1500px]:hidden flex flex-col items-center gap-4">
          {/* Logo - Centered */}
          <div className="flex-shrink-0 group cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src={Logo} 
              alt="F1 Garage Manager" 
              className="h-8 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_16px_rgba(239,68,68,0.3)]"
            />
          </div>

          {/* Mobile Controls - Centered */}
          <div className="flex items-center gap-4">
            
            {/* Menu Button */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/20 hover:bg-slate-900/30 transition-all duration-300 group border border-slate-700/30"
              >
                <svg className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-xs font-medium tracking-widest uppercase text-slate-400 group-hover:text-slate-300 transition-colors">Funciones</span>
              </button>

              {/* Funciones Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/50 shadow-2xl py-2 z-50 overflow-hidden">
                  {role === "admin" && <SimulationButton isMobile={true} />}
                  <div className="h-px bg-slate-800/50 my-1"></div>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full px-6 py-3 text-left text-xs font-medium tracking-widest uppercase transition-all duration-200 ${
                        activeView === item.id
                          ? "text-white bg-slate-900/40 border-l-2 border-red-600"
                          : "text-slate-400 hover:text-white hover:bg-slate-900/20"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown Button - Mobile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-300 group hover:bg-slate-900/30 active:bg-slate-900/50 border border-slate-700/30"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600/90 to-red-700 flex items-center justify-center shadow-lg opacity-85 group-hover:opacity-100 transition-opacity duration-300">
                </div>
                
                <svg
                  className={`w-4 h-4 text-slate-500 transition-all duration-400 ${
                    profileOpen ? 'rotate-180 text-slate-300' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Profile Dropdown Menu - Mobile */}
              {profileOpen && (
                <div className="absolute right-1/2 translate-x-1/2 mt-3 w-48 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/50 shadow-2xl shadow-black/60 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  
                  {/* Mi Perfil Option */}
                  <div className="py-2">
                    <button className="w-full px-6 py-3 text-left text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all duration-200 uppercase tracking-widest">
                      Mi Perfil
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>

                  {/* Log out Option */}
                  <div className="py-2 ">
                    <button className="w-full px-6 py-3 text-left text-xs font-medium text-red-500/90 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 uppercase tracking-widest" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden min-[1500px]:flex items-center justify-between px-4 lg:px-8 xl:px-12 2xl:px-16">
          
          {/* Logo */}
          <div className="flex justify-start">
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => window.location.reload()}>
              <img 
                src={Logo} 
                alt="F1 Garage Manager" 
                className="h-11 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_16px_rgba(239,68,68,0.3)]"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-12 flex-1 justify-center">

              {role === 'driver' && (
                <div className="animate-in fade-in zoom-in duration-700">
                  <span className="text-sm font-light tracking-[0.3em] uppercase text-slate-400">
                    ¡Bienvenido, <span className="text-white font-bold tracking-normal italic">{user.nombre}</span>!
                  </span>
                </div>
              )}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-medium tracking-widest transition-all duration-500 relative py-1 uppercase ${
                  activeView === item.id
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                
                {/* Active underline */}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-transparent transition-all duration-500 ${
                    activeView === item.id ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />

                {/* Active glow */}
                {activeView === item.id && (
                  <span className="absolute inset-0 -z-10 bg-red-600/5 rounded-sm blur-xl scale-110"></span>
                )}
              </button>
            ))}
            {role === "admin" && <SimulationButton isMobile={false} />}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6 justify-end">

            {/* Profile Dropdown - Desktop */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-6 py-2.5 rounded-lg transition-all duration-300 group hover:bg-slate-900/30 active:bg-slate-900/50"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/90 to-red-700 flex items-center justify-center shadow-lg opacity-85 group-hover:opacity-100 transition-opacity duration-300">
                </div>
                
                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-slate-500 transition-all duration-400 ${
                    profileOpen ? 'rotate-180 text-slate-300' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/50 shadow-2xl shadow-black/60 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  
                  {/* Mi Perfil */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setView("profile");
                        setProfileOpen(false);
                      }}
                      className="w-full px-6 py-3 text-left text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all duration-200 uppercase tracking-widest">
                      Mi Perfil
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>

                  {/* Cerrar Sesión */}
                  <div className="py-2" onClick={handleLogout}>
                    <button className="w-full px-6 py-3 text-left text-xs font-medium text-red-500/90 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 uppercase tracking-widest">
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border Line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>

      {/* Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px blur-md bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-50"></div>
    </nav>
  );
}

export default Navbar;