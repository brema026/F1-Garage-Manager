import { useState, useEffect } from 'react';
import { 
  FiUser, FiUsers, FiAward, FiZap, FiTarget, 
  FiShield, FiTrendingUp, FiCpu, FiActivity, FiMail 
} from 'react-icons/fi';
import api from '../api/axios';

export function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        // Aseguramos que tomamos el objeto user correctamente de la respuesta
        setUser(response.data.user);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  // Si no hay usuario, evitamos que la pantalla quede en blanco devolviendo un mensaje de error
  if (!user) return (
    <div className="text-center p-20 text-white uppercase font-black tracking-widest">
      No se pudo cargar la información del perfil
    </div>
  );

  // Normalización exhaustiva del rol para evitar fallos por idioma o mayúsculas
  const role = user.rol?.toLowerCase();
  const isDriver = role === 'driver' || role === 'conductor' || role === 'piloto';
  const isEngineer = role === 'engineer' || role === 'ingeniero';
  const isAdmin = role === 'admin';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      
      {/* --- CABECERA --- */}
      <div className="relative overflow-hidden bg-[#0d1117] border border-white/10 rounded-[2rem] p-10 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 bg-gradient-to-br from-dark to-slate-900 border-2 border-white/10 rounded-3xl flex items-center justify-center text-6xl font-black italic text-white shadow-2xl">
              {user.nombre?.charAt(0) || 'U'}
            </div>
            {isDriver && (
              <div className="absolute -bottom-3 -right-3 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-lg shadow-xl border border-white/20 uppercase tracking-widest">
                Elite Driver
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-3">
              {user.nombre}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 text-light/60 text-[10px] font-black px-4 py-2 rounded-xl tracking-widest uppercase">
                <FiMail className="text-primary" /> {user.email}
              </span>
              <span className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-xl tracking-widest uppercase">
                <FiShield /> {user.rol}
              </span>
            </div>
          </div>

          {/* Información de Equipo: Se muestra para todos excepto Admins puros */}
          {!isAdmin && (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] min-w-[280px]">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Equipo Actual</p>
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary rounded-2xl text-white">
                  <FiUsers size={28} />
                </div>
                <div>
                  <p className="text-2xl font-black uppercase italic text-white leading-tight">
                    {user.nombre_equipo || 'Sin Equipo'}
                  </p>
                  <p className="text-light/30 text-xs font-bold tracking-widest uppercase">F1 Garage</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ESTADÍSTICAS ESPECÍFICAS DE CONDUCTOR --- */}
        {isDriver && (
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0d1117] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <FiAward className="absolute -right-4 -top-4 text-primary/5 rotate-12" size={160} />
                <div className="relative z-10">
                  <p className="text-light/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Victorias Totales</p>
                  <p className="text-7xl font-black italic text-white tracking-tighter mb-2">{user.victorias || 0}</p>
                  <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase"><FiTrendingUp /> Trayectoria</div>
                </div>
              </div>

              <div className="bg-[#0d1117] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                <FiTarget className="absolute -right-4 -top-4 text-primary/5 rotate-12" size={160} />
                <div className="relative z-10">
                  <p className="text-light/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Podios Obtenidos</p>
                  <p className="text-7xl font-black italic text-white tracking-tighter mb-2">{user.podios || 0}</p>
                  <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase"><FiActivity /> Rendimiento</div>
                </div>
              </div>
            </div>

            {/* Barra de Habilidad con fallback para el nombre de columna habilidad_h */}
            <div className="bg-[#0d1117] border border-white/5 p-10 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3">
                  <FiZap className="text-primary" /> Telemetría de Habilidad
                </h3>
                <span className="text-3xl font-black italic text-primary">{user.habilidad || user.habilidad_h || 0}%</span>
              </div>
              <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-red-400 transition-all duration-1000" 
                  style={{ width: `${user.habilidad || user.habilidad_h || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* --- INFORMACIÓN OPERATIVA --- */}
        <div className={`${isDriver ? 'lg:col-span-1' : 'lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-3 gap-8'} space-y-8`}>
          <div className="bg-[#0d1117] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <FiShield className="text-primary" /> Seguridad del Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] font-bold text-light/40 uppercase">Estado Cuenta</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Activa</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] font-bold text-light/40 uppercase">ID Operativo</span>
                <span className="text-xs font-mono text-white">#{user.id_usuario}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0d1117] to-primary/5 border border-primary/20 p-8 rounded-[2.5rem] relative group">
            <div className="relative z-10">
              <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter mb-4">
                {isAdmin ? 'Piloto Administrador' : isEngineer ? 'Ingeniero' : 'Piloto'}
              </h3>
              <p className="text-light/50 text-xs font-bold leading-relaxed uppercase tracking-wide">
                {isAdmin 
                  ? 'Privilegios totales sobre la gestión de equipos, personal, patrocinios e infraestructura.' 
                  : isEngineer 
                  ? 'Responsable del desarrollo técnico y optimización del setup del monoplaza.'
                  : 'Encargado de la ejecución en pista y análisis de telemetría para la mejora del rendimiento.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}