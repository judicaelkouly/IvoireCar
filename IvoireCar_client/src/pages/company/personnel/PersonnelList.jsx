import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Bus, 
  Building, 
  CreditCard, 
  Search, 
  X, 
  RefreshCw, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api from '../../../services/api';

const PersonnelList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Actions
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Charger la liste du personnel depuis l'API Laravel
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/company/staff');
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération du personnel :', err);
      setError(
        err.response?.data?.message || 
        'Impossible de charger la liste du personnel. Veuillez réespérer.'
      );
    } finally {
      setLoading(false);
    }
  };
    const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.startsWith('/storage')) return `http://localhost:8000${avatarPath}`;
    return `http://localhost:8000/storage/${avatarPath.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Supprimer un membre du personnel
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} du personnel ?`)) {
      return;
    }

    setDeletingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.delete(`/api/company/staff/${userId}`);
      setSuccess(response.data.message || 'Membre supprimé avec succès.');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la suppression.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Métriques
  const totalDrivers = users.filter((u) => u.role === 'driver').length;
  const totalManagers = users.filter((u) => u.role === 'station_manager').length;
  const totalCashiers = users.filter((u) => u.role === 'cashier').length;

  // Filtrage
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Formatage des rôles et des badges
  const getRoleBadge = (role) => {
    switch (role) {
      case 'company_admin':
        return {
          label: 'Administrateur',
          className: 'bg-purple-50 text-purple-700 border-purple-200/60',
        };
      case 'station_manager':
        return {
          label: 'Chef de Gare',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
        };
      case 'driver':
        return {
          label: 'Chauffeur',
          className: 'bg-amber-50 text-amber-700 border-amber-200/60',
        };
      case 'cashier':
        return {
          label: 'Caissier / Guichetier',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        };
      default:
        return {
          label: role || 'Membre',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Personnel</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{users.length}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chauffeurs</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalDrivers}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Bus size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chefs de Gare</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalManagers}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Building size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guichetiers</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCashiers}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Barre d'actions, Filtres & Bouton Ajouter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher nom, email, téléphone..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtres & Bouton d'ajout */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
          >
            <option value="all">Tous les rôles</option>
            <option value="company_admin">Administrateurs</option>
            <option value="station_manager">Chefs de Gare</option>
            <option value="driver">Chauffeurs</option>
            <option value="cashier">Caissiers / Guichetiers</option>
          </select>

          <button
            onClick={fetchStaff}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-orange-600' : ''} />
          </button>

          {/* Bouton d'ajout d'un membre */}
          <Link
            to="add-personnel"
            className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus size={16} />
            <span>Nouveau membre</span>
          </Link>
        </div>
      </div>

      {/* Retours utilisateur */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStaff}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-[11px] cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Table du Personnel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Membre</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Rôle</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement du personnel...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun membre ne correspond à "${searchTerm}"`
                        : "Aucun membre enregistré dans le personnel pour le moment."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const fullName = user.name || 'N/A';
                  const phone = user.phone || user.number;
                  const roleBadge = getRoleBadge(user.role);
                  const initials = fullName.slice(0, 2).toUpperCase();
                  const avatarSrc = getAvatarUrl(user.avatar);


                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Avatar + Nom */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-orange-200">
                            {avatarSrc ? (
                              <img src={avatarSrc} alt={fullName} className="w-full h-full rounded-full object-cover" />
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
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                          {phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Badge Rôle */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${roleBadge.className}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton de Modification */}
                          <Link
                            to={`/company/update-personnel/${user.id}`}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier le membre"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Bouton de Suppression */}
                          <button
                            onClick={() => handleDelete(user.id, fullName)}
                            disabled={deletingId === user.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Supprimer le membre"
                          >
                            {deletingId === user.id ? (
                              <RefreshCw size={15} className="animate-spin text-rose-600" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
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
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{' '}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredUsers.length)}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredUsers.length}</span> membre(s)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;
