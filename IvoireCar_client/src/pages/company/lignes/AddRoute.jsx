import React, { useState, useEffect } from 'react';
import { Map, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const AddRoute = () => {
  const [formData, setFormData] = useState({
    name: '',
    departure_station_id: '',
    arrival_station_id: '',
    stops: [
      { station_id: '', price: '' } // Au moins une escale / tarif par défaut
    ]
  });

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger la liste des gares de la compagnie pour les selects
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/api/company/stations');
        setStations(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des gares :', err);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion des escales dynamiques
  const handleStopChange = (index, field, value) => {
    const updatedStops = [...formData.stops];
    updatedStops[index][field] = value;
    setFormData({ ...formData, stops: updatedStops });
  };

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { station_id: '', price: '' }]
    });
  };

  const removeStop = (index) => {
    if (formData.stops.length === 1) return; // Garder au moins une escale
    const updatedStops = formData.stops.filter((_, i) => i !== index);
    setFormData({ ...formData, stops: updatedStops });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/company/routes', formData);
      setSuccess(response.data.message || 'Ligne créée avec succès !');

      // Réinitialisation du formulaire
      setFormData({
        name: '',
        departure_station_id: '',
        arrival_station_id: '',
        stops: [{ station_id: '', price: '' }]
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la création de la ligne.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
      >
        {/* Titre */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
            <Map size={22} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 tracking-tight">
            Créer une Ligne de transport
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

        {/* Nom de la Ligne */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Nom de la ligne <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Abidjan - Bondoukou (via Abengourou)"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Gare de Départ & Terminus */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Gare de départ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="departure_station_id"
                value={formData.departure_station_id}
                onChange={handleChange}
                disabled={loadingStations}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none transition-all cursor-pointer disabled:bg-slate-100"
              >
                <option value="" disabled>Sélectionner</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Terminus (Arrivée) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="arrival_station_id"
                value={formData.arrival_station_id}
                onChange={handleChange}
                disabled={loadingStations}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none transition-all cursor-pointer disabled:bg-slate-100"
              >
                <option value="" disabled>Sélectionner</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Section Escales & Tarifs */}
        <div className="mt-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Escales & Grille Tarifaire (FCFA)
            </label>
            <button
              type="button"
              onClick={addStop}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              <Plus size={14} /> Ajouter une escale
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {formData.stops.map((stop, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                  #{index + 1}
                </span>

                {/* Sélection Gare d'escale */}
                <div className="flex-1 relative">
                  <select
                    value={stop.station_id}
                    onChange={(e) => handleStopChange(index, 'station_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="" disabled>Escale / Destination</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Champ Prix */}
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    placeholder="Prix (FCFA)"
                    value={stop.price}
                    onChange={(e) => handleStopChange(index, 'price', e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Bouton Supprimer l'escale */}
                {formData.stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
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
              Création de la ligne...
            </>
          ) : (
            'Ajouter la ligne'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddRoute;
