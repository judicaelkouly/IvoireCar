import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bus, Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await api.get('/sanctum/csrf-cookie');
      const response = await api.post('/api/forgot-password', { email });
      setStatusMessage(response.data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Une erreur s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* En-tête / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 group mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/25 group-hover:scale-105 transition-transform">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">
            Ivoire<span className="text-orange-600">Car</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Réinitialisation du mot de passe
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Saisissez votre e-mail pour recevoir les instructions
        </p>
      </div>

      {/* Formulaire */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-300/80 sm:px-10">
          
          {/* Message de Succès */}
          {statusMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Message d'Erreur */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 hover:border-orange-400 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <span>Recevoir le code</span>
              )}
            </button>
          </form>

          {/* Lien Retour */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
