import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import RecoverPassword from './views/RecoverPassword';
import MiCuenta from './views/Account';
import Explorar from './views/Explorar';
import MisCapsulas from './views/MisCapsulas';
import Ayuda from './views/Ayuda';
import CrearCapsula from './views/CrearCapsula';
import VerCapsula from './views/VerCapsula';
import EditarCapsula from './views/EditarCapsula';
import Privacy from './views/Privacy';
import Terms from './views/Terms';
import About from './views/About';
import Suscripciones from './views/Suscripciones';
import Features from './views/Features';
import PrivateRoute from './components/auth/PrivateRoute';
import CookiesModal from './components/modals/CookiesModal';
import VerifyEmail from './views/VerifyEmail';
import ResendVerification from './views/ResendVerification';
import ResetPassword from './views/ResetPassword';
import Notificaciones from './views/Notificaciones';
import TodasLasCapsulas from './views/TodasLasCapsulas';
import PanelModeracion from './views/PanelModeracion';
import CompartidasConmigo from './views/CompartidasConmigo';
import './index.css';

function App() {
  const [showCookiesModal, setShowCookiesModal] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookies-accepted');
    if (cookiesAccepted === null) {
      setShowCookiesModal(true);
    }
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route
            path="/mi-cuenta"
            element={
              <PrivateRoute>
                <MiCuenta />
              </PrivateRoute>
            }
          />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/capsulas" element={<MisCapsulas />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/crear-capsula" element={<CrearCapsula />} />
          <Route path="/capsulas/:id" element={<VerCapsula />} />
          <Route path="/vercapsula/:id" element={<VerCapsula />} />
          <Route path="/capsulas/:id/editar" element={<EditarCapsula />} />
          <Route path="/editarcapsula/:id" element={<EditarCapsula />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/suscripciones" element={<Suscripciones />} />
          <Route path="/features" element={<Features />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/todas-capsulas" element={<TodasLasCapsulas />} />
          <Route path="/panel-moderacion" element={<PanelModeracion />} />
          <Route
            path="/compartidas"
            element={
              <PrivateRoute>
                <CompartidasConmigo />
              </PrivateRoute>
            }
          />
        </Routes>
        <CookiesModal
          isOpen={showCookiesModal}
          onClose={() => setShowCookiesModal(false)}
        />
      </Layout>
    </Router>
  );
}

export default App;