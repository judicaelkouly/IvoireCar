import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, Edit3, Calendar, 
  MessageSquare, Camera, ArrowLeft, Save, Loader2,
  AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; 
import api from '../../../services/api'; 

const ProfileManager = () => {
  // Récupération de l'utilisateur et de checkAuth depuis AuthContext
  const { user, checkAuth } = useAuth();

  // Mode d'affichage : 'view' ou 'edit'
  const [isEditing, setIsEditing] = useState(false);

  // États de soumission et messages
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // État des données du formulaire
  const [userData, setUserData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    phone: '',
    role: '',
    avatar_url: null,
    password: '',
  });

  // Aperçu de la photo de profil
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Date du jour formatée en français
  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  // Remplacez 'http://localhost:8000' par l'URL de votre serveur Laravel / API si nécessaire
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/storage/${path.replace(/^\/?storage\//, '')}`;
};

  // Synchroniser le formulaire quand l'utilisateur du contexte change
  useEffect(() => {
  if (user) {
    setUserData({
      nom: user.nom || user.name || '',
      prenoms: user.prenoms || user.firstname || '',
      email: user.email || '',
      phone: user.phone || user.telephone || '',
      role: user.role || user.type || 'Utilisateur',
      avatar_url: null,
      password: '',
    });

    const avatarPath = user.avatar_url || user.avatar;
    if (avatarPath) {
      setAvatarPreview(getStorageUrl(avatarPath));
    }
  }
}, [user]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Assurer la présence du cookie CSRF Sanctum
      await api.get('/sanctum/csrf-cookie');

      // 2. Préparation des données multipart/form-data pour gèrer le fichier d'avatar
      const formDataToSend = new FormData();
      formDataToSend.append('nom', userData.nom);
      formDataToSend.append('prenoms', userData.prenoms);
      formDataToSend.append('email', userData.email);
      formDataToSend.append('phone', userData.phone);

      if (userData.password) {
        formDataToSend.append('password', userData.password);
      }

      if (userData.avatar instanceof File) {
        formDataToSend.append('avatar', userData.avatar);
      }

      // Simulation PUT pour Laravel lors des envois multipart/form-data
      formDataToSend.append('_method', 'PUT');

      // 3. Appel de l'API de mise à jour du profil
      const response = await api.post('/api/profile/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 4. Mettre à jour l'état central d'authentification (/api/me)
      await checkAuth();

      setSuccess(response.data?.message || 'Profil mis à jour avec succès.');
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil :', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la mise à jour du profil.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Alertes d'état */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl font-medium">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!isEditing ? (
        /* ================= VUE PROFIL ================= */
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* Bloc Gauche : Photo de profil & Statut */}
          <div className="bg-orange-600 p-6 md:w-64 flex flex-col items-center justify-center text-white relative shrink-0">
            <div className="relative mb-3">
              <div className="w-28 h-28 rounded-full border-4 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User size={56} className="text-white/80" />
                )}
              </div>
            </div>

            {/* Badge statut En ligne */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/20 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En ligne
            </div>
          </div>

          {/* Bloc Centre : Infos personnelles */}
          <div className="p-6 flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                BIENVENUE
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                {userData.nom} {userData.prenoms}
              </h2>
              <p className="text-sm text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-1">
                  <span> <strong> Email: </strong>{userData.email}</span> 
              </p>
              <p className='text-sm text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-1'>
              {userData.phone && (
                  <>
                    <span> <strong>Phone: </strong></span>
                    <span>{userData.phone}</span>
                  </>
                )}
              </p>
              <p className='text-sm text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-1'>
               <strong>Rôle:</strong> <span className="text-orange-600 font-semibold capitalize">{userData.role}</span>
              </p>

              <div className="border-t border-slate-100 my-4"></div>

              {/* Date dynamique */}
              <div className="flex items-center gap-2 text-xs text-slate-500 capitalize">
                <Calendar size={14} className="text-orange-500" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>

            {/* Bouton "Modifier mes informations" */}
            <div className="mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Edit3 size={15} />
                Modifier mes informations
              </button>
            </div>
          </div>

          {/* Bloc Droite : Messages / Raccourcis */}
          <div className="p-6 md:w-64 bg-slate-50/50 flex flex-col justify-center items-start gap-3">
            <button className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-orange-300 hover:shadow-md transition-all text-slate-700 text-xs font-medium text-left cursor-pointer">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                <MessageSquare size={16} />
              </div>
              <span>Messages reçus</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= VUE FORMULAIRE DE MODIFICATION ================= */
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* En-tête du formulaire */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Mettre à jour le profil
                </h2>
                <p className="text-xs text-slate-500">
                  Modifiez vos données personnelles et enregistrez.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Photo de Profil */}
            <div className="flex flex-col items-center justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-orange-400 bg-orange-50 flex items-center justify-center overflow-hidden shadow-inner group-hover:opacity-90 transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-orange-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-md group-hover:scale-110 transition-all">
                  <Camera size={16} />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <span className="text-xs text-slate-500 mt-2 font-medium">Changer la photo de profil</span>
            </div>

            {/* Champs du formulaire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={userData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>

              {/* Prénoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prénoms 
                </label>
                <input
                  type="text"
                  name="prenoms"
                  value={userData.prenoms}
                  onChange={handleChange}
                  
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                  <Mail size={13} className="text-slate-400" />
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                  <Phone size={13} className="text-slate-400" />
                  Téléphone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Nouveau Mot de passe */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                  <Lock size={13} className="text-slate-400" />
                  Nouveau mot de passe (Laissez vide si inchangé)
                </label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            {/* Actions du formulaire */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
