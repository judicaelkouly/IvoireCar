import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Building2, 
  Ticket, 
  Settings, 
  Home, 
  LogOut, 
  Menu, 
  X, 
  Banknote, 
  TrendingUp, 
  RefreshCw,
  ShieldCheck,
  Bus,
  ArrowRight
} from "lucide-react";
import CompanyList from "./compagnies/CompanyList";
import UserList from "./users/UsersList";
import ReservationList from "./tickets/ReservationList";
import ExpeditionList from "./colis/ExpeditionList";
import BusList from "./bus/BusList";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext"; // Import du contexte Auth

// Logo Authentique aux couleurs Orange-600
const BrandLogo = () => (
  <div className="flex items-center gap-2.5 group">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200">
      <Bus size={20} className="stroke-[2.2]" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-slate-900 rounded-full"></span>
    </div>
    <div className="flex flex-col">
      <span className="font-extrabold text-white text-base tracking-tight leading-none flex items-center">
        Ivoire<span className="text-orange-500">Car</span>
      </span>
    </div>
  </div>
);

const getLogoUrl = (logoPath) => {
    if (!logoPath) return 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop';
    
    // Si le lien est déjà absolu (contient http)
    if (logoPath.startsWith('http')) return logoPath;

    // Si le chemin commence déjà par /storage, on ajoute simplement la base URL du serveur
    if (logoPath.startsWith('/storage')) {
      return `http://localhost:8000${logoPath}`;
    }

    // Sinon, on ajoute http://localhost:8000/storage/
    return `http://localhost:8000/storage/${logoPath.replace(/^\/+/, '')}`;
  };

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const navigate = useNavigate();

  // Utilisation de l'authentification réelle
  const { user, logout } = useAuth();

  // États pour les KPI réels
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    companiesCount: 0,
    reservationsCount: 0,
    usersCount: 0,
    busesCount: 0,
    recentOperations: []
  });

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} /> },
    { id: "company", label: "Compagnies", icon: <Building2 size={18} /> },
    { id: "buses", label: "Flotte de Bus", icon: <Bus size={18} /> },
    { id: "users", label: "Clients", icon: <Users size={18} /> },
    { id: "colis", label: "Expéditions", icon: <Package size={18} /> },
    { id: "ticket", label: "Réservations", icon: <Ticket size={18} /> },
    { id: "setting", label: "Paramètres", icon: <Settings size={18} /> },
  ];

  // Chargement des données réelles depuis les endpoints du contrôleur Laravel
  const fetchDashboardStats = async () => {
    setLoadingKpis(true);
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get("api/admin/stats").catch(() => null),
        api.get("api/admin/recent-operations").catch(() => null)
      ]);

      if (statsRes && statsRes.data) {
        const data = statsRes.data;
        setKpiData((prev) => ({
          ...prev,
          totalRevenue: data.total_revenue_fcfa ?? data.total_revenue ?? 0,
          companiesCount: data.total_companies ?? data.companies_count ?? 0,
          reservationsCount: data.total_bookings ?? data.reservations_count ?? 0,
          usersCount: data.total_users ?? data.users_count ?? 0,
          busesCount: data.buses_count ?? 0,
        }));
      }

      if (recentRes && recentRes.data) {
        setKpiData((prev) => ({
          ...prev,
          recentOperations: Array.isArray(recentRes.data) ? recentRes.data : (recentRes.data.data || [])
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données API :", error);
    } finally {
      setLoadingKpis(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 
  };

  const handleRefreshData = () => {
    fetchDashboardStats();
  };

  // Déconnexion basée sur la session cookie Laravel Sanctum
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Grille des 5 cartes KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Chiffre d'affaires */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">C.A. Total</span>
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                    <Banknote size={18} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 truncate">
                  {formatCurrency(kpiData.totalRevenue)}
                </p>
                <div className="mt-2 flex items-center text-[11px] font-semibold text-emerald-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>Billets & Colis</span>
                </div>
              </div>

              {/* Compagnies */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compagnies</span>
                  <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                    <Building2 size={18} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {kpiData.companiesCount}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-400">Partenaires transport</p>
              </div>

              {/* Nouvelle KPI : Flotte de Bus */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flotte Bus</span>
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                    <Bus size={18} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {kpiData.busesCount}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-400">Véhicules enregistrés</p>
              </div>

              {/* Réservations */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Réservations</span>
                  <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                    <Ticket size={18} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {kpiData.reservationsCount}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-400">Billets émis</p>
              </div>

              {/* Clients */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clients</span>
                  <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                    <Users size={18} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {kpiData.usersCount}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-400">Utilisateurs enregistrés</p>
              </div>
            </div>

            {/* Aperçu des opérations récentes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Aperçu des opérations récentes</h3>
                <button 
                  onClick={() => setActiveTab("ticket")} 
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Voir tout</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {kpiData.recentOperations.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">
                    Aucune transaction récente à afficher.
                  </p>
                ) : (
                  kpiData.recentOperations.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-lg font-bold ${
                          item.type === 'colis' || item.tracking_code 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.type === 'colis' || item.tracking_code ? 'Colis' : 'Billet'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.reference || item.tracking_code || `Réservation #${item.id}`}
                          </p>
                          <p className="text-slate-400">
                            {item.user_name || item.sender_name || 'Client'}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        {formatCurrency(item.price || item.shipping_cost || item.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tous les utilisateurs de la plateforme</h2>
            <UserList />
          </div>
        );

        case "buses":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tous les utilisateurs de la plateforme</h2>
            <BusList />
          </div>
        );


      case "company":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Compagnies</h2>
            <CompanyList />
          </div>
        );

      case "ticket":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Réservations & Billets</h2>
            <ReservationList />
          </div>
        );

      case "colis":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Expéditions de Colis</h2>
            <ExpeditionList />
          </div>
        );

      case "setting":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Paramètres du Site & Généralités</h2>
            <p className="text-xs text-slate-500">Configuration de la plateforme, devises, notifications et règles métier.</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Extraction du nom et du rôle de l'utilisateur connecté
  const adminName = user?.name || user?.username || "Administrateur";
  const adminRole = user?.role || (user?.roles && user.roles[0]?.name) || "Administrateur";
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=f97316&color=fff`;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased">
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar / Brand Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
            <Link to="/" className="flex items-center">
              <BrandLogo />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="mt-4 px-3 flex-1 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu principal
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer Sidebar (Utilisateur connecté) */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <Home size={18} />
              <span>Voir le site</span>
            </Link>
            <Link to={'profile'}>
              <div className="bg-slate-800/50 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-colors">
                <img 
                  src={getLogoUrl(user.avatar_url || user.avatar)}
                        alt={user.name || user.nom}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-semibold truncate">{adminName}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-medium capitalize">
                    <ShieldCheck size={10} /> {adminRole}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="lg:ml-64 flex flex-col flex-1 min-h-screen">
        {/* Header Responsive */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80">
          <div className="px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  aria-label="Ouvrir le menu"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                    {navItems.find(i => i.id === activeTab)?.label || activeTab}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Refresh KPI */}
                <button
                  onClick={handleRefreshData}
                  title="Rafraîchir les données"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw size={18} className={loadingKpis ? "animate-spin text-orange-600" : ""} />
                </button>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-semibold text-xs transition-all duration-150 border border-rose-100 cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6 flex-1 max-w-8xl w-full mx-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
