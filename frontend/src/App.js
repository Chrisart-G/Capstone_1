import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Logins from './Component/Logins/Login';
import Singnup from './Component/Signup/Signup';
import MunicipalLandingPage from './Component/Home/Home';
import BusinessPermitForm from './Component/Form/businesspermit/businesspermit';
import PermitsHomepage from './Component/Home/Requesthome';
import AdminDashboard from './Component/Adminhomepage/Adminhome';
import ProtectedRoute from './Component/Auth/ProtectedRoute'; 
import EmployeeDashboard from './Component/Employeedashboard/Employeedashboard';
import MayorsPermitForm from './Component/Form/Mayorpermits/Mayorspermit';
import DocumentStatusTracker from './Component/DocumentStatusTracker/DocumentStatusTracker';
import AddEmployeeForm from './Component/Addemployee/Addemployee';
import Viewemployee from './Component/viewemployee/Viewemployee';
import AddOffice from './Component/Addoffice/Addoffice';
import ManageOffice from './Component/Manageoffice/ManageOffice'
import ElectricalPermitForm from './Component/Form/Electricalpermit/electricalpermit';
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
              <BusinessPermitForm />
            </ProtectedRoute>
             } />
          <Route path="/ElectricalPermitForm" element={
            <ProtectedRoute>
              <ElectricalPermitForm />
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

            <Route path="/MayorsPermitForm" element={
            <ProtectedRoute>
              <MayorsPermitForm />
            </ProtectedRoute>
          } />

            <Route path="/Docutracker" element={
            <ProtectedRoute>
              <DocumentStatusTracker />
            </ProtectedRoute>
          } />

            <Route path="/Addemploy" element={
            <ProtectedRoute>
              <AddEmployeeForm />
            </ProtectedRoute>
          } />

          <Route path="/viewemploy" element={
            <ProtectedRoute>
              <Viewemployee />
            </ProtectedRoute>
          } />
          <Route path="/AddOffice" element={
            <ProtectedRoute>
              <AddOffice />
            </ProtectedRoute>
          } />
          <Route path="/ManageOffice" element={
            <ProtectedRoute>
              <ManageOffice />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;