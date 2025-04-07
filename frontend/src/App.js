
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';
import Logins from './Component/Logins/Login';
import Singnup from './Component/Signup/Signup';
import MunicipalLandingPage from './Component/Home/Home';
import MayorsPermitForm from './Component/Form/businesspermit';
import PermitsHomepage from'./Component/Home/Requesthome';
import AdminDashboard from'./Component/Adminhomepage/Adminhome';
import EmployeeDashboard from './Component/Employeedashboard/Employeedashboard';


function App() {
  return (
    <div className="App">
   <Router>
          <Routes>
            <Route path="/Login" element={<Logins />} />
            <Route path="/Sign-up"y element={<Singnup />} />
            <Route path="/Chome" element={<MunicipalLandingPage />} />
            <Route path="/Uform" element={<MayorsPermitForm/>} />
            <Route path="/Permits" element={<PermitsHomepage/>} /> 
            <Route path="/AdminDash" element={<AdminDashboard/>} />
            <Route path="/Employdash" element={<EmployeeDashboard/>} />
          {/* amo si chongo */}
          </Routes>
    </Router>
  
    
    </div>
  );
}

export default App;
