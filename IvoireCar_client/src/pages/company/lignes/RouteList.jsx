import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  PlusCircle, 
  Search, 
  X, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Navigation,
  ArrowRight,
  Loader2
} from 'lucide-react';
import api from '../../../services/api';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Actions
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Charger la liste des trajets/lignes depuis l'API
  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/company/routes');
      setRoutes(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des trajets :', err);
      setError(
        err.response?.data?.message || 
        'Impossible de charger la liste des trajets. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Supprimer une ligne/trajet
  const handleDelete = async (routeId, routeName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le trajet "${routeName}" ?`)) {
      return;
    }

    setDeletingId(routeId);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.delete(`/api/company/routes/${routeId}`);
      setSuccess(response.data?.message || 'Trajet supprimé avec succès.');
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la suppression du trajet.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Modifier le statut (actif / inactif) directement en ligne
  const handleStatusChange = async (routeItem, newStatus) => {
    setUpdatingStatusId(routeItem.id);
    setError(null);
    setSuccess(null);

    const isActive = newStatus === 'active';

    try {
      await api.put(`/api/company/routes/${routeItem.id}`, {
        ...routeItem,
        is_active: isActive,
        status: newStatus,
      });
      
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeItem.id ? { ...r, is_active: isActive, status: newStatus } : r))
      );
      setSuccess(`Statut de la ligne mis à jour.`);
    } catch (err) {
      console.error('Erreur lors du changement de statut :', err);
      setError(
        err.response?.data?.message ||
        'Impossible de modifier le statut du trajet.'
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Formatage du prix
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? price : `${numericPrice.toLocaleString('fr-FR')} FCFA`;
  };

  // Métriques
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(
    (r) => r.is_active === true || r.status === 'active' || r.status === 'actif'
  ).length;
  const inactiveRoutes = routes.filter(
    (r) => r.is_active === false || r.status === 'inactive' || r.status === 'inactif'
  ).length;

  // Filtrage
  const filteredRoutes = routes.filter((routeItem) => {
    const name = routeItem.name || routeItem.nom || '';
    const startStation = routeItem.start_station?.name || routeItem.departure_station?.name || routeItem.departure || '';
    const endStation = routeItem.end_station?.name || routeItem.arrival_station?.name || routeItem.arrival || '';
    
    // Recherche incluant également les escales et leurs villes
    const stopsNames = routeItem.stops?.map(s => `${s.station?.name || s.name || ''} ${s.station?.city || ''}`).join(' ') || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stopsNames.toLowerCase().includes(searchTerm.toLowerCase());

    const isRouteActive = routeItem.is_active === true || routeItem.status === 'active';
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && isRouteActive) || 
      (statusFilter === 'inactive' && !isRouteActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const getSelectStyle = (isActive) => {
    return isActive
      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-500/20'
      : 'bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-500/20';
  };

  return (
    <div className="space-y-6 w-full">
      {/* En-tête avec métriques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Lignes / Trajets</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalRoutes}</p>
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
            <Navigation size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lignes Actives</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeRoutes}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lignes Inactives</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{inactiveRoutes}</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <XCircle size={20} />
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
            placeholder="Nom, gare de départ, d'arrivée, escale..."
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
            <option value="active" className="bg-white text-emerald-700 font-semibold">
              Actives
            </option>
            <option value="inactive" className="bg-white text-rose-700 font-semibold">
              Inactives
            </option>
          </select>

          <button
            onClick={fetchRoutes}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-orange-600' : ''} />
          </button>

          {/* Bouton d'ajout d'une ligne */}
          <Link
            to="add-route"
            className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle size={16} />
            <span>Nouvelle ligne</span>
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
            onClick={fetchRoutes}
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

      {/* Table des Trajets / Lignes */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Ligne / Trajet</th>
                <th className="py-3.5 px-4">Départ & Arrivée</th>
                <th className="py-3.5 px-4">Escales / Arrêts & Tarifs</th>
                <th className="py-3.5 px-4">Distance / Durée</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement des trajets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun trajet ne correspond à "${searchTerm}"`
                        : "Aucun trajet enregistré pour le moment."}
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
                paginatedRoutes.map((routeItem) => {
                  const routeName = routeItem.name || routeItem.nom || `${routeItem.departure_city || ''} - ${routeItem.arrival_city || ''}`;
                  const startStation = routeItem.departure_station?.name || routeItem.start_station?.name || routeItem.departure_city || 'N/A';
                  const endStation = routeItem.arrival_station?.name || routeItem.end_station?.name || routeItem.arrival_city || 'N/A';
                  
                  // Récupération des escales selon le retour de l'API (`stops`)
                  const stopsList = routeItem.stops || routeItem.intermediate_stations || routeItem.escales || [];
                  
                  const isRouteActive = routeItem.is_active ?? (routeItem.status === 'active' || routeItem.status === 'actif');
                  const distance = routeItem.distance ? `${routeItem.distance} km` : 'N/A';
                  const duration = routeItem.duration || routeItem.duree || 'N/A';

                  return (
                    <tr key={routeItem.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Nom de la ligne */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                            <Navigation size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{routeName}</p>
                            <p className="text-[11px] text-slate-400">ID: #{routeItem.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Gare de départ & Gare d'arrivée */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-800 font-medium">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold">
                            {startStation}
                          </span>
                          <ArrowRight size={14} className="text-orange-500 shrink-0" />
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold">
                            {endStation}
                          </span>
                        </div>
                      </td>

                      {/* Liste des escales avec leur prix */}
                      <td className="py-3 px-4">
                        {stopsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {stopsList.map((stop, idx) => {
                              const stopStationName = stop.station?.name || stop.name || 'Escale';
                              const stopCity = stop.station?.city ? `(${stop.station.city})` : '';
                              const stopPrice = stop.price;

                              return (
                                <div
                                  key={stop.id || idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50/80 text-orange-950 border border-orange-200/80 rounded-lg text-[11px] font-medium shadow-2xs"
                                >
                                  <MapPin size={12} className="text-orange-500 shrink-0" />
                                  <span>
                                    <strong className="font-semibold text-slate-800">{stopStationName}</strong>
                                    {stopCity && <span className="text-slate-500 text-[10px] ml-1">{stopCity}</span>}
                                  </span>

                                  {stopPrice && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white font-bold text-[10px] rounded-md shrink-0">
                                      {formatPrice(stopPrice)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Direct (Aucune escale)</span>
                        )}
                      </td>

                      {/* Distance & Durée */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{distance}</p>
                        <p className="text-[11px] text-slate-400">{duration}</p>
                      </td>

                      {/* Sélecteur de Statut Interactif */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {updatingStatusId === routeItem.id ? (
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 px-3 py-1 bg-orange-50 rounded-xl border border-orange-200">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Mise à jour...</span>
                            </div>
                          ) : (
                            <select
                              value={isRouteActive ? 'active' : 'inactive'}
                              onChange={(e) => handleStatusChange(routeItem, e.target.value)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border outline-none focus:ring-2 transition-all cursor-pointer ${getSelectStyle(isRouteActive)}`}
                            >
                              <option value="active" className="bg-white text-emerald-700 font-semibold">
                                Actif
                              </option>
                              <option value="inactive" className="bg-white text-rose-700 font-semibold">
                                Inactif
                              </option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Modifier */}
                          <Link
                            to={`/company/update-route/${routeItem.id}`}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier la ligne"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Supprimer */}
                          <button
                            onClick={() => handleDelete(routeItem.id, routeName)}
                            disabled={deletingId === routeItem.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Supprimer la ligne"
                          >
                            {deletingId === routeItem.id ? (
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
      {!loading && !error && filteredRoutes.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{' '}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredRoutes.length)}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredRoutes.length}</span> trajet(s)
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

export default RouteList;
