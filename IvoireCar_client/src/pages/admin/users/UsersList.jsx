import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert,
  Building2, 
  MapPin, 
  Car, 
  Banknote, 
  User, 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import api from '../../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupération des utilisateurs depuis l'API Laravel
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('api/admin/users');
      
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Traitement de l'URL d'avatar
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.startsWith('/storage')) return `http://localhost:8000${avatarPath}`;
    return `http://localhost:8000/storage/${avatarPath.replace(/^\/+/, '')}`;
  };

  // Métriques par rôle
  const getRoleCount = (targetRole) => {
    return users.filter((u) => {
      const r = (u.role || '').toLowerCase();
      return r === targetRole.toLowerCase();
    }).length;
  };

  const metrics = [
    { label: "Total Comptes", count: users.length, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Super Admins", count: getRoleCount('super_admin'), icon: ShieldAlert, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { label: "Admins Compagnie", count: getRoleCount('company_admin'), icon: Building2, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { label: "Chefs de Gare", count: getRoleCount('station_manager'), icon: MapPin, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Chauffeurs", count: getRoleCount('driver'), icon: Car, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Caissiers", count: getRoleCount('cashier'), icon: Banknote, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { label: "Passagers", count: getRoleCount('passenger'), icon: User, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  // Design des badges par rôle
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case 'company_admin':
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case 'station_manager':
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case 'driver':
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'cashier':
        return "bg-teal-50 text-teal-700 border-teal-200/80";
      case 'passenger':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Filtrage selon la recherche et le rôle
  const filteredUsers = users.filter((user) => {
    const name = user.name || user.username || '';
    const email = user.email || '';
    const phone = user.phone || user.telephone || user.number || '';
    const companyName = user.company?.name || user.company?.nom || user.compagnie?.name || user.compagnie?.nom || '';
    const role = (user.role || '').toLowerCase();

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" ? true : role === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Découpage pour la pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 w-full">
      {/* En-tête avec métriques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 truncate">{m.label}</span>
                <div className={`p-1.5 rounded-lg border ${m.color}`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">{m.count}</p>
            </div>
          );
        })}
      </div>

      {/* Barre d'actions & Filtres */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher nom, email, compagnie..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtre Rôle & Rafraîchissement */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
          >
            <option value="all">Tous les rôles</option>
            <option value="super_admin">Super Admin</option>
            <option value="company_admin">Admin Compagnie</option>
            <option value="station_manager">Chef de Gare</option>
            <option value="driver">Chauffeur</option>
            <option value="cashier">Caissier</option>
            <option value="passenger">Passager</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-orange-600" : ""} />
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-[11px]"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table des Utilisateurs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Compagnie</th>
                <th className="py-3.5 px-4 text-center">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement des utilisateurs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun utilisateur ne correspond à "${searchTerm}"`
                        : "Aucun utilisateur trouvé dans la base de données."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange("")}
                        className="text-xs font-semibold text-orange-600 hover:underline"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const fullName = user.name || user.username || "Non renseigné";
                  const phone = user.phone || user.telephone || user.number;
                  const role = user.role || "passenger";
                  const company = user.company || user.compagnie;
                  const companyName = company ? (company.name || company.nom) : null;
                  const initials = fullName.slice(0, 2).toUpperCase();
                  const avatarSrc = getAvatarUrl(user.avatar);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Avatar + Nom */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {avatarSrc ? (
                              <img src={avatarSrc} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{fullName}</p>
                            <p className="text-[11px] text-slate-400">ID: #{user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email + Téléphone */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                          {phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Compagnie associée */}
                      <td className="py-3 px-4">
                        {companyName ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building2 size={13} className="text-orange-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{companyName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Aucune</span>
                        )}
                      </td>

                      {/* Badge Rôle */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getRoleBadgeStyle(
                            role
                          )}`}
                        >
                          {role.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{" "}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredUsers.length)}</span> sur{" "}
            <span className="font-semibold text-slate-800">{filteredUsers.length}</span> utilisateur(s)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700 bg-slate-100 rounded-lg">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
