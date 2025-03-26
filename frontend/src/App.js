
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Logins from './Component/Logins/Login';
import Singnup from './Component/Signup/Signup';
import MunicipalLandingPage from './Component/Home/Home';


function App() {
  return (
    <div className="App">
   <Router>
          <Routes>
            <Route path="/" element={<Logins />} />
            <Route path="/Sign-up" element={<Singnup />} />
            <Route path="/Chome" element={<MunicipalLandingPage />} />
          {/* amo si chongo */}
          </Routes>
    </Router>
    </div>
  );
}

export default App;
