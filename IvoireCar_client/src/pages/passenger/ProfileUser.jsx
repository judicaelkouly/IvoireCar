import React, { useState } from 'react';
import { 
  User, 
  Ticket, 
  Package, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Download, 
  PlusCircle, 
  X, 
  Lock, 
  Eye, 
  Calendar, 
  Phone, 
  Mail, 
} from 'lucide-react';

// Données fictives pour la démonstration
const MOCK_USER = {
  name: "Kouly Judicael",
  email: "kouli@example.com",
  phone: "+225 07 00 00 00 00",
  verified: true,
  ticketsCount: 2,
  rewardsPoints: 2
};

const MOCK_TICKETS = [
  {
    id: "TK-8842",
    company: "UTB Express",
    from: "Abidjan (Gare Nord)",
    to: "Yamoussoukro",
    date: "2026-09-25",
    time: "08:00",
    seat: "14B",
    price: "5 000 FCFA",
    status: "Confirmé"
  },
  {
    id: "TK-7310",
    company: "STC Touristique",
    from: "Abidjan (Treichville)",
    to: "Bouaké",
    date: "2026-08-14",
    time: "14:30",
    seat: "05A",
    price: "8 000 FCFA",
    status: "Terminé"
  }
];

const MOCK_PARCELS = [
  {
    id: "CL-9041",
    company: "AVS Transport",
    sender: "Kouly Judicael",
    senderPhone: "+225 05 00 00 00 00",
    receiver: "Kouassi Jean",
    receiverPhone: "+225 05 01 02 03 04",
    from: "Abidjan",
    to: "San-Pédro",
    item: "Carton d'effets personnels (4.5 kg)",
    status: "En transit",
    date: "2026-09-18"
  },
  {
    id: "CL-6120",
    company: "UTB Express",
    sender: "Awa Koné",
    senderPhone: "+225 05 00 00 00 00",
    receiver: "KOULI Judicael",
    receiverPhone: "+225 07 00 00 00 00",
    from: "Yamoussoukro",
    to: "Abidjan",
    item: "Colis alimentaire scellé",
    status: "Livré",
    date: "2026-09-02"
  }
];

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Formulaire de changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    alert("Votre mot de passe a été mis à jour avec succès !");
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 md:px-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border border-slate-300/80 rounded-3xl p-4 shadow-xl shrink-0 h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" /> Mon Profil
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4" /> Mes Tickets
            </button>

            <button
              onClick={() => setActiveTab('parcels')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'parcels'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" /> Mes Colis
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Settings className="w-4 h-4" /> Paramètres
            </button>
          </nav>

          <hr className="my-4 border-slate-200" />

          <button
            onClick={() => alert("Déconnexion...")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 space-y-6">

          {/* BANNIÈRE PROFIL */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-orange-600/30 shrink-0">
                JK
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{MOCK_USER.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{MOCK_USER.email}</span>
                  {MOCK_USER.verified && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Membre Vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-start">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">TICKETS</span>
                <span className="text-xl font-extrabold text-white">{MOCK_USER.ticketsCount}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">COLIS</span>
                <span className="text-xl font-extrabold text-orange-500">{MOCK_USER.rewardsPoints}</span>
              </div>
            </div>
          </div>

          {/* ONGLET 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Informations Personnelles</h1>
                  <p className="text-xs text-slate-500">Gérez vos coordonnées et vos préférences.</p>
                </div>
                <button className="px-4 py-2 border border-slate-300 hover:border-orange-400 rounded-xl text-xs font-bold text-slate-700 bg-white hover:text-orange-600 transition-all shadow-sm">
                  Modifier le profil
                </button>
              </div>

              <div className="bg-white border border-slate-300/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{MOCK_USER.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{MOCK_USER.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 md:w-1/2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{MOCK_USER.phone}</span>
                  </div>
                </div>

                <hr className="my-4 border-slate-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Préférences d'information</h4>
                    <p className="text-[11px] text-slate-500">Recevoir les notifications sur les nouveaux trajets et offres de livraison.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-600 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2: MES TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Mes Tickets</h1>
                  <p className="text-xs text-slate-500">Consultez l'historique de vos réservations de voyage.</p>
                </div>
                <button 
                  onClick={() => alert("Redirection vers la page de réservation de billet...")}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Réserver un billet
                </button>
              </div>

              <div className="bg-white border border-slate-300/80 rounded-3xl overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-200">
                  {MOCK_TICKETS.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0 mt-0.5 border border-orange-100">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{ticket.id}</span>
                            <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200">
                              {ticket.company}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-semibold">
                            {ticket.from} → {ticket.to}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {ticket.date} à {ticket.time}</span>
                            <span>Siège: {ticket.seat}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                        <span className="text-sm font-extrabold text-slate-900">{ticket.price}</span>
                        <span className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline">
                          <Eye className="w-4 h-4" /> Voir détails
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3: MES COLIS */}
          {activeTab === 'parcels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Mes Colis</h1>
                  <p className="text-xs text-slate-500">Suivez et gérez l'ensemble de vos expéditions.</p>
                </div>
                <button 
                  onClick={() => alert("Redirection vers la demande d'expédition de colis...")}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Demander un envoi de colis
                </button>
              </div>

              <div className="bg-white border border-slate-300/80 rounded-3xl overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-200">
                  {MOCK_PARCELS.map((parcel) => (
                    <div 
                      key={parcel.id} 
                      onClick={() => setSelectedParcel(parcel)}
                      className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5 border border-emerald-100">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{parcel.id}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              parcel.status === 'En transit' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {parcel.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 font-semibold">{parcel.item}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{parcel.from} → {parcel.to} • {parcel.company}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                          <Eye className="w-4 h-4" /> Détails du colis
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL DÉTAILS DU TICKET */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Billet de Voyage</h3>
                <span className="text-xs font-semibold text-slate-400">{selectedTicket.id}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Compagnie:</span>
                <span className="font-bold text-slate-900">{selectedTicket.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Départ:</span>
                <span className="font-bold text-slate-900">{selectedTicket.from}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Destination:</span>
                <span className="font-bold text-slate-900">{selectedTicket.to}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Date & Heure:</span>
                <span className="font-bold text-slate-900">{selectedTicket.date} à {selectedTicket.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">N° de siège:</span>
                <span className="font-bold text-slate-900">{selectedTicket.seat}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Prix payé:</span>
                <span className="font-extrabold text-orange-600 text-sm">{selectedTicket.price}</span>
              </div>
            </div>

            <button 
              onClick={() => alert(`Téléchargement du ticket ${selectedTicket.id}...`)}
              className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Télécharger le billet PDF
            </button>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS DU COLIS */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setSelectedParcel(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Détails de l'expédition</h3>
                <span className="text-xs font-semibold text-slate-400">{selectedParcel.id}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Statut actuel:</span>
                <span className="font-bold text-emerald-600">{selectedParcel.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Contenu:</span>
                <span className="font-bold text-slate-900">{selectedParcel.item}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Compagnie:</span>
                <span className="font-bold text-slate-900">{selectedParcel.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Trajet:</span>
                <span className="font-bold text-slate-900">{selectedParcel.from} → {selectedParcel.to}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Expéditeur:</span>
                <span className="font-bold text-slate-900">{selectedParcel.sender} ({selectedParcel.senderPhone})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Destinataire:</span>
                <span className="font-bold text-slate-900">{selectedParcel.receiver} ({selectedParcel.receiverPhone})</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedParcel(null)}
              className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODAL SETTINGS (Changement de mot de passe) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Modifier le mot de passe</h3>
                <p className="text-xs text-slate-500">Saisissez vos identifiants de sécurité</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
