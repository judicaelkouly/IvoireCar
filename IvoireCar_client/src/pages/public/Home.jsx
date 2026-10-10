import React, { useState, useEffect } from 'react';
import ConnectNavbar from '../../components/ConnectNavbar';
import Footer from '../../components/Footer';
import { 
  Bus, 
  Package, 
  Search, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Star, 
  CreditCard, 
  Headphones, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Zap,
  X,
  Calendar,
  Compass,
  Building2,
  PhoneCall,
  User,
  Ticket,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

// Modèle de programmes des départs permanents par ligne
const SCHEDULE_SLOTS = [
  { id: 1, label: "1er Départ - 06h00" },
  { id: 2, label: "2e Départ - 08h30" },
  { id: 3, label: "3e Départ - 11h00" },
  { id: 4, label: "4e Départ - 14h00" },
  { id: 5, label: "5e Départ - 16h30" },
];

// Données des compagnies avec départs récurrents & notations
const COMPANIES_DATA = [
  {
    id: 1,
    name: "UTB Express",
    code: "UTB",
    bgColor: "from-purple-600 to-indigo-600",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    rating: "4.9",
    reviewsCount: 142,
    route: "Abidjan - Bondoukou",
    dailyDeparturesCount: 5,
    tags: ["Climatisé", "Wifi", "Prise USB"],
    images: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
      
    ]
  },
  {
    id: 2,
    name: "STC Touristique",
    code: "STC",
    bgColor: "from-emerald-600 to-teal-600",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rating: "4.8",
    reviewsCount: 98,
    route: "Abidjan - Bouaké",
    dailyDeparturesCount: 6,
    tags: ["TV", "Siège VIP", "Climatisé"],
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop",
    ]
  },
  {
    id: 3,
    name: "AVS Transport",
    code: "AVS",
    bgColor: "from-blue-600 to-cyan-600",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    rating: "4.7",
    reviewsCount: 84,
    route: "Abidjan - San-Pédro",
    dailyDeparturesCount: 4,
    tags: ["Express", "Recharge", "Confort"],
    images: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
    ]
  },
  {
    id: 4,
    name: "SCTE Transport",
    code: "SCTE",
    bgColor: "from-orange-500 to-amber-600",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    rating: "4.6",
    reviewsCount: 62,
    route: "Abidjan - Korhogo",
    dailyDeparturesCount: 3,
    tags: ["Direct", "Wifi", "Bagages 30kg"],
    images: [
      "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
    ]
  }
];

// Trajets populaires
const POPULAR_ROUTES = [
  { from: "Abidjan", to: "Bondoukou", price: "7 000 FCFA", duration: "6h 30m", departures: "5 départs/j" },
  { from: "Abidjan", to: "Yamoussoukro", price: "5 000 FCFA", duration: "2h 30m", departures: "18 départs/j" },
  { from: "Abidjan", to: "Bouaké", price: "8 000 FCFA", duration: "4h 15m", departures: "12 départs/j" },
  { from: "Abidjan", to: "Korhogo", price: "12 000 FCFA", duration: "8h 30m", departures: "6 départs/j" },
];

// Avis clients dynamiques
const INITIAL_REVIEWS = [
  { name: "Kouassi Jean", company: "UTB Express", route: "Abidjan ➔ Bondoukou", comment: "Le 1er départ de 06h00 est toujours à l'heure. Très pratique de pouvoir réserver plusieurs jours avant.", rating: 5, avatar: "JK" },
  { name: "Awa Koné", company: "STC Touristique", route: "Abidjan ➔ Bouaké", comment: "Application fluide, réservation faite 1 semaine à l'avance sans tracas !", rating: 5, avatar: "AK" },
  { name: "Marc Yao", company: "AVS Transport", route: "Abidjan ➔ San-Pédro", comment: "Possibilité de noter les compagnies très utile. Chauffeur prudent !", rating: 4, avatar: "MY" },
];

// Modal pour ajouter une note et un avis client
function AddReviewModal({ isOpen, onClose, onAddReview }) {
  const [company, setCompany] = useState('UTB Express');
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !comment) return;
    onAddReview({
      name,
      company,
      route: "Voyageur vérifié",
      comment,
      rating: Number(rating),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    });
    setName('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-bold">Noter une compagnie</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom & Prénom *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Yao Kouassi Bertrand"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Compagnie concernée *</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
            >
              {COMPANIES_DATA.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Note</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Votre commentaire *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ponctualité, propreté du bus, confort..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
          >
            Publier mon avis
          </button>
        </form>
      </div>
    </div>
  );
}

