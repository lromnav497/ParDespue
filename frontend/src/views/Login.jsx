import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError(data.message || 'Error al iniciar sesión');
        return;
      }
      // Guarda el token en localStorage (o donde prefieras)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Dispara el evento para que el Header se actualice
      window.dispatchEvent(new Event('user-updated'));
      navigate('/explorar');
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-[#2E2E7A] time-capsule rounded-xl p-8 max-w-md w-full shadow-lg transform transition-all">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1a1a4a] p-4 rounded-full border-4 border-[#F5E050]">
              <FontAwesomeIcon icon={faSignInAlt} className="text-4xl text-[#F5E050] icon-highlight" />
            </div>
          </div>
          <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="mr-3" />
            Iniciar Sesión
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-center mb-4">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Correo Electrónico
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Contraseña
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white"
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Iniciar Sesión
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-white/60">
          <Link to="/recover-password" className="text-blue-400 hover:text-blue-300 font-persero">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-gray-300 mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-[#F5E050] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;