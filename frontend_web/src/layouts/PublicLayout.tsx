import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI';
import { Menu, X, User, LayoutDashboard, LogOut, Heart, Calendar, MapPin, ChevronDown, Smartphone, Download } from 'lucide-react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.rol) {
      case 'admin':
        return '/admin/dashboard';
      case 'voluntario':
        return '/volunteer/dashboard';
      case 'beneficiario':
        return '/beneficiary/dashboard';
      case 'organizacion':
        return '/org/dashboard';
      default:
        return '/';
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    voluntario: 'Voluntario',
    beneficiario: 'Beneficiario',
    organizacion: 'Organización',
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-neutral-900 selection:bg-brand/10 selection:text-brand">
      {/* Header Público - Modern SaaS Sticky Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-50 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo a la izquierda */}
            <div className="flex-1 md:flex-none flex items-center">
              <Link to="/" className="flex items-center space-x-2.5">
                <span className="text-2xl font-black text-neutral-950 tracking-tight flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                  <span className="text-brand">❤️</span> Give<span className="text-brand"><span>&amp;</span>Go</span>
                </span>
              </Link>
            </div>

            {/* Menú centrado en escritorio */}
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-10 text-sm font-medium tracking-wide">
              <Link 
                to="/" 
                className={`transition-all duration-200 py-1.5 border-b-2 font-semibold ${
                  location.pathname === '/' 
                    ? 'text-brand border-brand font-bold' 
                    : 'text-neutral-500 border-transparent hover:text-brand'
                }`}
              >
                Inicio
              </Link>
              <Link 
                to="/events" 
                className={`transition-all duration-200 py-1.5 border-b-2 font-semibold ${
                  location.pathname === '/events' 
                    ? 'text-brand border-brand font-bold' 
                    : 'text-neutral-500 border-transparent hover:text-brand'
                }`}
              >
                Eventos
              </Link>
              <Link 
                to="/donations" 
                className={`transition-all duration-200 py-1.5 border-b-2 font-semibold ${
                  location.pathname === '/donations' 
                    ? 'text-brand border-brand font-bold' 
                    : 'text-neutral-500 border-transparent hover:text-brand'
                }`}
              >
                Donar
              </Link>
              <Link 
                to="/map" 
                className={`transition-all duration-200 py-1.5 border-b-2 font-semibold ${
                  location.pathname === '/map' 
                    ? 'text-brand border-brand font-bold' 
                    : 'text-neutral-500 border-transparent hover:text-brand'
                }`}
              >
                Mapa Solidario
              </Link>
              <a 
                href="/api/download/apk" 
                download="GiveAndGo.apk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-brand border border-red-200 hover:bg-brand hover:text-white font-bold text-xs transition-all shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App Móvil</span>
              </a>
            </nav>

            {/* Usuario a la derecha */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-4">
              {user ? (
                /* Menú de Usuario Logueado */
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 py-2 px-3.5 hover:bg-neutral-50 border border-neutral-100 rounded-xl transition-all focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs border border-brand/20 shadow-xs">
                      {user.nombre1?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left leading-none shrink-0">
                      <p className="text-xs font-semibold text-neutral-900">{user.nombre1}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{roleLabels[user.rol]}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {/* Dropdown Menu - Modern dropdown with transition */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 bg-white border border-neutral-200/80 rounded-2xl shadow-lg py-2.5 z-50 animate-in fade-in-50 slide-in-from-top-3 duration-200">
                      <div className="px-4.5 py-2.5 border-b border-neutral-100 mb-1.5">
                        <p className="text-xs font-bold text-neutral-950 truncate">{user.nombre1} {user.apellido1 || ''}</p>
                        <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">{user.correo}</p>
                      </div>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                        <span>Mi Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-neutral-400" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        to="/profile?tab=config"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-neutral-400" />
                        <span>Configuración</span>
                      </Link>
                      <hr className="border-neutral-100 my-1.5" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-2.5 w-full text-left px-4.5 py-2.5 text-xs text-brand hover:bg-red-50/40 font-bold cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Botones de Visitante */
                <div className="flex items-center space-x-3.5">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Iniciar Sesión</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Registrarse</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2.5 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 focus:outline-none"
              >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-5 duration-200">
            <Link to="/" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-sm font-semibold text-neutral-800 hover:text-brand transition-colors">Inicio</Link>
            <Link to="/events" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-sm font-semibold text-neutral-800 hover:text-brand transition-colors">Eventos</Link>
            <Link to="/donations" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-sm font-semibold text-neutral-800 hover:text-brand transition-colors">Donar</Link>
            <Link to="/map" onClick={() => setIsMobileOpen(false)} className="block py-1.5 text-sm font-semibold text-neutral-800 hover:text-brand transition-colors">Mapa Solidario</Link>
            <hr className="border-neutral-100" />
            
            {user ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3.5 px-1">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs border border-brand/20">
                    {user.nombre1?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{user.nombre1} {user.apellido1 || ''}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{roleLabels[user.rol]}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pl-1.5">
                  <Link to={getDashboardPath()} onClick={() => setIsMobileOpen(false)} className="block py-2 text-xs font-semibold text-neutral-600 hover:text-brand">
                    Mi Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="block py-2 text-xs font-semibold text-neutral-600 hover:text-brand">
                    Mi Perfil
                  </Link>
                  <Link to="/profile?tab=config" onClick={() => setIsMobileOpen(false)} className="block py-2 text-xs font-semibold text-neutral-600 hover:text-brand">
                    Configuración
                  </Link>
                  <button onClick={() => { setIsMobileOpen(false); handleLogout(); }} className="block w-full text-left py-2 text-xs font-bold text-brand hover:text-brand-hover">
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-2">
                <Link to="/login" onClick={() => setIsMobileOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileOpen(false)}>
                  <Button variant="primary" className="w-full" size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-10">
        {children}
      </main>

      {/* Footer - Elegant, Minimalist, Dark Theme */}
      <footer className="bg-[#111827] border-t border-neutral-800 text-white mt-auto py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1 space-y-4">
              <span className="text-xl font-extrabold text-white tracking-tight">
                ❤️ Give<span className="text-brand"><span>&amp;</span>Go</span>
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                Conectando personas que desean generar cambios positivos con fundaciones y voluntariados en Bogotá D.C.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Plataforma</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-semibold">
                <li><Link to="/" className="hover:text-brand transition-colors">Inicio</Link></li>
                <li><Link to="/events" className="hover:text-brand transition-colors">Ver Eventos</Link></li>
                <li><Link to="/map" className="hover:text-brand transition-colors">Mapa de Actividades</Link></li>
                <li><Link to="/donations" className="hover:text-brand transition-colors">Realizar Donación</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Comunidad</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-semibold">
                <li><Link to="/register?role=vol" className="hover:text-brand transition-colors">Voluntarios</Link></li>
                <li><Link to="/register?role=org" className="hover:text-brand transition-colors">Organizaciones</Link></li>
                <li><Link to="/register?role=ben" className="hover:text-brand transition-colors">Beneficiarios</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Contacto</h4>
              <p className="text-xs text-neutral-400">Email: <a href="mailto:soporte@giveandgo.com" className="hover:text-brand transition-colors">soporte@giveandgo.com</a></p>
              <p className="text-xs text-neutral-400 mt-1">Teléfono: +57 300 123 4567</p>
              <p className="text-xs text-neutral-400">Dirección: Kennedy, Bogotá, Colombia</p>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 font-semibold gap-4">
            <p>&copy; {new Date().getFullYear()} Give&amp;Go. Todos los derechos reservados.</p>
            <div className="flex space-x-6 text-[11px]">
              <a href="#" className="hover:text-neutral-300 transition-colors">Términos</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
