import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import VerifyEmailModal from '../components/modals/VerifyEmailModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showVerifyModal, setShowVerifyModal] = useState(location.state?.showVerifyModal || false);
  const expired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Si el backend responde con "Usuario no verificado"
        if (data.message && data.message.toLowerCase().includes('verific')) {
          setError('Tu cuenta no está verificada. Revisa tu correo para activarla.');
          setIsModalOpen(true);
        } else {
          setError(data.message || 'Error al iniciar sesión');
        }
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('user-updated'));
      navigate('/explorar');
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <>
      <VerifyEmailModal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} />
      <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] flex items-center justify-center px-4">
        <div className="bg-[#2E2E7A]/90 time-capsule rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-fade-in">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-[#1a1a4a] p-4 rounded-full border-4 border-[#F5E050] shadow-lg animate-bounce-slow">
                <FontAwesomeIcon icon={faSignInAlt} className="text-4xl text-[#F5E050] icon-highlight" />
              </div>
            </div>
            <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] flex items-center justify-center animate-fade-in-down">
              <FontAwesomeIcon icon={faUser} className="mr-3" />
              Iniciar Sesión
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
            {error && <div className="text-red-400 text-center mb-4 animate-pulse">{error}</div>}
            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Correo Electrónico
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
                  placeholder="tu@correo.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 flex items-center">
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Contraseña
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center items-center mb-2 mt-2 gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="accent-[#F5E050] w-4 h-4 rounded border-[#F5E050] focus:ring-[#F5E050] transition-all"
              />
              <label htmlFor="remember" className="ml-2 text-gray-300 select-none cursor-pointer hover:text-[#F5E050] transition-colors">
                Mantener sesión iniciada
              </label>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center shadow-lg focus:ring-2 focus:ring-[#F5E050]/60 focus:outline-none animate-fade-in-up"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Iniciar Sesión
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-white/60 animate-fade-in-up">
            <Link to="/recover-password" className="text-blue-400 hover:text-blue-300 font-persero underline underline-offset-2 transition-all">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="text-center text-gray-300 mt-6 animate-fade-in-up">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-[#F5E050] hover:underline transition-all">
              Regístrate
            </Link>
          </p>

          {expired && (
            <div className="text-red-500 mb-4 animate-pulse">
              Tu sesión ha expirado. Por favor, inicia sesión de nuevo.
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </>
  );
};

export default Login;