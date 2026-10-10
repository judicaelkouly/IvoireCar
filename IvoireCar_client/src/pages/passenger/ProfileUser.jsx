import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
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
  EyeOff,
  Calendar, 
  Phone, 
  Mail, 
  Camera,
  Loader2,
  Edit3,
  Check,
  AlertCircle
} from 'lucide-react';

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/storage')) return `http://localhost:8000${avatarPath}`;
  return `http://localhost:8000/storage/${avatarPath.replace(/^\/+/, '')}`;
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);

  // Modaux
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Données réelles API
  const [tickets, setTickets] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Formulaire d'édition du profil
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.nom || '',
    email: user?.email || '',
    phone: user?.phone || user?.telephone || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);

  // Formulaire de changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Mettre à jour le formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.nom || '',
        email: user.email || '',
        phone: user.phone || user.telephone || '',
      });
    }
  }, [user]);

  // Chargement des réservations et colis réels avec extraction sécurisée des données paginées
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingData(true);
      try {
        const [ticketsRes, parcelsRes] = await Promise.all([
          api.get('/api/my-reservations').catch(() => null),
          api.get('/api/my-parcels').catch(() => null)
        ]);

        // Extraction sécurisée pour la pagination Laravel (res.data.data.data OU res.data.data OU res.data)
        if (ticketsRes && ticketsRes.data) {
          const raw = ticketsRes.data.data;
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data) ? raw.data : (Array.isArray(ticketsRes.data) ? ticketsRes.data : []));
          setTickets(list);
        } else {
          setTickets([]);
        }

        if (parcelsRes && parcelsRes.data) {
          const raw = parcelsRes.data.data;
          const list = Array.isArray(raw)
            ? raw
            : (raw && Array.isArray(raw.data) ? raw.data : (Array.isArray(parcelsRes.data) ? parcelsRes.data : []));
          setParcels(list);
        } else {
          setParcels([]);
        }
      } catch (error) {
        console.error("Erreur de chargement des données utilisateur :", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, []);

  // Gestion du choix de fichier photo
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Soumission de la mise à jour du profil (avec Image Upload)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccessMsg(null);

    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    formData.append('phone', profileForm.phone);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      await api.post('/api/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await checkAuth(); // Recharger les infos utilisateur
      setProfileSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileSuccessMsg(null);
      }, 1500);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Soumission du changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.post('/api/profile/update-password', passwordForm);
      alert("Votre mot de passe a été modifié avec succès !");
      setIsPasswordModalOpen(false);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Erreur lors de la modification du mot de passe.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.name || user?.nom || "Utilisateur";
  const userEmail = user?.email || "";
  const userPhone = user?.phone || user?.telephone || "Non renseigné";
  const avatarUrl = avatarPreview || getAvatarUrl(user?.avatar || user?.avatar_url);

  const ticketList = Array.isArray(tickets) ? tickets : [];
  const parcelList = Array.isArray(parcels) ? parcels : [];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 md:px-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-3xl p-4 shadow-xl shrink-0 h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" /> Mon Profil
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4" /> Mes Tickets
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {ticketList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('parcels')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parcels'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" /> Mes Colis
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'parcels' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {parcelList.length}
              </span>
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Sécurité & Mot de passe
            </button>
          </nav>

          <hr className="my-4 border-slate-200" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 space-y-6">

          {/* BANNIÈRE PROFIL */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="flex items-center gap-5">
              <div className="relative group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName} 
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-orange-600/30 uppercase">
                    {userName.charAt(0)}
                  </div>
                )}
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight">{userName}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{userEmail}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Membre Actif
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-start">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">TICKETS</span>
                <span className="text-2xl font-extrabold text-white">{ticketList.length}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">COLIS</span>
                <span className="text-2xl font-extrabold text-orange-500">{parcelList.length}</span>
              </div>
            </div>
          </div>

          {/* ONGLET 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Informations Personnelles</h1>
                  <p className="text-xs text-slate-500">Gérez vos coordonnées et mettez à jour votre photo.</p>
                </div>
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> Modifier le profil
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
                    <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{userName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Adresse E-mail</label>
                    <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{userEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone</label>
                  <div className="flex items-center gap-2 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 md:w-1/2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{userPhone}</span>
                  </div>
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
                  <p className="text-xs text-slate-500">Historique de vos réservations de voyage.</p>
                </div>
                <button 
                  onClick={() => navigate('/reservation')}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Réserver un billet
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
  {loadingData ? (
    <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
      <span className="text-xs font-medium">Chargement de vos tickets...</span>
    </div>
  ) : ticketList.length === 0 ? (
    <div className="p-8 text-center text-slate-400">
      <p className="text-xs font-medium">Vous n'avez aucune réservation pour le moment.</p>
    </div>
  ) : (
    <div className="divide-y divide-slate-100">
      {ticketList.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => setSelectedTicket(ticket)}
          type="button"
          className="w-full text-left p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 focus:outline-none focus:bg-slate-50"
        >
          {/* Section Gauche : Infos Ticket */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl shrink-0 mt-0.5 border border-orange-100">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  {ticket.ticket_number || `TKT-${ticket.id}`}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200">
                  {ticket.company?.name || "IvoireCar Partner"}
                </span>
              </div>
              
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                {ticket.departure_station?.city || ticket.departure_station?.name || 'Départ'} →{' '}
                {ticket.destination_station?.city || ticket.destination_station?.name || 'Arrivée'}
              </p>
              
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {/* Sécurité si la date est un string ou manquante */}
                  {ticket.booking_date 
                    ? new Date(ticket.booking_date).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })
                    : 'Date inconnue'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Droite : Prix et Action */}
          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto">
            <span className="text-sm font-extrabold text-slate-900">
              {ticket.amount ? `${Number(ticket.amount).toLocaleString('fr-FR')} FCFA` : '5 000 FCFA'}
            </span>
            <span className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline">
              <Eye className="w-4 h-4" /> Voir détails
            </span>
          </div>
        </button>
      ))}
    </div>
  )}
