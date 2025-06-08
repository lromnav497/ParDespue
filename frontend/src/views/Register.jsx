import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (profilePicture) formData.append('profile_picture', profilePicture);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Error al registrar');
      } else {
        setSuccess(data.message || '¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setProfilePicture(null);
        setTimeout(() => {
          navigate('/login', { state: { showVerifyModal: true } });
        }, 2000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] flex items-center justify-center px-4">
      <div className="bg-[#2E2E7A]/90 time-capsule rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1a1a4a] p-4 rounded-full border-4 border-[#F5E050] shadow-lg animate-bounce-slow">
              <FontAwesomeIcon icon={faUserPlus} className="text-4xl text-[#F5E050] icon-highlight" />
            </div>
          </div>
          <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] flex items-center justify-center animate-fade-in-down">
            <FontAwesomeIcon icon={faUserPlus} className="mr-3" />
            Crear Cuenta
          </h2>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 animate-fade-in-up">
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
                className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
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
                className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
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
                className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
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
                className="w-full bg-[#1a1a4a]/80 border border-[#3d3d9e] rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-[#F5E050] text-white transition-all duration-200 shadow-inner focus:shadow-[#F5E050]/20"
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <label className="relative group cursor-pointer">
              {/* Imagen de perfil grande y estética */}
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Foto de perfil"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#F5E050] shadow-lg transition-transform duration-200 group-hover:scale-105 bg-white animate-fade-in"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#F5E050] flex items-center justify-center animate-fade-in">
                  <FontAwesomeIcon icon={faUser} className="text-[#2E2E7A] text-4xl" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setProfilePicture(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Subir foto de perfil"
              />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs px-3 py-1 rounded-full opacity-90 group-hover:opacity-100 pointer-events-none transition">
                {profilePicture ? 'Cambiar foto' : 'Subir foto'}
              </span>
            </label>
          </div>

          {error && <div className="text-red-400 text-center mb-4 animate-pulse">{error}</div>}
          {success && <div className="text-green-400 text-center mb-4 animate-fade-in-up">{success}</div>}

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center shadow-lg focus:ring-2 focus:ring-[#F5E050]/60 focus:outline-none animate-fade-in-up"
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Registrarse
            </button>
          </div>
        </form>

        <p className="text-center text-gray-300 mt-6 animate-fade-in-up">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-[#F5E050] hover:underline transition-all">
            Inicia Sesión
          </Link>
        </p>
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
    </div>
  );
};

export default Register;