import React, { useState, useEffect } from 'react';
import { 
  Package, 
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
  UserCheck,
  Edit3,
  Building2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import api from '../../../services/api';

const CompanyExpeditionList = () => {
  const [expeditions, setExpeditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExpedition, setSelectedExpedition] = useState(null);

  // Modales d'actions
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [targetExpedition, setTargetExpedition] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Formulaires
  const [newStatus, setNewStatus] = useState("");
  const [collectData, setCollectData] = useState({
    collector_name: "",
    collector_phone: "",
    collector_id_number: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(15);

  // 1. Récupération des expéditions de la compagnie (Company Admin)
  const fetchCompanyExpeditions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Route du contrôleur ParcelController::companyParcels
      const response = await api.get(`api/company/parcels?page=${page}&per_page=${itemsPerPage}`);
      
      const payload = response.data?.data || response.data || {};
      const dataList = payload.data || (Array.isArray(payload) ? payload : []);
      
      setExpeditions(dataList);
      setCurrentPage(payload.current_page || 1);
      setTotalPages(payload.last_page || 1);
      setTotalItems(payload.total || dataList.length);
    } catch (err) {
      console.error("Erreur lors de la récupération des expéditions :", err);
      setError("Impossible de charger la liste des expéditions de votre compagnie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyExpeditions(currentPage);
  }, [currentPage]);

  // Toast notification temporaire
  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // 2. Mettre à jour l'état de l'expédition (updateStatus)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetExpedition || !newStatus) return;

    try {
      setUpdating(true);
      const response = await api.patch(`api/company/parcels/${targetExpedition.id}/status`, {
        status: newStatus
      });

      showNotification(response.data?.message || "Statut mis à jour avec succès !");
      setShowStatusModal(false);
      setTargetExpedition(null);
      
      // Mettre à jour la vue sélectionnée si la modale de détail est ouverte
      if (selectedExpedition && selectedExpedition.id === targetExpedition.id) {
        setSelectedExpedition({ ...selectedExpedition, status: newStatus });
      }

      fetchCompanyExpeditions(currentPage);
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
      alert(err.response?.data?.message || "Échec de la mise à jour du statut.");
    } finally {
      setUpdating(false);
    }
  };

  // 3. Remise du colis au destinataire (collect)
  const handleCollectParcel = async (e) => {
    e.preventDefault();
    if (!targetExpedition) return;

    try {
      setUpdating(true);
      const response = await api.post(`api/company/parcels/${targetExpedition.id}/collect`, collectData);

      showNotification(response.data?.message || "Colis remis au destinataire avec succès !");
      setShowCollectModal(false);
      setTargetExpedition(null);
      setCollectData({ collector_name: "", collector_phone: "", collector_id_number: "" });

      if (selectedExpedition && selectedExpedition.id === targetExpedition.id) {
        setSelectedExpedition(response.data?.parcel || { ...selectedExpedition, status: 'collected' });
      }

      fetchCompanyExpeditions(currentPage);
    } catch (err) {
      console.error("Erreur lors du retrait du colis :", err);
      alert(err.response?.data?.message || "Échec de l'enregistrement de la remise.");
    } finally {
      setUpdating(false);
    }
  };

  // Formateur de devise FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Métriques
  const getStatusCount = (status) => {
    return expeditions.filter((e) => (e.status || '').toLowerCase() === status.toLowerCase()).length;
  };

  const totalShippingCost = expeditions.reduce((sum, e) => sum + (parseFloat(e.shipping_cost || e.price) || 0), 0);

  const metrics = [
    { label: "Total Expéditions", count: totalItems, icon: Package, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "En Transit", count: getStatusCount('in_transit'), icon: Truck, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Arrivés en Gare", count: getStatusCount('arrived_at_destination'), icon: Building2, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Chiffre Fret (Page)", count: formatCurrency(totalShippingCost), icon: Banknote, color: "text-teal-600 bg-teal-50 border-teal-100" },
  ];

  // Design des badges
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'collected':
      case 'delivered':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case 'in_transit':
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'arrived_at_destination':
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case 'received_at_station':
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case 'pending':
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case 'cancelled':
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'En Attente';
      case 'received_at_station': return 'Réceptionné Gare';
      case 'in_transit': return 'En Transit';
      case 'arrived_at_destination': return 'Arrivé en Gare';
      case 'collected': return 'Retiré / Livré';
      case 'cancelled': return 'Annulé';
      default: return status || 'N/A';
    }
  };

  // Filtrage
  const filteredExpeditions = expeditions.filter((exp) => {
    const trackingCode = exp.tracking_code || '';
    const senderName = exp.sender_name || exp.sender?.name || '';
    const recipientName = exp.recipient_name || exp.receiver_name || '';
    const recipientPhone = exp.recipient_phone || exp.receiver_phone || '';
    const departure = exp.departure_station?.name || exp.departure_station?.city || '';
    const arrival = exp.arrival_station?.name || exp.arrival_station?.city || '';
    const status = (exp.status || '').toLowerCase();

    const matchesSearch = 
      trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arrival.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Toast Notification de Succès */}
      {actionSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold animate-bounce">
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* En-tête Métriques */}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher code, expéditeur, destinataire..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
            <option value="received_at_station">Réceptionné Gare</option>
            <option value="in_transit">En Transit</option>
            <option value="arrived_at_destination">Arrivé en Gare</option>
            <option value="collected">Retiré / Livré</option>
          </select>

          <button
            onClick={() => fetchCompanyExpeditions(currentPage)}
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
            onClick={() => fetchCompanyExpeditions(currentPage)}
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
                <th className="py-3.5 px-4">Frais Fret</th>
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
                      <span>Chargement des colis de votre compagnie...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpeditions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucune expédition ne correspond à "${searchTerm}"`
                        : "Aucune expédition enregistrée pour votre compagnie."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
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
                  const recipientName = exp.recipient_name || exp.receiver_name || "Inconnu";
                  const recipientPhone = exp.recipient_phone || exp.receiver_phone;
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Mettre à jour le statut */}
                          {exp.status !== 'collected' && (
                            <button
                              onClick={() => {
                                setTargetExpedition(exp);
                                setNewStatus(exp.status || 'received_at_station');
                                setShowStatusModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                              title="Changer le statut"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {/* Effectuer le retrait */}
                          {exp.status === 'arrived_at_destination' && (
                            <button
                              onClick={() => {
                                setTargetExpedition(exp);
                                setCollectData({
                                  collector_name: exp.recipient_name || exp.receiver_name || '',
                                  collector_phone: exp.recipient_phone || exp.receiver_phone || '',
                                  collector_id_number: ''
                                });
                                setShowCollectModal(true);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Remettre au destinataire"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}

                          {/* Détails */}
                          <button
                            onClick={() => setSelectedExpedition(exp)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
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

      {/* MODAL 1: Changement d'état de l'expédition */}
      {showStatusModal && targetExpedition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowStatusModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mettre à jour le statut</h3>
                <p className="text-xs text-slate-400">Colis #{targetExpedition.tracking_code}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Nouveau statut :</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-slate-800 cursor-pointer"
                >
                  <option value="received_at_station">Réceptionné à la gare de départ</option>
                  <option value="in_transit">En cours d'expédition (En transit)</option>
                  <option value="arrived_at_destination">Arrivé à la gare de destination</option>
                </select>

              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {updating && <RefreshCw size={14} className="animate-spin" />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Remise au destinataire (Collect) */}
      {showCollectModal && targetExpedition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setShowCollectModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowCollectModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remise du Colis</h3>
                <p className="text-xs text-slate-400">Code: #{targetExpedition.tracking_code}</p>
              </div>
            </div>

            <form onSubmit={handleCollectParcel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nom complet du récepteur *</label>
                <input
                  type="text"
                  required
                  value={collectData.collector_name}
                  onChange={(e) => setCollectData({ ...collectData, collector_name: e.target.value })}
                  placeholder="ex: KOUASSI Jean"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Téléphone du récepteur *</label>
                <input
                  type="text"
                  required
                  value={collectData.collector_phone}
                  onChange={(e) => setCollectData({ ...collectData, collector_phone: e.target.value })}
                  placeholder="ex: 0707070707"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">N° CNI / Pièce d'identité *</label>
                <input
                  type="text"
                  required
                  value={collectData.collector_id_number}
                  onChange={(e) => setCollectData({ ...collectData, collector_id_number: e.target.value })}
                  placeholder="ex: C0012345678"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {updating && <RefreshCw size={14} className="animate-spin" />}
                  <span>Confirmer la remise</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Détails du Colis */}
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
              <div className="flex-1">
                <div className="flex justify-between items-center pr-6">
                  <h3 className="text-base font-bold text-slate-900">Colis #{selectedExpedition.tracking_code}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeStyle(selectedExpedition.status)}`}>
                    {getStatusLabel(selectedExpedition.status)}
                  </span>
                </div>
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Destinataire Prévu</p>
                  <p className="font-bold text-slate-800">{selectedExpedition.recipient_name || selectedExpedition.receiver_name || 'N/A'}</p>
                  <p className="text-[11px] text-slate-500">{selectedExpedition.recipient_phone || selectedExpedition.receiver_phone || 'N/A'}</p>
                </div>
              </div>

              {/* Trajet */}
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

              {/* Description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Description du Colis</p>
                <p className="text-slate-700 italic">{selectedExpedition.description || 'Aucune description'}</p>
                <div className="flex gap-4 pt-1 text-[11px] text-slate-600 font-medium">
                  <span>Poids: <strong>{selectedExpedition.weight_kg ? `${selectedExpedition.weight_kg} kg` : 'N/A'}</strong></span>
                  <span>Valeur déclarée: <strong>{formatCurrency(selectedExpedition.estimated_value)}</strong></span>
                </div>
              </div>

              {/* Infos Retrait si le colis est retiré */}
              {selectedExpedition.collector_name && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <UserCheck size={14} />
                    <span>Informations de Retrait</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                    <p>Récupéré par: <strong>{selectedExpedition.collector_name}</strong></p>
                    <p>Téléphone: <strong>{selectedExpedition.collector_phone || 'N/A'}</strong></p>
                    <p>N° Pièce: <strong>{selectedExpedition.collector_id_number || 'N/A'}</strong></p>
                    <p>Date: <strong>{selectedExpedition.collected_at ? new Date(selectedExpedition.collected_at).toLocaleDateString('fr-FR') : 'N/A'}</strong></p>
                  </div>
                </div>
              )}

              {/* Tarifs et Actions rapides dans la modale */}
              <div className="flex justify-between items-center p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Mode de Paiement</p>
                  <p className="font-bold text-indigo-900 uppercase">{selectedExpedition.payment_method || 'ESPÈCES / WAVE'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Frais Fret</p>
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

export default CompanyExpeditionList;
