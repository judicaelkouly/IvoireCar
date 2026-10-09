import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ExternalLink, Building2, Search, Plus, Loader2 } from 'lucide-react';
import api from '../../../services/api'; // Importation de votre instance configurée avec session/cookie

const CompanyList = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Récupération des compagnies depuis l'API Laravel via la session cookie
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/companies');

        // Récupération des données selon le format retourné (tableau direct ou encapsulé)
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCompanies(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des compagnies :", err);
        setError("Impossible de charger la liste des compagnies.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filtrage des résultats selon la recherche
  const filteredCompanies = companies.filter((c) => {
    const companyName = c.name || c.nom || '';
    const companyCode = c.code || c.code_compagnie || '';
    return (
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      companyCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  
   // Construction de l'URL du logo depuis l'API Laravel
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop';
    
    // Si le lien est déjà absolu (contient http)
    if (logoPath.startsWith('http')) return logoPath;

    // Si le chemin commence déjà par /storage, on ajoute simplement la base URL du serveur
    if (logoPath.startsWith('/storage')) {
      return `http://localhost:8000${logoPath}`;
    }

    // Sinon, on ajoute http://localhost:8000/storage/
    return `http://localhost:8000/storage/${logoPath.replace(/^\/+/, '')}`;
  };

  return (
    <div className="w-full max-w-8xl mx-auto p-4 sm:p-6 space-y-6">
      {/* En-tête avec barre de recherche & Bouton Ajouter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-orange-600" size={24} />
            Liste des Compagnies
          </h1>
          <p className="text-xs text-slate-500">
            Gérez et consultez toutes vos compagnies partenaires
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Recherche */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher une compagnie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          {/* Bouton Ajouter */}
          <Link 
            to="/admin/add-company" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
          >
            <Plus size={16} />
            Nouvelle Compagnie
          </Link>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 gap-3">
          <Loader2 className="animate-spin text-orange-600" size={32} />
          <p className="text-sm text-slate-500">Chargement des compagnies...</p>
        </div>
      )}

      {/* Message d'erreur */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Grille des Cartes */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => {
            const status = company.status || (company.is_active ? "Actif" : "Inactif");
            const isActif = status === "Actif" || company.is_active === true || company.is_active === 1;

            return (
              <div
                key={company.id}
                onClick={() => onSelectCompany && onSelectCompany(company)}
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Ligne supérieure colorée */}
                <div className="h-1.5 w-full bg-orange-600" />

                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Entête de la carte (Logo + Badge) */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full border border-slate-100 p-1 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      <img
                        src={getLogoUrl(company.logo || company.logo_path)}
                        alt={company.name || company.nom}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    {/* Badge d'état */}
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                        isActif
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActif ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {isActif ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {/* Titre et Identifiant */}
                  <div className="mb-4">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {company.code || company.code_compagnie || `CMP-${company.id}`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {company.name || company.nom}
                    </h3>
                  </div>

                  {/* Séparateur pointillé */}
                  <div className="border-t border-dashed border-slate-200 my-3"></div>

                  {/* Informations de contact */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-orange-500 shrink-0" />
                      <span className="truncate">{company.phone || company.telephone || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-orange-500 shrink-0" />
                      <span className="truncate">{company.email || "Non renseigné"}</span>
                    </div>
                  </div>
                </div>

               
                {/* Pied de carte */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                <Link
                  to={`/admin/details/${company.id}`}
                  onClick={(e) => e.stopPropagation()} // Empêche le déclenchement de l'événement onClick du conteneur parent
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-md group-hover:shadow-orange-600/20"
                >
                  <ExternalLink size={14} />
                  Accéder aux détails
                </Link>
              </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Message si aucun résultat */}
      {!loading && !error && filteredCompanies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Aucune compagnie trouvée.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
