import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Building2, 
  MapPin, 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Banknote,
  Calendar,
  Eye,
  Truck,
  Weight,
  UserCheck
} from 'lucide-react';
import api from '../../../services/api';

const ExpeditionList = () => {
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExpedition, setSelectedExpedition] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(15);

  // Récupération des expéditions (colis) depuis l'API Laravel
  const fetchExpeditions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`api/admin/parcels?page=${page}&per_page=${itemsPerPage}`);
      
      const payload = response.data?.data || response.data || {};
      const dataList = payload.data || (Array.isArray(payload) ? payload : []);
      
      setExpeditions(dataList);
      setCurrentPage(payload.current_page || 1);
      setTotalPages(payload.last_page || 1);
      setTotalItems(payload.total || dataList.length);
    } catch (err) {
      console.error("Erreur lors de la récupération des expéditions :", err);
      setError("Impossible de charger la liste des expéditions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpeditions(currentPage);
  }, [currentPage]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Formateur de devise FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Compteurs par statut
  const getStatusCount = (status) => {
    return expeditions.filter((e) => (e.status || '').toLowerCase() === status.toLowerCase()).length;
  };

  const totalShippingCost = expeditions.reduce((sum, e) => sum + (parseFloat(e.shipping_cost || e.price) || 0), 0);

  const metrics = [
    { label: "Total Expéditions", count: totalItems, icon: Package, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "En Transit", count: getStatusCount('in_transit'), icon: Truck, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Livrées / Retirées", count: getStatusCount('collected'), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Chiffre Fret (Page)", count: formatCurrency(totalShippingCost), icon: Banknote, color: "text-teal-600 bg-teal-50 border-teal-100" },
  ];

  // Stylisation du statut d'expédition
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'collected':
      case 'delivered':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case 'in_transit':
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'arrived_at_destination':
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case 'pending':
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case 'cancelled':
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Libellés conviviaux des statuts
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'En Attente';
      case 'in_transit': return 'En Transit';
      case 'arrived_at_destination': return 'Arrivé en Gare';
      case 'collected': return 'Retiré / Livré';
      case 'cancelled': return 'Annulé';
      default: return status || 'N/A';
    }
  };

  // Filtrage selon la recherche et le statut
  const filteredExpeditions = expeditions.filter((exp) => {
    const trackingCode = exp.tracking_code || '';
    const senderName = exp.sender_name || exp.sender?.name || '';
    const recipientName = exp.recipient_name || '';
    const recipientPhone = exp.recipient_phone || '';
    const companyName = exp.company?.name || '';
    const departure = exp.departure_station?.name || exp.departure_station?.city || '';
    const arrival = exp.arrival_station?.name || exp.arrival_station?.city || '';
    const status = (exp.status || '').toLowerCase();

    const matchesSearch = 
      trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arrival.toLowerCase().includes(searchTerm.toLowerCase());

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
            placeholder="Rechercher code, expéditeur, destinataire..."
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
            <option value="pending">En Attente</option>
            <option value="in_transit">En Transit</option>
            <option value="arrived_at_destination">Arrivé en Gare</option>
            <option value="collected">Retiré / Livré</option>
          </select>

          <button
            onClick={() => fetchExpeditions(currentPage)}
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
            onClick={() => fetchExpeditions(currentPage)}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-[11px] cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table des Expéditions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Code Suivi</th>
                <th className="py-3.5 px-4">Expéditeur ➔ Destinataire</th>
                <th className="py-3.5 px-4">Trajet (Départ ➔ Arrivée)</th>
                <th className="py-3.5 px-4">Compagnie</th>
                <th className="py-3.5 px-4">Frais Expédition</th>
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
                      <span>Chargement des expéditions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpeditions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucune expédition ne correspond à "${searchTerm}"`
                        : "Aucune expédition trouvée."}
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
                filteredExpeditions.map((exp) => {
                  const senderName = exp.sender_name || exp.sender?.name || "Inconnu";
                  const recipientName = exp.recipient_name || "Inconnu";
                  const recipientPhone = exp.recipient_phone;
                  const companyName = exp.company?.name || "N/A";
                  const depStation = exp.departure_station?.name || exp.departure_station?.city || "N/A";
                  const arrStation = exp.arrival_station?.name || exp.arrival_station?.city || "N/A";
                  const createdDate = exp.created_at ? new Date(exp.created_at).toLocaleDateString('fr-FR') : "N/A";

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code Suivi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                            <Package size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{exp.tracking_code}</p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar size={11} />
                              <span>{createdDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Expéditeur ➔ Destinataire */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-800 font-medium truncate max-w-[160px]">
                            <span className="text-slate-400 text-[10px] uppercase block">De:</span> {senderName}
                          </div>
                          <div className="text-slate-600 font-bold truncate max-w-[160px]">
                            <span className="text-slate-400 text-[10px] uppercase block">À:</span> {recipientName}
                            {recipientPhone && <span className="font-normal text-[11px] text-slate-400 ml-1">({recipientPhone})</span>}
                          </div>
                        </div>
                      </td>

                      {/* Trajet */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin size={13} className="text-indigo-500 shrink-0" />
                          <span>{depStation}</span>
                          <span className="text-slate-400">➔</span>
                          <span>{arrStation}</span>
                        </div>
                      </td>

                      {/* Compagnie */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 size={13} className="text-orange-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{companyName}</span>
                        </div>
                      </td>

                      {/* Frais */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{formatCurrency(exp.shipping_cost || exp.price)}</span>
                        {exp.weight_kg && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Weight size={10} />
                            <span>{exp.weight_kg} kg</span>
                          </div>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(
                            exp.status
                          )}`}
                        >
                          {getStatusLabel(exp.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedExpedition(exp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Voir les détails"
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
            <span className="font-semibold text-slate-800">{totalItems}</span> expédition(s)
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

      {/* Modal Détails Colis */}
      {selectedExpedition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setSelectedExpedition(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedExpedition(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Package size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Colis #{selectedExpedition.tracking_code}</h3>
                <p className="text-xs text-slate-400">
                  Enregistré le {selectedExpedition.created_at ? new Date(selectedExpedition.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Expéditeur & Destinataire */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Expéditeur</p>
                  <p className="font-bold text-slate-800">{selectedExpedition.sender_name || selectedExpedition.sender?.name || 'N/A'}</p>
                  <p className="text-[11px] text-slate-500">{selectedExpedition.sender_phone || selectedExpedition.sender?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Destinataire</p>
                  <p className="font-bold text-slate-800">{selectedExpedition.recipient_name || 'N/A'}</p>
                  <p className="text-[11px] text-slate-500">{selectedExpedition.recipient_phone || 'N/A'}</p>
                </div>
              </div>

              {/* Trajet & Compagnie */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gare de Départ</p>
                  <p className="font-bold text-slate-800">{selectedExpedition.departure_station?.name || selectedExpedition.departure_station?.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gare d'Arrivée</p>
                  <p className="font-bold text-slate-800">{selectedExpedition.arrival_station?.name || selectedExpedition.arrival_station?.city || 'N/A'}</p>
                </div>
              </div>

              {/* Spécifications du Colis */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Description du Colis</p>
                <p className="text-slate-700 italic">{selectedExpedition.description || 'Aucune description'}</p>
                <div className="flex gap-4 pt-1 text-[11px] text-slate-600 font-medium">
                  <span>Poids: <strong>{selectedExpedition.weight_kg ? `${selectedExpedition.weight_kg} kg` : 'N/A'}</strong></span>
                  <span>Valeur estimée: <strong>{formatCurrency(selectedExpedition.estimated_value)}</strong></span>
                </div>
              </div>

              {/* Retrait (si disponible) */}
              {selectedExpedition.collector_name && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <UserCheck size={14} />
                    <span>Informations de Retrait</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                    <p>Récupéré par: <strong>{selectedExpedition.collector_name}</strong></p>
                    <p>Téléphone: <strong>{selectedExpedition.collector_phone || 'N/A'}</strong></p>
                    <p>N° Piece: <strong>{selectedExpedition.collector_id_number || 'N/A'}</strong></p>
                    <p>Date: <strong>{selectedExpedition.collected_at ? new Date(selectedExpedition.collected_at).toLocaleDateString('fr-FR') : 'N/A'}</strong></p>
                  </div>
                </div>
              )}

              {/* Tarifs et Paiement */}
              <div className="flex justify-between items-center p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Mode de Paiement</p>
                  <p className="font-bold text-indigo-900 uppercase">{selectedExpedition.payment_method || 'ESPÈCES / WAVE'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Frais d'Expédition</p>
                  <p className="text-base font-extrabold text-indigo-700">{formatCurrency(selectedExpedition.shipping_cost || selectedExpedition.price)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpeditionList;
