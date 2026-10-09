import React, { useState } from "react";
import { Bus, User, LogOut, Ticket, Sparkles, X, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Données fictives pour le formulaire
const COMPAGNIES = [
  { id: "UTB", name: "UTB Express" },
  { id: "STC", name: "Sotra Touristique" },
  { id: "AVS", name: "AVS Transport" },
  { id: "SCTE", name: "SCTE Transport" }
];

const STATIONS = [
  "Abidjan (Adjamé)",
  "Abidjan (Yopougon)",
  "Yamoussoukro",
  "Bouaké",
  "San-Pédro",
  "Korhogo"
];

const SCHEDULES = [
  { id: "d1", label: "1er départ (05h30)", price: 5000 },
  { id: "d2", label: "2ème départ (07h00)", price: 5000 },
  { id: "d3", label: "3ème départ (09h30)", price: 5500 },
  { id: "d4", label: "4ème départ (12h00)", price: 5000 },
  { id: "d5", label: "Départ du soir (16h30)", price: 6000 },
];

function ConnectNavbar({ user = { name: "Kouassi Jean", email: "jean@example.com", avatar: null } }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // État d'ouverture du modal de réservation
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États du formulaire de réservation
  const [compagnie, setCompagnie] = useState(COMPAGNIES[0].id);
  const [departure, setDeparture] = useState("Abidjan (Adjamé)");
  const [destination, setDestination] = useState("Yamoussoukro");
  const [schedule, setSchedule] = useState(SCHEDULES[0].id);
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WAVE");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Déterminer le tarif actuel selon l'horaire sélectionné
  const selectedScheduleObj = SCHEDULES.find((s) => s.id === schedule) || SCHEDULES[0];
  const ticketPrice = selectedScheduleObj.price;

  const handleOpenModal = (e) => {
    if (e) e.preventDefault();
    setIsModalOpen(true);
    setMenuOpen(false);
    setIsSubmitted(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      alert(`Réservation confirmée ! Un SMS avec votre billet a été envoyé au ${phone}.`);
    }, 1500);
  };

  const navItems = [
    { name: "Compagnies", href: "#" },
    { name: "À Propos", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-12 lg:px-24 xl:px-40 py-3.5 transition-all bg-white/80">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* LOGO */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-black">
              Ivoire<span className="text-orange-500">Car</span>
            </span>
          </a>

          {/* LIENS DE NAVIGATION (Desktop) */}
          <div className="hidden lg:flex items-center border rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner border-slate-200 bg-slate-50/50">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-1.5 rounded-full font-medium text-black hover:text-orange-500 transition-all duration-200 text-sm"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Bouton Réserver (Ouvre le modal) */}
            <Link
              to="/reservation"
              className="group relative inline-flex items-center gap-2 bg-[#ea580c] hover:bg-orange-700 text-white text-base font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-700/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Réserver un billet</span>
              <Sparkles className="w-4 h-4" />
            </Link>

            {/* SÉPARATEUR */}
            <div className="h-6 w-px bg-slate-200" />

            {/* MENU PROFIL / AVATAR */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-200/80  transition-all cursor-pointer focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </button>

                {/* DROPDOWN PROFIL */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <a
                        href="/mon-profil"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#F97316]" />
                        <span>Mon Profil</span>
                      </a>
                      <a
                        href="/mes-tickets"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#059669]" />
                        <span>Mes Tickets</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => alert("Déconnexion...")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors"
              >
                Se connecter
              </a>
            )}
          </div>

          {/* BOUTON BURGER (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-black focus:outline-none"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#0F172A]/95 border-b border-white/10 backdrop-blur-2xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-200 text-white">
            {/* Info Utilisateur Mobile */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#059669] text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Liens Mobile */}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={handleOpenModal}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F97316] to-[#059669] text-white text-sm font-semibold py-3 rounded-xl shadow-lg cursor-pointer"
              >
                <span>Réserver mon ticket</span>
                <Sparkles className="w-4 h-4" />
              </button>

              {user && (
                <button
                  onClick={() => alert("Déconnexion...")}
                  className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MODAL DE RÉSERVATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* EN-TÊTE MODAL */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#ea580c] bg-orange-50 px-2.5 py-1 rounded-md inline-block mb-1">
                  RÉSERVATION EN DIRECT
                </span>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{departure.split(" ")[0]}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span>{destination.split(" ")[0]}</span>
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULAIRE DE RÉSERVATION */}
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 overflow-y-auto text-left">
              
              {/* COMPAGNIE & DÉPART CHOISI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Choix Compagnie */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Compagnie
                  </label>
                  <select
                    value={compagnie}
                    onChange={(e) => setCompagnie(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all cursor-pointer"
                  >
                    {COMPAGNIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horaire de Départ */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Départ Choisis
                  </label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all cursor-pointer"
                  >
                    {SCHEDULES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GARES DÉPART ET ARRIVÉE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Gare de Départ
                  </label>
                  <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all cursor-pointer"
                  >
                    {STATIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Destination
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all cursor-pointer"
                  >
                    {STATIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TARIF DU BILLET */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  TARIF DU BILLET
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {ticketPrice.toLocaleString()} FCFA
                </span>
              </div>

              {/* INFOS PASSAGER */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    NOM COMPLET DU PASSAGER
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Kouassi Jean"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    NUMÉRO MOBILE MONEY (SMS BILLET)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 07 01 02 03 04"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>

              {/* MOYEN DE PAIEMENT */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  MOYEN DE PAIEMENT
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["WAVE", "ORANGE", "MTN"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? "border-[#ea580c] bg-orange-50 text-[#ea580c] shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOUTON PAYER ET CONFIRMER */}
              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full mt-2 bg-[#ea580c] hover:bg-orange-700 text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-orange-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitted ? (
                  <span>Confirmation en cours...</span>
                ) : (
                  <>
                    <span>PAYER ET CONFIRMER LA RÉSERVATION</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectNavbar;
