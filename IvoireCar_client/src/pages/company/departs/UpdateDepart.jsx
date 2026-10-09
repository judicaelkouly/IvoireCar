import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit3, MapPin, Bus, User, Route, Calendar, Clock, Repeat, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';

const UpdateDepart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mode du départ : 'recurrent' ou 'ponctuel'
  const [mode, setMode] = useState('recurrent');

  const [formData, setFormData] = useState({
    route_id: '',
    departure_station_id: '',
    bus_id: '',
    driver_id: '',
    // Champs récurrents
    departure_time_recurrent: '06:00',
    days_of_week: [1, 2, 3, 4, 5, 6, 7], // 1=Lundi, 7=Dimanche
    // Champs ponctuel
    departure_date: '',
    departure_time: '06:00',
  });

  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const daysList = [
    { id: 1, label: 'Lun' },
    { id: 2, label: 'Mar' },
    { id: 3, label: 'Mer' },
    { id: 4, label: 'Jeu' },
    { id: 5, label: 'Ven' },
    { id: 6, label: 'Sam' },
    { id: 7, label: 'Dim' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        // Charge les données de référence en parallèle
        const [routesRes, stationsRes, busesRes, driversRes] = await Promise.all([
          api.get('/api/company/routes'),
          api.get('/api/company/stations'),
          api.get('/api/company/buses'),
          api.get('/api/company/drivers'),
        ]);

        setRoutes(routesRes.data);
        setStations(stationsRes.data);
        setBuses(busesRes.data);
        setDrivers(driversRes.data);

        // Tentative de chargement : Récurrent d'abord, sinon Ponctuel
        try {
          // 1. Tente de charger le modèle récurrent
          const scheduleRes = await api.get(`/api/company/schedule-templates/${id}`);
          const data = scheduleRes.data;

          setMode('recurrent');
          setFormData({
            route_id: data.route_id || '',
            departure_station_id: data.departure_station_id || '',
            bus_id: data.bus_id || '',
            driver_id: data.driver_id || '',
            departure_time_recurrent: data.departure_time ? data.departure_time.substring(0, 5) : '06:00',
            days_of_week: data.days_of_week || [1, 2, 3, 4, 5, 6, 7],
            departure_date: '',
            departure_time: '06:00',
          });
        } catch (scheduleErr) {
          // 2. Si 404 (non trouvé dans les schedules), essaye le départ ponctuel
          if (scheduleErr.response && scheduleErr.response.status === 404) {
            try {
              const departureRes = await api.get(`/api/company/departures/${id}`);
              const data = departureRes.data;

              setMode('ponctuel');
              setFormData({
                route_id: data.route_id || '',
                departure_station_id: data.departure_station_id || '',
                bus_id: data.bus_id || '',
                driver_id: data.driver_id || '',
                departure_date: data.departure_date || '',
                departure_time: data.departure_time ? data.departure_time.substring(0, 5) : '06:00',
                departure_time_recurrent: '06:00',
                days_of_week: [1, 2, 3, 4, 5, 6, 7],
              });
            } catch (depErr) {
              console.error('Erreur lors du chargement du départ ponctuel :', depErr);
              setError('Impossible de trouver le départ spécifié.');
            }
          } else {
            console.error('Erreur lors du chargement du départ récurrent :', scheduleErr);
            setError('Erreur lors de la récupération des données du départ.');
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des listes de référence :', err);
        setError('Impossible de charger les données nécessaires au formulaire.');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'route_id') {
      const selectedRoute = routes.find((r) => r.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        route_id: value,
        departure_station_id: selectedRoute ? selectedRoute.departure_station_id : prev.departure_station_id,
      }));
      return;
    }

    if (name === 'bus_id') {
      const selectedBus = buses.find((b) => b.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        bus_id: value,
        driver_id: selectedBus && selectedBus.user_id ? selectedBus.user_id : prev.driver_id,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (dayId) => {
    setFormData((prev) => {
      const currentDays = prev.days_of_week;
      const updatedDays = currentDays.includes(dayId)
        ? currentDays.filter((d) => d !== dayId)
        : [...currentDays, dayId];
      return { ...prev, days_of_week: updatedDays.sort() };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'recurrent') {
        const payload = {
          route_id: formData.route_id,
          departure_station_id: formData.departure_station_id,
          bus_id: formData.bus_id || null,
          driver_id: formData.driver_id || null,
          departure_time: formData.departure_time_recurrent,
          days_of_week: formData.days_of_week,
        };

        const response = await api.put(`/api/company/schedule-templates/${id}`, payload);
        setSuccess(response.data.message || 'Horaire récurrent mis à jour avec succès !');
      } else {
        const payload = {
          route_id: formData.route_id,
          departure_station_id: formData.departure_station_id,
          bus_id: formData.bus_id,
          driver_id: formData.driver_id,
          departure_date: formData.departure_date,
          departure_time: formData.departure_time,
        };

        const response = await api.put(`/api/company/departures/${id}`, payload);
        setSuccess(response.data.message || 'Départ mis à jour avec succès !');
      }

      setTimeout(() => {
        navigate('/company');
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour du départ.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <Loader2 className="animate-spin text-indigo-600" size={20} />
          Chargement du départ...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 w-full max-w-xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80"
      >
        {/* En-tête */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Link to={'/company/departures'} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Modifier le Départ
            </h2>
            <p className="text-xs text-slate-500">
              Mettez à jour les informations du départ {mode === 'recurrent' ? 'récurrent' : 'ponctuel'}.
            </p>
          </div>
        </div>

        {/* Sélecteur de Mode (Lecture seule / Indicatif) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('recurrent')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'recurrent'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat size={14} />
            Horaire Récurrent
          </button>
          <button
            type="button"
            onClick={() => setMode('ponctuel')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'ponctuel'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={14} />
            Départ Ponctuel
          </button>
        </div>

        {/* Alerts */}
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

        {/* Section Trajet */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Route size={14} className="text-slate-400" />
              Ligne de transport <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 appearance-none transition-all cursor-pointer font-medium"
              >
                <option value="" disabled>Sélectionner une ligne</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <MapPin size={14} className="text-emerald-500" />
              Gare de départ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="departure_station_id"
                value={formData.departure_station_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 appearance-none transition-all cursor-pointer"
              >
                <option value="" disabled>Gare de départ</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        {/* Configuration de l'horaire */}
        {mode === 'recurrent' ? (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Clock size={14} className="text-indigo-600" />
                Heure fixe du départ quotidien <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                name="departure_time_recurrent"
                value={formData.departure_time_recurrent}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Jours d'activation de ce créneau
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysList.map((day) => {
                  const isActive = formData.days_of_week.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Date du voyage <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="departure_date"
                value={formData.departure_date}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Clock size={14} className="text-indigo-600" />
                Heure de départ <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
              />
            </div>
          </div>
        )}

        {/* Section Ressources (Car & Chauffeur) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Bus size={14} className="text-slate-400" />
              Véhicule {mode === 'ponctuel' && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <select
                name="bus_id"
                value={formData.bus_id}
                onChange={handleChange}
                required={mode === 'ponctuel'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 appearance-none transition-all cursor-pointer"
              >
                <option value="">Sélectionner un car (Optionnel)</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.registration_number} ({bus.model} - {bus.capacity} places)
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <User size={14} className="text-slate-400" />
              Chauffeur attribué {mode === 'ponctuel' && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                required={mode === 'ponctuel'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 appearance-none transition-all cursor-pointer"
              >
                <option value="">Attribuer un chauffeur (Optionnel)</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone || driver.email})
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        {/* Bouton de Soumission */}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Mise à jour...
            </>
          ) : (
            <>
              <Edit3 size={16} />
              Enregistrer les modifications
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const ChevronIcon = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
    </svg>
  </div>
);

export default UpdateDepart;
