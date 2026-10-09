import React, { useState } from 'react';
import { Building2, UserCheck, ImagePlus, Upload, Phone, Mail, Lock, User, PlusCircle } from 'lucide-react';

const UpdateCompany = () => {
  const [formData, setFormData] = useState({
    // Compagnie
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    
    // Administrateur
    adminNom: '',
    adminPrenoms: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    
    // Médias
    logo: null,
    images: [null, null, null, null],
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([null, null, null, null]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion du Logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Gestion des 4 images de la compagnie
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données à soumettre :", formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4 sm:p-6">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-3xl bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80"
      >
        {/* En-tête du formulaire */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <Building2 size={26} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Mettre à jour la compagnie
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Renseignez les détails de la compagnie et du compte administrateur initial.
            </p>
          </div>
        </div>

        {/* SECTION 1 : Informations sur la Compagnie */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Building2 size={18} className="text-orange-500" />
            <h3>Informations de la Compagnie</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom de la compagnie */}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>

            {/* Contact Téléphone */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Phone size={13} className="text-slate-400" />
                Contact / Standard <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+225 07 00 00 00 00"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Email de la compagnie */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Mail size={13} className="text-slate-400" />
                Email professionnel
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="contact@compagnie.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 2 : Administrateur Associé */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <UserCheck size={18} className="text-orange-500" />
            <h3>Administrateur principal</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom */}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Prénoms */}
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Email Admin */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Mail size={13} className="text-slate-400" />
                Email de connexion <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@compagnie.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Téléphone Admin */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Phone size={13} className="text-slate-400" />
                Numéro du responsable <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="+225 01 00 00 00 00"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Mot de passe */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                <Lock size={13} className="text-slate-400" />
                Mot de passe <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 3 : Médias (Logo + 4 Photos) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <ImagePlus size={18} className="text-orange-500" />
            <h3>Identité visuelle & Médias</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cadre Logo (1/3 de la largeur) */}
            <div className="sm:col-span-1 flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Logo de la compagnie <span className="text-rose-500">*</span>
              </label>
              <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 rounded-2xl cursor-pointer transition-all overflow-hidden group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Aperçu logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center text-center p-3">
                    <Upload size={24} className="text-slate-400 group-hover:text-orange-500 transition-colors mb-1" />
                    <span className="text-xs font-medium text-slate-600">Téléverser le logo</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG (Max 2Mo)</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" required />
              </label>
            </div>

            {/* Cadres Images de la compagnie (2/3 de la largeur - Grille de 4) */}
            <div className="sm:col-span-2 flex flex-col">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Photos de présentation (Gares, Véhicules...)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <label 
                    key={index}
                    className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 rounded-2xl cursor-pointer transition-all overflow-hidden group"
                  >
                    {imagesPreview[index] ? (
                      <img src={imagesPreview[index]} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center p-2 text-center">
                        <PlusCircle size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors mb-1" />
                        <span className="text-[11px] font-medium text-slate-500">Photo {index + 1}</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageChange(index, e)} 
                      className="hidden" 
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de Soumission */}
        <button
          type="submit"
          className="mt-4 w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Building2 size={18} />
          Enregistrer la compagnie
        </button>
      </form>
    </div>
  );
};

export default UpdateCompany;
