import React from 'react';

export function DriverWelcome({ user, setView }) {
  const hasTeam = user?.id_equipo && user?.id_equipo !== "0" && user?.id_equipo !== 0;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 animate-fadeIn">
      <div className="group relative bg-[#0d1117]/80 border border-red-900/30 p-10 rounded-3xl text-center backdrop-blur-2xl max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-red-900/60 hover:-translate-y-1">
        
        <div className="absolute -inset-0.5 bg-gradient-to-b from-red-950 to-transparent rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative p-4 bg-red-950/20 rounded-full border border-red-900/20 transition-transform duration-500 group-hover:scale-105">
              <svg className="w-12 h-12 text-red-800/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0d1117] ${hasTeam ? 'bg-green-900/80' : 'bg-red-900/80'}`}></div>
            </div>
          </div>

          <h2 className="text-slate-200 text-xl font-bold mb-4 tracking-[0.15em] uppercase font-sans">
            Panel de Conductor
          </h2>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[280px] mx-auto">
            Bienvenido, <span className="text-slate-300 font-medium">{user?.nombre || 'Piloto'}</span>. 
            Acceso de <span className="text-red-900/80 font-bold uppercase tracking-tighter">solo lectura</span> habilitado para consulta de métricas y equipo.
          </p>

          <button 
            onClick={() => setView('profile')} 
            className="relative overflow-hidden w-full py-3 px-6 bg-[#1a1f26] hover:bg-red-950/40 border border-white/5 text-slate-400 hover:text-red-200 font-bold rounded-xl transition-all duration-300 uppercase text-[10px] tracking-[0.2em]"
          >
            Ver Perfil y Estadísticas
          </button>

          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-black/20 rounded-lg border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${hasTeam ? 'bg-green-900 shadow-[0_0_5px_rgba(20,83,45,0.5)]' : 'bg-red-950 shadow-[0_0_5px_rgba(69,10,10,0.5)]'}`}></div>
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                {hasTeam ? 'Equipo Confirmado' : 'Equipo no asignado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}