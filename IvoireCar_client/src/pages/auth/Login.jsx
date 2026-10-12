import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData);
      
      // Redirection dynamique selon le rôle de l'utilisateur
      const role = response.user?.role;
      switch (role) {
        case 'super_admin':
          navigate('/admin');
          break;
        case 'company_admin':
          navigate('/company');
          break;
          case 'station_manager':
          navigate('/company');
          break;
          case 'driver':
          navigate('/company');
          break;
          case 'cashier':
          navigate('/company');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Identifiants incorrects ou erreur de connexion.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-slate-200 p-5 font-sans">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-[400px] bg-white border border-slate-300/80 p-8 sm:p-9 rounded-3xl shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
            Connexion
          </h2>
          <p className="text-slate-500 text-sm">
            Bienvenue ! Connectez-vous à votre compte
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Adresse e-mail */}
        <div className="flex flex-col gap-1.5">
          <label 
            htmlFor="identifier"
            className="text-sm font-semibold text-slate-700"
          >
            Adresse e-mail
          </label>
          <div className="relative w-full">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input 
              required 
              type="text" 
              id="identifier"
              name="login"
              placeholder="john.doe@example.com"
              value={formData.login}
              onChange={handleChange}
              className={`w-full pl-11 pr-3.5 py-3 text-sm text-slate-900 bg-slate-50/80 border ${
                error ? 'border-red-500' : 'border-slate-200'
              } rounded-2xl outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-200`}
            />
          </div>
        </div> 

        {/* Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Mot de passe
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs text-orange-600 hover:text-orange-700 hover:underline transition-colors duration-200 font-semibold"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative w-full">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input 
              required 
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-11 pr-11 py-3 text-sm text-slate-900 bg-slate-50/80 border ${
                error ? 'border-red-500' : 'border-slate-200'
              } rounded-2xl outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bouton Se connecter */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <span>Se connecter</span>
          )}
        </button>

        {/* Lien Inscription */}
        <p className="text-center text-slate-600 text-sm mt-1">
          Pas encore de compte ?{' '}
          <Link 
            to="/register" 
            className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors duration-200"
          >
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
}