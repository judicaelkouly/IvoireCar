import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Building2, 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  Users,
  CheckCircle2,
  XCircle,
  Wrench,
  Wifi,
  Tv,
  Snowflake
} from 'lucide-react';
import api from '../../../services/api';

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBus, setSelectedBus] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(15);

  // Récupération de la flotte de bus depuis l'API Laravel
  const fetchBuses = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`api/admin/buses?page=${page}&per_page=${itemsPerPage}`);
      
      const payload = response.data?.data || response.data || {};
      const dataList = payload.data || (Array.isArray(payload) ? payload : []);
      
      setBuses(dataList);
      setCurrentPage(payload.current_page || 1);
      setTotalPages(payload.last_page || 1);
      setTotalItems(payload.total || dataList.length);
    } catch (err) {
      console.error("Erreur lors de la récupération des bus :", err);
      setError("Impossible de charger la liste des véhicules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses(currentPage);
  }, [currentPage]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Compteurs par statut
  const getStatusCount = (status) => {
    return buses.filter((b) => (b.status || '').toLowerCase() === status.toLowerCase()).length;
  };


  const metrics = [
    { label: "Total Véhicules", count: totalItems, icon: Bus, color: "text-orange-600 bg-orange-50 border-orange-100" },
    { label: "En Service / Actifs", count: getStatusCount('active') || getStatusCount('in_service'), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "En Maintenance", count: getStatusCount('maintenance'), icon: Wrench, color: "text-amber-600 bg-amber-50 border-amber-100" },
  ];

  // Stylisation du statut du bus
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_service':
      case 'disponible':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case 'maintenance':
      case 'en_panne':
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'inactive':
      case 'hors_service':
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Libellés conviviaux des statuts
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_service':
      case 'disponible': 
        return 'En Service';
      case 'maintenance': 
      case 'en_panne': 
        return 'Maintenance';
      case 'inactive': 
      case 'hors_service': 
        return 'Hors Service';
      default: 
        return status || 'N/A';
    }
  };

  // Filtrage selon la recherche et le statut
  const filteredBuses = buses.filter((bus) => {
    const registrationNumber = bus.registration_number || bus.immatriculation || bus.plate_number || '';
    const busModel = bus.model || bus.brand || '';
    const companyName = bus.company?.name || '';
    const busNumber = bus.bus_number || bus.number || '';
    const status = (bus.status || '').toLowerCase();

    const matchesSearch = 
      registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      busModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      busNumber.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* En-tête avec métriques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">{m.count}</p>
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
            placeholder="Rechercher immatriculation, modèle, compagnie..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtre Statut & Rafraîchissement */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">En Service</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Hors Service</option>
          </select>

          <button
            onClick={() => fetchBuses(currentPage)}
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
            onClick={() => fetchBuses(currentPage)}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-[11px] cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table des Bus */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Véhicule / Immatriculation</th>
                <th className="py-3.5 px-4">Compagnie</th>
                <th className="py-3.5 px-4">Modèle / Marque</th>
                <th className="py-3.5 px-4">Capacité</th>
                <th className="py-3.5 px-4">Équipements</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span>Chargement de la flotte de bus...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucun véhicule ne correspond à "${searchTerm}"`
                        : "Aucun véhicule trouvé."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => handleSearchChange("")}
                        className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => {
                  const plateNumber = bus.registration_number || bus.immatriculation || bus.plate_number || "N/A";
                  const companyName = bus.company?.name || "N/A";
                  const modelName = bus.model || bus.brand || "Standard";
                  const capacity = bus.capacity || bus.total_seats || 0;
                  const busCode = bus.bus_number ? `Bus #${bus.bus_number}` : `ID: ${bus.id}`;

                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Immatriculation */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                            <Bus size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{plateNumber}</p>
                            <span className="text-[11px] text-slate-400 font-medium">{busCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Compagnie */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 size={13} className="text-orange-500 shrink-0" />
                          <span className="truncate max-w-[160px]">{companyName}</span>
                        </div>
                      </td>

                      {/* Modèle */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{modelName}</span>
                      </td>

                      {/* Capacité */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Users size={14} className="text-indigo-500" />
                          <span>{capacity} places</span>
                        </div>
                      </td>

                      {/* Équipements */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          {bus.has_wifi && <Wifi size={14} className="text-emerald-600" title="Wi-Fi disponible" />}
                          {bus.has_ac && <Snowflake size={14} className="text-blue-500" title="Climatisation" />}
                          {bus.has_tv && <Tv size={14} className="text-purple-500" title="Écran / TV" />}
                          {!bus.has_wifi && !bus.has_ac && !bus.has_tv && <span className="text-[11px] text-slate-400">Standard</span>}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(
                            bus.status
                          )}`}
                        >
                          {getStatusLabel(bus.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedBus(bus)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Voir la fiche véhicule"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination serveur */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800">{currentPage}</span> sur{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span> — Total{" "}
            <span className="font-semibold text-slate-800">{totalItems}</span> véhicule(s)
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
              {currentPage} / {totalPages}
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

      {/* Modal Fiche Détails du Bus */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setSelectedBus(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedBus(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Bus size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedBus.registration_number || selectedBus.immatriculation || 'Immatriculation N/A'}
                </h3>
                <p className="text-xs text-slate-400">
                  Compagnie : {selectedBus.company?.name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Infos Générales */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Marque / Modèle</p>
                  <p className="font-bold text-slate-800">{selectedBus.model || selectedBus.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Capacité Assise</p>
                  <p className="font-bold text-slate-800">{selectedBus.capacity || selectedBus.total_seats || 0} Sièges</p>
                </div>
              </div>

              {/* Équipements de confort */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Équipements & Confort</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 ${selectedBus.has_ac ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <Snowflake size={16} />
                    <span className="text-[10px] font-bold">Climatisation</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 ${selectedBus.has_wifi ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <Wifi size={16} />
                    <span className="text-[10px] font-bold">Wi-Fi Gratuit</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 ${selectedBus.has_tv ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <Tv size={16} />
                    <span className="text-[10px] font-bold">Écran TV</span>
                  </div>
                </div>
              </div>

              {/* Statut opérationnel */}
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Statut Actuel</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 border ${getStatusBadgeStyle(selectedBus.status)}`}>
                    {getStatusLabel(selectedBus.status)}
                  </span>
                </div>
                {selectedBus.last_maintenance && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dernière Révision</p>
                    <p className="font-bold text-slate-700">{new Date(selectedBus.last_maintenance).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusList;
