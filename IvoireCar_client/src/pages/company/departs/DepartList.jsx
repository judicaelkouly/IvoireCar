import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  X, 
  RefreshCw, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  CheckCheck, 
  XCircle, 
  MapPin, 
  Bus, 
  User, 
  Ticket, 
  PlusCircle, 
  Navigation,
  Edit3,
  Trash2,
  Repeat
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const DepartList = () => {
  const navigate = useNavigate();

  // Données
  const [departures, setDepartures] = useState([]);
  const [scheduleTemplates, setScheduleTemplates] = useState([]);
  
  // États de chargement et retours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filtres & Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('recurring'); // 'one_time' (ponctuels), 'recurring' (récurrents), 'all'

  // Modale & Actions
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Charger la liste selon le contexte
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeFilter === 'all') {
        // Chargement parallèle des deux sources de données
        const [depRes, tempRes] = await Promise.all([
          api.get('api/company/departures'),
          api.get('api/company/schedule-templates'),
        ]);
        setDepartures(depRes.data?.data || depRes.data || []);
        setScheduleTemplates(tempRes.data?.data || tempRes.data || []);
      } else if (typeFilter === 'recurring') {
        const res = await api.get('api/company/schedule-templates');
        setScheduleTemplates(res.data?.data || res.data || []);
      } else {
        // 'one_time'
        const res = await api.get('api/company/departures');
        setDepartures(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement données :', err);
      setError(
        err.response?.data?.message ||
        'Impossible de charger la liste. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  // Formatage de date et d'heure pour départs ponctuels
  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Formatage des jours pour départs récurrents
  const formatDays = (days) => {
    if (!days) return 'Non spécifié';
    if (Array.isArray(days)) return days.join(', ');
    return days;
  };

  // Changement de statut (pour les départs ponctuels)
  const handleStatusChange = async (departureId, newStatus) => {
    setUpdatingId(departureId);
    setError(null);
    setSuccess(null);

    try {
      await api.put(`api/company/departures/${departureId}`, { status: newStatus });
      
      setDepartures((prev) =>
        prev.map((d) => (d.id === departureId ? { ...d, status: newStatus } : d))
      );

      if (selectedItem && selectedItem.id === departureId) {
        setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      }

      setSuccess('Statut mis à jour avec succès.');
    } catch (err) {
      console.error('Erreur modification statut :', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle Activation (Départs ponctuels vs Templates récurrents)
  const handleToggleActive = async (item, isTemplate = false) => {
    const updatedStatus = !item.is_active;
    setUpdatingId(item.id);
    setError(null);
    setSuccess(null);

    const endpoint = isTemplate
      ? `api/company/schedule-templates/${item.id}/toggle-active`
      : `api/company/departures/${item.id}/toggle-active`;

    try {
      const response = await api.patch(endpoint, { is_active: updatedStatus });
      const finalActive = response.data?.is_active ?? updatedStatus;

      if (isTemplate) {
        setScheduleTemplates((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, is_active: finalActive } : t))
        );
      } else {
        setDepartures((prev) =>
          prev.map((d) => (d.id === item.id ? { ...d, is_active: finalActive } : d))
        );
      }

      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem((prev) => ({ ...prev, is_active: finalActive }));
      }

      setSuccess(`Élément ${finalActive ? 'activé' : 'désactivé'} avec succès.`);
    } catch (err) {
      console.error('Erreur toggle active :', err);
      setError(err.response?.data?.message || "Erreur lors de la modification d'activation.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Suppression (Départs ponctuels vs Templates récurrents)
  const handleDelete = async (item, isTemplate = false) => {
    const label = isTemplate ? 'ce programme récurrent' : 'ce départ ponctuel';
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${label} ?`)) {
      return;
    }

    setDeletingId(item.id);
    setError(null);
    setSuccess(null);

    const endpoint = isTemplate
      ? `api/company/schedule-templates/${item.id}`
      : `api/company/departures/${item.id}`;

    try {
      await api.delete(endpoint);

      if (isTemplate) {
        setScheduleTemplates((prev) => prev.filter((t) => t.id !== item.id));
      } else {
        setDepartures((prev) => prev.filter((d) => d.id !== item.id));
      }

      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem(null);
      }

      setSuccess('Suppression effectuée avec succès.');
    } catch (err) {
      console.error('Erreur suppression :', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  // Normalisation des objets pour l'affichage combiné en mode "all"
  const normalizedData = React.useMemo(() => {
    let list = [];

    if (typeFilter === 'all' || typeFilter === 'one_time') {
      const formattedDeps = departures.map((d) => ({
        ...d,
        _isTemplate: false,
      }));
      list = [...list, ...formattedDeps];
    }

    if (typeFilter === 'all' || typeFilter === 'recurring') {
      const formattedTemps = scheduleTemplates.map((t) => ({
        ...t,
        _isTemplate: true,
      }));
      list = [...list, ...formattedTemps];
    }

    return list;
  }, [departures, scheduleTemplates, typeFilter]);

  // Filtrage combiné (Recherche + Statut)
  const filteredList = normalizedData.filter((item) => {
    const code = item.code || '';
    const routeName = item.route?.name || item.route?.title || '';
    const stationName = item.departure_station?.name || item.departureStation?.name || '';
    const driverName = item.driver?.name || '';
    const busNum = item.bus?.registration_number || item.bus?.immatriculation || '';

    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      busNum.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || item._isTemplate || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Métriques
  const scheduledCount = departures.filter((d) => d.status === 'scheduled').length;
  const inTransitCount = departures.filter((d) => d.status === 'in_transit').length;
  const completedCount = departures.filter((d) => d.status === 'completed').length;
  const recurringCount = scheduleTemplates.length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Badge de Statut
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
            <Clock size={12} /> Programmation
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
            <Navigation size={12} /> En route
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <CheckCheck size={12} /> Terminé
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full">
            <XCircle size={12} /> Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {status || 'N/A'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cartes Métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Programmés</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{scheduledCount}</p>
          </div>
          <div className="p-2 bg-amber-100/60 text-amber-600 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">En route</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{inTransitCount}</p>
          </div>
          <div className="p-2 bg-blue-100/60 text-blue-600 rounded-lg">
            <Navigation size={18} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Terminés</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{completedCount}</p>
          </div>
          <div className="p-2 bg-emerald-100/60 text-emerald-600 rounded-lg">
            <CheckCheck size={18} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Horaires Récurrents</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{recurringCount}</p>
          </div>
          <div className="p-2 bg-purple-100/60 text-purple-600 rounded-lg">
            <Repeat size={18} />
          </div>
        </div>
      </div>

      {/* Recherche, Filtres & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Champ de Recherche */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Code, ligne, gare, chauffeur..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
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

        {/* Filtres & Boutons d'action */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Filtre Type principal */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
          >
            <option value="recurring">Horaires Récurrents</option>
            <option value="one_time">Départs Ponctuels</option>
            <option value="all">Tous les départs & récurrences</option>
          </select>

          {/* Filtre Statut (s'applique principalement aux départs ponctuels) */}
          {typeFilter !== 'recurring' && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Programmés ({scheduledCount})</option>
              <option value="in_transit">En route ({inTransitCount})</option>
              <option value="completed">Terminés ({completedCount})</option>
              <option value="cancelled">Annulés</option>
            </select>
          )}

          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-600' : ''} />
          </button>

          <Link
            to={typeFilter === 'recurring' ? 'add-depart' : 'add-depart'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle size={16} />
            <span>
              {typeFilter === 'recurring' ? 'Nouveau Récurrent' : 'Nouveau Départ'}
            </span>
          </Link>
        </div>
      </div>

      {/* Notifications / Messages */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
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

      {/* Tableau Dynamique */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Code / Type</th>
                <th className="py-3.5 px-4">
                  {typeFilter === 'recurring' ? 'Jours / Heure' : 'Date & Heure / Fréquence'}
                </th>
                <th className="py-3.5 px-4">Ligne & Gare</th>
                <th className="py-3.5 px-4">Véhicule</th>
                <th className="py-3.5 px-4">Chauffeur</th>
                {typeFilter !== 'recurring' && <th className="py-3.5 px-4 text-center">Places</th>}
                <th className="py-3.5 px-4 text-center">Actif</th>
                {typeFilter !== 'recurring' && <th className="py-3.5 px-4 text-center">Statut</th>}
                {typeFilter !== 'recurring' && <th className="py-3.5 px-4 text-center">Changer Statut</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-indigo-600" size={24} />
                      <span>Chargement des données...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun résultat pour "${searchTerm}"`
                        : 'Aucune donnée enregistrée pour le moment.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const isTemplate = item._isTemplate;
                  const routeName = item.route?.name || item.route?.title || 'Ligne non spécifiée';
                  const stationName = item.departure_station?.name || item.departureStation?.name || 'Gare non spécifiée';
                  const busReg = item.bus?.registration_number || item.bus?.immatriculation || 'Bus non assigné';
                  const busModel = item.bus?.model || item.bus?.modele || '';

                  return (
                    <tr
                      key={`${isTemplate ? 'tpl' : 'dep'}-${item.id}`}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* Code / Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isTemplate ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-lg">
                            <Repeat size={12} /> Récurrent #{item.id}
                          </span>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-lg w-fit mb-1">
                              <Ticket size={12} />
                              <span>{item.code || `DEP-#${item.id}`}</span>
                            </div>
                            {item.schedule_template_id && (
                              <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-0.5">
                                <Repeat size={10} /> issu de modèle
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Date & Heure / Jours */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isTemplate ? (
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1">
                              <Calendar size={12} className="text-purple-600" />
                              {formatDays(item.days_of_week)}
                            </p>
                            <p className="text-[11px] font-semibold text-purple-700 mt-0.5 flex items-center gap-1">
                              <Clock size={11} />
                              {item.departure_time || item.time || 'Non spécifié'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-900">{formatDate(item.departure_time).date}</p>
                            <p className="text-[11px] font-semibold text-indigo-600">{formatDate(item.departure_time).time}</p>
                          </div>
                        )}
                      </td>

                      {/* Ligne & Gare */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{routeName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate max-w-[140px]">{stationName}</span>
                        </div>
                      </td>

                      {/* Véhicule */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Bus size={13} className={isTemplate ? 'text-purple-600' : 'text-indigo-600'} />
                          <span>{busReg}</span>
                        </div>
                        {busModel && <p className="text-[11px] text-slate-400">{busModel}</p>}
                      </td>

                      {/* Chauffeur */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <User size={13} className="text-slate-400" />
                          <span>{item.driver?.name || 'Non assigné'}</span>
                        </div>
                      </td>

                      {/* Places Disponibles (Uniquement départs) */}
                      {typeFilter !== 'recurring' && (
                        <td className="py-3 px-4 text-center">
                          {!isTemplate ? (
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs">
                              {item.available_seats ?? 'N/A'} places
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}

                      {/* Toggle Actif / Inactif */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => handleToggleActive(item, isTemplate)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            item.is_active ? (isTemplate ? 'bg-purple-600' : 'bg-indigo-600') : 'bg-slate-200'
                          }`}
                          title={item.is_active ? 'Désactiver' : 'Activer'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              item.is_active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Statut Badge (Uniquement départs) */}
                      {typeFilter !== 'recurring' && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {!isTemplate ? renderStatusBadge(item.status) : <span className="text-slate-300">-</span>}
                        </td>
                      )}

                      {/* Sélecteur de statut rapide (Uniquement départs) */}
                      {typeFilter !== 'recurring' && (
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {!isTemplate ? (
                            <select
                              disabled={updatingId === item.id}
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer disabled:opacity-50"
                            >
                              <option value="scheduled">Programmer</option>
                              <option value="in_transit">En route</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled">Annuler</option>
                            </select>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Aperçu"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                isTemplate
                                  ? `/company/update-depart/${item.id}`
                                  : `/company/update-depart/${item.id}`
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item, isTemplate)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={16} className={deletingId === item.id ? 'animate-pulse text-rose-600' : ''} />
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
      {!loading && !error && filteredList.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{' '}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredList.length)}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredList.length}</span> élément(s)
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

      {/* Modale de Détails */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 relative max-h-[90vh] overflow-y-auto border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedItem._isTemplate ? (
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Repeat size={10} /> Horaire Type Récurrent
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Départ Ponctuel
                  </span>
                )}

                {!selectedItem._isTemplate && renderStatusBadge(selectedItem.status)}

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedItem.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedItem.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
                <span>
                  {selectedItem._isTemplate
                    ? `Programme Récurrent #${selectedItem.id}`
                    : `Code : ${selectedItem.code || `DEP-#${selectedItem.id}`}`}
                </span>
              </h3>

              <p className="text-xs text-slate-400">
                {selectedItem._isTemplate
                  ? `Fréquence : ${formatDays(selectedItem.days_of_week)} à ${selectedItem.departure_time || selectedItem.time}`
                  : `Départ prévu le ${formatDate(selectedItem.departure_time).date} à ${formatDate(selectedItem.departure_time).time}`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ligne</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedItem.route?.name || selectedItem.route?.title || 'Non spécifiée'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gare de Départ</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedItem.departure_station?.name || selectedItem.departureStation?.name || 'Non spécifiée'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Véhicule</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedItem.bus?.registration_number || selectedItem.bus?.immatriculation || 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chauffeur</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedItem.driver?.name || 'Non assigné'}
                </p>
              </div>
            </div>

            {!selectedItem._isTemplate && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Mettre à jour le statut :</span>
                <select
                  disabled={updatingId === selectedItem.id}
                  value={selectedItem.status}
                  onChange={(e) => handleStatusChange(selectedItem.id, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer"
                >
                  <option value="scheduled">Programmer</option>
                  <option value="in_transit">En route</option>
                  <option value="completed">Terminer</option>
                  <option value="cancelled">Annuler</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartList;
