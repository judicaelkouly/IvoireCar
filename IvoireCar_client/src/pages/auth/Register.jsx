import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateClient = () => {
    const errs = {};
    if (formData.password.length < 8) {
      errs.password = ['Le mot de passe doit contenir au moins 8 caractères.'];
    }
    if (formData.password !== formData.password_confirmation) {
      errs.password_confirmation = ['Les mots de passe ne correspondent pas.'];
    }
    const phoneRegex = /^(01|05|07)\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      errs.phone = ['Numéro invalide (ex: 0701020304).'];
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setGeneralError(
          error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-slate-200 p-5 font-sans">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-[420px] bg-white border border-slate-300/80 p-8 sm:p-9 rounded-3xl shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
            Créer un compte
          </h2>
          <p className="text-slate-500 text-sm">
            Inscrivez-vous gratuitement pour commencer
          </p>
        </div>

        {/* Message d'erreur général */}
        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Champs Nom & Téléphone */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Nom */}
          <div className="relative w-full">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
            <input 
              required 
              placeholder=" " 
              type="text" 
              id="fullname"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`peer w-full pl-11 pr-3.5 pt-5 pb-2 text-sm text-slate-900 bg-slate-50 border ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              } rounded-xl outline-none hover:border-orange-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all duration-200`}
            />
            <label 
              htmlFor="fullname"
              className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-orange-600"
            >
              Nom & Prénoms
            </label>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
          </div>

          {/* Téléphone */}
          <div className="relative w-full">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
            <input 
              required 
              placeholder=" " 
              type="tel" 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`peer w-full pl-11 pr-3.5 pt-5 pb-2 text-sm text-slate-900 bg-slate-50 border ${
                errors.phone ? 'border-red-500' : 'border-slate-300'
              } rounded-xl outline-none hover:border-orange-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all duration-200`}
            />
            <label 
              htmlFor="phone"
              className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-orange-600"
            >
              Téléphone
            </label>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone[0]}</p>}
          </div>
        </div> 

        {/* Adresse Email */}
        <div className="relative w-full">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
          <input 
            required 
            placeholder=" " 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`peer w-full pl-11 pr-3.5 pt-5 pb-2 text-sm text-slate-900 bg-slate-50 border ${
              errors.email ? 'border-red-500' : 'border-slate-300'
            } rounded-xl outline-none hover:border-orange-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all duration-200`}
          />
          <label 
            htmlFor="email"
            className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-orange-600"
          >
            Adresse Email
          </label>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>}
        </div> 

        {/* Mot de passe */}
        <div className="relative w-full">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
          <input 
            required 
            placeholder=" " 
            type={showPassword ? 'text' : 'password'} 
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`peer w-full pl-11 pr-11 pt-5 pb-2 text-sm text-slate-900 bg-slate-50 border ${
              errors.password ? 'border-red-500' : 'border-slate-300'
            } rounded-xl outline-none hover:border-orange-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all duration-200`}
          />
          <label 
            htmlFor="password"
            className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-orange-600"
          >
            Mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer z-10"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>}
        </div>

        {/* Confirmation mot de passe */}
        <div className="relative w-full">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
          <input 
            required 
            placeholder=" " 
            type={showConfirmPassword ? 'text' : 'password'} 
            id="confirmPassword"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`peer w-full pl-11 pr-11 pt-5 pb-2 text-sm text-slate-900 bg-slate-50 border ${
              errors.password_confirmation ? 'border-red-500' : 'border-slate-300'
            } rounded-xl outline-none hover:border-orange-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/15 transition-all duration-200`}
          />
          <label 
            htmlFor="confirmPassword"
            className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-orange-600"
          >
            Confirmer le mot de passe
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer z-10"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-500">{errors.password_confirmation[0]}</p>
          )}
        </div>

        {/* Bouton de Soumission */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Inscription en cours...</span>
            </>
          ) : (
            <span>S'inscrire</span>
          )}
        </button>

        {/* Lien Connexion */}
        <p className="text-center text-slate-600 text-sm mt-1">
          Déjà un compte ?{' '}
          <Link 
            to="/login" 
            className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors duration-200"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
