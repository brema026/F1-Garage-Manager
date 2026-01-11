import React from "react";
import Logo from '../../assets/logo/full-logo-white.png';

function Footer() {
  return (
    <footer className="relative">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/30 to-slate-950/40 backdrop-blur-xl"></div>

      {/* Top Border Line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={Logo} 
              alt="F1 Garage Manager" 
              className="h-7 sm:h-14 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-gradient-to-b from-transparent via-red-600/40 to-transparent"></div>

          {/* Center Content */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <p className="text-xs sm:text-xs font-medium tracking-widest uppercase text-slate-400">
              Racing Team Management System
            </p>
            <p className="text-xs font-light tracking-wide text-slate-500">
              © 2026 · TEC · All Rights Reserved
            </p>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-gradient-to-b from-transparent via-red-600/40 to-transparent"></div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-px blur-md bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-50"></div>
    </footer>
  );
}

export default Footer;