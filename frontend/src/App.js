import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Navbar from './components/Navbar';
import Footer from './components/common/Footer';
import Users from './pages/Users';
import Teams from './pages/Teams';
import Drivers from './pages/Drivers';
import Sponsors from './pages/Sponsors';
import Parts from './pages/Parts';
import Inventory from './pages/Inventory';
import CarSetup from './pages/CarSetup';

function App() {
  const [view, setView] = useState('equipos');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Cambiar después con auth real

  const renderView = () => {
    switch (view) {
      case 'drivers': return <Drivers />;
      case 'sponsors': return <Sponsors />;
      case 'parts': return <Parts />;
      case 'teams': return <Teams setView={setView} />;
      case 'inventory': return <Inventory setView={setView} />;
      case 'setup': return <CarSetup setView={setView} />;
      default: return <Teams />;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Login y Register */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard - Con Navbar y Footer */}
        <Route
          path="/dashboard/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar setView={setView} />
              <main className="flex-1">
                {renderView()}
              </main>
              <Footer />
            </div>
          }
        />

        {/* Default redirect a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;