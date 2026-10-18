import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, UserCheck, ImagePlus, Upload, Phone, Mail, Lock, PlusCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';

const UpdateCompany = () => {
  const { id } = useParams(); // Récupération dynamique de l'ID depuis l'URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    adminNom: '',
    adminPrenoms: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    logo: null,
    images: [null, null, null, null],
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les informations existantes de la compagnie au montage
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!id) {
        setError("Identifiant de compagnie introuvable.");
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        const response = await api.get(`/api/companies/${id}`);
        const data = response.data?.data || response.data;

        setFormData((prev) => ({
          ...prev,
          companyName: data.name || '',
          companyPhone: data.phone || '',
          companyEmail: data.email || '',
          adminNom: data.admin?.nom || '',
          adminPrenoms: data.admin?.prenoms || '',
          adminEmail: data.admin?.email || '',
          adminPhone: data.admin?.phone || '',
        }));

        // Aperçu du logo
        if (data.logo) {
          const cleanLogo = data.logo.replace(/\\/g, '/');
          setLogoPreview(cleanLogo.startsWith('http') ? cleanLogo : `http://localhost:8000/storage/${cleanLogo.replace(/^storage\//, '')}`);
        }

        // Aperçu des images de la galerie
        if (data.images) {
          let parsedImages = [];
          try {
            parsedImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
          } catch (e) {
            parsedImages = [];
          }

          const previews = [null, null, null, null];
          parsedImages.forEach((img, idx) => {
            if (idx < 4 && img) {
              const cleanImg = img.replace(/\\/g, '/');
              previews[idx] = cleanImg.startsWith('http') ? cleanImg : `http://localhost:8000/storage/${cleanImg.replace(/^storage\//, '')}`;
            }
          });
          setImagesPreview(previews);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données de la compagnie:", err);
        setError("Impossible de charger les informations de la compagnie.");
      } finally {
        setFetching(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...formData.images];
      newImages[index] = file;
      setFormData((prev) => ({ ...prev, images: newImages }));

      const newPreviews = [...imagesPreview];
      newPreviews[index] = URL.createObjectURL(file);
      setImagesPreview(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const data = new FormData();
    data.append('_method', 'PUT');

    data.append('company_name', formData.companyName);
    data.append('company_phone', formData.companyPhone);
    if (formData.companyEmail) data.append('company_email', formData.companyEmail);

    data.append('admin_nom', formData.adminNom);
    data.append('admin_prenoms', formData.adminPrenoms);
    data.append('admin_email', formData.adminEmail);
    data.append('admin_phone', formData.adminPhone);
    
    if (formData.adminPassword) {
      data.append('admin_password', formData.adminPassword);
    }

    if (formData.logo instanceof File) {
      data.append('logo', formData.logo);
    }

    formData.images.forEach((img) => {
      if (img instanceof File) {
        data.append('images[]', img);
      }
    });

    try {
      const response = await api.post(`/api/companies/update/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.message || 'Compagnie mise à jour avec succès !');
      setTimeout(() => navigate(-1), 1500); // Redirection après succès
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          <span>Chargement des données de la compagnie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4 sm:p-6">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-3xl bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <Building2 size={26} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Mettre à jour la compagnie
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Modifiez les informations de la compagnie et de son administrateur.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Retour
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl font-medium">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Building2 size={18} className="text-orange-500" />
            <h3>Informations de la Compagnie</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom de la compagnie <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ex: Transport Express Ivoire"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Phone size={13} className="text-slate-400" /> Contact / Standard <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+225 07 00 00 00 00"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Mail size={13} className="text-slate-400" /> Email professionnel
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="contact@compagnie.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <UserCheck size={18} className="text-orange-500" />
            <h3>Administrateur principal</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="adminNom"
                value={formData.adminNom}
                onChange={handleChange}
                placeholder="Ex: Kouassi"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prénoms <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="adminPrenoms"
                value={formData.adminPrenoms}
                onChange={handleChange}
                placeholder="Ex: Yao Jean"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Mail size={13} className="text-slate-400" /> Email de connexion <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@compagnie.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Phone size={13} className="text-slate-400" /> Numéro du responsable <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="+225 01 00 00 00 00"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Lock size={13} className="text-slate-400" /> Nouveau mot de passe <span className="text-[11px] font-normal text-slate-400">(Laisser vide pour conserver l'actuel)</span>
              </label>
              <input
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <ImagePlus size={18} className="text-orange-500" />
            <h3>Identité visuelle & Médias</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo de la compagnie</label>
              <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 rounded-2xl cursor-pointer overflow-hidden group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Aperçu logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-center p-3">
                    <Upload size={24} className="text-slate-400 group-hover:text-orange-500 mb-1" />
                    <span className="text-xs font-medium text-slate-600">Modifier le logo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>

            <div className="sm:col-span-2 flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Photos de présentation</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <label key={index} className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 rounded-2xl cursor-pointer overflow-hidden group">
                    {imagesPreview[index] ? (
                      <img src={imagesPreview[index]} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center p-2 text-center">
                        <PlusCircle size={20} className="text-slate-400 group-hover:text-orange-500 mb-1" />
                        <span className="text-[11px] font-medium text-slate-500">Photo {index + 1}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} className="hidden" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-2xl text-sm shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Mise à jour en cours...
            </>
          ) : (
            <>
              <Building2 size={18} />
              Enregistrer les modifications
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UpdateCompany;
