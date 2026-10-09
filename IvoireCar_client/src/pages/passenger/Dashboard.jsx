import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    departure_city: '',
    arrival_city: '',
    departure_date: '',
  });

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookingTripId, setBookingTripId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setSuccessMessage(null);

    try {
      const response = await api.get('/api/trips/search', { params: searchParams });
      setTrips(response.data);
    } catch (error) {
      console.error('Erreur chargement trajets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (tripId) => {
    setBookingTripId(tripId);
    setSuccessMessage(null);

    try {
      await api.post('/api/tickets', { trip_id: tripId, seats_count: 1 });
      setSuccessMessage('Réservation effectuée avec succès ! Retrouvez votre ticket dans la section "Mes Billets".');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setBookingTripId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner Bienvenue */}
      <div className="bg-gradient-to-r from-orange-500/20 via-slate-800 to-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700/80">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Bienvenue, <span className="text-orange-400">{user?.name}</span> 👋
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          Recherchez vos trajets et réservez vos billets de car en quelques clics.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-orange-400" />
          Rechercher un billet de car
        </h2>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Ville de Départ</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ex: Abidjan"
                required
                value={searchParams.departure_city}
                onChange={(e) => setSearchParams({ ...searchParams, departure_city: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Ville d'Arrivée</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ex: Yamoussoukro"
                required
                value={searchParams.arrival_city}
                onChange={(e) => setSearchParams({ ...searchParams, arrival_city: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="date"
                required
                value={searchParams.departure_date}
                onChange={(e) => setSearchParams({ ...searchParams, departure_date: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>Trouver</span>
            </button>
          </div>
        </form>
      </div>

      {/* Résultats */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Trajets disponibles</h3>
          {trips.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-400">
              Aucun trajet ne correspond à vos critères.
            </div>
          ) : (
            trips.map((trip) => (
              <div key={trip.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase">{trip.company?.name}</span>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {trip.departure_station?.city} → {trip.arrival_station?.city}
                  </h4>
                  <p className="text-sm text-slate-400 flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Départ : {new Date(trip.departure_time).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-2xl font-black text-white">{trip.price} FCFA</span>
                  <button
                    onClick={() => handleBook(trip.id)}
                    disabled={bookingTripId === trip.id}
                    className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center gap-2"
                  >
                    {bookingTripId === trip.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>Réserver</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
