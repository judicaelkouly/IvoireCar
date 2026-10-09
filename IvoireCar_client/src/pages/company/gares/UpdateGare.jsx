import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building, 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import api from '../../../services/api';

const UpdateGare = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    manager_id: '',
  });

  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [loadingStation, setLoadingStation] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Charger la liste des chefs de gare
  useEffect(() => {
    const fetchStationManagers = async () => {
      try {
        const response = await api.get('/api/company/station-managers');
        setManagers(response.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des chefs de gare :', err);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchStationManagers();
  }, []);

  // 2. Charger les données actuelles de la gare
  useEffect(() => {
    const fetchStation = async () => {
      setLoadingStation(true);
      setError(null);
      try {
        const response = await api.get(`/api/company/stations/${id}`);
        const station = response.data?.data || response.data;

        if (station) {
          setFormData({
            name: station.name || '',
            city: station.city || station.location || '',
            address: station.address || '',
            phone: station.phone || station.contact_phone || '',
            manager_id: station.manager_id || station.manager?.id || '',
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la gare :', err);
        setError(
          err.response?.data?.message || 
          'Impossible de récupérer les informations de la gare.'
        );
      } finally {
        setLoadingStation(false);
      }
    };

    if (id) {
      fetchStation();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put(`/api/company/stations/${id}`, formData);
      setSuccess(response.data?.message || 'Gare mise à jour avec succès !');

      setTimeout(() => {
        navigate('/company');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la gare :', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la mise à jour de la gare.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <p className="text-sm font-medium">Chargement des données de la gare...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-3">
        {/* Lien de retour */}
        <Link
          to="/company"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour au tableau de bord</span>
        </Link>

        {/* Formulaire */}
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
        >
          {/* En-tête */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Building size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-orange-600 tracking-tight">
                Mettre à jour la gare
              </h2>
              <p className="text-xs text-slate-500">Modification de la gare #{id}</p>
            </div>
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

          {/* Nom & Ville */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nom de la gare <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Gare Adjamé"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ville <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Abidjan"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Adresse / Localisation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: Boulevard Nangui Abrogoua, face Renault"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Numéro de téléphone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225 07 00 00 00 00"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          {/* Sélection du Chef de gare (role: station_manager) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Chef de gare (Responsable)
            </label>
            <div className="relative">
              <select
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                disabled={loadingManagers}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">Aucun chef de gare assigné pour le moment</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.email})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {managers.length === 0 && !loadingManagers && (
              <p className="text-[11px] text-slate-500 mt-1">
                Aucun chef de gare trouvé. Vous pourrez en ajouter via la section Personnel.
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/company')}
              className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer text-center"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateGare;
