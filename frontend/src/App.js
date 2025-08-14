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
import PlumbingPermitForm from './Component/Form/Plumbingpermit/plumbingpermit';
import CedulaPermitForm from './Component/Form/Cedulapermit/cedulapermit';
import FencingPermitForm from './Component/Form/Fencingpermit/fencingpermit';
import MunicipalUserProfileDashboard from './Component/Userprofile/userprofile';
import Usersettings from './Component/Usersettings/usersettings';
import EmployeeProfileDashboard from './Component/Employeeprofile/employeeprofile';
import EmployeeHistoryDashboard from './Component/Employeedashboard/employeehistory';
import ElectronicsPermitForm from './Component/Form/Electronicspermit/electronicspermit';
import BuildingPermitForm from './Component/Form/Buildingpermit/buildingpermit';
import AdminNotificationPage from './Component/Adminnotification/adminnotification';
import DocumentRequirementsManager from './Component/Admindocumentrequirments/admindocumentrequirments';
import RenewalBusinessPermitForm from './Component/Form/RenewalBusinessPermit/renewalbusinesspermit';
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
          <Route path="/PlumbingPermitForm" element={
            <ProtectedRoute>
              <PlumbingPermitForm />
            </ProtectedRoute>
             } />
          <Route path="/CedulaPermitForm" element={
            <ProtectedRoute>
              <CedulaPermitForm />
            </ProtectedRoute>
             } />
          <Route path="/FencingPermitForm" element={
            <ProtectedRoute>
              <FencingPermitForm/>
            </ProtectedRoute>
          } />
          <Route path="/ElectronicsPermitForm" element={
            <ProtectedRoute>
              <ElectronicsPermitForm/>
            </ProtectedRoute>
          } />
          <Route path="/BuildingPermitForm" element={
            <ProtectedRoute>
              <BuildingPermitForm/>
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

          <Route path="/Userprofile" element={
            <ProtectedRoute>
              <MunicipalUserProfileDashboard />
            </ProtectedRoute>
          } />

          <Route path="/Usesettings" element={
            <ProtectedRoute>
              <Usersettings />
            </ProtectedRoute>
          } />


          <Route path="/Employeeprofile" element={
            <ProtectedRoute>
              <EmployeeProfileDashboard />
            </ProtectedRoute>
          } />

          <Route path="/Employeehistory" element={
            <ProtectedRoute>
              < EmployeeHistoryDashboard />
            </ProtectedRoute>
          } />

            <Route path="/Addemploy" element={
            <ProtectedRoute>
              <AddEmployeeForm />
            </ProtectedRoute>
          } />
          <Route path="/AdminNotification" element={
            <ProtectedRoute>
              <AdminNotificationPage />
            </ProtectedRoute>
          } />
          <Route path="/AdminDocumentRequirments" element={
            <ProtectedRoute>
              <DocumentRequirementsManager />
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
          <Route path="/RenewalBusinessPermit" element={
            <ProtectedRoute>
              <RenewalBusinessPermitForm />
            </ProtectedRoute>
             } />
          
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;