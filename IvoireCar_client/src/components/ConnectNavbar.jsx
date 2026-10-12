import React, { useState } from "react";
import { Bus, User, LogOut, Ticket, LayoutDashboard, UserPlus, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("http")) return avatarPath;
  if (avatarPath.startsWith("/storage")) {
    return `http://localhost:8000${avatarPath}`;
  }
  return `http://localhost:8000/storage/${avatarPath.replace(/^\/+/, "")}`;
};

function ConnectNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const navItems = [
    { name: "Compagnies", href: "#" },
    { name: "À Propos", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Expédition", href: "/expedition" },
  ];

  const userName = user?.name || user?.nom || "Utilisateur";
  const userEmail = user?.email || "";
  const userRole = user?.role;
  const avatarUrl = getAvatarUrl(user?.avatar || user?.avatar_url);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-12 lg:px-24 xl:px-40 py-3.5 transition-all bg-white/80">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-black">
              Ivoire<span className="text-orange-500">Car</span>
            </span>
          </Link>

          {/* LIENS DE NAVIGATION (Desktop) */}
          <div className="hidden lg:flex items-center border rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner border-slate-200 bg-slate-50/50">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-1.5 rounded-full font-medium text-black hover:text-orange-500 transition-all duration-200 text-sm"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Bouton Réserver */}
            <Link
              to="/reservation"
              className="group relative inline-flex items-center gap-2 bg-[#ea580c] hover:bg-orange-700 text-white text-base font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-700/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Réserver un billet</span>
              <Ticket className="w-4 h-4" />
            </Link>

            {/* SÉPARATEUR */}
            <div className="h-6 w-px bg-slate-200" />

            {/* MENU PROFIL / AUTHENTIFICATION */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-200/80 transition-all cursor-pointer focus:outline-none"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                      {userName.charAt(0)}
                    </div>
                  )}
                </button>

                {/* DROPDOWN PROFIL */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>

                    <div className="py-1">
                      {userRole === "super_admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-500" />
                          <span>Administration</span>
                        </Link>
                      )}

                      {userRole === "company_admin" && (
                        <Link
                          to="/company"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-500" />
                          <span>Espace Compagnie</span>
                        </Link>
                      )}

                      <Link
                        to="/mon-profil"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#F97316]" />
                        <span>Mon Profil</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-orange-500" />
                  <span>S'inscrire</span>
                </Link>
              </div>
            )}
          </div>

          {/* BOUTON BURGER (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-black focus:outline-none cursor-pointer"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#0F172A]/95 border-b border-white/10 backdrop-blur-2xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-200 text-white">
            {user && (
              <Link to="/mon-profil" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#059669] text-white font-bold flex items-center justify-center uppercase">
                      {userName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Liens Mobile */}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                to="/reservation"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-semibold py-3 rounded-xl shadow-lg cursor-pointer"
              >
                <span>Réserver mon ticket</span>
                <Ticket className="w-4 h-4" />
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>S'inscrire</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default ConnectNavbar;
