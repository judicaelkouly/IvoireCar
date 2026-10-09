import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Bus, 
  MapPin, 
  Ticket, 
  PackageCheck, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Phone, 
  Mail, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import api from '../../../services/api';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // États de chargement et données
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    vehiclesCount: 0,
    staffCount: 0,
    stationsCount: 0,
    tripsCount: 0,
    reservationsCount: 0,
    reservationsRevenue: 0,
    shipmentsCount: 0,
    shipmentsRevenue: 0,
  });

  // Données des onglets (alignées avec la réponse API)
  const [staff, setStaff] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);

  // États UI
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  // Charger toutes les infos de la compagnie
  const fetchCompanyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint API du backend
      const res = await api.get(`api/companies/details/${id}`);
      const data = res.data?.data || res.data;

      // 1. Informations Entreprise
      setCompany(data.company || {});

      // 2. Extraction des Listes (Noms de clés exacts du backend)
      const staffList = data.staff || [];
      const vehiclesList = data.vehicles || [];
      const stationsList = data.stations || [];
      const tripsList = data.trips || [];
      const parcelsList = data.parcels?.list || data.parcels || [];

      setStaff(staffList);
      setVehicles(vehiclesList);
      setStations(stationsList);
      setTrips(tripsList);
      setShipments(parcelsList);

      // 3. Calcul des Revenus à partir des données Analytics
      const ticketRevenuesMonthly = data.analytics?.ticket_revenues_monthly || [];
      const parcelRevenuesMonthly = data.analytics?.parcel_revenues_monthly || [];

      const totalTicketRev = ticketRevenuesMonthly.reduce(
        (sum, item) => sum + (parseFloat(item.total_revenue) || 0), 0
      );
      const totalTicketCount = ticketRevenuesMonthly.reduce(
        (sum, item) => sum + (parseInt(item.total_tickets) || 0), 0
      );

      const totalParcelRev = parcelRevenuesMonthly.reduce(
        (sum, item) => sum + (parseFloat(item.total_revenue) || 0), 0
      );
      const totalParcelCount = parcelRevenuesMonthly.reduce(
        (sum, item) => sum + (parseInt(item.total_parcels) || 0), 0
      );

      // 4. Statistiques Globale
      setStats({
        vehiclesCount: data.counts?.buses ?? vehiclesList.length,
        staffCount: data.counts?.staff ?? staffList.length,
        stationsCount: data.counts?.stations ?? stationsList.length,
        tripsCount: data.counts?.trips ?? tripsList.length,
        reservationsCount: totalTicketCount,
        reservationsRevenue: totalTicketRev,
        shipmentsCount: data.counts?.parcels ?? totalParcelCount ?? parcelsList.length,
        shipmentsRevenue: totalParcelRev,
      });
    } catch (err) {
      console.error("Erreur de chargement de la compagnie :", err);
      setError(err.response?.data?.message || "Impossible de charger les détails de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCompanyDetails();
  }, [id]);

  // Formateur de devise (FCFA)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop';
    
    // Si le lien est déjà absolu (contient http)
    if (logoPath.startsWith('http')) return logoPath;

    // Si le chemin commence déjà par /storage, on ajoute simplement la base URL du serveur
    if (logoPath.startsWith('/storage')) {
      return `http://localhost:8000${logoPath}`;
    }

    // Sinon, on ajoute http://localhost:8000/storage/
    return `http://localhost:8000/storage/${logoPath.replace(/^\/+/, '')}`;
  };

  // Filtrage générique
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'staff':
        return staff.filter(s => (s.name || '').toLowerCase().includes(term) || (s.email || '').toLowerCase().includes(term) || (s.phone || '').toLowerCase().includes(term));
      case 'vehicles':
        return vehicles.filter(v => (v.registration_number || '').toLowerCase().includes(term) || (v.model || '').toLowerCase().includes(term));
      case 'stations':
        return stations.filter(st => (st.name || '').toLowerCase().includes(term) || (st.city || '').toLowerCase().includes(term));
      case 'shipments':
        return shipments.filter(sh => (sh.tracking_code || sh.code || '').toLowerCase().includes(term) || (sh.sender_name || '').toLowerCase().includes(term));
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm text-slate-500 font-medium">Chargement des informations de la compagnie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl max-w-xl mx-auto my-8 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
        <button
          onClick={fetchCompanyDetails}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const totalRevenue = stats.reservationsRevenue + stats.shipmentsRevenue;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* En-tête Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200/80 shrink-0"
            title="Retour"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="w-14 h-14 rounded-2xl   flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0 overflow-hidden">
            {company?.logo ? (
              <img
                        src={getLogoUrl(company.logo || company.logo_path)}
                        alt={company.name || company.nom}
                        className="w-full h-full rounded-full object-cover"
                      />
            ) : (
              <Building2 size={28} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{company?.name || 'Nom Entreprise'}</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${company?.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {company?.is_active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Mail size={13} /> {company?.email || 'N/A'}</span>
              <span className="flex items-center gap-1"><Phone size={13} /> {company?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Global Financial Indicator */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 self-start md:self-auto shrink-0">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenu Total (12 mois)</p>
            <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Cartes Métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Personnel */}
        <div
          onClick={() => { setActiveTab('staff'); setSearchTerm(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'staff' 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
              : 'bg-white border-slate-200/80 text-slate-800 hover:border-indigo-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${activeTab === 'staff' ? 'text-indigo-100' : 'text-slate-500'}`}>Membres Staff</span>
            <div className={`p-2 rounded-xl ${activeTab === 'staff' ? 'bg-indigo-500/50 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold mt-3">{stats.staffCount}</p>
        </div>

        {/* Véhicules */}
        <div
          onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'vehicles' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
              : 'bg-white border-slate-200/80 text-slate-800 hover:border-blue-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${activeTab === 'vehicles' ? 'text-blue-100' : 'text-slate-500'}`}>Véhicules</span>
            <div className={`p-2 rounded-xl ${activeTab === 'vehicles' ? 'bg-blue-500/50 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <Bus size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold mt-3">{stats.vehiclesCount}</p>
        </div>

        {/* Gares */}
        <div
          onClick={() => { setActiveTab('stations'); setSearchTerm(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'stations' 
              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20' 
              : 'bg-white border-slate-200/80 text-slate-800 hover:border-purple-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${activeTab === 'stations' ? 'text-purple-100' : 'text-slate-500'}`}>Gares</span>
            <div className={`p-2 rounded-xl ${activeTab === 'stations' ? 'bg-purple-500/50 text-white' : 'bg-purple-50 text-purple-600'}`}>
              <MapPin size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold mt-3">{stats.stationsCount}</p>
        </div>

        {/* Réservations */}
        <div
          onClick={() => setActiveTab('overview')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-white border-slate-200/80 text-slate-800 hover:border-amber-300 hover:shadow-xs`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Réservations</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Ticket size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mt-2">{stats.reservationsCount}</p>
            <p className="text-[10px] font-semibold mt-0.5 text-slate-400">
              Val: {formatCurrency(stats.reservationsRevenue)}
            </p>
          </div>
        </div>

        {/* Expéditions */}
        <div
          onClick={() => { setActiveTab('shipments'); setSearchTerm(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'shipments' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
              : 'bg-white border-slate-200/80 text-slate-800 hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${activeTab === 'shipments' ? 'text-emerald-100' : 'text-slate-500'}`}>Expéditions</span>
            <div className={`p-2 rounded-xl ${activeTab === 'shipments' ? 'bg-emerald-500/50 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <PackageCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mt-2">{stats.shipmentsCount}</p>
            <p className={`text-[10px] font-semibold mt-0.5 ${activeTab === 'shipments' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Val: {formatCurrency(stats.shipmentsRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Vue générale
          </button>
          <button
            onClick={() => { setActiveTab('staff'); setSearchTerm(''); }}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff & Employés ({stats.staffCount})
          </button>
          <button
            onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Flotte de Véhicules ({stats.vehiclesCount})
          </button>
          <button
            onClick={() => { setActiveTab('stations'); setSearchTerm(''); }}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'stations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Gares ({stats.stationsCount})
          </button>
          <button
            onClick={() => { setActiveTab('shipments'); setSearchTerm(''); }}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'shipments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Expéditions / Colis ({stats.shipmentsCount})
          </button>
        </div>

        {/* Recherche */}
        {activeTab !== 'overview' && (
          <div className="relative mb-2 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrer..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-48"
            />
          </div>
        )}
      </div>

      {/* CONTENU : VUE GÉNÉRALE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Informations Générales</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Raison Sociale</span>
                <span className="font-bold text-slate-800">{company?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Téléphone</span>
                <span className="font-bold text-slate-800">{company?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">E-mail</span>
                <span className="font-bold text-slate-800">{company?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Créée le</span>
                <span className="font-bold text-slate-800">
                  {company?.created_at ? new Date(company.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Résumé Financier (12 mois)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <Ticket size={20} className="text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Ventes Billetterie</p>
                    <p className="text-[10px] text-slate-400">{stats.reservationsCount} billet(s) vendu(s)</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-700">{formatCurrency(stats.reservationsRevenue)}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <PackageCheck size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Expéditions Colis</p>
                    <p className="text-[10px] text-slate-400">{stats.shipmentsCount} colis expédié(s)</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(stats.shipmentsRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU TABLEAUX */}
      {activeTab !== 'overview' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  {activeTab === 'staff' && (
                    <>
                      <th className="py-3.5 px-4">Nom / Prénom</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4 text-center">Créé le</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'vehicles' && (
                    <>
                      <th className="py-3.5 px-4">Immatriculation</th>
                      <th className="py-3.5 px-4">Modèle / Marque</th>
                      <th className="py-3.5 px-4 text-center">Capacité (Sièges)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'stations' && (
                    <>
                      <th className="py-3.5 px-4">Nom de la Gare</th>
                      <th className="py-3.5 px-4">Ville</th>
                      <th className="py-3.5 px-4">Adresse</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'shipments' && (
                    <>
                      <th className="py-3.5 px-4">Code Colis</th>
                      <th className="py-3.5 px-4">Expéditeur</th>
                      <th className="py-3.5 px-4">Destinataire</th>
                      <th className="py-3.5 px-4 text-center">Statut</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredData().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Aucune donnée disponible pour cet onglet.
                    </td>
                  </tr>
                ) : (
                  getFilteredData().map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {activeTab === 'staff' && (
                        <>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-800">{item.phone || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400">{item.email}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => setSelectedItemDetails(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer">
                              <Eye size={16} />
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'vehicles' && (
                        <>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.registration_number || `BUS-${item.id}`}</td>
                          <td className="py-3.5 px-4">{item.model || 'Autocar Standard'}</td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{item.capacity || 50} places</td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => setSelectedItemDetails(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                              <Eye size={16} />
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'stations' && (
                        <>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4">{item.city || 'N/A'}</td>
                          <td className="py-3.5 px-4">{item.address || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => setSelectedItemDetails(item)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer">
                              <Eye size={16} />
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'shipments' && (
                        <>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">{item.tracking_code || `#EXP-${item.id}`}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{item.sender_name || 'Expéditeur'}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{item.recipient_name || 'Destinataire'}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                              {item.status || 'En cours'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button onClick={() => setSelectedItemDetails(item)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer">
                              <Eye size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale d'Aperçu Rapide */}
      {selectedItemDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setSelectedItemDetails(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItemDetails(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Détails de l'élément</h3>
            <pre className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto text-slate-700 max-h-80">
              {JSON.stringify(selectedItemDetails, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;
