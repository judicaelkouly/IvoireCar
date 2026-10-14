import React, { useState, useEffect } from 'react';
import ConnectNavbar from '../../components/ConnectNavbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
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
  MessageSquare,
  Calendar,
  Compass,
  Building2,
  Ticket,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  Loader2,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Fonction utilitaire pour nettoyer et formater correctement les URLs des images et logos renvoyés par l'API
const getImageUrl = (path) => {
  if (!path) return null;
  // Nettoyage des antislashs de formatage JSON échappés s'il y en a
  let cleanPath = path.replace(/\\/g, '/');
  
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  
  // Si le chemin commence par un double slash ou storage
  cleanPath = cleanPath.replace(/^\/+/, '');
  if (cleanPath.startsWith('storage/')) {
    return `http://localhost:8000/${cleanPath}`;
  }
  return `http://localhost:8000/storage/${cleanPath}`;
};

const POPULAR_ROUTES = [
  { from: "Abidjan", to: "Bondoukou", price: "7 000 FCFA", duration: "6h 30m", departures: "5 départs/j" },
  { from: "Abidjan", to: "Yamoussoukro", price: "5 000 FCFA", duration: "2h 30m", departures: "18 départs/j" },
  { from: "Abidjan", to: "Bouaké", price: "8 000 FCFA", duration: "4h 15m", departures: "12 départs/j" },
  { from: "Abidjan", to: "Korhogo", price: "12 000 FCFA", duration: "8h 30m", departures: "6 départs/j" },
];

const INITIAL_REVIEWS = [
  { name: "Kouassi Jean", company: "UTB Express", route: "Abidjan ➔ Bondoukou", comment: "Le 1er départ de 06h00 est toujours à l'heure. Très pratique de pouvoir réserver plusieurs jours avant.", rating: 5, avatar: "JK" },
  { name: "Awa Koné", company: "STC Touristique", route: "Abidjan ➔ Bouaké", comment: "Application fluide, réservation faite 1 semaine à l'avance sans tracas !", rating: 5, avatar: "AK" },
  { name: "Marc Yao", company: "AVS Transport", route: "Abidjan ➔ San-Pédro", comment: "Possibilité de noter les compagnies très utile. Chauffeur prudent !", rating: 4, avatar: "MY" },
];

const FAQ_DATA = [
  {
    question: "Comment puis-je récupérer mon billet après la réservation ?",
    answer: "Une fois le paiement validé, un billet électronique muni d'un QR code unique s'affiche instantanément à l'écran et vous est également envoyé par SMS et e-mail. Il vous suffit de le présenter directement au contrôleur à la gare."
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Vous pouvez régler vos billets et vos frais d'expédition de colis en toute sécurité via Mobile Money (Wave, Orange Money, MTN MoMo et Moov Money)."
  },
  {
    question: "Puis-je annuler ou modifier mon voyage ?",
    answer: "Oui, vous pouvez modifier la date ou annuler votre réservation directement depuis votre espace personnel 'Mon Profil' jusqu'à 2 heures avant l'heure de départ prévue."
  },
  {
    question: "Comment fonctionne l'expédition de colis ?",
    answer: "Remplissez le formulaire 'Expédier Colis' en indiquant les informations de l'expéditeur, du destinataire et la valeur estimée. Les frais s'élèvent à 10% de la valeur déclarée. Un numéro de suivi unique vous permettra de suivre le colis en temps réel."
  }
];

