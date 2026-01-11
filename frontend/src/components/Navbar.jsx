import React, { useState } from "react";
import Logo from '../assets/logo/logo.png';

function Navbar({ setView }) {
  // State management
  const [activeView, setActiveView] = useState("teams");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle navigation click
  const handleNavClick = (view) => {
    setView(view);
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  // Navigation items
  const navItems = [
    { id: "teams", label: "Equipos" },
    { id: "drivers", label: "Conductores" },
    { id: "sponsors", label: "Patrocinadores" },
    { id: "parts", label: "Partes" },
    { id: "inventory", label: "Inventario" },
    { id: "setup", label: "Armado" },
  ];

  return (
    <nav className="relative">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/20 backdrop-blur-xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center gap-4">
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
            <div className="relative">
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
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/50 shadow-2xl shadow-black/60 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
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
            <div className="relative">
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
                  <div className="py-2">
                    <button className="w-full px-6 py-3 text-left text-xs font-medium text-red-500/90 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 uppercase tracking-widest">
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 group cursor-pointer lg:flex-1" onClick={() => window.location.reload()}>
            <img 
              src={Logo} 
              alt="F1 Garage Manager" 
              className="h-11 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_16px_rgba(239,68,68,0.3)]"
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block absolute left-1/4 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-slate-700/20 to-transparent"></div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-12 flex-1 justify-center">
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
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            
            {/* Red Separator Line */}
            <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-red-600/60 to-transparent"></div>

            {/* Profile Dropdown - Desktop */}
            <div className="relative">
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
                    <button className="w-full px-6 py-3 text-left text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all duration-200 uppercase tracking-widest">
                      Mi Perfil
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"></div>

                  {/* Cerrar Sesión */}
                  <div className="py-2">
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