</div>

            </div>
          )}

          {/* ONGLET 3: MES COLIS */}
          {activeTab === 'parcels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Mes Colis</h1>
                  <p className="text-xs text-slate-500">Suivez et gérez vos expéditions de colis.</p>
                </div>
                <button 
                  onClick={() => navigate('/expedition')}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Expédier un colis
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
                {loadingData ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                    <span className="text-xs font-medium">Chargement de vos colis...</span>
                  </div>
                ) : parcelList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-xs font-medium">Aucune expédition de colis enregistrée.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {parcelList.map((parcel) => (
                      <div 
                        key={parcel.id} 
                        onClick={() => setSelectedParcel(parcel)}
                        className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0 mt-0.5 border border-amber-100">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {parcel.tracking_code || `CL-${parcel.id}`}
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                parcel.status === 'delivered' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {parcel.status || 'En attente'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1 font-semibold">{parcel.description || 'Colis'}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {parcel.origin_station || 'Origine'} → {parcel.destination_station || 'Destination'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          <span className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline">
                            <Eye className="w-4 h-4" /> Détails
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL EDIT PROFILE */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Modifier le profil</h3>
                <p className="text-xs text-slate-500">Mettez à jour vos informations personnelles</p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Cadre d'upload Photo */}
              <div className="flex flex-col items-center justify-center gap-2 pb-2">
                <div className="relative group cursor-pointer">
                  {avatarPreview || avatarUrl ? (
                    <img 
                      src={avatarPreview || avatarUrl} 
                      alt="Aperçu Avatar" 
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-dashed border-slate-300">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold"
                  >
                    Changer
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Cliquez pour ajouter une photo</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SETTINGS (Changement de mot de passe) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Changer le mot de passe</h3>
                <p className="text-xs text-slate-500">Sécurisez l'accès à votre compte</p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                    placeholder="Min 8 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all"
                    placeholder="Répétez le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Mettre à jour</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS TICKET */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Billet de Voyage</h3>
                <span className="text-xs font-semibold text-slate-400">
                  {selectedTicket.ticket_number || `TKT-${selectedTicket.id}`}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Compagnie:</span>
                <span className="font-bold text-slate-900">{selectedTicket.company?.name || "IvoireCar Partner"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Passager:</span>
                <span className="font-bold text-slate-900">{selectedTicket.passenger_name || userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Départ:</span>
                <span className="font-bold text-slate-900">
                  {selectedTicket.departure_station?.name || selectedTicket.departure_station?.city || 'Gare'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Destination:</span>
                <span className="font-bold text-slate-900">
                  {selectedTicket.destination_station?.name || selectedTicket.destination_station?.city || 'Gare'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Date du voyage:</span>
                <span className="font-bold text-slate-900">{selectedTicket.booking_date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Montant:</span>
                <span className="font-extrabold text-orange-600 text-sm">
                  {selectedTicket.amount ? `${Number(selectedTicket.amount).toLocaleString('fr-FR')} FCFA` : '5 000 FCFA'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => alert(`Impression du billet ${selectedTicket.ticket_number || selectedTicket.id}...`)}
              className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Télécharger le PDF
            </button>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS COLIS */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setSelectedParcel(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Détails Colis</h3>
                <span className="text-xs font-semibold text-slate-400">
                  {selectedParcel.tracking_code || `CL-${selectedParcel.id}`}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Statut:</span>
                <span className="font-bold text-amber-700 uppercase">{selectedParcel.status || 'En cours'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Description:</span>
                <span className="font-bold text-slate-900">{selectedParcel.description || 'Colis'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Expéditeur:</span>
                <span className="font-bold text-slate-900">
                  {selectedParcel.sender_name} ({selectedParcel.sender_phone})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Destinataire:</span>
                <span className="font-bold text-slate-900">
                  {selectedParcel.recipient_name} ({selectedParcel.recipient_phone})
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedParcel(null)}
              className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
