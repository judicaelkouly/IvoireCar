import React, { useState, useMemo } from 'react';

// Mock Data pour les corridors / liaisons
const CORRIDORS_DATA = [
  {
    id: 'c1',
    category: 'Axe Nord-Centre',
    origin: 'Abidjan',
    destination: 'Yamoussoukro',
    fromStation: 'Gare Nord Adjamé',
    toStation: 'Gare Centrale Yamoussoukro',
    duration: '3h15',
    departures: 38,
    price: 5000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    features: ['Wi-Fi High Speed', 'Climatisation VIP', 'Prises USB', 'Bagage inclus']
  },
  {
    id: 'c2',
    category: 'Axe Nord-Centre',
    origin: 'Abidjan',
    destination: 'Bouaké',
    fromStation: 'Gare Nord Adjamé',
    toStation: 'Gare Principale Bouaké',
    duration: '4h45',
    departures: 24,
    price: 7500,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    features: ['Wi-Fi 4G', 'Siège Semi-Couchette', 'Écran Vidéo', 'Soute Scellée']
  },
  {
    id: 'c3',
    category: 'Grand Littoral',
    origin: 'Abidjan',
    destination: 'San-Pédro',
    fromStation: 'Gare Express Yopougon',
    toStation: 'Gare Portuaire San-Pédro',
    duration: '5h30',
    departures: 16,
    price: 9000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
    features: ['Wi-Fi 4G', 'Climatisation', 'Prise 220V', 'Suivi Colis']
  },
  {
    id: 'c4',
    category: 'Axe Nord-Centre',
    origin: 'Bouaké',
    destination: 'Korhogo',
    fromStation: 'Gare Centrale Bouaké',
    toStation: 'Gare Nord Korhogo',
    duration: '3h45',
    departures: 12,
    price: 6000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80',
    features: ['Service Express', 'Climatisation', 'Bagage inclus']
  },
  {
    id: 'c5',
    category: 'Liaisons Internationales',
    origin: 'Abidjan',
    destination: 'Bamako',
    fromStation: 'Hub International Treichville',
    toStation: 'Gare Centrale Bamako',
    duration: '18h00',
    departures: 4,
    price: 28000,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80',
    features: ['Couchette Premium', 'Repas inclus', 'Transit Simplifié', 'Wi-Fi Satellite']
  },
  {
    id: 'c6',
    category: 'Grand Littoral',
    origin: 'Abidjan',
    destination: 'Grand-Bassam',
    fromStation: 'Gare du Sud Koumassi',
    toStation: 'Station Plage Grand-Bassam',
    duration: '0h45',
    departures: 50,
    price: 1500,
    currency: 'FCFA',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    features: ['Navette Rapide', 'Climatisation']
  }
];

// Mock Data pour les compagnies
const OPERATORS_DATA = [
  {
    id: 'op1',
    code: 'HE',
    name: 'Horizon Express VIP',
    bgColor: 'bg-orange-600',
    textColor: 'text-white',
    rating: 4.9,
    reviewsCount: '1.8k',
    mainRoute: 'Abidjan ⇄ Yamoussoukro',
    tags: ['Euro 6', 'Wi-Fi 4G', 'GPS Direct'],
    verified: true
  },
  {
    id: 'op2',
    code: 'TR',
    name: 'Trans-Régional Plus',
    bgColor: 'bg-indigo-600',
    textColor: 'text-white',
    rating: 4.7,
    reviewsCount: '920',
    mainRoute: 'Abidjan ⇄ Bouaké ⇄ Korhogo',
    tags: ['Inclinable', 'Fret Lourd'],
    verified: true
  },
  {
    id: 'op3',
    code: 'ST',
    name: 'Sahel Trans Continental',
    bgColor: 'bg-emerald-600',
    textColor: 'text-white',
    rating: 4.8,
    reviewsCount: '2.4k',
    mainRoute: 'Bouaké ⇄ Bamako / Ouaga',
    tags: ['Douane Express', 'Couchette'],
    verified: true
  },
  {
    id: 'op4',
    code: 'LV',
    name: 'Littoral Lignes Express',
    bgColor: 'bg-slate-800',
    textColor: 'text-white',
    rating: 4.8,
    reviewsCount: '1.1k',
    mainRoute: 'Abidjan ⇄ San-Pédro Direct',
    tags: ['USB Individuel', 'Soute Scellée'],
    verified: true
  }
];