// Modal Expédition de Colis
function ParcelModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    company: 'UTB Express',
    originStation: '',
    destinationStation: '',
    itemValue: '',
    itemDescription: '',
    receiverName: '',
    receiverPhone: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Redirection vers la passerelle de paiement...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <Package className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Expédier un colis</h3>
              <p className="text-xs text-indigo-200">Formulaire d'envoi rapide & sécurisé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Informations de l'expéditeur
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom & prénoms *</label>
                <input
                  type="text"
                  name="senderName"
                  required
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="Ex: Yao Kouassi Bertrand"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  name="senderPhone"
                  required
                  value={formData.senderPhone}
                  onChange={handleChange}
                  placeholder="Ex: 07 01 02 03 04"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Compagnie & Trajet
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compagnie *</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                >
                  <option value="UTB Express">UTB Express</option>
                  <option value="STC Touristique">STC Touristique</option>
                  <option value="AVS Transport">AVS Transport</option>
                  <option value="SCTE Transport">SCTE Transport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gare de départ *</label>
                <input
                  type="text"
                  name="originStation"
                  required
                  value={formData.originStation}
                  onChange={handleChange}
                  placeholder="Ex: Adjamé MBadjan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gare d'arrivée *</label>
                <input
                  type="text"
                  name="destinationStation"
                  required
                  value={formData.destinationStation}
                  onChange={handleChange}
                  placeholder="Ex: Central Bondoukou"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Détails du colis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valeur estimée (FCFA) *</label>
                <input
                  type="number"
                  name="itemValue"
                  required
                  value={formData.itemValue}
                  onChange={handleChange}
                  placeholder="Ex: 50000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (contenu, poids) *</label>
                <input
                  type="text"
                  name="itemDescription"
                  required
                  value={formData.itemDescription}
                  onChange={handleChange}
                  placeholder="Ex: Sac d'habits, 5kg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Destinataire
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du récepteur *</label>
                <input
                  type="text"
                  name="receiverName"
                  required
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="Ex: Koné Aminata"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone récepteur *</label>
                <input
                  type="tel"
                  name="receiverPhone"
                  required
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  placeholder="Ex: 05 04 03 02 01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Payer et finaliser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Carte Compagnie avec Note & Départs quotidiens
function CompanyCard({ company }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === company.images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [company.images.length]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${company.bgColor} text-white font-black text-sm flex items-center justify-center shadow-md`}>
              {company.code}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-900 font-bold text-xs">{company.rating}</span>
                <span className="text-[10px] text-slate-400">({company.reviewsCount} avis)</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${company.badgeColor}`}>
            <CheckCircle2 className="w-3 h-3" /> Agréé
          </span>
        </div>

        {/* Dynamic Image Carousel */}
        <div className="relative w-full h-36 mb-3 rounded-xl overflow-hidden bg-slate-100 group/slider">
          <img
            src={company.images[currentImageIndex]}
            alt={company.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          
          <button
            onClick={() => setCurrentImageIndex(prev => prev === 0 ? company.images.length - 1 : prev - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-1 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentImageIndex(prev => prev === company.images.length - 1 ? 0 : prev + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-1 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="absolute bottom-2 left-3 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded-md">
            <Compass className="w-3 h-3 text-orange-400" />
            <span>{company.route}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 mb-3 text-[11px] text-slate-600 flex items-center justify-between">
          <span>Départs pré-programmés</span>
          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{company.dailyDeparturesCount} départs/j</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {company.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <button className="mt-4 w-full py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer group-hover:bg-orange-600">
        <span>Voir les départs</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// Module Terminal de Recherche avec Horaires Pré-programmés
function SearchTerminal({ activeSearchTab, setActiveSearchTab, onSearch, trackingCode, setTrackingCode, onQuickTrack, onOpenParcelModal }) {
  const [company, setCompany] = useState('Toutes les compagnies');
  const [originStation, setOriginStation] = useState('Gare Adjamé'); // Champ Gare de départ
  const [destination, setDestination] = useState('Bondoukou');
  const [departDate, setDepartDate] = useState('2026-09-26');
  const [selectedSlot, setSelectedSlot] = useState(SCHEDULE_SLOTS[0].label);


  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 md:p-6 text-slate-800">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            onClick={() => setActiveSearchTab('billet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSearchTab === 'billet'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> Billet de Bus
          </button>
          <button
            onClick={() => {
              setActiveSearchTab('colis');
              onOpenParcelModal();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSearchTab === 'colis'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Expédier Colis
          </button>
        </div>

        <form onSubmit={onQuickTrack} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 w-full md:w-80">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="N° Billet ou Suivi (ex: TR-9402)"
            className="w-full bg-transparent text-slate-800 text-xs font-medium focus:outline-none px-2"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3 h-3" /> Suivre
          </button>
        </form>
      </div>

      {activeSearchTab === 'billet' ? (
  <form onSubmit={(e) => { 
    e.preventDefault(); 
    onSearch({ company, originStation, destination, departDate, selectedSlot }); 
  }}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

      {/* 1. Compagnie */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
          <Building2 className="w-3 h-3" /> Compagnie
        </label>
        <select 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer"
        >
          <option>Toutes les compagnies</option>
          {COMPANIES_DATA.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* 2. Gare de départ */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-500" /> Gare de départ
        </label>
        <input
          type="text"
          value={originStation}
          onChange={(e) => setOriginStation(e.target.value)}
          placeholder="Ex: Gare Adjamé"
          className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none"
        />
      </div>

      {/* 3. Destination */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-orange-500" /> Destination
        </label>
        <select 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)} 
          className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="Bondoukou">Bondoukou</option>
          <option value="Yamoussoukro">Yamoussoukro</option>
          <option value="Bouaké">Bouaké</option>
          <option value="Korhogo">Korhogo</option>
        </select>
      </div>

      {/* 4. Date du voyage */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Date
        </label>
        <input 
          type="date" 
          value={departDate} 
          onChange={(e) => setDepartDate(e.target.value)} 
          className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer" 
        />
      </div>

      {/* 5. Choix du Départ / Horaire */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 focus-within:border-orange-500 focus-within:bg-white transition-all">
        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-600" /> Départ
        </label>
        <select 
          value={selectedSlot} 
          onChange={(e) => setSelectedSlot(e.target.value)} 
          className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer"
        >
          {SCHEDULE_SLOTS.map(slot => (
            <option key={slot.id} value={slot.label}>{slot.label}</option>
          ))}
        </select>
      </div>

      {/* 6. Bouton Réserver */}
      <button 
        type="submit" 
        className="w-full h-full min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
      >
        <Ticket className="w-4 h-4" /> Réserver
      </button>

    </div>
  </form>
) : (


        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Envoi de colis rapide & sécurisé</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md">
              Expédiez vos marchandises vers n'importe quelle ville avec suivi en temps réel par SMS.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenParcelModal}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Package className="w-4 h-4" /> Commencer l'expédition
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activeSearchTab, setActiveSearchTab] = useState('billet');
  const [trackingCode, setTrackingCode] = useState('');
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleAddReview = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
   
      <ConnectNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative bg-slate-950 text-white pt-10 pb-20 lg:pb-28 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-orange-600/20 via-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"
              alt="Autocar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
           

            <div className="max-w-3xl mb-8">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-[1.15]">
                Voyagez & expédiez en toute <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">sérénité.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Comparez les gares et compagnies agréées, réservez vos départs fixes en quelques clics et suivez vos colis en temps réel.
              </p>
            </div>

            <SearchTerminal
              activeSearchTab={activeSearchTab}
              setActiveSearchTab={setActiveSearchTab}
              onSearch={(data) => alert(`Recherche lancée :\n- Destination: ${data.destination}\n- Date: ${data.departDate}\n- Horaire: ${data.selectedSlot}`)}
              trackingCode={trackingCode}
              setTrackingCode={setTrackingCode}
              onQuickTrack={(e) => { e.preventDefault(); alert(`Suivi du code : ${trackingCode}`); }}
              onOpenParcelModal={() => setIsParcelModalOpen(true)}
            />
          </div>
        </section>

        {/* COMPAGNIES PARTENAIRES AVEC NOTES */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Réseau Certifié</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">
                  Compagnies & Notes Clients
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COMPANIES_DATA.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </div>
        </section>

        {/* TRAJETS POPULAIRES */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                   <TrendingUp className="w-3.5 h-3.5" /> Top Destinations
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">
                  Lignes les plus demandées
                </h2>
              </div>
              <button className="text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer">
                Voir tous les trajets <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_ROUTES.map((route, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-500 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {route.duration}</span>
                    <span className="bg-orange-100/80 text-orange-700 px-2 py-0.5 rounded-full font-bold text-[10px]">{route.departures}</span>
                  </div>
                  <div className="flex items-center justify-between my-2">
                    <span className="font-bold text-slate-900 text-sm">{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-slate-900 text-sm">{route.to}</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">À partir de</span>
                    <span className="text-base font-extrabold text-orange-600">{route.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AVANTAGES */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Services Premium</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">
                Pourquoi réserver sur notre plateforme ?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">100% Sécurisé</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Billets électroniques infalsifiables avec QR Code scannable à la gare.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Mobile Money</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Payez rapidement via Wave, Orange Money, MTN MoMo et Moov Money.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Suivi SMS en direct</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Restez informé de l'état d'avancement de votre colis ou de l'embarquement.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Assistance 24/7</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Notre équipe support vous accompagne à chaque étape de votre voyage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES & AVIS COMPAGNIES */}
        <section className="py-14 bg-slate-950 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Avis Voyageurs</span>
                <h2 className="text-2xl md:text-3xl font-extrabold mt-0.5">Ce que pensent nos voyageurs</h2>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <MessageSquare className="w-4 h-4" /> Laisser un avis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                        {rev.company}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{rev.comment}"</p>
                  </div>

                  <div className="flex items-center gap-2.5 border-t border-slate-800/80 pt-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/30">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{rev.name}</h4>
                      <span className="text-[10px] text-slate-400">{rev.route}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <ParcelModal
        isOpen={isParcelModalOpen}
        onClose={() => setIsParcelModalOpen(false)}
      />

      <AddReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onAddReview={handleAddReview}
      />

      <Footer />
    </div>
  );
}