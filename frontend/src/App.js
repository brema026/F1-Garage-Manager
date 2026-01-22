import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Navbar from './components/Navbar';
import Footer from './components/common/Footer';
import Teams from './pages/Teams';
import Drivers from './pages/Drivers';
import Sponsors from './pages/Sponsors';
import Parts from './pages/Parts';
import Inventory from './pages/Inventory';
import CarSetup from './pages/CarSetup';
import api from './api/axios';
import { DriverWelcome } from './components/DriverWelcome';
import { Profile } from './pages/Profile'
import CircuitSelection from './pages/race-simulator/CircuitSelection';

function App() {
  const [view, setView] = useState('teams');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get('/auth/check-auth');
        
        if (response.data.authenticated) {
          setIsLoggedIn(true);
          setUser(response.data.user);
        }

      } catch (e) {
        setIsLoggedIn(false);

      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const renderView = () => {
    if (!user) return null;

    const role = user.rol?.toLowerCase();

    if (view === 'profile') {
      return <Profile user={user} />;
    }

    if (role === 'driver') {
      return <DriverWelcome user={user} setView={setView} />;
    }

    switch (view) {
      case 'teams': return <Teams setView={setView} user={user} />; // Pasamos el user para filtrar equipo
      case 'drivers': 
        return role === 'admin' ? <Drivers /> : <Navigate to="/dashboard" />;
      case 'sponsors': return <Sponsors user={user}/>;
      case 'parts': return <Parts user={user}/>;
      case 'inventory': return <Inventory setView={setView} user={user}/>;
      case 'setup': return <CarSetup setView={setView} user={user}/>;
      default: return <Teams />;
    }
  };

  // Show loading spinner while verifying session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        <Route path="/register" element={<Register />} />
        <Route path="/simulation" element={<CircuitSelection />} />
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            isLoggedIn ? (
              <div className="flex flex-col min-h-screen">
                {/* Pasamos setIsLoggedIn al Navbar para el logout */}
                <Navbar setView={setView} setIsLoggedIn={setIsLoggedIn} user={user} />
                <main className="flex-1">
                  {renderView()}
                </main>
                <Footer />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;