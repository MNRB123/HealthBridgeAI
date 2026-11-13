import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MedicinePriceFinder from './pages/MedicinePriceFinder';
import HealthcareFinder from './pages/HealthcareFinder';
import MentalWellness from './pages/MentalWellness';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/medicine-price-finder" element={<MedicinePriceFinder />} />
            <Route path="/healthcare-finder" element={<HealthcareFinder />} />
            <Route path="/mental-wellness" element={<MentalWellness />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