function AddReviewModal({ isOpen, onClose, onAddReview, companies }) {
  const [company, setCompany] = useState(companies[0]?.name || 'UTB Express');
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
              {companies.map(c => (
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

function CompanyCard({ company }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parsing robuste des images de galerie renvoyées sous forme de chaîne JSON par le backend
  let rawImages = [];
  try {
    if (typeof company.images === 'string') {
      rawImages = JSON.parse(company.images);
    } else if (Array.isArray(company.images)) {
      rawImages = company.images;
    }
  } catch (e) {
    rawImages = [];
  }

  const images = rawImages.length > 0 
    ? rawImages.map(img => getImageUrl(img)) 
    : [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
      ];

  const logoUrl = getImageUrl(company.logo);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-md shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-xs text-orange-600">
                  {company.code || company.name.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-900 font-bold text-xs">{company.rating || "4.8"}</span>
                <span className="text-[10px] text-slate-400">({company.reviewsCount || 80} avis)</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" /> Agréé
          </span>
        </div>

        <div className="relative w-full h-40 mb-4 rounded-2xl overflow-hidden bg-slate-100 group/slider">
          <img
            src={images[currentImageIndex]}
            alt={company.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-1.5 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900 text-white p-1.5 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-lg">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>{company.route || "Réseau National"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {["Climatisé", "Wifi", "Sécurisé"].map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <button className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group-hover:bg-orange-600">
        <span>Voir les départs</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function SearchTerminal({ companies, onOpenParcelModal, trackingCode, setTrackingCode, onQuickTrack }) {
  const [activeTab, setActiveTab] = useState('billet');
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  
  const [departureStation, setDepartureStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  
  const [departures, setDepartures] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [loadingDepartures, setLoadingDepartures] = useState(false);
  
  const [departDate, setDepartDate] = useState(new Date().toISOString().split('T')[0]);

  const [routeId, setRouteId] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [step, setStep] = useState('search'); 
  
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WAVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompany) {
      setSelectedCompany(String(companies[0].id));
    }
  }, [companies, selectedCompany]);

  useEffect(() => {
    if (!selectedCompany) return;
    const fetchStations = async () => {
      setLoadingStations(true);
      setStations([]);
      setDepartureStation('');
      setDestinationStation('');
      try {
        const res = await api.get(`api/companies/${selectedCompany}/stations`);
        const data = res.data?.data || res.data || [];
        setStations(data);
        if (data.length > 0) {
          setDepartureStation(String(data[0].id));
          if (data.length > 1) setDestinationStation(String(data[1].id));
        }
      } catch (err) {
        console.error('Erreur chargement gares:', err);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedCompany || !departureStation || !destinationStation || departureStation === destinationStation) {
      setDepartures([]);
      setSelectedDeparture('');
      setTicketPrice(null);
      setRouteId(null);
      return;
    }

    const fetchRouteAndDepartures = async () => {
      setLoadingDepartures(true);
      setLoadingPrice(true);
      try {
        const resRoute = await api.get('api/company/routes/search', {
          params: {
            company_id: selectedCompany,
            departure_station_id: departureStation,
            destination_station_id: destinationStation
          }
        });
        const routeData = resRoute.data;
        const rId = routeData.route_id || routeData.route?.id;
        const priceVal = routeData.price || 5000;

        setRouteId(rId);
        setTicketPrice(priceVal);

        if (rId) {
          const resDeps = await api.get('api/company/schedule-templates', {
            params: {
              company_id: selectedCompany,
              route_id: rId,
              departure_station_id: departureStation
            }
          });
          const depsData = resDeps.data?.data || resDeps.data || [];
          setDepartures(depsData);
          if (depsData.length > 0) {
            setSelectedDeparture(String(depsData[0].id));
          } else {
            setSelectedDeparture('');
          }
        }
      } catch (err) {
        console.error('Erreur calcul trajet/prix:', err);
        setDepartures([]);
        setTicketPrice(7000);
      } finally {
        setLoadingDepartures(false);
        setLoadingPrice(false);
      }
    };

    fetchRouteAndDepartures();
  }, [selectedCompany, departureStation, destinationStation]);

  const handleProceedToPricing = (e) => {
    e.preventDefault();
    setStep('pricing');
  };

  const handleValidateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        company_id: selectedCompany,
        route_id: routeId,
        departure_station_id: departureStation,
        destination_station_id: destinationStation,
        schedule_template_id: selectedDeparture,
        booking_date: departDate,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        payment_method: paymentMethod,
        amount: ticketPrice || 7000,
      };

      const res = await api.post('api/bookings', payload);
      const data = res.data?.data || res.data;

      const compObj = companies.find(c => String(c.id) === String(selectedCompany));
      const depStObj = stations.find(s => String(s.id) === String(departureStation));
      const arrStObj = stations.find(s => String(s.id) === String(destinationStation));

      setReceiptData({
        ticketNumber: data?.ticket_number || `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        companyName: compObj?.name || 'Compagnie Agréée',
        from: depStObj?.name || 'Départ',
        to: arrStObj?.name || 'Arrivée',
        date: departDate,
        passengerName,
        phone: passengerPhone,
        amount: ticketPrice || 7000,
        paymentMethod,
        qrCodeValue: JSON.stringify({ ticket: data?.ticket_number || 'TKT-123456', passenger: passengerName })
      });
      setStep('success');
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      setReceiptData({
        ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
        companyName: companies.find(c => String(c.id) === String(selectedCompany))?.name || 'UTB Express',
        from: stations.find(s => String(s.id) === String(departureStation))?.name || 'Abidjan',
        to: stations.find(s => String(s.id) === String(destinationStation))?.name || 'Bondoukou',
        date: departDate,
        passengerName: passengerName || 'Voyageur',
        phone: passengerPhone || '0700000000',
        amount: ticketPrice || 7000,
        paymentMethod,
        qrCodeValue: JSON.stringify({ ticket: 'TKT-DEMO', passenger: passengerName })
      });
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 md:p-7 text-slate-800 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1">
          <button
            onClick={() => { setActiveTab('billet'); setStep('search'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'billet'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4" /> Billet de Bus
          </button>
          <button
            onClick={() => {
              setActiveTab('colis');
              onOpenParcelModal();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'colis'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" /> Expédier Colis
          </button>
        </div>

        <form onSubmit={onQuickTrack} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 w-full lg:w-80 shadow-inner">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="N° Billet ou Suivi (ex: TR-9402)"
            className="w-full bg-transparent text-slate-800 text-xs font-medium focus:outline-none px-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Search className="w-3.5 h-3.5" /> Suivre
          </button>
        </form>
      </div>

      {activeTab === 'billet' && step === 'search' && (
        <form onSubmit={handleProceedToPricing}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-xs">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-600" /> Compagnie
              </label>
              <select 
                value={selectedCompany} 
                onChange={(e) => setSelectedCompany(e.target.value)} 
                className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer py-1"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-xs">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Gare de départ
              </label>
              <select
                value={departureStation}
                onChange={(e) => setDepartureStation(e.target.value)}
                disabled={loadingStations || stations.length === 0}
                className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer py-1 disabled:opacity-50"
              >
                {loadingStations ? (
                  <option>Chargement...</option>
                ) : stations.length === 0 ? (
                  <option>Aucune gare</option>
                ) : (
                  stations.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                )}
              </select>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-xs">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Destination
              </label>
              <select 
                value={destinationStation} 
                onChange={(e) => setDestinationStation(e.target.value)} 
                disabled={loadingStations || stations.length === 0}
                className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer py-1 disabled:opacity-50"
              >
                {loadingStations ? (
                  <option>Chargement...</option>
                ) : stations.length === 0 ? (
                  <option>Aucune destination</option>
                ) : (
                  stations.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                )}
              </select>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-xs">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-600" /> Date du voyage
              </label>
              <input 
                type="date" 
                value={departDate} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartDate(e.target.value)} 
                className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer py-1" 
              />
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-xs">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" /> Horaire de départ
              </label>
              <select 
                value={selectedDeparture} 
                onChange={(e) => setSelectedDeparture(e.target.value)} 
                disabled={loadingDepartures || departures.length === 0}
                className="w-full bg-transparent font-semibold text-xs text-slate-800 focus:outline-none cursor-pointer py-1 disabled:opacity-50"
              >
                {loadingDepartures ? (
                  <option>Chargement des départs...</option>
                ) : departures.length === 0 ? (
                  <option value="">Aucun départ planifié</option>
                ) : (
                  departures.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.formatted_label || `${d.departure_number || 1}er Départ (${d.departure_time || ''})`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full h-full min-h-[56px] bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4" /> Vérifier le tarif & Réserver
            </button>

          </div>
        </form>
      )}

      {activeTab === 'billet' && step === 'pricing' && (
        <form onSubmit={handleValidateBooking} className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">Tarif estimé du billet</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loadingPrice ? "Calcul en cours..." : `${(ticketPrice || 7000).toLocaleString('fr-FR')} FCFA`}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setStep('search')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Modifier le trajet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nom complet du passager *</label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Ex: Kouassi Jean"
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Numéro Mobile Money *</label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="Ex: 07 01 02 03 04"
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Choisissez votre moyen de paiement</label>
            <div className="grid grid-cols-3 gap-2">
              {['WAVE', 'ORANGE', 'MTN'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'border-orange-500 text-orange-600 bg-orange-50 ring-2 ring-orange-500'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Validation en cours...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Payer et valider le billet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'billet' && step === 'success' && receiptData && (
        <div className="p-4 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Réservation Confirmée !</h3>
            <p className="text-xs text-slate-500 mt-0.5">Billet N° <span className="font-bold text-slate-800">{receiptData.ticketNumber}</span></p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 relative">
            <div className="flex justify-between items-start border-b border-slate-200/80 pb-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Compagnie</p>
                <p className="text-xs font-bold text-slate-800">{receiptData.companyName}</p>
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <QRCodeSVG value={receiptData.qrCodeValue} size={64} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Trajet</p>
                <p className="font-semibold text-slate-800">{receiptData.from} ➔ {receiptData.to}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Date</p>
                <p className="font-semibold text-slate-800">{receiptData.date}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Passager</p>
                <p className="font-semibold text-slate-800">{receiptData.passengerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Téléphone</p>
                <p className="font-semibold text-slate-800">{receiptData.phone}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Total Payé ({receiptData.paymentMethod})</span>
              <span className="font-extrabold text-orange-600 text-sm">{receiptData.amount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>Imprimer le Billet</span>
            </button>
            <button
              onClick={() => { setStep('search'); setReceiptData(null); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Nouvelle Réservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [trackingCode, setTrackingCode] = useState('');
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await api.get('api/companies');
        const data = res.data?.data || res.data || [];
        setCompanies(data);
      } catch (err) {
        console.error('Erreur chargement compagnies dynamiques:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleAddReview = (newReview) => {
    setReviews((currentReviews) => [newReview, ...currentReviews]);
  };

  const handleTrack = (event) => {
    event.preventDefault();
    if (!trackingCode.trim()) return;
    alert(`Suivi du code : ${trackingCode}`);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800 selection:bg-orange-500 selection:text-white">
      <ConnectNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 -z-20">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"
              alt="Autocar confortable sur la route"
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,#020617_8%,rgba(2,6,23,.92)_48%,rgba(2,6,23,.55)_100%)]" />
          </div>
          <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-orange-600/20 blur-[140px]" />

          <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-7xl">
                  Vos trajets, <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">en mieux.</span>
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Comparez les compagnies agréées, trouvez le bon départ et envoyez vos colis en toute confiance depuis une seule plateforme.
                </p>
                <div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Prix transparents</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Paiement sécurisé</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Support réactif</span>
                </div>
              </div>

              <div className="relative lg:pt-5">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-orange-500/30 to-amber-500/10 blur-2xl" />
                <div className="relative">
                  <SearchTerminal
                    companies={companies}
                    trackingCode={trackingCode}
                    setTrackingCode={setTrackingCode}
                    onQuickTrack={handleTrack}
                    onOpenParcelModal={() => setIsParcelModalOpen(true)}
                  />
                  <p className="mt-3 text-center text-[11px] text-slate-400">Réservez en moins de 2 minutes · Sans frais cachés</p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-6">
              {[
                ['50+', 'compagnies partenaires'],
                ['120+', 'destinations couvertes'],
                ['4.8/5', 'note moyenne'],
                ['24/7', 'assistance voyageurs'],
              ].map(([value, label]) => (
                <div key={label} className="border-l border-orange-500/30 pl-3 sm:pl-5">
                  <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 sm:text-[11px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPAGNIES SECTION (DYNAMIQUE) */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[.18em] text-orange-600">Un réseau de confiance</span>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Les compagnies plébiscitées</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-500">Des opérateurs vérifiés, notés par de vrais voyageurs et prêts à vous accompagner.</p>
              </div>
            </div>
            
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                <span>Chargement des compagnies partenaires...</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500">Aucune compagnie disponible pour le moment.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {companies.map((company) => <CompanyCard key={company.id} company={company} />)}
              </div>
            )}
          </div>
        </section>

        {/* ROUTES POPULAIRES SECTION */}
        <section className="bg-white py-16 lg:py-24 border-y border-slate-200/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-orange-600">
                  <TrendingUp className="h-3.5 w-3.5" /> Les incontournables
                </span>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Partez en toute simplicité</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_ROUTES.map((route, idx) => (
                <div key={idx} className="group rounded-3xl border border-slate-200 bg-slate-50/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-orange-500" /> {route.duration}</span>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-bold text-orange-700 text-[10px]">{route.departures}</span>
                  </div>
                  <div className="my-5 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-950 text-sm">{route.from}</span>
                    <div className="flex flex-1 items-center gap-1 px-2">
                      <span className="h-px flex-1 bg-slate-300" />
                      <ArrowRight className="h-4 w-4 text-orange-600 transition group-hover:translate-x-1" />
                      <span className="h-px flex-1 bg-slate-300" />
                    </div>
                    <span className="font-bold text-slate-950 text-sm">{route.to}</span>
                  </div>
                  <div className="flex items-end justify-between border-t border-slate-200 pt-3.5">
                    <span className="text-[11px] text-slate-500 font-medium">À partir de</span>
                    <span className="text-base font-black text-orange-600">{route.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE SECTION */}
        <section className="bg-orange-50/40 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-orange-600">Un parcours sans friction</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Réserver n'a jamais été aussi simple</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['01', Search, 'Recherchez votre trajet', 'Indiquez votre départ, votre destination et la date qui vous convient.'], 
                ['02', Ticket, 'Choisissez votre départ', 'Comparez les horaires, les prix et les services de chaque compagnie.'], 
                ['03', CheckCircle2, 'Voyagez sereinement', 'Recevez votre billet instantanément et gardez toutes les informations à portée de main.']
              ].map(([number, Icon, title, text]) => (
                <div key={number} className="relative rounded-3xl border border-orange-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-4xl font-black text-orange-200/80">{number}</span>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-950 text-base">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AVANTAGES SECTION */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-orange-600">Pensé pour vous</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tout ce qu'il faut pour voyager mieux</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['100% Sécurisé', 'Billets électroniques avec QR Code scannable à la gare.', ShieldCheck], 
                ['Mobile Money', 'Payez avec Wave, Orange Money, MTN MoMo et Moov Money.', CreditCard], 
                ['Suivi en direct', "Restez informé de l'avancement de votre colis ou de votre embarquement.", Zap], 
                ['Assistance 24/7', 'Une équipe disponible pour vous accompagner à chaque étape.', Headphones]
              ].map(([title, text, Icon]) => (
                <div key={title} className="rounded-3xl border border-slate-200/80 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-950 text-base">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION FAQ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-orange-600 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Questions fréquentes
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tout ce que vous devez savoir</h2>
            </div>
            <div className="space-y-4">
              {FAQ_DATA.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 transition-all">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm md:text-base cursor-pointer hover:bg-slate-100/60 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-orange-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* AVIS CLIENTS SECTION */}
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white lg:py-24">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[.18em] text-orange-400">Ils nous font confiance</span>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Des voyages qui laissent une bonne impression</h2>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(true)} 
                className="inline-flex items-center gap-2 self-start rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/20 transition hover:bg-orange-500 md:self-auto cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> Laisser un avis
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-7 shadow-xl">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-400">
                        {rev.company}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic leading-relaxed text-slate-300">“{rev.comment}”</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20 text-xs font-bold text-orange-300">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                      <span className="text-[11px] text-slate-500">{rev.route}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <AddReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onAddReview={handleAddReview}
        companies={companies}
      />

      <Footer />
    </div>
  );
}
