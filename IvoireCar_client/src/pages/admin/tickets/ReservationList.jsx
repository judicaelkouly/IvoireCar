import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Building2, 
  MapPin, 
  User, 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  Banknote,
  Calendar,
  Eye
} from 'lucide-react';
import api from '../../../services/api';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Récupération des réservations depuis l'API Laravel
  const fetchReservations = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`api/admin/reservations?page=${page}&per_page=${itemsPerPage}`);
      
      const payload = response.data?.data || response.data || {};
      const dataList = payload.data || (Array.isArray(payload) ? payload : []);
      
      setReservations(dataList);
      setCurrentPage(payload.current_page || 1);
      setTotalPages(payload.last_page || 1);
      setTotalItems(payload.total || dataList.length);
    } catch (err) {
      console.error("Erreur lors de la récupération des réservations :", err);
      setError("Impossible de charger la liste des réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(currentPage);
  }, [currentPage]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Formateur de devise FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Métriques calculées sur le lot actuel ou la globale
  const getStatusCount = (status) => {
    return reservations.filter((r) => (r.payment_status || '').toUpperCase() === status.toUpperCase()).length;
  };

  const totalRevenue = reservations.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const metrics = [
    { label: "Total Réservations", count: totalItems, icon: Ticket, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Payées", count: getStatusCount('PAID'), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "En Attente", count: getStatusCount('PENDING'), icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Volume (Page)", count: formatCurrency(totalRevenue), icon: Banknote, color: "text-teal-600 bg-teal-50 border-teal-100" },
  ];

  // Design des badges de statut
  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case 'PENDING':
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'CANCELLED':
      case 'FAILED':
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Filtrage selon la recherche et le statut de paiement
  const filteredReservations = reservations.filter((res) => {
    const ticketNum = res.ticket_number || '';
    const passengerName = res.passenger_name || res.user?.name || '';
    const passengerPhone = res.passenger_phone || res.user?.phone || '';
    const companyName = res.company?.name || '';
    const departure = res.departure_station?.name || res.departure_station?.city || '';
    const destination = res.destination_station?.name || res.destination_station?.city || '';
    const status = (res.payment_status || '').toUpperCase();

    const matchesSearch = 
      ticketNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passengerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : status === statusFilter.toUpperCase();

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
            placeholder="Rechercher ticket, passager, gare..."
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
            <option value="PAID">Payé (PAID)</option>
            <option value="PENDING">En Attente (PENDING)</option>
            <option value="CANCELLED">Annulé (CANCELLED)</option>
          </select>

          <button
            onClick={() => fetchReservations(currentPage)}
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
            onClick={() => fetchReservations(currentPage)}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-[11px] cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table des Réservations */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Billet</th>
                <th className="py-3.5 px-4">Passager</th>
                <th className="py-3.5 px-4">Trajet (Départ ➔ Arrivée)</th>
                <th className="py-3.5 px-4">Compagnie</th>
                <th className="py-3.5 px-4">Prix</th>
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
                      <span>Chargement des réservations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-500">
                      {searchTerm
                        ? `Aucune réservation ne correspond à "${searchTerm}"`
                        : "Aucune réservation trouvée."}
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
                filteredReservations.map((res) => {
                  const passengerName = res.passenger_name || res.user?.name || "Inconnu";
                  const phone = res.passenger_phone || res.user?.phone;
                  const companyName = res.company?.name || "N/A";
                  const depStation = res.departure_station?.name || res.departure_station?.city || "N/A";
                  const arrStation = res.destination_station?.name || res.destination_station?.city || "N/A";
                  const bookingDate = res.booking_date ? new Date(res.booking_date).toLocaleDateString('fr-FR') : "N/A";

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Billet */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                            <Ticket size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{res.ticket_number}</p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar size={11} />
                              <span>{bookingDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Passager */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{passengerName}</p>
                          {phone && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              <span>{phone}</span>
                            </div>
                          )}
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

                      {/* Montant */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{formatCurrency(res.amount)}</span>
                        <p className="text-[10px] text-slate-400 uppercase">{res.payment_method || 'WAVE'}</p>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(
                            res.payment_status
                          )}`}
                        >
                          {res.payment_status || 'PAID'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReservation(res)}
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
            <span className="font-semibold text-slate-800">{totalItems}</span> réservation(s)
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

      {/* Modal Détails Billet */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setSelectedReservation(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedReservation(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Ticket size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Billet #{selectedReservation.ticket_number}</h3>
                <p className="text-xs text-slate-400">
                  Réservé le {selectedReservation.booking_date ? new Date(selectedReservation.booking_date).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Passager</p>
                  <p className="font-bold text-slate-800">{selectedReservation.passenger_name || 'N/A'}</p>
                  <p className="text-[11px] text-slate-500">{selectedReservation.passenger_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Compagnie</p>
                  <p className="font-bold text-slate-800">{selectedReservation.company?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gare de Départ</p>
                  <p className="font-bold text-slate-800">{selectedReservation.departure_station?.name || selectedReservation.departure_station?.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gare de Destination</p>
                  <p className="font-bold text-slate-800">{selectedReservation.destination_station?.name || selectedReservation.destination_station?.city || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Paiement</p>
                  <p className="font-bold text-indigo-900">{selectedReservation.payment_method || 'WAVE'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Montant</p>
                  <p className="text-base font-extrabold text-indigo-700">{formatCurrency(selectedReservation.amount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
