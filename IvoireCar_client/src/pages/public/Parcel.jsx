import React, { useState, useEffect } from 'react';
import { X, Package, User, MapPin, Phone, CreditCard, Loader2, CheckCircle, Printer, Calculator } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';

const SendParcelModal = ({ isOpen = true, onClose }) => {
  // Données dynamiques
  const [companies, setCompanies] = useState([]);
  const [stations, setStations] = useState([]);

  // Formulaire Expéditeur
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Formulaire Trajet & Compagnie
  const [selectedCompany, setSelectedCompany] = useState('');
  const [departureStation, setDepartureStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');

  // Formulaire Colis
  const [estimatedValue, setEstimatedValue] = useState('');
  const [description, setDescription] = useState('');

  // Formulaire Destinataire & Paiement
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');

  // États UI
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  // Calcul du coût d'expédition (10% de la valeur estimée)
  const shippingCost = estimatedValue && !isNaN(estimatedValue) 
    ? Math.round(parseFloat(estimatedValue) * 0.10) 
    : 0;

  // Charger les compagnies au chargement
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

  // Charger les gares de la compagnie
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchCompanyStations = async () => {
      setLoadingStations(true);
      setDepartureStation('');
      setDestinationStation('');
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

  const getStationName = (id) => {
    const st = stations.find((s) => String(s.id) === String(id));
    return st ? st.name : '—';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departureStation || !destinationStation || departureStation === destinationStation) {
      setError("Veuillez sélectionner une gare de départ et d'arrivée différentes.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Mappage des clés du payload pour correspondre aux règles de validation Laravel
    const payload = {
      company_id: selectedCompany,
      departure_station_id: departureStation,
      arrival_station_id: destinationStation, // <-- Remplacé destination_station_id par arrival_station_id
      sender_name: senderName,
      sender_phone: senderPhone,
      estimated_value: estimatedValue,
      shipping_cost: shippingCost,
      description: description,
      recipient_name: receiverName,            // <-- Si votre API attend recipient_name au lieu de receiver_name
      recipient_phone: receiverPhone,          // <-- Si votre API attend recipient_phone au lieu de receiver_phone
      payment_method: paymentMethod,
    };

    try {
      const res = await api.post('api/parcels', payload);
      const data = res.data?.data || res.data;

      setReceipt({
        trackingNumber: data?.tracking_number || `COL-${Math.floor(100000 + Math.random() * 900000)}`,
        companyName: companies.find(c => String(c.id) === String(selectedCompany))?.name || 'Compagnie',
        from: getStationName(departureStation),
        to: getStationName(destinationStation),
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        description,
        estimatedValue,
        shippingCost,
        paymentMethod,
        qrCodeValue: JSON.stringify({
          tracking: data?.tracking_number || 'COL-123456',
          sender: senderName,
          receiver: receiverName,
        })
      });
    } catch (err) {
      console.error('Erreur envoi colis:', err);
      setError(err.response?.data?.message || "Échec de l'enregistrement du colis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 transition-all my-8">
        
        {/* En-tête Modale (Charte Orange/Orange-600) */}
        <div className="p-6 bg-gradient-to-r from-orange-600 to-amber-500 text-white relative">
          <button 
            onClick={onClose}
            type="button"
            className="absolute right-5 top-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {!receipt && (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Package size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Expédier un colis</h2>
                <p className="text-xs text-orange-100 mt-0.5">Formulaire d'envoi rapide & sécurisé</p>
              </div>
            </div>
          )}
        </div>

        {/* CONTENU */}
        {receipt ? (
          /* VUE BORDEREAU D'EXPÉDITION ET REÇU */
          <div className="p-6 text-center space-y-5">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Expédition Enregistrée !</h3>
              <p className="text-xs text-slate-500 mt-0.5">Colis N° <span className="font-bold text-slate-800">{receipt.trackingNumber}</span></p>
            </div>

            {/* Carte du Reçu */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 relative">
              <div className="flex justify-between items-start border-b border-slate-200/80 pb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Compagnie</p>
                  <p className="text-xs font-bold text-slate-800">{receipt.companyName}</p>
                </div>
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
                  <p className="text-[10px] text-slate-400">Expéditeur</p>
                  <p className="font-semibold text-slate-800">{receipt.senderName} ({receipt.senderPhone})</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Destinataire</p>
                  <p className="font-semibold text-slate-800">{receipt.receiverName} ({receipt.receiverPhone})</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Valeur déclarée</p>
                  <p className="font-semibold text-slate-800">{Number(receipt.estimatedValue).toLocaleString()} FCFA</p>
                </div>
                <div className="col-span-2 bg-orange-50 p-2 rounded-xl border border-orange-100 flex justify-between items-center">
                  <p className="text-xs font-bold text-orange-900">Frais d'expédition (10%)</p>
                  <p className="text-xs font-extrabold text-orange-600">{Number(receipt.shippingCost).toLocaleString()} FCFA</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <p className="text-[10px] text-slate-400">Description</p>
                <p className="text-xs font-medium text-slate-700 whitespace-pre-line">{receipt.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer size={16} />
                <span>Imprimer le Bordereau</span>
              </button>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Nouveau Colis
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE D'EXPÉDITION */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* SECTION 1: EXPÉDITEUR */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <User size={14} />
                <span>Informations de l'expéditeur</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Nom & prénoms *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ex: Yao Kouassi Bertrand"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="Ex: 07 01 02 03 04"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: COMPAGNIE & TRAJET */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <MapPin size={14} />
                <span>Compagnie & Trajet</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Compagnie *
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
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Gare de départ *
                  </label>
                  <select
                    value={departureStation}
                    onChange={(e) => setDepartureStation(e.target.value)}
                    disabled={loadingStations}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  >
                    {loadingStations ? (
                      <option>Chargement...</option>
                    ) : (
                      stations.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Gare d'arrivée *
                  </label>
                  <select
                    value={destinationStation}
                    onChange={(e) => setDestinationStation(e.target.value)}
                    disabled={loadingStations}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  >
                    {loadingStations ? (
                      <option>Chargement...</option>
                    ) : (
                      stations.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: DÉTAILS DU COLIS */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <Package size={14} />
                <span>Détails du colis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Valeur estimée (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                
                {/* Champ Coût d'expédition calculé dynamiquement */}
                <div>
                  <label className="text-[10px] font-bold text-orange-600 flex items-center gap-1 mb-1">
                    <Calculator size={12} /> Frais d'envoi (10%)
                  </label>
                  <div className="w-full text-xs font-bold p-2.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl flex items-center justify-between">
                    <span>{shippingCost.toLocaleString()} FCFA</span>
                    <span className="text-[10px] text-orange-500 font-normal">Calculé auto.</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Description (contenu, poids, dimensions) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Sac d'habits (5kg), documents confidentiels, etc."
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: DESTINATAIRE */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <Phone size={14} />
                <span>Destinataire & Paiement</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Nom du récepteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Ex: Koné Aminata"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Téléphone récepteur *
                  </label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="Ex: 05 04 03 02 01"
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* Choix du mode de paiement */}
              <div className="pt-1">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
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
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>
            )}

            {/* BOUTONS D'ACTION */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Payer {shippingCost ? `(${shippingCost.toLocaleString()} FCFA)` : ''}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendParcelModal;
