import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await fetch('/api/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Error al registrar');
      } else {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
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
              <FontAwesomeIcon icon={faUserPlus} className="text-4xl text-[#F5E050] icon-highlight" />
            </div>
          </div>
          <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="mr-3" />
            Crear Cuenta
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Nombre
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white"
                placeholder="Tu nombre"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2 flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Correo Electrónico
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

          <div className="mb-4">
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

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 flex items-center">
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Confirmar Contraseña
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white"
                placeholder="********"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-center mb-4">{error}</div>}
          {success && <div className="text-green-400 text-center mb-4">{success}</div>}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center"
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Registrarse
            </button>
          </div>
        </form>

        <p className="text-center text-gray-300 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-[#F5E050] hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;