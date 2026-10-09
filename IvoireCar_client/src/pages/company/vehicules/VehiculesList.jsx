import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bus, 
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
  Wrench,
  XCircle,
  UserCheck,
  Loader2
} from 'lucide-react';
import api from '../../../services/api';

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
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

  // Charger la liste des véhicules depuis l'API
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/company/buses');
      setVehicles(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des véhicules :', err);
      setError(
        err.response?.data?.message || 
        'Impossible de charger la liste des véhicules. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Supprimer un véhicule
  const handleDelete = async (vehicleId, registrationNumber) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${registrationNumber} ?`)) {
      return;
    }

    setDeletingId(vehicleId);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.delete(`/api/company/buses/${vehicleId}`);
      setSuccess(response.data?.message || 'Véhicule supprimé avec succès.');
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la suppression du véhicule.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Modifier le statut directement en ligne via le Select
  const handleStatusChange = async (vehicle, newStatus) => {
    setUpdatingStatusId(vehicle.id);
    setError(null);
    setSuccess(null);

    const payload = {
      registration_number: vehicle.registration_number || vehicle.immatriculation,
      model: vehicle.model || vehicle.modele,
      capacity: vehicle.capacity || vehicle.seats,
      driver_id: vehicle.user_id || vehicle.driver_id || vehicle.driver?.id || null,
      status: newStatus,
    };

    try {
      await api.put(`/api/company/vehicles/${vehicle.id}`, payload);
      
      // Mettre à jour l'état local du véhicule
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, status: newStatus } : v))
      );
      setSuccess(`Statut du véhicule ${payload.registration_number} mis à jour.`);
    } catch (err) {
      console.error('Erreur lors du changement de statut :', err);
      setError(
        err.response?.data?.message ||
        'Impossible de modifier le statut du véhicule.'
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Métriques corrigées (inclusion du statut 'available' issu du Controller Laravel)
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(
    (v) => v.status === 'available' || v.status === 'active' || v.status === 'disponible'
  ).length;
  const maintenanceVehicles = vehicles.filter(
    (v) => v.status === 'maintenance' || v.status === 'en_panne'
  ).length;
  const inactiveVehicles = vehicles.filter(
    (v) => v.status === 'inactive' || v.status === 'hors_service' || v.status === 'in_transit'
  ).length;

  // Filtrage
  const filteredVehicles = vehicles.filter((vehicle) => {
    const registration = vehicle.registration_number || vehicle.immatriculation || '';
    const brand = vehicle.brand || vehicle.marque || '';
    const model = vehicle.model || vehicle.modele || '';
    const driverName = vehicle.driver?.name || vehicle.chauffeur?.name || '';

    const matchesSearch = 
      registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Style dynamique selon le statut sélectionné
  const getSelectStyle = (status) => {
    switch (status) {
      case 'available':
      case 'active':
      case 'disponible':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-emerald-500/20';
      case 'maintenance':
      case 'en_panne':
        return 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-amber-500/20';
      case 'inactive':
      case 'hors_service':
      case 'in_transit':
        return 'bg-rose-50 text-rose-700 border-rose-300 focus:ring-rose-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300 focus:ring-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* En-tête avec métriques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Véhicules</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalVehicles}</p>
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
            <Bus size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Service / Dispo</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeVehicles}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Maintenance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{maintenanceVehicles}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench size={20} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hors Service</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{inactiveVehicles}</p>
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
            placeholder="Immatriculation, marque, chauffeur..."
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
            
            <option value="active" className="bg-white text-blue-700 font-semibold">
                Actif / Disponible
            </option>
            <option value="maintenance" className="bg-white text-amber-700 font-semibold">
                Maintenance
            </option>
            <option value="inactive" className="bg-white text-rose-700 font-semibold">
                Hors service
            </option>
          </select>

          <button
            onClick={fetchVehicles}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-orange-600' : ''} />
          </button>

          {/* Bouton d'ajout d'un véhicule */}
          <Link
            to="add-vehicule"
            className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle size={16} />
            <span>Nouveau véhicule</span>
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
            onClick={fetchVehicles}
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

      {/* Table des Véhicules */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Véhicule</th>
                <th className="py-3.5 px-4">Immatriculation</th>
                <th className="py-3.5 px-4">Capacité</th>
                <th className="py-3.5 px-4">Chauffeur Assigné</th>
                <th className="py-3.5 px-4 text-center">Changer Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement des véhicules...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun véhicule ne correspond à "${searchTerm}"`
                        : "Aucun véhicule enregistré pour le moment."}
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
                paginatedVehicles.map((vehicle) => {
                  const registration = vehicle.registration_number || vehicle.immatriculation || 'Non spécifié';
                  const model = vehicle.model || vehicle.modele || '';
                  const capacity = vehicle.capacity || vehicle.seats || 'N/A';
                  const driverName = vehicle.driver?.name || vehicle.chauffeur?.name;
                  const currentStatus = vehicle.status || 'available';

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Marque & Modèle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                            <Bus size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{model}</p>
                            <p className="text-[11px] text-slate-400">ID: #{vehicle.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Immatriculation */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px]">
                          {registration}
                        </span>
                      </td>

                      {/* Capacité */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{capacity}</span> places
                      </td>

                      {/* Chauffeur Assigné */}
                      <td className="py-3 px-4">
                        {driverName ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <UserCheck size={14} className="text-emerald-600 shrink-0" />
                            <span>{driverName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Aucun chauffeur</span>
                        )}
                      </td>

                      {/* Selecteur de Statut Interactif */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {updatingStatusId === vehicle.id ? (
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 px-3 py-1 bg-orange-50 rounded-xl border border-orange-200">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Mise à jour...</span>
                            </div>
                          ) : (
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(vehicle, e.target.value)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border outline-none focus:ring-2 transition-all cursor-pointer ${getSelectStyle(currentStatus)}`}
                            >
                              
                              <option value="active" className="bg-white text-emerald-700 font-semibold">
                                Actif / Disponible
                              </option>
                              <option value="maintenance" className="bg-white text-amber-700 font-semibold">
                                Maintenance
                              </option>
                              <option value="inactive" className="bg-white text-rose-700 font-semibold">
                                Hors service
                              </option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton de Modification */}
                          <Link
                            to={`/company/update-vehicule/${vehicle.id}`}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier le véhicule"
                          >
                            <Edit3 size={15} />
                          </Link>

                          {/* Bouton de Suppression */}
                          <button
                            onClick={() => handleDelete(vehicle.id, registration)}
                            disabled={deletingId === vehicle.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Supprimer le véhicule"
                          >
                            {deletingId === vehicle.id ? (
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
      {!loading && !error && filteredVehicles.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Affichage de <span className="font-semibold text-slate-800">{startIndex + 1}</span> à{' '}
            <span className="font-semibold text-slate-800">{Math.min(endIndex, filteredVehicles.length)}</span> sur{' '}
            <span className="font-semibold text-slate-800">{filteredVehicles.length}</span> véhicule(s)
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

export default VehiclesList;