function Header({ activeTab, setActiveTab, onOpenAuth }) {
  const navItems = [
    { id: 'reserver-un-billet', label: 'Réserver un billet' },
    { id: 'expedier-un-colis', label: 'Expédier un colis' },
    { id: 'compagnies-partenaires', label: 'Compagnies partenaires' },
    { id: 'gares-et-villes', label: 'Gares & Villes' },
    { id: 'suivi-colis-billet', label: 'Suivi de colis / billet' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('reserver-un-billet')}>
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
            TC
          </div>
          <span className="font-bold text-xl uppercase tracking-tight text-slate-900 hidden sm:inline-block">
            TransConnect
          </span>
        </div>

        {/* Navigation Bureau */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('expedier-un-colis')}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 border border-indigo-200/60"
          >
            <span className="material-symbols-outlined text-base">local_shipping</span>
            Espace Transporteurs
          </button>
          
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
          >
            Connexion
            <span className="material-symbols-outlined text-base">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchTerminal({ activeSearchTab, setActiveSearchTab, onSearch, trackingCode, setTrackingCode, onQuickTrack }) {
  // Filtres bus
  const [busFilterDirect, setBusFilterDirect] = useState(true);
  const [busFilterWifi, setBusFilterWifi] = useState(true);
  const [busFilterAC, setBusFilterAC] = useState(true);

  // Form states
  const [origin, setOrigin] = useState('Abidjan (Gare Nord)');
  const [destination, setDestination] = useState('Bouaké (Gare Principale)');
  const [departDate, setDepartDate] = useState('2026-09-20');

  const handleBusSubmit = (e) => {
    e.preventDefault();
    onSearch({ type: 'bus', origin, destination, departDate, passengers });
  };

  const handleCargoSubmit = (e) => {
    e.preventDefault();
    onSearch({ type: 'cargo', origin, destination, weight: '12kg' });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 md:p-6 lg:p-8 transition-all">
      {/* Dynamic Tabs & Quick Tracker */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-xl gap-1">
          <button
            onClick={() => setActiveSearchTab('billet')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeSearchTab === 'billet'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Réserver un Billet de Bus
          </button>

          <button
            onClick={() => setActiveSearchTab('colis')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeSearchTab === 'colis'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Expédier un Colis / Fret
          </button>
        </div>

        {/* Quick Tracking Field */}
        <form onSubmit={onQuickTrack} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 w-full md:w-80">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="N° Billet ou Suivi (ex: TR-9402)"
            className="w-full bg-transparent text-slate-800 text-xs font-medium focus:outline-none px-1"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
          >
            Suivre
          </button>
        </form>
      </div>

      {/* Form Bus */}
      {activeSearchTab === 'billet' && (
        <form onSubmit={handleBusSubmit} className="flex flex-col gap-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Origine */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Origine / Gare</label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option>Abidjan (Gare Nord)</option>
                  <option>Yamoussoukro (Centre)</option>
                  <option>Bouaké (Gare Principale)</option>
                  <option>San-Pédro (Gare Portuaire)</option>
                  <option>Korhogo (Nord Express)</option>
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination</label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option>Yamoussoukro (Centre)</option>
                  <option>Bouaké (Gare Principale)</option>
                  <option>San-Pédro (Gare Portuaire)</option>
                  <option>Korhogo (Nord Express)</option>
                  <option>Bamako (Mali Transit)</option>
                </select>
              </div>
            </div>

            {/* Date Départ */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Départ</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Date Retour (optionnel) */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3 transition-all">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Retour (Optionnel)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="date"
                  className="w-full bg-transparent font-medium text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            

            {/* CTA Submit */}
            <div className="lg:col-span-1 flex items-stretch">
              <button
                type="submit"
                className="w-full min-h-[58px] bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all"
              >
                <span>Trouver un trajet</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600">
            <span className="text-slate-900 uppercase tracking-wider text-[11px] font-bold">Filtres Rapides :</span>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={busFilterDirect}
                onChange={(e) => setBusFilterDirect(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600"
              />
              Départs directs
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={busFilterWifi}
                onChange={(e) => setBusFilterWifi(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600"
              />
              Wi-Fi inclus
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={busFilterAC}
                onChange={(e) => setBusFilterAC(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600"
              />
              Climatisation
            </label>
          </div>
        </form>
      )}

      {/* Form Colis / Fret */}
      {activeSearchTab === 'colis' && (
        <form onSubmit={handleCargoSubmit} className="flex flex-col gap-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Centre Envoi */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Centre d'Envoi</label>
              <div className="flex items-center gap-2 mt-1">
                <select className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none">
                  <option>Hub Abidjan Treichville</option>
                  <option>Centre Bouaké Fret</option>
                  <option>Gare San-Pédro</option>
                </select>
              </div>
            </div>

            {/* Reception */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Gare de Réception</label>
              <div className="flex items-center gap-2 mt-1">
                <select className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none">
                  <option>Bouaké Fret Central</option>
                  <option>Yamoussoukro Relais</option>
                  <option>Korhogo Débarcadère</option>
                </select>
              </div>
            </div>

            {/* Nature */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nature du Colis</label>
              <div className="flex items-center gap-2 mt-1">
                <select className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none">
                  <option>Carton Standard (1 à 25 kg)</option>
                  <option>Plis Express & Documents</option>
                  <option>Marchandise Volumineuse</option>
                </select>
              </div>
            </div>

            {/* Poids */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Poids Estimé (kg)</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="number" defaultValue="12" min="1" max="500" className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none" />
              </div>
            </div>

            {/* Envoi Prévu */}
            <div className="lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Envoi Prévu Le</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="date" defaultValue="2026-09-20" className="w-full bg-transparent font-semibold text-sm text-slate-800 focus:outline-none" />
              </div>
            </div>

            {/* Submit */}
            <div className="lg:col-span-1 flex items-stretch">
              <button
                type="submit"
                className="w-full min-h-[58px] bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Estimer & Expédier</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-600">
            <span className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Engagements Fret :</span>
            <span className="flex items-center gap-1"> Scellé QR Sécurisé</span>
            <span className="flex items-center gap-1"> Assurance jusqu'à 250 000 FCFA</span>
            <span className="flex items-center gap-1">Notification SMS en direct</span>
          </div>
        </form>
      )}
    </div>
  );
}

function BookingModal({ isOpen, onClose, selectedRoute }) {
  const [step, setStep] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wave');

  if (!isOpen || !selectedRoute) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8  text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {step === 1 ? (
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
              Réservation en direct
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {selectedRoute.origin} ➔ {selectedRoute.destination}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
             
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarif du billet</span>
                <span className="text-2xl font-bold text-slate-900">
                  {selectedRoute.price.toLocaleString()} {selectedRoute.currency}
                </span>
              </div>
              
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nom complet du passager
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="ex: Kouassi Jean"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Numéro Mobile Money (SMS Billet)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ex: 07 01 02 03 04"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Moyen de paiement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['wave', 'orange', 'mtn'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                        paymentMethod === method
                          ? 'border-orange-600 bg-orange-50 text-orange-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors mt-2"
              >
                Payer et Confirmer la Réservation
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Billet Réservé !</h3>
            <p className="text-sm text-slate-600 mb-6">
              Merci <span className="font-bold text-slate-800">{passengerName}</span>. Un SMS contenant votre QR code d'embarquement a été envoyé au <span className="font-bold text-slate-800">{phone}</span>.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-left mb-6 font-mono text-xs">
              <div>Code de Réservation : <strong className="text-orange-600">TC-88920-2026</strong></div>
              <div>Trajet : {selectedRoute.origin} ➔ {selectedRoute.destination}</div>
              <div>Statut : VALIDE</div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransConnectApp() {
  const [activeTab, setActiveTab] = useState('reserver-un-billet');
  const [activeSearchTab, setActiveSearchTab] = useState('billet');
  const [selectedCategory, setSelectedCategory] = useState('Toutes les lignes');
  
  // Quick Search & Tracking State
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRouteForBooking, setSelectedRouteForBooking] = useState(null);

  // Filtering Corridors via useMemo
  const filteredCorridors = useMemo(() => {
    if (selectedCategory === 'Toutes les lignes') return CORRIDORS_DATA;
    return CORRIDORS_DATA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleOpenBooking = (route) => {
    setSelectedRouteForBooking(route);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (searchParams) => {
    alert(`Recherche transmise pour : ${searchParams.origin} vers ${searchParams.destination}`);
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    // Simulation de résultat de suivi
    setTrackingResult({
      code: trackingCode,
      status: 'En transit',
      location: 'En route vers Yamoussoukro (Km 120)',
      eta: 'Aujourd\'hui à 16:30',
      carrier: 'Horizon Express VIP'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => alert('Interface de connexion sécurisée')}
      />

      {/* 2. HERO SECTION */}
      <main className="pt-20">
        <section className="relative bg-slate-900 text-white pt-8 pb-16 lg:pb-24 overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"
              alt="Autocar TransConnect sur la route"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              <span className="text-orange-400 uppercase tracking-wider font-bold">Plateforme Fédérale Certifiée</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-200">Suivi GPS & Mobile Money Actifs</span>
            </div>

            {/* Central Headline */}
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400 block mb-2">
                Réseau Central Interurbain & Logistique Fret
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Voyagez et expédiez en toute sérénité dans toutes les régions
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                Comparez les horaires de plus de 50 transporteurs certifiés, réservez vos places assises et suivez vos colis de bout en bout en temps réel.
              </p>
            </div>

            {/* INTERACTIVE SEARCH ENGINE */}
            <SearchTerminal
              activeSearchTab={activeSearchTab}
              setActiveSearchTab={setActiveSearchTab}
              onSearch={handleSearchSubmit}
              trackingCode={trackingCode}
              setTrackingCode={setTrackingCode}
              onQuickTrack={handleQuickTrack}
            />

            {/* QUICK TRACKING RESULT DISPLAY */}
            {trackingResult && (
              <div className="mt-6 p-4 bg-indigo-900/80 backdrop-blur-md border border-indigo-500/40 rounded-2xl animate-fadeIn flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                    <span className="material-symbols-outlined text-2xl">radar</span>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-indigo-300 font-bold tracking-wider">
                      Suivi de référence : {trackingResult.code}
                    </div>
                    <div className="text-sm font-semibold">
                      Statut : <span className="text-emerald-400 font-bold">{trackingResult.status}</span> — {trackingResult.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-indigo-200">Arrivée estimée : <strong>{trackingResult.eta}</strong></span>
                  <button
                    onClick={() => setTrackingResult(null)}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {}
        <section className="bg-white border-y border-slate-200/80 py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Flotte Partenaire</span>
                <span className="material-symbols-outlined text-orange-600">directions_bus</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">50+</div>
              <div className="text-xs text-slate-500 mt-1">Compagnies agréées et auditées</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Maillage National</span>
                <span className="material-symbols-outlined text-indigo-600">hub</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">120+</div>
              <div className="text-xs text-slate-500 mt-1">Gares et terminaux connectés</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Volume Traité</span>
                <span className="material-symbols-outlined text-emerald-600">confirmation_number</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900">2.5M+</div>
              <div className="text-xs text-slate-500 mt-1">Billets et manifestes émis</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ponctualité</span>
                <span className="material-symbols-outlined text-orange-600">verified</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-orange-600">98.6%</div>
              <div className="text-xs text-slate-500 mt-1">Sécurité et régularité contrôlées</div>
            </div>
          </div>
        </section>

        {}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-orange-600 mb-1">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  Liaisons Populaires
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  Lignes Interurbaines Principales
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Cadencement régulier et départs garantis avec confort à bord.
                </p>
              </div>

              {/* Category Filter Badges */}
              <div className="flex flex-wrap gap-2">
                {['Toutes les lignes', 'Grand Littoral', 'Axe Nord-Centre', 'Liaisons Internationales'].map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Route Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCorridors.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={route.image}
                      alt={route.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {route.departures} Départs / Jour
                    </div>
                    <div className="absolute bottom-3 right-3 bg-orange-600 text-white font-extrabold text-sm px-3 py-1 rounded-lg shadow-md">
                      Dès {route.price.toLocaleString()} {route.currency}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 mb-1">
                        <span>{route.category}</span>
                        <span>Durée : {route.duration}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {route.origin} ➔ {route.destination}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {route.fromStation} vers {route.toStation}.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-lg" title="Wi-Fi">wifi</span>
                        <span className="material-symbols-outlined text-lg" title="Climatisation">ac_unit</span>
                        <span className="material-symbols-outlined text-lg" title="Bagages">luggage</span>
                      </div>

                      <button
                        onClick={() => handleOpenBooking(route)}
                        className="text-xs font-bold uppercase text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                      >
                        Réserver
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {}
        <section className="py-12 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-orange-600">Réseau d'Opérateurs</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  Compagnies Partenaires Agréées
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Auditées régulièrement pour garantir sécurité, propreté et régularité.
                </p>
              </div>
              <button className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Voir toutes les compagnies
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {OPERATORS_DATA.map((op) => (
                <div key={op.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${op.bgColor} ${op.textColor} font-bold text-lg flex items-center justify-center shadow-sm`}>
                        {op.code}
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                        <span className="material-symbols-outlined text-xs">verified</span> VÉRIFIÉ
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{op.name}</h3>
                    <div className="flex items-center gap-1.5 my-1">
                      <span className="text-amber-500 font-bold text-xs">★ {op.rating}</span>
                      <span className="text-xs text-slate-400">({op.reviewsCount} avis)</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Ligne majeure : <strong className="text-slate-800">{op.mainRoute}</strong>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {op.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(CORRIDORS_DATA[0])}
                    className="mt-6 w-full py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors"
                  >
                    Horaires & Tarifs
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold">TC</div>
                <span className="font-bold text-lg uppercase tracking-wider">TransConnect</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le réseau centralisé de réservation de transport interurbain et d'expédition de fret. Sécurité, ponctualité et traçabilité.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Voyageurs & Fret</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Acheter un billet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expédier un colis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Suivi du trajet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gares & Horaires</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Paiement Sécurisé</h4>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
                <span className="px-2 py-1 bg-slate-800 rounded">Wave</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Orange Money</span>
                <span className="px-2 py-1 bg-slate-800 rounded">MTN MoMo</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Carte CB</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Assistance 24/7</h4>
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-[10px] uppercase text-orange-400 font-bold">Centre d'appel</div>
                <div className="text-sm font-bold text-white mt-0.5">+225 01 02 03 04</div>
                <div className="text-[11px] text-slate-400">support@transconnect.net</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© 2026 TransConnect. Tous droits réservés.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300">Mentions légales</a>
              <a href="#" className="hover:text-slate-300">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL REUSABLE */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoute={selectedRouteForBooking}
      />
    </div>
  );
}