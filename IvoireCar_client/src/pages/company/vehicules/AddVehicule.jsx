import React, { useState, useEffect } from 'react';
import { Bus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const AddVehicule = () => {
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    capacity: '',
    driver_id: '',
  });

  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger la liste des chauffeurs (role: driver) de la compagnie
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.get('/api/company/drivers');
        setDrivers(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des chauffeurs :', err);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/company/buses', formData);
      setSuccess(response.data.message || 'Véhicule ajouté avec succès !');

      // Réinitialisation du formulaire
      setFormData({
        registration_number: '',
        model: '',
        capacity: '',
        driver_id: '',
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de l\'ajout du véhicule.'
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
            <Bus size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 tracking-tight">
            Ajouter un nouveau véhicule
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

        {/* Immatriculation & Modèle */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Immatriculation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="Ex: 1234AB01"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all uppercase"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Modèle <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ex: Yutong 70"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        {/* Capacité */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Capacité (Nombre de places) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="capacity"
            min="1"
            max="150"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Ex: 70"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Chauffeur principal */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Chauffeur principal
          </label>
          <div className="relative">
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              disabled={loadingDrivers}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Aucun chauffeur assigné pour le moment</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.phone || driver.email})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {drivers.length === 0 && !loadingDrivers && (
            <p className="text-[11px] text-slate-500 mt-1">
              Aucun chauffeur enregistré. Vous pourrez en ajouter via la section Personnel.
            </p>
          )}
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
              Création du véhicule...
            </>
          ) : (
            'Ajouter le véhicule'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddVehicule;
