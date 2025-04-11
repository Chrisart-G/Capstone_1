import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Logins from './Component/Logins/Login';
import Singnup from './Component/Signup/Signup';
import MunicipalLandingPage from './Component/Home/Home';
import MayorsPermitForm from './Component/Form/businesspermit/businesspermit';
import PermitsHomepage from './Component/Home/Requesthome';
import AdminDashboard from './Component/Adminhomepage/Adminhome';
import ProtectedRoute from './Component/Auth/ProtectedRoute'; 
import EmployeeDashboard from './Component/Employeedashboard/Employeedashboard';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={<Logins />} />
          <Route path="/Sign-up" element={<Singnup />} />
          
          {/* Protected routes */}
          <Route path="/Chome" element={
            <ProtectedRoute>
              <MunicipalLandingPage />
            </ProtectedRoute>
          } />
          <Route path="/Uform" element={
            <ProtectedRoute>
              <MayorsPermitForm />
            </ProtectedRoute>
          } />
          <Route path="/Permits" element={
            <ProtectedRoute>
              <PermitsHomepage />
            </ProtectedRoute>
          } />
          <Route path="/AdminDash" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/EmployDash" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;