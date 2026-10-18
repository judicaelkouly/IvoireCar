import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
//import PassengerDashboard from './pages/passenger/Dashboard';
import ProfileUser from './pages/passenger/ProfileUser';
import CompanyDashboard from './pages/company/Dashboard';
import SuperAdminDashboard from './pages/admin/Dashboard';
import AddPersonnel from './pages/company/personnel/AddPersonnel';
import UpdatePersonnel from './pages/company/personnel/UpdatePersonnel';
import AddGare from './pages/company/gares/AddGare';
import UpdateGare from './pages/company/gares/UpdateGare';
import UpdateVehicule from './pages/company/vehicules/UpdateVehicule';
import AddVehicule from './pages/company/vehicules/AddVehicule';
import AddDepart from './pages/company/departs/AddDepart';
import UpdateDepart from './pages/company/departs/UpdateDepart';
import AddCompany from './pages/admin/compagnies/AddCompany';
import UpdateCompany from './pages/admin/compagnies/UpdateCompany';
//import Profile from './pages/admin/profile/Profile';

import AddRoute from './pages/company/lignes/AddRoute';
import UpdateRoute from './pages/company/lignes/UpdateRoute';
import ProfileManager from './pages/company/profile/ProfilManager';
import AdminProfile from './pages/admin/profile/Profile';
import TicketBooking from './pages/public/Booking';
import SendParcelModal from './pages/public/Parcel';
import CompanyDetails from './pages/admin/compagnies/DetailsCompany';

// Composant de protection de route
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. Attente de la vérification de session
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <span className="text-slate-600 text-sm font-medium">Chargement en cours...</span>
      </div>
    );
  }

  // 2. Redirection si non connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Redirection si le rôle n'est pas autorisé
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Permet d'afficher les routes enfants imbriquées
  return <Outlet />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/mon-profil" element={<ProfileUser />} />
          <Route path="/reservation" element={<TicketBooking />} />
          <Route path="/expedition" element={<SendParcelModal />} />


          {/* Espace Company Admin (Protégé) */}
          <Route element={<ProtectedRoute allowedRoles={['company_admin', 'station_manager', 'driver', 'cashier']} />}>
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/add-personnel" element={<AddPersonnel />} />
            <Route path="/company/update-personnel/:id" element={<UpdatePersonnel />} />

            <Route path="/company/add-gare" element={<AddGare />} />
            <Route path="/company/update-gare/:id" element={<UpdateGare />} />

            <Route path="/company/add-vehicule" element={<AddVehicule />} />
            <Route path="/company/update-vehicule/:id" element={<UpdateVehicule />} />

            <Route path="/company/add-depart" element={<AddDepart />} />
            <Route path="/company/update-depart/:id" element={<UpdateDepart />} />

            <Route path="/company/add-route" element={<AddRoute />} />
            <Route path="/company/update-route/:id" element={<UpdateRoute />} />

            <Route path="/company/profile" element={<ProfileManager />} />
          </Route>

          {/* Espace Super Admin (Protégé) */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin" element={<SuperAdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/add-company" element={<AddCompany />} />
            <Route path="/admin/update-company/:id" element={<UpdateCompany />} />
            <Route path="/admin/details/:id" element={<CompanyDetails />} />

            
          </Route>

          {/* Redirection automatique pour les routes inconnues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
