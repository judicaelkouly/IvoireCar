import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';

const UpdatePersonnel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    number: '',
    password: '',
    role: '',
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Découper le champ 'name' complet en Nom et Prénoms
  const populateFormData = (user) => {
    const nameParts = (user.name || '').trim().split(' ');
    const nom = nameParts[0] || '';
    const prenoms = nameParts.slice(1).join(' ') || '';

    setFormData({
      nom: nom,
      prenoms: prenoms,
      email: user.email || '',
      number: user.phone || user.number || '',
      password: '', // Optionnel à la modification
      role: user.role || (user.roles && user.roles[0]?.name) || '',
    });
  };

  useEffect(() => {
    if (id) {
      const fetchStaffMember = async () => {
        setLoadingData(true);
        try {
          const response = await api.get(`/api/company/staff/${id}`);
          populateFormData(response.data);
        } catch (err) {
          setError(
            err.response?.data?.message ||
            'Impossible de charger les informations du membre.'
          );
        } finally {
          setLoadingData(false);
        }
      };
      fetchStaffMember();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put(`/api/company/staff/${id}`, formData);
      setSuccess(response.data.message || 'Membre mis à jour avec succès !');

      // Redirection automatique vers la liste après 1.2s
      setTimeout(() => {
        navigate(-1);
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <Loader2 className="animate-spin text-orange-600" size={20} />
          Chargement des informations du membre...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
      >
        {/* En-tête avec bouton Retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <UserCheck size={22} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-600 tracking-tight">
              Mettre à jour le membre
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Retour"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Retours utilisateur */}
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

        {/* Nom & Prénoms */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Koffi"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Prénoms <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="prenoms"
              value={formData.prenoms}
              onChange={handleChange}
              placeholder="Ex: Jean"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@domaine.com"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all"
          />
        </div>

        {/* Numéro de téléphone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Numéro de téléphone <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="+225 01 00 00 00 00"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all"
          />
        </div>

        {/* Mot de passe (Optionnel) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Mot de passe <span className="text-slate-400 font-normal">(laisser vide pour conserver l'actuel)</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all"
          />
        </div>

        {/* Sélection du Rôle */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Rôle <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 appearance-none transition-all cursor-pointer"
            >
              <option value="" disabled>Sélectionner un rôle</option>
              <option value="company_admin">Administrateur</option>
              <option value="cashier">Caissier / Guichetier</option>
              <option value="station_manager">Gestionnaire de gare</option>
              <option value="driver">Chauffeur</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Mise à jour...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePersonnel;
