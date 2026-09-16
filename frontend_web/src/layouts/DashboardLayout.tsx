import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge } from '../components/UI';
import { 
  Heart, 
  Calendar, 
  Users, 
  Building2, 
  Tag, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar popovers al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menús de la sidebar según el rol
  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];

    switch (user.rol) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
          { label: 'Mi Perfil', path: '/profile', icon: <User className="w-5 h-5 shrink-0" /> },
          { label: 'Usuarios', path: '/admin/users', icon: <Users className="w-5 h-5 shrink-0" /> },
          { label: 'Organizaciones', path: '/admin/organizations', icon: <Building2 className="w-5 h-5 shrink-0" /> },
          { label: 'Solicitudes Verificación', path: '/admin/verifications', icon: <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" /> },
          { label: 'Eventos', path: '/admin/events', icon: <Calendar className="w-5 h-5 shrink-0" /> },
          { label: 'Donaciones', path: '/admin/donations', icon: <Heart className="w-5 h-5 shrink-0" /> },
          { label: 'Categorías', path: '/admin/categories', icon: <Tag className="w-5 h-5 shrink-0" /> },
        ];
      case 'voluntario':
        return [
          { label: 'Dashboard', path: '/volunteer/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
          { label: 'Mi Perfil', path: '/profile', icon: <User className="w-5 h-5 shrink-0" /> },
          { label: 'Inscribirme en Eventos', path: '/volunteer/events', icon: <Calendar className="w-5 h-5 shrink-0" /> },
          { label: 'Mis Donaciones', path: '/volunteer/donations', icon: <Heart className="w-5 h-5 shrink-0" /> },
        ];
      case 'beneficiario':
        return [
          { label: 'Dashboard', path: '/beneficiary/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
          { label: 'Jornadas y Eventos', path: '/events', icon: <Calendar className="w-5 h-5 shrink-0" /> },
          { label: 'Mi Perfil', path: '/profile', icon: <User className="w-5 h-5 shrink-0" /> },
        ];
      case 'organizacion':
        return [
          { label: 'Dashboard', path: '/org/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
          { label: 'Mi Perfil', path: '/profile', icon: <User className="w-5 h-5 shrink-0" /> },
          { label: 'Gestionar Eventos', path: '/org/events', icon: <Calendar className="w-5 h-5 shrink-0" /> },
          { label: 'Donaciones Recibidas', path: '/org/campaigns', icon: <Heart className="w-5 h-5 shrink-0" /> },
          { label: 'Personas Vinculadas', path: '/org/volunteers', icon: <Users className="w-5 h-5 shrink-0" /> },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    voluntario: 'Voluntario',
    beneficiario: 'Beneficiario',
    organizacion: 'Organización',
  };

  const userDisplayName = user 
    ? `${user.nombre1} ${user.apellido1}`
    : 'Usuario';

  // Notificaciones simuladas por rol
  const getNotifications = () => {
    if (user?.rol === 'admin') {
      return [
        { id: 1, title: 'Nueva solicitud de verificación', desc: 'Fundación Kennedy envió sus documentos.', time: 'Hace 10 min', unread: true },
        { id: 2, title: 'Nuevo evento creado', desc: 'Jornada de Alimentos en Patio Bonito.', time: 'Hace 1 hora', unread: true },
        { id: 3, title: 'Donación recibida', desc: '$ 150.000 registrados en sistema.', time: 'Hace 3 horas', unread: false },
      ];
    }
    if (user?.rol === 'organizacion') {
      return [
        { id: 1, title: 'Nuevo voluntario inscrito', desc: 'Carlos Gómez se unió a tu jornada.', time: 'Hace 15 min', unread: true },
        { id: 2, title: 'Postulación recibida', desc: 'María López solicitó ayuda nutricional.', time: 'Hace 2 horas', unread: true },
      ];
    }
    return [
      { id: 1, title: '¡Inscripción confirmada!', desc: 'Tu participación en la jornada ha sido registrada.', time: 'Hace 30 min', unread: true },
      { id: 2, title: 'Próxima jornada en Kennedy', desc: 'Recordatorio: Evento de Salud mañana 8:00 AM.', time: 'Hace 5 horas', unread: false },
    ];
  };

  const notifications = getNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

  // Título amigable de migas de pan
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Principal';
    if (path.includes('/users')) return 'Gestión de Usuarios';
    if (path.includes('/organizations')) return 'Directorio de Organizaciones';
    if (path.includes('/verifications')) return 'Solicitudes de Verificación';
    if (path.includes('/events')) return 'Gestión de Eventos y Jornadas';
    if (path.includes('/donations') || path.includes('/campaigns')) return 'Historial de Donaciones';
    if (path.includes('/volunteers')) return 'Voluntarios Vinculados';
    if (path.includes('/categories')) return 'Categorías del Sistema';
    if (path.includes('/profile')) return 'Mi Perfil de Usuario';
    return 'Panel de Control';
  };

  return (
    <div className="min-h-screen bg-neutral-50/80 flex font-sans select-none text-neutral-800 antialiased">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-neutral-200/80 z-30 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? 'w-20' : 'w-66'
        }`}
      >
        {/* Brand & Collapse Toggle */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-neutral-100 bg-white shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              ❤️
            </div>
            {!isCollapsed && (
              <span className="text-xl font-black text-neutral-950 tracking-tight transition-opacity duration-200">
                Give<span className="text-brand">&amp;Go</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Role Card Header */}
        {!isCollapsed ? (
          <div className="mx-3 my-4 p-3.5 rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100/60 border border-neutral-200/60 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-400 font-extrabold tracking-wider uppercase">Rol Actual</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">En línea</span>
              </div>
            </div>
            <Badge variant={user?.rol === 'admin' ? 'danger' : user?.rol === 'organizacion' ? 'info' : 'success'}>
              {roleLabels[user?.rol || ''] || 'General'}
            </Badge>
            <p className="text-xs font-black text-neutral-900 mt-2.5 truncate">{userDisplayName}</p>
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">{user?.correo}</p>
          </div>
        ) : (
          <div className="flex justify-center my-4">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-brand font-black text-xs" title={userDisplayName}>
              {user?.nombre1?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/events' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-neutral-900 text-white shadow-sm' 
                    : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-950'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-brand' : 'text-neutral-400 group-hover:text-neutral-700'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-neutral-200/80 bg-white">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 text-red-500 shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white text-neutral-900 border-r border-neutral-200 h-full z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200">
              <span className="text-sm font-black uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                <span className="text-brand">❤️</span> Give&amp;Go
              </span>
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 border-b border-neutral-200 bg-neutral-50/80">
              <Badge variant={user?.rol === 'admin' ? 'danger' : user?.rol === 'organizacion' ? 'info' : 'success'}>
                {roleLabels[user?.rol || ''] || 'General'}
              </Badge>
              <p className="text-sm font-bold text-neutral-900 mt-2 truncate">{userDisplayName}</p>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.correo}</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className={isActive ? 'text-brand' : 'text-neutral-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-neutral-200 bg-white">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-white border-b border-neutral-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Header */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <span>Panel</span>
                <span>/</span>
                <span className="text-brand">{roleLabels[user?.rol || ''] || 'General'}</span>
              </div>
              <h1 className="text-base md:text-lg font-black text-neutral-900 tracking-tight leading-tight">
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Direct Link to Public Site */}
            <Link 
              to="/" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80 transition-all"
            >
              <span>Ver Sitio Público</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Link>

            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

            {/* Notifications Popover Trigger */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand" />
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Notificaciones</h4>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 text-red-700 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs transition-colors hover:bg-neutral-50 ${n.unread ? 'bg-red-50/30' : ''}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-neutral-900">{n.title}</p>
                          <span className="text-[10px] text-neutral-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 border-t border-neutral-100 text-center bg-neutral-50/50">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu Popover */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-800 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                  {user?.nombre1?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-extrabold text-neutral-900 leading-none truncate max-w-28">{userDisplayName}</p>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">{user?.rol}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:block" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-neutral-100 bg-neutral-50">
                    <p className="text-xs font-black text-neutral-900 truncate">{userDisplayName}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user?.correo}</p>
                    <div className="mt-2">
                      <Badge variant={user?.rol === 'admin' ? 'danger' : user?.rol === 'organizacion' ? 'info' : 'success'}>
                        {roleLabels[user?.rol || ''] || 'General'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>Mi Perfil</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                      <span>Sitio Público</span>
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-neutral-100 bg-neutral-50/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        {/* System Footer */}
        <footer className="bg-white border-t border-neutral-200/80 h-10 px-6 md:px-8 flex items-center justify-between text-[11px] text-neutral-400 shrink-0 select-none">
          <p>&copy; {new Date().getFullYear()} Give&amp;Go Platform. Plataforma Comunitaria Kennedy.</p>
          <div className="hidden sm:flex items-center gap-4 font-medium">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Sistema Operativo
            </span>
            <span>v1.0.5</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
