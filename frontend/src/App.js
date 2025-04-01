
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import Logins from './Component/Logins/Login';
import Singnup from './Component/Signup/Signup';
import MunicipalLandingPage from './Component/Home/Home';
import MayorsPermitForm from './Component/Form/form';
import PermitsHomepage from'./Component/Home/Requesthome';


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
          {/* amo si chongo */}
          </Routes>
    </Router>
  
    
    </div>
  );
}

export default App;
