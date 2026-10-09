import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bus, 
  Ticket, 
  Package, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search,
  ChevronRight
} from 'lucide-react';

export default function PassengerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Rechercher un trajet', path: '/passenger', icon: Search, end: true },
    { label: 'Mes Billets', path: '/passenger/tickets', icon: Ticket },
    { label: 'Mes Colis', path: '/passenger/parcels', icon: Package },
    { label: 'Mon Profil', path: '/passenger/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white">Ivoire<span className="text-orange-500">Car</span></span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 z-50 h-full w-64 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/60 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">Ivoire<span className="text-orange-500">Car</span></span>
          </Link>

          {/* User Profile Summary */}
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Passager'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.phone || user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
