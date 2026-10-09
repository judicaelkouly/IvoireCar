import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, Printer, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';

const DirectBookingModal = ({ isOpen = true, onClose }) => {
  // Données chargées depuis l'API
  const [companies, setCompanies] = useState([]);
  const [stations, setStations] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [currentRouteId, setCurrentRouteId] = useState(null);
  
  // États de sélection du formulaire
  const [selectedCompany, setSelectedCompany] = useState('');
  const [departureStation, setDepartureStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Infos passager & Paiement
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');

  // États UI
  const [price, setPrice] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  // 1. Charger la liste des compagnies au chargement
  useEffect(() => {
    if (!isOpen) return;
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await api.get('api/companies');
        const data = res.data?.data || res.data || [];
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0].id);
      } catch (err) {
        console.error('Erreur chargement compagnies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [isOpen]);

  // 2. Charger les gares de la compagnie sélectionnée
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchCompanyStations = async () => {
      setLoadingStations(true);
      setDepartureStation('');
      setDestinationStation('');
      setPrice(0);
      setError(null);
      try {
        const res = await api.get(`api/companies/${selectedCompany}/stations`);
        const data = res.data?.data || res.data || [];
        setStations(data);
        if (data.length > 0) {
          setDepartureStation(data[0].id);
          if (data.length > 1) setDestinationStation(data[1].id);
        }
      } catch (err) {
        console.error('Erreur chargement gares:', err);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchCompanyStations();
  }, [selectedCompany]);

  // 3. Rechercher la ligne, calculer le prix et charger les départs récurrents
  useEffect(() => {
    if (!selectedCompany || !departureStation || !destinationStation || departureStation === destinationStation) {
      setPrice(0);
      setDepartures([]);
      setCurrentRouteId(null);
      return;
    }

    const fetchRouteAndDepartures = async () => {
      setLoadingPrice(true);
      setError(null);
      try {
        // Apport : Appel à la route backend de recherche de ligne et calcul de prix d'escale
        const resRoute = await api.get('api/company/routes/search', {
          params: {
            company_id: selectedCompany,
            departure_station_id: departureStation,
            destination_station_id: destinationStation
          }
        });

        const routeData = resRoute.data;
        const routeId = routeData.route_id || routeData.route?.id;
        const routePrice = routeData.price || 0;

        setPrice(routePrice);
        setCurrentRouteId(routeId);

        // Récupération des départs prévus pour la ligne et la gare choisie
        const resDeps = await api.get('api/company/schedule-templates', {
          params: {
            company_id: selectedCompany,
            route_id: routeId,
            departure_station_id: departureStation
          }
        });

        const depsData = resDeps.data?.data || resDeps.data || [];
        setDepartures(depsData);
        if (depsData.length > 0) {
          setSelectedDeparture(depsData[0].id);
        } else {
          setSelectedDeparture('');
        }

      } catch (err) {
        console.error('Erreur prix/départs:', err);
        setPrice(0);
        setDepartures([]);
        setCurrentRouteId(null);
        if (err.response?.status === 444 || err.response?.data?.message) {
          setError(err.response.data.message || "Aucun itinéraire trouvé entre ces deux gares.");
        } else {
          setError("Impossible de calculer le tarif pour ce parcours.");
        }
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchRouteAndDepartures();
  }, [selectedCompany, departureStation, destinationStation]);

  // Récupérer le nom de la gare par son ID
  const getStationName = (id) => {
    const st = stations.find((s) => String(s.id) === String(id));
    return st ? st.name : '—';
  };

  // Récupérer le libellé formaté du départ sélectionné pour le reçu
  const getSelectedDepartureLabel = () => {
    const dep = departures.find((d) => String(d.id) === String(selectedDeparture));
    if (dep) {
      return dep.formatted_label || `${dep.departure_number || 1}er Départ (${dep.departure_time || ''})`;
    }
    return '05h30';
  };

  // Soumission et Réservation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentRouteId || price <= 0) {
      setError("Veuillez sélectionner un trajet valide avant de continuer.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      company_id: selectedCompany,
      route_id: currentRouteId,
      departure_station_id: departureStation,
      destination_station_id: destinationStation,
      schedule_template_id: selectedDeparture,
      booking_date: bookingDate,
      passenger_name: passengerName,
      passenger_phone: passengerPhone,
      payment_method: paymentMethod,
      amount: price,
    };

    try {
      const res = await api.post('api/bookings', payload);
      const data = res.data?.data || res.data;
      
      // Construire l'objet reçu avec le code QR
      setReceipt({
        ticketNumber: data?.ticket_number || `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        companyName: companies.find(c => String(c.id) === String(selectedCompany))?.name || 'Compagnie Transport',
        from: getStationName(departureStation),
        to: getStationName(destinationStation),
        departureTime: getSelectedDepartureLabel(),
        date: bookingDate,
        passengerName,
        phone: passengerPhone,
        amount: price,
        paymentMethod,
        qrCodeValue: JSON.stringify({
          ticket: data?.ticket_number || 'TKT-123456',
          passenger: passengerName,
          date: bookingDate,
        })
      });
    } catch (err) {
      console.error('Erreur réservation direct:', err);
      setError(err.response?.data?.message || 'Échec lors de la création de la réservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transition-all">
        
        {/* En-tête Modale */}
        <div className="p-5 pb-3 flex justify-between items-start relative">
          
          <Link  
          to="/"
            className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </Link>

          {!receipt && (
            <div className="w-full text-center space-y-1">
              <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase">
                Réservation en direct
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-2">
                <span>{getStationName(departureStation)}</span>
                <span className="text-slate-400">➔</span>
                <span>{getStationName(destinationStation)}</span>
              </h2>
            </div>
          )}
        </div>

        {/* CONTENU DE LA MODALE */}
        {receipt ? (
          /* VUE REÇU ET CODE QR */
          <div className="p-6 pt-2 text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Réservation Confirmée !</h3>
              <p className="text-xs text-slate-500 mt-0.5">Billet N° <span className="font-bold text-slate-800">{receipt.ticketNumber}</span></p>
            </div>

            {/* Carte du Reçu */}
            <div id="receipt-print" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 relative">
              <div className="flex justify-between items-start border-b border-slate-200/80 pb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Compagnie</p>
                  <p className="text-xs font-bold text-slate-800">{receipt.companyName}</p>
                </div>
                {/* Génération du Code QR */}
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <QRCodeSVG value={receipt.qrCodeValue} size={64} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Trajet</p>
                  <p className="font-semibold text-slate-800">{receipt.from} ➔ {receipt.to}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Date & Heure</p>
                  <p className="font-semibold text-slate-800">{receipt.date} ({receipt.departureTime})</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Passager</p>
                  <p className="font-semibold text-slate-800">{receipt.passengerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Téléphone</p>
                  <p className="font-semibold text-slate-800">{receipt.phone}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Montant Payé ({receipt.paymentMethod})</span>
                <span className="font-extrabold text-orange-600 text-sm">{receipt.amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={16} />
                <span>Imprimer le Reçu</span>
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Nouveau
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE DE RÉSERVATION */
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            
            {/* Ligne 1 : Compagnie & Départ Choisis */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Compagnie
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {loadingCompanies ? (
                    <option>Chargement...</option>
                  ) : (
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Départ Choisis
                </label>
                <select
                  value={selectedDeparture}
                  onChange={(e) => setSelectedDeparture(e.target.value)}
                  disabled={departures.length === 0}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                >
                  {departures.length === 0 ? (
                    <option value="">Aucun départ disponible</option>
                  ) : (
                    departures.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.formatted_label || `${d.departure_number || 1}er Départ (${d.departure_time || ''})`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Ligne 2 : Gare de départ & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Gare de Départ
                </label>
                <select
                  value={departureStation}
                  onChange={(e) => setDepartureStation(e.target.value)}
                  disabled={loadingStations}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                >
                  {loadingStations ? (
                    <option>Chargement gares...</option>
                  ) : (
                    stations.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Destination
                </label>
                <select
                  value={destinationStation}
                  onChange={(e) => setDestinationStation(e.target.value)}
                  disabled={loadingStations}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                >
                  {loadingStations ? (
                    <option>Chargement gares...</option>
                  ) : (
                    stations.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Ligne 3 : Date de voyage */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Date de voyage
              </label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Bloc Tarif du Billet */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center my-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tarif du Billet
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {loadingPrice ? (
                  <span className="text-xs text-slate-400 font-normal">Calcul en cours...</span>
                ) : (
                  `${price.toLocaleString('fr-FR')} FCFA`
                )}
              </p>
            </div>

            {/* Ligne 4 : Nom Complet */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Nom complet du passager
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Ex: Kouassi Jean"
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Ligne 5 : Numéro Mobile Money */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Numéro Mobile Money (SMS Billet)
              </label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="ex: 07 01 02 03 04"
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Ligne 6 : Moyen de Paiement */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Moyen de paiement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['WAVE', 'ORANGE', 'MTN'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'border-orange-500 text-orange-600 bg-orange-50/50 ring-1 ring-orange-500'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>
            )}

            {/* Bouton Valider */}
            <button
              type="submit"
              disabled={isSubmitting || price <= 0}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Traitement du paiement...</span>
                </>
              ) : (
                <>
                  <span>PAYER ET CONFIRMER LA RÉSERVATION ✓</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DirectBookingModal;
