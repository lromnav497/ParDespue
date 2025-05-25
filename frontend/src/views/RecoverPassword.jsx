import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Si el correo existe, recibirás instrucciones para recuperar tu contraseña');
    // Aquí iría la lógica para enviar el correo
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-[#2E2E7A] time-capsule rounded-xl p-8 max-w-md w-full shadow-lg transform transition-all">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1a1a4a] p-4 rounded-full border-4 border-[#F5E050]">
              <FontAwesomeIcon icon={faKey} className="text-4xl text-[#F5E050] icon-highlight" />
            </div>
          </div>
          <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] flex items-center justify-center">
            <FontAwesomeIcon icon={faKey} className="mr-3" />
            Recuperar Contraseña
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center"
            >
              <FontAwesomeIcon icon={faKey} className="mr-2" />
              Enviar Instrucciones
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-white bg-green-500/20 p-3 rounded-lg">
            {message}
          </p>
        )}

        <p className="text-center text-gray-300 mt-6">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="text-[#F5E050] hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RecoverPassword;