import React, { useState } from 'react';
import { Loader2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const AddPersonnel = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    number: '',
    password: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/company/staff', formData);
      setSuccess(response.data.message || 'Membre ajouté avec succès !');

      // Réinitialisation du formulaire
      setFormData({
        nom: '',
        prenoms: '',
        email: '',
        number: '',
        password: '',
        role: '',
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de l\'ajout du membre.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
      >
        {/* Titre */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
            <UserPlus size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 tracking-tight">
            Ajouter un nouveau membre
          </h2>
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Numéro du personnel <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="+225 01 00 00 00 00"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Mot de passe <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none transition-all cursor-pointer"
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

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Création en cours...
            </>
          ) : (
            'Ajouter le membre'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPersonnel;
