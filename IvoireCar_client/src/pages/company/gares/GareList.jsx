import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Search, 
  X, 
  RefreshCw, 
  Plus, 
  Phone, 
  User, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import api from '../../../services/api';

const GareList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Actions
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Charger la liste des gares depuis l'API Laravel
  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/company/stations');
      const data = response.data.data || response.data || [];
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors de la récupération des gares :', err);
      setError(
        err.response?.data?.message || 
        'Impossible de charger la liste des gares. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Supprimer une gare
  const handleDelete = async (stationId, stationName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la gare "${stationName}" ?`)) {
      return;
    }

    setDeletingId(stationId);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.delete(`/api/company/stations/${stationId}`);
      setSuccess(response.data?.message || `La gare "${stationName}" a été supprimée avec succès.`);
      setStations((prev) => prev.filter((st) => st.id !== stationId));
    } catch (err) {
      console.error('Erreur lors de la suppression de la gare :', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la suppression de la gare.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Métrique unique
  const totalStations = stations.length;

  // Filtrage (Par défaut toutes les gares sont considérées comme actives)
  const filteredStations = stations.filter((station) => {
    const name = station.name?.toLowerCase() || '';
    const city = station.city?.toLowerCase() || station.location?.toLowerCase() || '';
    const manager = station.manager_name?.toLowerCase() || station.manager?.name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || city.includes(term) || manager.includes(term);

    // Si pas de champ status en base, on force la valeur à "active" (true) par défaut
    const isActive = station.is_active !== undefined ? Boolean(station.is_active) : (station.status ? station.status === 'active' : true);
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive);

    return matchesSearch && matchesStatus;
  });

  // Logique de Pagination
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStations = filteredStations.slice(startIndex, endIndex);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Unique métrique : TOTAL DES GARES */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total des gares</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalStations}</p>
        </div>
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <Building2 size={20} />
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
            placeholder="Rechercher gare, ville, responsable..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Gares actives</option>
            <option value="inactive">Gares inactives</option>
          </select>

          <button
            onClick={fetchStations}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-orange-600' : ''} />
          </button>

          {/* Bouton d'ajout d'une gare */}
          <Link
            to="add-gare"
            className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nouvelle gare</span>
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
            onClick={fetchStations}
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

      {/* Table des Gares */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Gare</th>
                <th className="py-3.5 px-4">Localisation & Contact</th>
                <th className="py-3.5 px-4">Chef de Gare</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement des gares...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucune gare ne correspond à "${searchTerm}"`
                        : "Aucune gare enregistrée pour le moment."}
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
                paginatedStations.map((station) => {
                  const name = station.name || 'Gare sans nom';
                  const city = station.city || station.location || 'Emplacement non défini';
                  const phone = station.phone || station.contact_phone;
                  const managerName = station.manager_name || station.manager?.name || 'Non attribué';
                  
                  // Par défaut à active si non défini par le backend
                  const isActive = station.is_active !== undefined ? Boolean(station.is_active) : (station.status ? station.status === 'active' : true);

                  return (
                    <tr key={station.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Icône + Nom de la gare */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 ring-1 ring-orange-200">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{name}</p>
                            <p className="text-[11px] text-slate-400">ID: #{station.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Localisation & Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{city}</span>
                          </div>
                          {phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Chef de Gare */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span>{managerName}</span>
                        </div>
                      </td>

                      {/* Statut Badge (Par défaut Active) */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200/60'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton de Modification */}
                          <Link
                            to={`/company/update-gare/${station.id}`}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier la gare"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Bouton de Suppression */}
                          <button
                            onClick={() => handleDelete(station.id, name)}
                            disabled={deletingId === station.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Supprimer la gare"
                          >
                            {deletingId === station.id ? (
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
      {!loading && !error && filteredStations.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{' '}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredStations.length)}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredStations.length}</span> gare(s)
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

export default GareList;
